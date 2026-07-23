import React from 'react';
import { User } from 'firebase/auth';
import { UserProgress, Lesson } from '../types';
import { CommunityStats } from '../lib/communityStats';
import { motion } from 'motion/react';
import {
  Flame, Users, BookOpen, TrendingUp, ArrowRight, Clock, Mic, Trophy, Sparkles,
} from 'lucide-react';

interface HomeTabProps {
  user: User | null;
  progress: UserProgress;
  todayLesson: Lesson;
  todayCompleted: boolean;
  stats: CommunityStats | null;
  displayName: string;
  onContinue: () => void;
  onGoToPractice: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  progress,
  todayLesson,
  todayCompleted,
  stats,
  displayName,
  onContinue,
  onGoToPractice,
}) => {
  const currentDay = progress.currentDay || 1;
  const myCompleted = progress.completedDays.length;
  const avg = stats ? stats.avgCompletions : 0;
  const totalCreatives = stats ? Math.max(stats.totalCreatives, 1) : null;

  // You vs the average creative — normalize both bars against the leader
  const barMax = Math.max(myCompleted, avg, 1);
  const myPct = Math.round((myCompleted / barMax) * 100);
  const avgPct = Math.round((avg / barMax) * 100);
  const aheadBy = avg > 0 ? Math.round(((myCompleted - avg) / avg) * 100) : null;

  const statTiles = [
    {
      icon: Users,
      label: 'Creatives on the journey',
      value: totalCreatives !== null ? totalCreatives.toLocaleString() : '—',
      tint: 'text-[#2563EB]',
    },
    {
      icon: BookOpen,
      label: 'Your lessons completed',
      value: myCompleted.toString(),
      tint: 'text-[#2563EB]',
    },
    {
      icon: TrendingUp,
      label: 'Cohort average',
      value: avg > 0 ? avg.toFixed(1) : '—',
      tint: 'text-[#EAB308]',
    },
    {
      icon: Flame,
      label: 'Your streak',
      value: `${progress.streakCount}d`,
      tint: 'text-[#EAB308]',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8" id="home-tab">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-mono tracking-[0.18em] text-[#2563EB] uppercase font-bold">Day {currentDay} of 30</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#0B1F3A] tracking-tight mt-1">
            Welcome back, {displayName.split(' ')[0]}.
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 max-w-lg">
            Here's how you're moving compared to other creatives on the same journey.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-[#FEF9C3] px-3 py-2 rounded-full border border-[#FDE68A] shrink-0">
          <Flame size={16} className="text-[#EAB308] fill-[#FACC15]" />
          <span className="text-xs font-bold text-[#854D0E]">{progress.streakCount}-day streak</span>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statTiles.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="bg-white border border-[#D6E4FA] rounded-3xl p-5 shadow-sm"
            >
              <Icon size={18} className={s.tint} />
              <p className="text-2xl font-serif font-extrabold text-[#0B1F3A] mt-3 leading-none">{s.value}</p>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-tight font-medium">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* You vs cohort comparison */}
      <div className="bg-white border border-[#D6E4FA] rounded-3xl p-6 sm:p-7 shadow-sm mb-6" id="cohort-compare">
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-[9px] font-mono text-[#2563EB] font-bold tracking-[0.18em] uppercase">You vs the cohort</span>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#0B1F3A] mt-1">
              {aheadBy !== null && aheadBy > 0
                ? `You're ${aheadBy}% ahead of the average creative.`
                : aheadBy !== null && aheadBy < 0
                  ? `You're just behind the average — one lesson closes the gap.`
                  : `You're right with the pack. Keep the streak alive.`}
            </h3>
          </div>
          <Trophy size={22} className="text-[#FACC15] hidden sm:block" />
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-[#0B1F3A]">You</span>
              <span className="text-[#2563EB] font-mono">{myCompleted} lessons</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#FACC15]"
                initial={{ width: 0 }}
                animate={{ width: `${myPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-500">Average creative</span>
              <span className="text-slate-400 font-mono">{avg > 0 ? avg.toFixed(1) : '—'} lessons</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-slate-300"
                initial={{ width: 0 }}
                animate={{ width: `${avgPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
              />
            </div>
          </div>
        </div>

        {!stats && (
          <p className="text-[11px] font-mono text-slate-400 mt-4">
            Cohort numbers appear once the community stats rule is deployed.
          </p>
        )}
      </div>

      {/* Continue + pledge row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue card */}
        <div className="lg:col-span-2 bg-[#0B1F3A] rounded-3xl p-6 sm:p-7 text-white relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 opacity-10"><Sparkles size={130} /></div>
          <span className="text-[9px] font-mono font-bold text-[#FACC15] uppercase tracking-[0.18em] relative">
            {todayCompleted ? 'Today complete' : `Day ${todayLesson.dayNumber} • Today's focus`}
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold mt-2 leading-tight relative">
            {todayCompleted ? 'Nice work today.' : todayLesson.title}
          </h3>
          <p className="text-sm text-slate-300 mt-2 max-w-md relative leading-relaxed">
            {todayCompleted
              ? 'You showed up. Sharpen it with a speaking drill, or rest and return tomorrow.'
              : todayLesson.tagline}
          </p>
          <div className="flex flex-wrap gap-3 mt-6 relative">
            {!todayCompleted ? (
              <button
                onClick={onContinue}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm py-3 px-6 rounded-2xl transition-all shadow-lg shadow-[#2563EB]/30 active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer"
              >
                <BookOpen size={16} /> Continue today's lesson <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={onGoToPractice}
                className="bg-[#FACC15] hover:bg-[#EAB308] text-[#0B1F3A] font-bold text-sm py-3 px-6 rounded-2xl transition-all active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer"
              >
                <Mic size={16} /> Practice speaking drill
              </button>
            )}
          </div>
        </div>

        {/* Pledge card */}
        <div className="bg-white border border-[#D6E4FA] rounded-3xl p-6 shadow-sm flex flex-col">
          <span className="text-[9px] font-mono font-bold text-[#EAB308] uppercase tracking-[0.18em] inline-flex items-center gap-1.5">
            <Clock size={12} /> Your daily pledge
          </span>
          {progress.pledgeTime ? (
            <>
              <p className="text-3xl font-serif font-extrabold text-[#0B1F3A] mt-3">{progress.pledgeTime}</p>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                You pledged to show up daily at this time. Consistency is the whole game.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-500 mt-3 leading-relaxed">
              Set a daily time in your Profile to lock in your commitment.
            </p>
          )}
          <div className="mt-auto pt-4">
            <p className="text-[11px] font-serif italic text-slate-500 leading-relaxed">
              "We don't compete — we create new markets."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
