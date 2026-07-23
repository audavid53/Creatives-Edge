import React, { useState, useEffect } from 'react';
import { Lesson, UserLessonRecord } from '../types';
import { Illustration } from './Illustration';
import { generateLessonPDF } from '../lib/pdfHelper';
import { Confetti } from './Confetti';
import { motion } from 'motion/react';
import { Award, FileText, Video, ArrowRight, CheckCircle, Home, Sparkles, Download, Play } from 'lucide-react';

interface CelebrationViewProps {
  lesson: Lesson;
  record: UserLessonRecord;
  streakCount: number;
  onStartPracticeGame: () => void;
  onReturnHome: () => void;
}

export const CelebrationView: React.FC<CelebrationViewProps> = ({
  lesson,
  record,
  streakCount,
  onStartPracticeGame,
  onReturnHome
}) => {
  const [downloaded, setDownloaded] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  // Fire the celebration confetti once, then retire it.
  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 3600);
    return () => clearTimeout(t);
  }, []);

  // Custom warm affirmations for each day
  const getDayAffirmation = (day: number) => {
    switch (day) {
      case 1:
        return "Day 1 done — Clara's lesson is sealed. You've made your first claim on a market and acknowledged the trap of selling hours.";
      case 2:
        return "Day 2 done — Julian's journey is now part of yours. You have sailed out of the crowded harbor to seek elite, underserved shores.";
      case 3:
        return "Day 3 done — The math of hours has been solved. You have laid the foundations of your productized, scalable asset.";
      case 4:
        return "Day 4 done — You are no longer selling optional vitamins. You have mapped the expensive headache and declared yourself a vital painkiller.";
      case 5:
        return "Day 5 done — The generalist's exhaustion is behind you. You have crowned yourself the undisputed specialist for a wealthy niche.";
      default:
        return `Day ${day} done — Another brick laid in your high-leverage business. You are actively separating your wealth from your physical time.`;
    }
  };

  const handleDownloadPDF = () => {
    generateLessonPDF(
      lesson.dayNumber,
      lesson.title,
      lesson.quiz.keyInsightText,
      lesson.reflectionQuestions,
      record.reflectionAnswers
    );
    setDownloaded(true);
  };

  return (
    <div className="flex flex-col min-h-full justify-between pb-8 px-5 py-6 bg-[#EFF5FE]" id="celebration-screen">
      {showConfetti && <Confetti count={70} />}
      {/* Celebration Header */}
      <div className="text-center mt-6" id="celebration-header">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 15 }}
          className="inline-block p-4 bg-emerald-50 rounded-full text-emerald-600 mb-4 border border-emerald-200"
        >
          <CheckCircle size={36} className="fill-emerald-10" />
        </motion.div>

        <span className="text-xs font-mono font-bold text-[#2563EB] uppercase tracking-widest block mb-1">
          MILESTONE ACHIEVED
        </span>
        <h2 className="text-2xl font-serif font-bold text-slate-900 leading-tight">
          Day {lesson.dayNumber} Complete
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-mono">
          Current streak: {streakCount} Days • Keep the ritual alive
        </p>
      </div>

      {/* Central Illustration Area */}
      <div className="my-6 flex justify-center items-center" id="celebration-graphic">
        <motion.div
          animate={{ rotate: [0, 3, -3, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs relative flex flex-col items-center max-w-xs"
        >
          <Illustration type={lesson.illustrationType} size={140} />
          <div className="absolute top-2 right-2 text-amber-500">
            <Sparkles size={16} className="fill-amber-300 animate-pulse" />
          </div>
        </motion.div>
      </div>

      {/* Affirming Narrative Copy */}
      <div className="text-center max-w-sm mx-auto px-4 mb-6" id="celebration-affirmation">
        <p className="text-slate-700 text-sm font-serif italic leading-relaxed">
          {getDayAffirmation(lesson.dayNumber)}
        </p>
      </div>

      {/* Two Equal Rounded Action Cards */}
      <div className="grid grid-cols-1 gap-4 w-full mb-6" id="celebration-actions">
        {/* PDF Download Card */}
        <button
          onClick={handleDownloadPDF}
          className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-4 text-left transition-all flex items-start gap-4 active:scale-99 shadow-xs group cursor-pointer"
          id="pdf-download-card-btn"
        >
          <div className="bg-[#EFF5FE] p-3 rounded-xl text-[#2563EB] group-hover:bg-[#2563EB]/10 transition-colors">
            <FileText size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-slate-800 flex items-center justify-between">
              <span>Scribe Keepsake PDF</span>
              <Download size={14} className="text-slate-400 group-hover:text-[#2563EB] transition-colors" />
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-normal font-sans">
              Download your custom lesson booklet containing the core story, key insight, and your personal written reflections.
            </p>
            {downloaded && (
              <span className="inline-block mt-2 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-mono font-semibold">
                ✓ Downloaded Successfully
              </span>
            )}
          </div>
        </button>

        {/* Practice Game Card */}
        <button
          onClick={onStartPracticeGame}
          className="bg-[#0B1F3A] hover:bg-slate-900 rounded-2xl p-4 text-left transition-all flex items-start gap-4 active:scale-99 shadow-md group cursor-pointer"
          id="practice-game-card-btn"
        >
          <div className="bg-[#2563EB] p-3 rounded-xl text-white group-hover:scale-105 transition-transform">
            <Video size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white flex items-center justify-between">
              <span>Play Daily Practice Game</span>
              <Play size={14} className="text-[#2563EB] group-hover:translate-x-1 transition-transform" />
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-normal font-sans">
              Practice speaking your own reflection answers aloud under speed pressure to program confidence and spontaneity.
            </p>
          </div>
        </button>
      </div>

      {/* Return to Dashboard */}
      <div className="text-center" id="celebration-footer">
        <button
          onClick={onReturnHome}
          className="text-xs font-mono font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 mx-auto py-2 px-4 hover:bg-slate-100/60 rounded-xl transition-all cursor-pointer"
          id="return-dashboard-button"
        >
          <Home size={14} />
          <span>Return to Academy Dashboard</span>
        </button>
      </div>
    </div>
  );
};
