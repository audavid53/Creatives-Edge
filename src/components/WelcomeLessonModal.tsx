import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, BookOpen, Compass, Target } from 'lucide-react';
import { Lesson } from '../types';

interface WelcomeLessonModalProps {
  lesson: Lesson;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Lesson intro — no per-lesson pledge. Instead it reframes the journey each
 * time (stop competing → discover the market only you can serve) and previews
 * today's focus. The one-time commitment pledge lives in Admission.
 */
export const WelcomeLessonModal: React.FC<WelcomeLessonModalProps> = ({
  lesson,
  onConfirm,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-[#0B1F3A]/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="bg-white w-full max-w-lg rounded-3xl p-6 md:p-8 border border-[#D6E4FA] shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xs uppercase tracking-wider font-bold p-2 z-10 transition-colors"
        >
          Cancel
        </button>

        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-[#2563EB] uppercase font-extrabold">
            <Sparkles size={11} /> Your Journey
          </span>
          <h2 className="text-2xl font-serif font-bold text-[#0B1F3A] mt-2 leading-tight">
            Remember why you're here.
          </h2>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed px-2">
            This is a journey to help you go from{' '}
            <span className="font-semibold text-[#0B1F3A]">competing for the same gigs and brand deals as every creative</span>{' '}
            — to <span className="font-semibold text-[#2563EB]">discovering a market need you are uniquely positioned to solve.</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-2.5">
            <Compass size={17} className="text-slate-400 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-slate-600 leading-snug">Stop competing in saturated markets.</p>
          </div>
          <div className="bg-[#EFF5FE] border border-[#D6E4FA] rounded-2xl p-4 flex items-start gap-2.5">
            <Target size={17} className="text-[#2563EB] shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-[#0B1F3A] leading-snug">Create a market only you can serve.</p>
          </div>
        </div>

        {/* Today's focus */}
        <div className="bg-gradient-to-br from-[#EFF5FE] to-[#DCE9FB] rounded-2xl p-5 border border-[#D6E4FA] mt-6">
          <span className="text-[9px] font-mono tracking-widest text-[#2563EB] uppercase font-extrabold flex items-center gap-1.5">
            <BookOpen size={11} /> Today's focus • Day {lesson.dayNumber}
          </span>
          <h3 className="text-lg font-serif font-bold text-[#0B1F3A] mt-1.5">{lesson.title}</h3>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            {lesson.aboutText || lesson.tagline}
          </p>
        </div>

        <button
          onClick={onConfirm}
          className="w-full mt-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-[#2563EB]/25 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer active:scale-[0.98]"
        >
          <span>Let's begin</span>
          <ArrowRight size={14} />
        </button>
      </motion.div>
    </div>
  );
};
