import React, { useState } from 'react';
import { Quiz } from '../types';
import { Illustration } from './Illustration';
import { CheckCircle2, AlertCircle, Award, ArrowRight, Share2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface QuizViewProps {
  quiz: Quiz;
  dayNumber: number;
  onNext: (selectedAnswer: number, isCorrectFirstTry: boolean) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  quiz,
  dayNumber,
  onNext
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [firstTryCorrect, setFirstTryCorrect] = useState(true);

  const handleOptionSelect = (idx: number) => {
    if (hasAnsweredCorrectly) return; // Lock options once correct

    setSelectedIdx(idx);
    setAttempts(prev => prev + 1);

    if (idx === quiz.correctIndex) {
      setHasAnsweredCorrectly(true);
      if (attempts > 0) {
        setFirstTryCorrect(false);
      }
    } else {
      // Wrong answer
      if (attempts === 0) {
        setFirstTryCorrect(false);
      }
    }
  };

  const handleContinue = () => {
    if (selectedIdx !== null) {
      onNext(selectedIdx, firstTryCorrect);
    }
  };

  return (
    <div className="flex flex-col min-h-full justify-between pb-8 px-5 py-6">
      <div>
        {/* Header */}
        <div className="text-center mb-6" id="quiz-header">
          <span className="text-xs font-mono font-bold text-[#2563EB] uppercase">Day {dayNumber} • Active Recall</span>
          <h2 className="text-xl font-serif font-bold text-slate-900 mt-1">Reflect & Retain</h2>
          <p className="text-xs text-slate-500 mt-1">Recall reinforces memory. Select the core truth below.</p>
        </div>

        {/* Question Container */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs mb-6" id="quiz-question-card">
          <h3 className="text-base md:text-lg font-serif font-bold text-slate-800 leading-snug mb-5">
            {quiz.question}
          </h3>

          {/* Options List */}
          <div className="flex flex-col gap-3" id="quiz-options-list">
            {quiz.options.map((option, idx) => {
              const isSelected = selectedIdx === idx;
              const isCorrect = idx === quiz.correctIndex;
              const isWrongSelection = isSelected && !isCorrect;

              let btnStyle = "border-slate-200 hover:border-slate-300 bg-white text-slate-700";
              if (isSelected) {
                if (isCorrect) {
                  btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900";
                } else {
                  btnStyle = "border-rose-400 bg-rose-50/70 text-rose-900";
                }
              } else if (hasAnsweredCorrectly && isCorrect) {
                // Highlight correct answer even if they got it after retry
                btnStyle = "border-emerald-300 bg-emerald-50/50 text-emerald-800";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  disabled={hasAnsweredCorrectly}
                  className={`w-full text-left font-sans text-sm p-4 rounded-2xl border-2 transition-all flex justify-between items-center cursor-pointer active:scale-99 ${btnStyle}`}
                  id={`quiz-option-${idx}`}
                >
                  <span className="font-medium pr-3">{option}</span>
                  {isSelected && isCorrect && <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />}
                  {isSelected && !isCorrect && <AlertCircle size={18} className="text-rose-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Correct/Incorrect Feedback micro-copy */}
          {selectedIdx !== null && (
            <div className="mt-4 text-center">
              {hasAnsweredCorrectly ? (
                <p className="text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1">
                  <CheckCircle2 size={14} /> Magnificent. You've uncovered the core truth.
                </p>
              ) : (
                <p className="text-xs text-rose-600 font-semibold flex items-center justify-center gap-1 animate-pulse">
                  <AlertCircle size={14} /> That's not quite it. Sit with the story for a moment and try again.
                </p>
              )}
            </div>
          )}
        </div>

        {/* The Key Insight Payoff moment - treat it like a beautiful quotable card */}
        {hasAnsweredCorrectly && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#EFF5FE] border-2 border-amber-300/60 rounded-3xl p-6 shadow-sm relative overflow-hidden"
            id="key-insight-card"
          >
            {/* Soft decorative background illustration */}
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
              <Illustration type="mirror" size={120} />
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="bg-amber-100 p-1.5 rounded-full text-amber-700">
                <Sparkles size={14} className="fill-amber-300" />
              </div>
              <span className="text-xs font-mono font-bold text-amber-800 uppercase tracking-widest">Key Insight</span>
            </div>

            <h4 className="text-lg font-serif italic text-slate-800 leading-relaxed font-medium">
              "{quiz.keyInsightText}"
            </h4>

            <div className="mt-4 flex items-center justify-between border-t border-[#D6E4FA] pt-3 text-[10px] font-mono text-slate-400">
              <span>Day {dayNumber} Devotional Takeaway</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(quiz.keyInsightText);
                  alert("Insight copied to clipboard!");
                }}
                className="hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                title="Copy Insight"
              >
                <Share2 size={11} /> Copy
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer Continue */}
      <div className="mt-8" id="quiz-footer">
        <button
          onClick={handleContinue}
          disabled={!hasAnsweredCorrectly}
          className={`w-full font-sans font-medium py-3.5 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
            hasAnsweredCorrectly 
              ? 'bg-[#0B1F3A] hover:bg-[#2563EB] text-white active:scale-98' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
          }`}
          id="quiz-continue-button"
        >
          <span>Continue to Reflections</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
