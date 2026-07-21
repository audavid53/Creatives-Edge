import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ArrowRight, ArrowLeft, Sparkles, Award, Shield, BookOpen } from 'lucide-react';
import { Lesson } from '../types';

interface WelcomeLessonModalProps {
  lesson: Lesson;
  onConfirm: () => void;
  onClose: () => void;
}

export const WelcomeLessonModal: React.FC<WelcomeLessonModalProps> = ({
  lesson,
  onConfirm,
  onClose
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [truths, setTruths] = useState<boolean[]>([false, false, false]);

  const truthStatements = [
    "You are passionate about your Creativity.",
    "You want to live a soft life from your Creativity.",
    "You are done trading hours for money. You want your earn without spending from your personal time."
  ];

  const handleToggleTruth = (index: number) => {
    const updated = [...truths];
    updated[index] = !updated[index];
    setTruths(updated);
  };

  const allTicked = truths.every(t => t);
  const tickedCount = truths.filter(t => t).length;

  const handleNextSlide = () => {
    if (currentSlide === 0 && !allTicked) return;
    if (currentSlide < 2) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onConfirm();
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0B1F3A]/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="bg-[#EFF5FE] w-full max-w-lg rounded-3xl p-6 md:p-8 border border-[#D6E4FA] shadow-2xl relative max-h-[90vh] flex flex-col justify-between"
      >
        {/* Cancel button in top right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-sans text-xs uppercase tracking-wider font-bold p-2 z-10 transition-colors"
        >
          Cancel
        </button>

        {/* Content container */}
        <div className="overflow-y-auto pr-1 flex-1 py-4 flex flex-col justify-center min-h-[350px]">
          <AnimatePresence mode="wait">
            {currentSlide === 0 && (
              <motion.div
                key="slide-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="text-center pb-2">
                  <span className="text-[10px] font-mono tracking-widest text-[#2563EB] uppercase font-extrabold flex items-center justify-center gap-1.5">
                    <Sparkles size={11} />
                    ADMISSION CRITERIA
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-slate-900 mt-1">Welcome to the Creative Edge Academy</h2>
                </div>

                <p className="text-slate-600 text-sm font-sans leading-relaxed text-center px-4">
                  You are here because three things are true about you:
                </p>

                <div className="space-y-2.5">
                  {truthStatements.map((statement, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleToggleTruth(idx)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                        truths[idx]
                          ? 'bg-[#2563EB]/5 border-[#2563EB] text-slate-950 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        truths[idx] 
                          ? 'bg-[#2563EB] border-[#2563EB] text-white' 
                          : 'border-slate-300 bg-slate-50'
                      }`}>
                        {truths[idx] && <Check size={11} strokeWidth={3} />}
                      </div>
                      <span className="text-xs font-sans font-medium leading-relaxed">
                        {statement}
                      </span>
                    </div>
                  ))}
                </div>

                {!allTicked && (
                  <p className="text-[10px] text-center font-mono text-slate-400 font-bold uppercase">
                    Please tick all 3 statements to verify your profile ({tickedCount}/3)
                  </p>
                )}
              </motion.div>
            )}

            {currentSlide === 1 && (
              <motion.div
                key="slide-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <span className="text-[10px] font-mono tracking-widest text-[#2563EB] uppercase font-extrabold flex items-center justify-center gap-1.5">
                    <Shield size={11} />
                    FOUNDATIONAL THEOREM
                  </span>
                  <h2 className="text-xl font-serif font-bold text-slate-900 mt-1">Here is the truth this academy is built on:</h2>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-[#D6E4FA] shadow-xs relative">
                  <div className="absolute -top-3 left-6 bg-[#2563EB] text-white text-[9px] font-mono uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full">
                    Axiom
                  </div>
                  <p className="text-sm md:text-base italic font-serif text-slate-900 leading-relaxed font-bold border-l-2 border-[#2563EB] pl-3 py-1">
                    Sustainable wealth comes from solving a small problem for many customers (High Volume × Low Price), or a massive pain point for a few wealthy ones.(Low Volume × High Price)
                  </p>
                </div>

                <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 text-center">
                  <p className="text-xs text-slate-600 font-sans leading-relaxed">
                    Not from working harder. Not from posting more. Not from being more talented than the next creative.
                  </p>
                </div>
              </motion.div>
            )}

            {currentSlide === 2 && (
              <motion.div
                key="slide-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <span className="text-[10px] font-mono tracking-widest text-[#2563EB] uppercase font-extrabold flex items-center justify-center gap-1.5">
                    <BookOpen size={11} />
                    TODAY'S CURRICULUM • DAY {lesson.dayNumber}
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-slate-900 mt-1">{lesson.title}</h2>
                </div>

                <div className="bg-amber-50/40 rounded-2xl p-5 border border-amber-200/50 space-y-2">
                  <span className="text-[9px] font-mono text-amber-700 font-bold uppercase tracking-wider">
                    Today's Exposure Summary
                  </span>
                  <p className="text-xs md:text-sm text-slate-800 leading-relaxed font-medium">
                    This Lesson, you will expose <span className="text-[#2563EB] font-semibold">"{lesson.aboutText || lesson.tagline || 'key components'}"</span>.
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-xs text-slate-500 font-sans italic">
                    Are you ready to claim your creative leverage? Let's step up to the challenge.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions & slide indicators */}
        <div className="mt-6 pt-4 border-t border-slate-200/50 space-y-4">
          {/* Progress dots */}
          <div className="flex justify-center items-center gap-2">
            {[0, 1, 2].map((sIdx) => (
              <div
                key={sIdx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === sIdx 
                    ? 'w-6 bg-[#2563EB]' 
                    : 'w-1.5 bg-slate-300'
                }`}
              />
            ))}
          </div>

          {/* Buttons row */}
          <div className="flex items-center gap-3">
            {currentSlide > 0 && (
              <button
                type="button"
                onClick={handlePrevSlide}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-sans font-bold py-3 px-5 rounded-2xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNextSlide}
              disabled={currentSlide === 0 && !allTicked}
              className={`flex-1 font-sans font-bold py-3.5 px-6 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider ${
                (currentSlide === 0 && !allTicked)
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer active:scale-98'
              }`}
            >
              <span>
                {currentSlide === 0 ? "Verify Premise" : currentSlide === 1 ? "Next Slide" : "Let's begin"}
              </span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
