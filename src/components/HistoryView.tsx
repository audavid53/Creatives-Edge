import React, { useState } from 'react';
import { getLessonByDay } from '../data/lessons';
import { UserLessonRecord, Lesson } from '../types';
import { generateLessonPDF } from '../lib/pdfHelper';
import { ArrowLeft, BookOpen, Lock, CheckCircle, ChevronDown, ChevronUp, Download, Play, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryViewProps {
  currentDay: number;
  completedDays: number[];
  completedToday: boolean;
  customLessons: Record<number, Lesson>;
  lessonRecords: Record<number, UserLessonRecord>;
  onSelectLesson: (dayNumber: number) => void;
  onPlayGame: (dayNumber: number) => void;
  onBack: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  currentDay,
  completedDays,
  completedToday,
  customLessons,
  lessonRecords,
  onSelectLesson,
  onPlayGame,
  onBack
}) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const toggleExpand = (day: number) => {
    if (expandedDay === day) {
      setExpandedDay(null);
    } else {
      setExpandedDay(day);
    }
  };

  const handleDownloadPDF = (day: number) => {
    const lesson = customLessons[day] || getLessonByDay(day);
    const record = lessonRecords[day];
    if (!record) return;

    generateLessonPDF(
      day,
      lesson.title,
      lesson.quiz.keyInsightText,
      lesson.reflectionQuestions,
      record.reflectionAnswers
    );
  };

  // Build list of all 30 Days
  const daysArray = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="flex flex-col min-h-full justify-between pb-8 px-5 py-6" id="history-archive-screen">
      <div>
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6" id="history-top-bar">
          <button
            onClick={onBack}
            className="text-xs font-mono font-medium text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
            id="history-back-btn"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <span className="text-xs font-mono font-bold text-[#C85A32] uppercase font-semibold">
            Curriculum Archive
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-8" id="history-header">
          <div className="inline-block p-3 bg-[#FAF6F0] rounded-full text-[#C85A32] mb-3 border border-[#EBE3D5]">
            <Calendar size={24} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 mt-1">The 30-Day Blueprint</h2>
          <p className="text-xs text-stone-500 mt-1.5 px-4 leading-relaxed">
            Your personal treasury of creative business breakthroughs. Review past insights, download journals, and redo past lessons anytime.
          </p>
        </div>

        {/* Days List */}
        <div className="flex flex-col gap-3" id="history-list-days">
          {daysArray.map((day) => {
            const isCompleted = completedDays.includes(day);
            const isCurrent = day === currentDay;
            const isLocked = day > currentDay && !isCompleted;
            const isExpanded = expandedDay === day;
            const lesson = customLessons[day] || getLessonByDay(day);
            const record = lessonRecords[day];

            return (
              <div
                key={day}
                className={`border rounded-2xl transition-all overflow-hidden bg-white ${
                  isExpanded ? 'border-stone-300 shadow-sm' : 'border-stone-200/60'
                }`}
                id={`history-day-card-${day}`}
              >
                {/* Day row trigger */}
                <div
                  onClick={() => !isLocked && toggleExpand(day)}
                  className={`p-4 flex items-center justify-between cursor-pointer select-none transition-colors ${
                    isLocked ? 'opacity-50 bg-stone-50 cursor-not-allowed' : 'hover:bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    {isCompleted ? (
                      <div className="text-emerald-600 bg-emerald-50 p-1.5 rounded-full border border-emerald-100">
                        <CheckCircle size={16} className="fill-emerald-10" />
                      </div>
                    ) : isCurrent ? (
                      <div className="text-stone-800 bg-[#FAF6F0] p-1.5 rounded-full border border-stone-200 animate-pulse">
                        <BookOpen size={16} />
                      </div>
                    ) : (
                      <div className="text-stone-400 bg-stone-100 p-1.5 rounded-full">
                        <Lock size={16} />
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] font-mono text-stone-400 font-semibold uppercase">
                        Day {day} {isCurrent && "• Active Focus"}
                      </span>
                      <h3 className="text-sm font-serif font-bold text-stone-800 mt-0.5">
                        {lesson.title}
                      </h3>
                    </div>
                  </div>

                  {!isLocked && (
                    <div className="text-stone-400 pl-2">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  )}
                </div>

                {/* Expanded Details Card */}
                <AnimatePresence initial={false}>
                  {isExpanded && !isLocked && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="border-t border-stone-100 overflow-hidden"
                    >
                      <div className="p-5 bg-stone-50/40">
                        {isCompleted && record ? (
                          <div className="flex flex-col gap-4">
                            {/* Key Insight */}
                            <div className="bg-[#FAF6F0] border-l-3 border-amber-400 p-4 rounded-r-xl">
                              <span className="text-[9px] font-mono font-bold text-amber-800 uppercase tracking-widest block mb-1">Declared Key Insight</span>
                              <p className="text-xs italic font-serif text-stone-800 font-medium">
                                "{lesson.quiz.keyInsightText}"
                              </p>
                            </div>

                            {/* Reflection Answers */}
                            <div className="flex flex-col gap-3">
                              <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest pl-1 block">Your Scribed Responses</span>
                              {lesson.reflectionQuestions.map((q, idx) => {
                                const ans = record.reflectionAnswers[idx]?.trim() || "No response recorded.";
                                return (
                                  <div key={idx} className="bg-white p-3 rounded-xl border border-stone-100 shadow-3xs">
                                    <p className="text-xs font-serif font-semibold text-stone-800">
                                      {idx + 1}. {q}
                                    </p>
                                    <p className="text-xs text-stone-600 italic font-sans mt-1.5 border-l border-stone-200 pl-2">
                                      "{ans}"
                                    </p>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Interactive Quick Actions */}
                            <div className="grid grid-cols-2 gap-3 mt-2 pt-2 border-t border-stone-100">
                              <button
                                onClick={() => handleDownloadPDF(day)}
                                className="bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-medium py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Download size={13} />
                                <span>Download Keepsake</span>
                              </button>
                              <button
                                onClick={() => onSelectLesson(day)}
                                className="bg-[#1C1917] hover:bg-[#C85A32] text-white text-xs font-medium py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <BookOpen size={13} />
                                <span>Redo Lesson</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          // If current day but not yet completed
                          <div className="text-center py-4 flex flex-col items-center">
                            <p className="text-xs text-stone-500 font-sans mb-3">
                              You haven't completed Day {day} lesson yet. Unlock this day's active recalls and reflections.
                            </p>
                            {completedToday ? (
                              <div className="bg-stone-100 p-3.5 rounded-2xl border border-stone-200 text-stone-500 flex items-center justify-center gap-1.5 text-xs font-mono max-w-xs mx-auto">
                                <Lock size={12} className="text-[#C85A32]" />
                                <span>Day {day} will unlock tomorrow (One lesson per day limit)</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => onSelectLesson(day)}
                                className="bg-[#1C1917] hover:bg-[#C85A32] text-white text-xs font-medium py-2.5 px-5 rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                              >
                                <BookOpen size={14} />
                                <span>Begin Day {day} Lesson</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Back home */}
      <div className="text-center mt-10" id="history-footer">
        <button
          onClick={onBack}
          className="bg-[#1C1917] hover:bg-stone-900 text-white text-xs font-sans font-medium py-3 px-6 rounded-2xl transition-all shadow-sm cursor-pointer"
        >
          Return to Academy Dashboard
        </button>
      </div>
    </div>
  );
};
