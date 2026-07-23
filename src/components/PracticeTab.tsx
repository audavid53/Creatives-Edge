import React from 'react';
import { Lesson, UserLessonRecord } from '../types';
import { getLessonByDay } from '../data/lessons';
import { Mic, Play, Video, ArrowRight, BookOpen, CheckCircle } from 'lucide-react';

interface PracticeTabProps {
  completedDays: number[];
  lessonRecords: Record<number, UserLessonRecord>;
  customLessons: Record<number, Lesson>;
  onPlayDrill: (day: number) => void;
  onGoToJourney: () => void;
}

export const PracticeTab: React.FC<PracticeTabProps> = ({
  completedDays,
  lessonRecords,
  customLessons,
  onPlayDrill,
  onGoToJourney,
}) => {
  const titleFor = (day: number) => (customLessons[day] || getLessonByDay(day)).title;

  // A drill is unlocked for any completed day that has written reflections.
  const unlocked = [...completedDays]
    .filter((day) => {
      const rec = lessonRecords[day];
      return rec && rec.reflectionAnswers && rec.reflectionAnswers.some((a) => a && a.trim().length > 0);
    })
    .sort((a, b) => b - a);

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8" id="practice-tab">
      <div className="mb-7">
        <span className="text-[10px] font-mono tracking-[0.18em] text-[#2563EB] uppercase font-bold inline-flex items-center gap-1.5">
          <Mic size={12} /> Spontaneity Training
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#0B1F3A] tracking-tight mt-1">
          Speaking drills
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 max-w-lg">
          Turn your written reflections into confident, on-demand pitches. Recording windows shrink
          each round: <span className="font-semibold text-[#0B1F3A]">1m → 30s → 15s</span>.
        </p>
      </div>

      {unlocked.length === 0 ? (
        <div className="bg-white border border-[#D6E4FA] rounded-3xl p-8 text-center shadow-sm">
          <div className="inline-block p-4 bg-[#EFF5FE] rounded-full text-[#2563EB] mb-4 border border-[#D6E4FA]">
            <Mic size={26} />
          </div>
          <h3 className="text-lg font-serif font-bold text-[#0B1F3A]">No drills unlocked yet</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            Complete a lesson — including its written reflections — and its speaking drill unlocks here.
          </p>
          <button
            onClick={onGoToJourney}
            className="mt-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm py-3 px-7 rounded-2xl transition-all shadow-lg shadow-[#2563EB]/25 active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer"
          >
            <BookOpen size={16} /> Go to today's lesson <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {unlocked.map((day) => {
            const played = lessonRecords[day]?.practiceGamePlayed;
            return (
              <button
                key={day}
                onClick={() => onPlayDrill(day)}
                className="bg-white hover:bg-[#EFF5FE] border border-[#D6E4FA] hover:border-[#2563EB] rounded-3xl p-5 text-left transition-all shadow-sm group active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#2563EB] uppercase tracking-wide">Day {day}</span>
                  {played && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-600 uppercase">
                      <CheckCircle size={11} className="fill-emerald-50" /> Practiced
                    </span>
                  )}
                </div>
                <h3 className="text-base font-serif font-bold text-[#0B1F3A] mt-2 leading-snug line-clamp-2">
                  {titleFor(day)}
                </h3>
                <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#2563EB]">
                  <span className="bg-[#EFF5FE] group-hover:bg-white p-2 rounded-xl border border-[#D6E4FA] transition-colors">
                    <Video size={14} />
                  </span>
                  <span className="inline-flex items-center gap-1 uppercase tracking-wide">
                    {played ? 'Practice again' : 'Start drill'} <Play size={12} className="fill-[#2563EB]" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
