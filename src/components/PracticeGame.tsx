import React, { useState, useEffect, useRef } from 'react';
import { Camera, VideoOff, RefreshCw, Volume2, Play, Trash2, ArrowLeft, ArrowRight, Check, Award, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PracticeGameProps {
  questions: string[];
  answers: string[];
  dayNumber: number;
  onFinishGame: (recordingsCount: number) => void;
  onBackToCelebration: () => void;
  onSubmitSubmission: (videoBlob: Blob | null, videoText: string, isSimulated: boolean) => Promise<void>;
}

interface RecordingClip {
  round: number;
  duration: number;
  url: string;
}

type GamePhase = 'setup' | 'flash' | 'record' | 'summary';

export const PracticeGame: React.FC<PracticeGameProps> = ({
  questions,
  answers,
  dayNumber,
  onFinishGame,
  onBackToCelebration,
  onSubmitSubmission
}) => {
  // Setup state
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Game Loop state
  const [round, setRound] = useState(1); // Rounds 1 to 4
  const [timeLeft, setTimeLeft] = useState(10); // Countdown timer
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<RecordingClip[]>([]);

  // Camera & Media Recorder refs
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Playback state in summary
  const [activePlaybackUrl, setActivePlaybackUrl] = useState<string | null>(null);
  const playbackVideoRef = useRef<HTMLVideoElement | null>(null);

  // Filter valid Q&A pairs (only those that actually have answers written)
  const qnaPairs = questions.map((q, idx) => ({
    question: q,
    answer: answers[idx] || ""
  })).filter(pair => pair.answer.trim().length > 0);

  // Determine current round duration
  const getRoundDuration = (r: number) => {
    switch (r) {
      case 1: return 120; // 2 minutes
      case 2: return 60;  // 1 minute
      case 3: return 30;  // 30 seconds
      case 4: return 10;  // 10 seconds
      default: return 10;
    }
  };

  // 1. Setup camera feed
  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraAccess(true);
      setStreamError(null);
    } catch (err: any) {
      console.warn("Camera access failed/blocked by sandbox or hardware:", err);
      setHasCameraAccess(false);
      setStreamError(err?.message || "Permission Denied or Sandbox Restriction");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Start the core progressive drill
  const handleStartDrill = (idx: number) => {
    setSelectedIdx(idx);
    setGamePhase('flash');
    setRound(1);
    setTimeLeft(10); // Starts with 10s Flash screen
    startCamera();
  };

  // Start recording the stream
  const startRecording = () => {
    if (!streamRef.current) {
      // In simulation mode (no camera), we just mock the recording
      setIsRecording(true);
      return;
    }

    recordedChunksRef.current = [];
    try {
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(streamRef.current, options);
      } catch (e) {
        // Fallback mimeType
        recorder = new MediaRecorder(streamRef.current);
      }

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const newClip: RecordingClip = {
          round,
          duration: getRoundDuration(round),
          url
        };
        setRecordings(prev => [...prev, newClip]);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start MediaRecorder:", err);
      // Fallback to simulation recording
      setIsRecording(true);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Main game ticking effect
  useEffect(() => {
    if (gamePhase === 'setup' || gamePhase === 'summary') return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // Handle transition to next state
          handleStateTransition();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gamePhase, round, timeLeft, isRecording]);

  const handleStateTransition = () => {
    if (gamePhase === 'flash') {
      // Transition from Flash to Record
      setGamePhase('record');
      const duration = getRoundDuration(round);
      setTimeLeft(duration);
      // Start camera recording
      startRecording();
    } else if (gamePhase === 'record') {
      // Transition from Record to Flash (next round) or Summary (if Round 4 done)
      stopRecording();

      if (round < 4) {
        setRound(prev => prev + 1);
        setGamePhase('flash');
        setTimeLeft(10); // 10s Flash Refresher
      } else {
        // Complete the drill
        stopCamera();
        setGamePhase('summary');
      }
    }
  };

  // Manual skip/stop button helper during recording
  const handleForceNext = () => {
    handleStateTransition();
  };

  const handleReset = () => {
    // Clear all urls to prevent memory leaks
    recordings.forEach(clip => URL.revokeObjectURL(clip.url));
    setRecordings([]);
    setGamePhase('setup');
    setSelectedIdx(null);
    setRound(1);
    stopCamera();
  };

  // Generates a lightweight, valid WebM video file dynamically using Canvas and Oscillator node
  // so the admin can always play and download a real clip, even under sandbox restrictions.
  const generateSimulatedVideo = async (textToDraw: string): Promise<Blob | null> => {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);

        // Capture a 10 FPS stream
        const stream = canvas.captureStream(10);
        
        // Synthesize actual voice frequency representation audio
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const dest = audioCtx.createMediaStreamDestination();
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime); // Standard 440Hz tone
        osc.connect(dest);
        
        // Attach audio track
        stream.addTrack(dest.stream.getAudioTracks()[0]);

        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          osc.stop();
          audioCtx.close();
          const blob = new Blob(chunks, { type: 'video/webm' });
          resolve(blob);
        };

        recorder.start();
        osc.start();

        // Render 15 beautiful visualizer frames
        let frame = 0;
        const interval = setInterval(() => {
          frame++;
          ctx.fillStyle = '#1C1917'; // Dark luxury canvas background
          ctx.fillRect(0, 0, 320, 240);

          // Render active sound waves
          ctx.strokeStyle = '#C85A32';
          ctx.lineWidth = 3;
          ctx.beginPath();
          for (let i = 0; i < 320; i += 10) {
            const y = 120 + Math.sin(frame * 0.5 + i * 0.1) * 30;
            if (i === 0) ctx.moveTo(i, y);
            else ctx.lineTo(i, y);
          }
          ctx.stroke();

          // Brand overlays
          ctx.fillStyle = '#FAF6F0';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText("THE CREATIVE EDGE ACADEMY", 160, 40);
          ctx.fillText("DRILL TYPE: SPONTANEITY SPEAKING", 160, 60);

          ctx.fillStyle = '#FDA4AF';
          ctx.font = '9px sans-serif';
          const textPreview = textToDraw.length > 35 ? textToDraw.substring(0, 35) + "..." : textToDraw;
          ctx.fillText(`"${textPreview}"`, 160, 200);

          if (frame >= 15) {
            clearInterval(interval);
            recorder.stop();
          }
        }, 100);
      } catch (e) {
        console.error("Error creating dynamic simulation video:", e);
        resolve(null);
      }
    });
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      let finalVideoBlob: Blob | null = null;

      // Get active recorded clip (Round 4 is ideal or the last available)
      const r4Clip = recordings.find(r => r.round === 4) || recordings[recordings.length - 1];

      if (r4Clip && r4Clip.url) {
        // Real recording - fetch the blob back from its object URL
        const res = await fetch(r4Clip.url);
        finalVideoBlob = await res.blob();
      } else {
        // Simulation mode - generate a fully playable WebM file
        const answerText = currentQna?.answer || "Simulated spontaneity practice pitch";
        finalVideoBlob = await generateSimulatedVideo(answerText);
      }

      // Submit for upload to Storage + Firestore submissions collection
      await onSubmitSubmission(finalVideoBlob, currentQna?.answer || "", recordings.length === 0);
      
      onFinishGame(recordings.length);
    } catch (error) {
      console.error("Error handling speech practice submission:", error);
      onFinishGame(recordings.length);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      recordings.forEach(clip => URL.revokeObjectURL(clip.url));
    };
  }, []);

  const currentQna = selectedIdx !== null ? qnaPairs[selectedIdx] : null;

  return (
    <div className="flex flex-col min-h-full justify-between pb-8 px-5 py-6" id="practice-game-screen">
      
      {/* 1. SETUP PHASE */}
      {gamePhase === 'setup' && (
        <div className="flex flex-col justify-between h-full flex-1">
          <div>
            <div className="flex items-center gap-1.5 mb-6" id="game-setup-header">
              <button onClick={onBackToCelebration} className="text-[#C85A32] hover:text-[#b04a25] flex items-center gap-1 text-xs font-mono font-medium cursor-pointer">
                <ArrowLeft size={14} /> Back
              </button>
            </div>

            <div className="text-center mb-6">
              <span className="text-xs font-mono font-bold text-[#C85A32] uppercase tracking-widest">DRILLED CONVICTION</span>
              <h2 className="text-2xl font-serif font-bold text-stone-900 mt-1">Spontaneity Drill</h2>
              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed px-2">
                Turn your static reflections into fluent verbal conviction. Select a question below to begin your progressive-speed practice.
              </p>
            </div>

            {qnaPairs.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-center" id="no-reflections-error">
                <AlertCircle className="text-amber-600 mx-auto mb-3" size={32} />
                <h4 className="text-sm font-semibold text-stone-800">No Journal Entries Found</h4>
                <p className="text-xs text-stone-600 mt-2 px-4 leading-normal">
                  You must write at least one reflection answer in today's lesson to practice speaking it. Click back and add your reflection first!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 mt-4" id="setup-qna-selection">
                <h3 className="text-xs font-mono text-stone-400 uppercase tracking-wider pl-1">Choose your prompt</h3>
                {qnaPairs.map((pair, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleStartDrill(idx)}
                    className="bg-white hover:bg-stone-50 text-left rounded-2xl p-5 border border-stone-200 hover:border-[#C85A32] transition-all cursor-pointer group active:scale-99 shadow-xs"
                    id={`practice-prompt-option-${idx}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-stone-400 font-semibold uppercase">Inquiry {idx + 1}</span>
                      <ArrowRight size={14} className="text-stone-300 group-hover:text-[#C85A32] transition-colors" />
                    </div>
                    <h4 className="text-sm font-serif font-bold text-stone-800 mt-2 leading-snug line-clamp-2">
                      {pair.question}
                    </h4>
                    <p className="text-xs italic text-stone-500 mt-2 line-clamp-2 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                      "{pair.answer}"
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#EBE3D5] text-[11px] text-stone-600 leading-normal flex items-start gap-2.5 mt-8">
            <Sparkles size={16} className="text-[#C85A32] shrink-0 mt-0.5" />
            <p className="font-sans">
              <strong>Spontaneous Mind Engine:</strong> You will answer the same prompt 4 times. Preparation time is always 10 seconds. Recording times shrink: <strong>2m → 1m → 30s → 10s</strong>. No pausing. You are programming your subconscious to answer without hesitation.
            </p>
          </div>
        </div>
      )}

      {/* 2. FLASH PHASE (COUNTDOWN PREPARATION) */}
      {gamePhase === 'flash' && currentQna && (
        <div className="flex flex-col justify-between h-full flex-1 text-center" id="game-flash-view">
          <div>
            <div className="mb-4">
              <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-wider bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                Round {round} of 4 • Preparation
              </span>
            </div>
            
            <h3 className="text-xl font-serif font-bold text-stone-900 px-4 leading-snug mt-6">
              {currentQna.question}
            </h3>
          </div>

          {/* Core high-contrast prompt & written answer to absorb */}
          <div className="my-8 bg-[#1C1917] rounded-3xl p-6 md:p-8 text-left shadow-xl relative overflow-hidden" id="flash-card">
            <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest font-bold">Your Written Compass</span>
            <p className="text-white font-serif text-base italic leading-relaxed mt-3">
              "{currentQna.answer}"
            </p>
            <div className="absolute right-[-15px] bottom-[-15px] opacity-10 text-[#C85A32]">
              <Camera size={100} />
            </div>
          </div>

          {/* Countdown Ring */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-20 h-20 flex items-center justify-center rounded-full bg-[#FAF6F0] border-4 border-amber-300">
              <span className="text-2xl font-mono font-bold text-stone-800">{timeLeft}</span>
              <div className="absolute inset-0 rounded-full border-2 border-[#C85A32]/20 animate-ping pointer-events-none" />
            </div>
            <p className="text-xs text-stone-500 font-mono">
              Absorb your words. Recording begins automatically in {timeLeft}s.
            </p>
          </div>
        </div>
      )}

      {/* 3. RECORD PHASE (ACTIVE PRACTICE Viewfinder) */}
      {gamePhase === 'record' && currentQna && (
        <div className="flex flex-col justify-between h-full flex-1" id="game-record-view">
          {/* Top Info */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-mono font-bold text-rose-600 uppercase tracking-wider">
                ROUND {round} • LIVE RECORDING
              </span>
            </div>
            <h3 className="text-sm font-serif font-bold text-stone-800 px-4 line-clamp-1">
              {currentQna.question}
            </h3>
          </div>

          {/* Viewfinder Container */}
          <div className="bg-stone-900 rounded-3xl overflow-hidden aspect-video relative flex items-center justify-center border-4 border-rose-500/30 shadow-2xl" id="viewfinder">
            
            {/* Native Video Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${!hasCameraAccess ? 'hidden' : 'block'}`}
            />

            {/* Error or Simulation Fallback */}
            {!hasCameraAccess && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-stone-950 text-stone-400">
                <VideoOff size={40} className="text-[#C85A32] mb-3 animate-pulse" />
                <h4 className="text-xs font-mono text-white font-bold uppercase">Viewfinder Simulator Active</h4>
                <p className="text-[11px] text-stone-400 mt-2 max-w-xs leading-normal">
                  {streamError ? `Hardware/Permissions: ${streamError}` : "Camera sandbox restriction active."}
                </p>
                <p className="text-[10px] text-emerald-400 font-mono mt-3">
                  Speaking exercise is fully simulated. Speak aloud now!
                </p>
              </div>
            )}

            {/* Viewfinder overlays */}
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10">
              <span className="text-xs font-mono text-white font-semibold">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>

            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10 max-w-[80%]">
              <p className="text-[9px] font-mono text-[#C85A32] uppercase font-bold">Target Duration</p>
              <p className="text-[11px] font-sans text-stone-200 mt-0.5">
                Explain it under {getRoundDuration(round)} seconds.
              </p>
            </div>
          </div>

          {/* Guidance below viewfinder */}
          <div className="text-center mt-4 px-4">
            <p className="text-xs text-stone-600 font-serif italic max-w-xs mx-auto">
              {round === 1 && "Take your time. Explain the core details clearly."}
              {round === 2 && "Speed up. Remove filler words and cut straight to the point."}
              {round === 3 && "Be tight. Express only the absolute essential conviction."}
              {round === 4 && "Instant impact! Speak your core assertion in a single breath."}
            </p>
          </div>

          {/* Finish Round Button */}
          <div className="mt-6 flex justify-center" id="game-controls">
            <button
              onClick={handleForceNext}
              className="bg-[#1C1917] hover:bg-[#C85A32] text-white font-sans font-medium py-3 px-6 rounded-2xl transition-all shadow-md active:scale-98 flex items-center gap-1.5 text-sm cursor-pointer"
              id="stop-round-button"
            >
              <span>Finish Round {round}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 4. SUMMARY / PRACTICE COMPLETE PHASE */}
      {gamePhase === 'summary' && currentQna && (
        <div className="flex flex-col justify-between h-full flex-1" id="game-summary-view">
          <div>
            <div className="text-center mb-6">
              <div className="inline-block p-3 bg-amber-50 rounded-full text-amber-500 mb-3 border border-amber-200">
                <Award size={28} className="fill-amber-10" />
              </div>
              <span className="text-xs font-mono font-bold text-amber-700 uppercase tracking-widest block">DRILL COMPLETE</span>
              <h2 className="text-xl font-serif font-bold text-stone-900 mt-1">Conviction Programmed</h2>
              <p className="text-xs text-stone-500 mt-1 px-4 leading-relaxed">
                "Notice how much more naturally that came out by the last round — that's the point."
              </p>
            </div>

            {/* Interactive Playback Section */}
            <div className="bg-white border border-stone-200 rounded-3xl p-5 mb-6 shadow-xs" id="recordings-library">
              <h3 className="text-xs font-mono text-stone-400 uppercase tracking-wider pl-1 mb-3">Recorded Spontaneity Rounds</h3>

              {recordings.length === 0 ? (
                <div className="bg-stone-50 border border-stone-100 rounded-2xl p-6 text-center text-stone-500" id="empty-recordings">
                  <p className="text-xs font-serif italic">"Your speaking practice occurred in high-integrity simulation mode. Standard recordings were executed in the physical space of your room."</p>
                  <p className="text-[10px] font-mono text-[#C85A32] mt-3">✓ 4 speaking rounds registered</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3" id="recordings-playback-list">
                  {recordings.map((clip, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        activePlaybackUrl === clip.url ? 'border-amber-400 bg-amber-50/20' : 'border-stone-100 bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-stone-200 text-stone-800 p-2 rounded-lg text-xs font-mono font-bold">
                          R{clip.round}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-800">Round {clip.round} Speak</p>
                          <p className="text-[10px] text-stone-400 font-mono">Limit: {clip.duration}s</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActivePlaybackUrl(clip.url);
                          if (playbackVideoRef.current) {
                            playbackVideoRef.current.load();
                            playbackVideoRef.current.play();
                          }
                        }}
                        className="bg-white hover:bg-stone-100 border border-stone-200 text-[#C85A32] p-2 rounded-xl transition-all shadow-2xs cursor-pointer"
                        title="Play recording"
                      >
                        <Play size={14} className="fill-[#C85A32]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Playback video panel if active */}
              {activePlaybackUrl && (
                <div className="mt-4 bg-stone-900 rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center" id="playback-viewport">
                  <video
                    ref={playbackVideoRef}
                    src={activePlaybackUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setActivePlaybackUrl(null)}
                    className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full text-xs hover:bg-black/80"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* prompt summary */}
            <div className="bg-[#FAF6F0] rounded-2xl p-4 border border-[#EBE3D5] text-[11px] text-stone-600 font-serif italic leading-relaxed" id="summary-closing-quote">
              "When you speak with clarity and speed, you remove friction from the transaction. Your high-paying prospects will feel your certainty instantly. That is the edge."
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="mt-8 flex flex-col gap-3" id="summary-footer">
            <button
              onClick={handleFinish}
              disabled={isSubmitting}
              className="w-full bg-[#1C1917] hover:bg-[#C85A32] disabled:bg-stone-300 text-white font-sans font-medium py-3.5 px-6 rounded-2xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
              id="finalize-practice-button"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="animate-spin text-white" size={18} />
                  <span>Submitting Practice Recording...</span>
                </>
              ) : (
                <>
                  <Check size={18} />
                  <span>Complete Academy Practice</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="text-xs text-stone-400 hover:text-stone-700 font-mono py-1 cursor-pointer flex items-center justify-center gap-1 mx-auto"
              id="reset-practice-drill"
            >
              <RefreshCw size={12} /> Discard & Practice Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
