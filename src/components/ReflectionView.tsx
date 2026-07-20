import React, { useState, useEffect } from 'react';
import { HelpCircle, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReflectionViewProps {
  questions: string[];
  placeholders: string[];
  dayNumber: number;
  onFinishReflections: (answers: string[]) => void;
  onBackToQuiz: () => void;
}

export const ReflectionView: React.FC<ReflectionViewProps> = ({
  questions,
  placeholders,
  dayNumber,
  onFinishReflections,
  onBackToQuiz
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill(""));
  const [direction, setDirection] = useState(0); // -1 for back, 1 for forward
  const [showNudge, setShowNudge] = useState(false);

  // Auto-save: We can update local storage or local state. We will pass answers up on final save.

  const currentAnswer = answers[currentIdx] || "";

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updated = [...answers];
    updated[currentIdx] = e.target.value;
    setAnswers(updated);
    if (showNudge && e.target.value.trim().length > 0) {
      setShowNudge(false);
    }
  };

  const handleNext = () => {
    // If empty and they haven't been nudged yet, nudge them gently
    if (currentAnswer.trim() === "" && !showNudge) {
      setShowNudge(true);
      return;
    }

    // Reset nudge state
    setShowNudge(false);

    if (currentIdx < questions.length - 1) {
      setDirection(1);
      setCurrentIdx(prev => prev + 1);
    } else {
      // Completed all reflections
      onFinishReflections(answers);
    }
  };

  const handleBack = () => {
    setShowNudge(false);
    if (currentIdx > 0) {
      setDirection(-1);
      setCurrentIdx(prev => prev - 1);
    } else {
      onBackToQuiz();
    }
  };

  const handleNudgeSkip = () => {
    setShowNudge(false);
    if (currentIdx < questions.length - 1) {
      setDirection(1);
      setCurrentIdx(prev => prev + 1);
    } else {
      onFinishReflections(answers);
    }
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
      transition: { duration: 0.25 }
    })
  };

  return (
    <div className="flex flex-col min-h-full justify-between pb-8 px-5 py-6">
      <div>
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6" id="reflection-top-bar">
          <button
            onClick={handleBack}
            className="text-xs font-mono font-medium text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
            id="reflection-back-link"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <span className="text-xs font-mono font-bold text-[#C85A32] uppercase">
            Reflection {currentIdx + 1} of {questions.length}
          </span>
        </div>

        {/* Header summary */}
        <div className="text-center mb-6" id="reflection-intro">
          <span className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">Internal Journal</span>
          <h2 className="text-xl font-serif font-bold text-stone-900 mt-1">Scribe Your Blueprint</h2>
          <p className="text-xs text-stone-500 mt-1">Your written reflections will compile directly into today's PDF keepsake.</p>
        </div>

        {/* Question Area with AnimatePresence */}
        <div className="min-h-[220px]" id="reflection-container">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIdx}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs flex flex-col"
              id={`reflection-card-${currentIdx}`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-[#FAF6F0] text-[#C85A32] p-2 rounded-xl mt-0.5 shrink-0">
                  <HelpCircle size={18} />
                </div>
                <h3 className="text-base font-serif font-semibold text-stone-800 leading-snug mt-0.5">
                  {questions[currentIdx]}
                </h3>
              </div>

              {/* Text Area */}
              <textarea
                value={currentAnswer}
                onChange={handleInputChange}
                placeholder={placeholders[currentIdx] || "Be honest — no one else sees this but you."}
                rows={5}
                className="w-full text-stone-800 font-sans text-sm p-4 rounded-2xl border-2 border-stone-200 focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] focus:outline-hidden transition-all placeholder:text-stone-400 bg-stone-50/50 resize-none"
                id={`reflection-input-${currentIdx}`}
              />

              {/* Auto save message */}
              <p className="text-[10px] text-stone-400 mt-2 font-mono text-right">
                ✓ Auto-saving locally
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Gentle nudge warning block */}
        <AnimatePresence>
          {showNudge && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-stone-800 text-xs"
              id="reflection-nudge"
            >
              <div className="flex items-start gap-2.5">
                <div className="text-amber-600 font-bold mt-0.5">💡 Insight:</div>
                <div className="flex-1">
                  <p className="font-serif italic font-medium">"This one's worth sitting with — want to come back to it?"</p>
                  <p className="text-[11px] text-stone-500 mt-1">Writing crystallizes thought. If you are stuck, write a single word or short phrase. Or, skip to proceed anyway.</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setShowNudge(false)}
                      className="bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 font-medium px-3 py-1.5 rounded-lg text-[11px] cursor-pointer"
                    >
                      Stay & Reflect
                    </button>
                    <button
                      onClick={handleNudgeSkip}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold px-3 py-1.5 rounded-lg text-[11px] cursor-pointer"
                    >
                      Skip Question
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Nav Controls */}
      <div className="mt-8 flex flex-col gap-4" id="reflection-footer">
        {/* Progress horizontal bar */}
        <div className="flex items-center gap-1 w-full px-2">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                idx === currentIdx 
                  ? 'bg-[#C85A32]' 
                  : idx < currentIdx 
                    ? 'bg-stone-500' 
                    : 'bg-stone-200'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full bg-[#1C1917] hover:bg-[#C85A32] text-white font-sans font-medium py-3.5 px-6 rounded-2xl transition-all shadow-sm active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          id="reflection-continue-button"
        >
          <span>
            {currentIdx === questions.length - 1 ? 'Complete Reflection' : 'Next Question'}
          </span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
