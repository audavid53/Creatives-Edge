import React from 'react';
import { User } from 'firebase/auth';
import { Lesson, UserProgress } from '../types';
import { Illustration } from './Illustration';
import {
  BookOpen, Flame, CheckCircle, Calendar,
  Sparkles, Lock, Phone, PenTool, Users, Package, Trophy, RefreshCw,
  Mic, Video, ArrowRight
} from 'lucide-react';

interface LandingProps {
  user: User | null;
  progress: UserProgress;
  todayLesson: Lesson;
  todayCompleted: boolean;
  completedToday: boolean;
  userPhoneNumber: string;
  isAdmin: boolean;
  onBeginLesson: () => void;
  onLogout: () => void;
  onViewHistory: () => void;
  onPlayPracticeGameDirectly: () => void;
  onDownloadDirectly: () => void;
  onUpdatePhoneNumber: (phone: string) => void;
  onOpenAdmin: () => void;
  onLogoClick?: () => void;
  userDisplayName?: string;
  userProfilePic?: string;
}

export const Landing: React.FC<LandingProps> = ({
  user,
  progress,
  todayLesson,
  todayCompleted,
  completedToday,
  userPhoneNumber,
  isAdmin,
  onBeginLesson,
  onViewHistory,
  onPlayPracticeGameDirectly,
  onDownloadDirectly,
  onUpdatePhoneNumber,
  onOpenAdmin,
  userDisplayName,
  userProfilePic
}) => {
  const isGuest = user?.isAnonymous;
  const currentDay = progress.currentDay || todayLesson.dayNumber || 1;
  const displayName = isGuest
    ? 'Creative Guest'
    : (userDisplayName || user?.displayName || user?.email?.split('@')[0] || 'Creative Practitioner');

  const milestones = [
    { day: 5, label: "Create Content", icon: PenTool },
    { day: 10, label: "Build Community", icon: Users },
    { day: 15, label: "Create Product", icon: Package },
    { day: 20, label: "Get Customer", icon: Trophy }
  ];

  const getLineProgress = () => {
    if (currentDay >= 20) return 100;
    if (currentDay >= 15) return 80;
    if (currentDay >= 10) return 48;
    if (currentDay >= 5) return 15;
    return 0;
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8" id="landing-dashboard">

      {/* Greeting hero */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-mono tracking-[0.18em] text-[#2563EB] uppercase font-bold">Day {currentDay} of 30</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#0B1F3A] tracking-tight mt-1">
            Welcome back, {displayName.split(' ')[0]}.
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 max-w-lg">
            Decouple your income from your time — one focused lesson at a time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-2 rounded-full border border-amber-200">
            <Flame size={16} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-amber-800">{progress.streakCount}-day streak</span>
          </div>
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 bg-[#0B1F3A] hover:bg-[#2563EB] text-white text-[10px] font-mono font-bold px-3 py-2 rounded-full transition-all cursor-pointer uppercase tracking-wider"
              id="open-admin-boardroom-btn"
            >
              <Sparkles size={11} className="animate-pulse text-amber-300" />
              <span>Console</span>
            </button>
          )}
        </div>
      </div>

      {/* The 30-Day Path — full-width milestone tracker */}
      <div className="bg-white border border-[#D6E4FA] rounded-3xl p-6 sm:p-7 shadow-sm mb-6" id="academy-milestones">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[9px] font-mono text-[#2563EB] font-bold tracking-[0.18em] uppercase">The Path Ahead</span>
            <p className="text-base sm:text-lg font-serif font-bold text-[#0B1F3A] leading-snug mt-1 max-w-xl">
              30 days to your first paying customer — without selling your time.
            </p>
          </div>
          <span className="hidden sm:block text-2xl font-serif font-extrabold text-[#2563EB]">
            {Math.round((progress.completedDays.length / 30) * 100)}%
          </span>
        </div>

        <div className="relative pt-2 pb-6 px-1">
          <div className="absolute top-[22px] left-4 right-4 h-[3px] bg-slate-100 rounded-full" />
          <div
            className="absolute top-[22px] left-4 h-[3px] bg-[#2563EB] rounded-full transition-all duration-700"
            style={{ width: `calc(${getLineProgress()}% - ${getLineProgress() === 0 ? '0px' : getLineProgress() === 100 ? '32px' : '16px'})` }}
          />
          <div className="relative flex justify-between">
            {milestones.map((m) => {
              const isReached = currentDay >= m.day;
              const Icon = m.icon;
              return (
                <div key={m.day} className="flex flex-col items-center group relative z-10">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    isReached
                      ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-lg shadow-[#2563EB]/25 scale-110'
                      : 'bg-white border-slate-200 text-slate-400 group-hover:border-[#93B4F5]'
                  }`}>
                    <Icon size={16} />
                  </div>
                  <span className={`text-[9px] font-mono font-bold uppercase mt-2 px-2 py-0.5 rounded-md transition-colors duration-500 ${
                    isReached ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'bg-slate-50 text-slate-400'
                  }`}>
                    Day {m.day}
                  </span>
                  <span className={`text-[11px] font-sans font-semibold tracking-tight mt-1.5 text-center max-w-[80px] leading-tight ${
                    isReached ? 'text-[#0B1F3A]' : 'text-slate-400'
                  }`}>
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main dashboard grid */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left / main column — Today's lesson + speaking drill */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Today's Focus */}
          <div id="todays-lesson-container">
            <h3 className="text-[10px] font-mono tracking-[0.18em] text-[#2563EB] uppercase font-bold mb-3 flex items-center gap-1.5">
              <Sparkles size={12} /> Today's Focus
            </h3>

            {completedToday && !todayCompleted ? (
              /* Locked state */
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col items-center text-center">
                <div className="p-4 bg-[#EFF5FE] rounded-full text-[#2563EB] mb-4 border border-[#D6E4FA]">
                  <Lock size={26} />
                </div>
                <span className="text-[10px] font-mono font-bold text-[#2563EB] uppercase">Day {todayLesson.dayNumber} Locked</span>
                <h3 className="text-lg font-serif font-bold text-[#0B1F3A] mt-1">One lesson per day</h3>
                <p className="text-sm text-slate-600 mt-2 max-w-md leading-relaxed">
                  You've completed today's lesson. Consistency compounds — Day {todayLesson.dayNumber} unlocks tomorrow.
                </p>
                <button
                  disabled
                  className="bg-slate-100 text-slate-400 font-sans font-bold py-3.5 px-8 rounded-2xl mt-6 flex items-center justify-center gap-2 cursor-not-allowed text-xs border border-slate-200 uppercase tracking-wider"
                >
                  <Lock size={13} /><span>Unlocks Tomorrow</span>
                </button>
              </div>
            ) : !todayCompleted ? (
              /* Available lesson */
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:border-[#93B4F5] transition-all">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="bg-[#EFF5FE] p-5 rounded-3xl border border-[#D6E4FA] shrink-0">
                    <Illustration type={todayLesson.illustrationType} size={128} />
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <span className="text-[10px] font-mono font-bold text-[#2563EB] uppercase">Day {todayLesson.dayNumber} of 30</span>
                    <h3 className="text-2xl font-serif font-bold text-[#0B1F3A] mt-1 leading-tight">{todayLesson.title}</h3>
                    <p className="text-sm text-slate-500 italic mt-1.5">{todayLesson.tagline}</p>
                    <p className="text-sm text-slate-600 mt-3 leading-relaxed">{todayLesson.aboutText}</p>
                    <button
                      onClick={onBeginLesson}
                      className="w-full sm:w-auto mt-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-sans font-bold text-sm py-3.5 px-8 rounded-2xl transition-all shadow-lg shadow-[#2563EB]/25 active:scale-[0.98] inline-flex items-center justify-center gap-2 cursor-pointer"
                      id="begin-lesson-button"
                    >
                      <BookOpen size={16} /><span>Begin Today's Lesson</span><ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Completed lesson */
              <div className="bg-[#EBF4EB] rounded-3xl p-6 sm:p-8 border border-[#D0E5D0] shadow-sm">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="bg-white/70 p-5 rounded-3xl border border-emerald-100 shrink-0">
                    <Illustration type={todayLesson.illustrationType} size={120} />
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <div className="inline-flex items-center gap-2 mb-2 bg-white px-3 py-1 rounded-full border border-emerald-200">
                      <CheckCircle size={14} className="text-emerald-600 fill-emerald-50" />
                      <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">Day {todayLesson.dayNumber} Completed</span>
                    </div>
                    <h3 className="text-xl font-serif font-bold text-[#0B1F3A] leading-tight">{todayLesson.title}</h3>
                    <p className="text-sm text-slate-500 italic mt-1">{todayLesson.tagline}</p>
                    <p className="text-sm text-slate-700 mt-3 leading-relaxed bg-white/70 rounded-2xl p-4 border border-[#D0E5D0]/60 text-left">
                      {todayLesson.aboutText}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <button
                        onClick={onDownloadDirectly}
                        className="flex-1 bg-white hover:bg-slate-50 text-[#0B1F3A] border border-slate-200 text-xs font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        id="direct-download-button"
                      >
                        Journal PDF
                      </button>
                      <button
                        onClick={onBeginLesson}
                        className="flex-1 bg-[#0B1F3A] hover:bg-[#2563EB] text-white text-xs font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        id="direct-redo-button"
                      >
                        <RefreshCw size={12} /><span>Redo Lesson</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Daily Speaking Drill */}
          <div id="speaking-drill-container">
            <h3 className="text-[10px] font-mono tracking-[0.18em] text-[#2563EB] uppercase font-bold mb-3 flex items-center gap-1.5">
              <Mic size={12} /> Spontaneity Training
            </h3>

            {!todayCompleted ? (
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-3 right-3 bg-slate-200/60 text-slate-500 p-1.5 rounded-full" title="Locked">
                  <Lock size={12} />
                </div>
                <div className="flex gap-4 items-start">
                  <div className="bg-slate-200/60 p-3 rounded-2xl text-slate-400 shrink-0">
                    <Mic size={22} />
                  </div>
                  <div className="flex-1">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Daily Speaking Drill</span>
                    <h4 className="text-base font-serif font-bold text-slate-700 leading-tight mt-0.5">Spontaneous Pitching Challenge</h4>
                    <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                      Turn insights into confident pitches. Complete today's lesson to unlock this drill.
                    </p>
                    <button
                      onClick={onBeginLesson}
                      className="mt-4 bg-white hover:bg-[#EFF5FE] text-slate-700 hover:text-[#2563EB] border border-slate-200 font-sans font-bold text-xs py-2.5 px-5 rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                      id="unlock-drill-button"
                    >
                      <BookOpen size={12} /><span>Complete Lesson {currentDay} First</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#EFF5FE] rounded-3xl p-6 border border-[#D6E4FA] shadow-sm relative overflow-hidden">
                <div className="absolute top-3 right-3 bg-white text-[#2563EB] text-[8px] font-mono font-bold px-2 py-0.5 rounded border border-[#2563EB]/20 uppercase tracking-widest animate-pulse">
                  Active
                </div>
                <div className="flex gap-4 items-start">
                  <div className="bg-white p-3 rounded-2xl text-[#2563EB] shrink-0 border border-[#D6E4FA] shadow-sm">
                    <Mic size={22} />
                  </div>
                  <div className="flex-1">
                    <span className="text-[9px] font-mono font-bold text-[#2563EB] uppercase tracking-wider block">Daily Challenge • Day {todayLesson.dayNumber}</span>
                    <h4 className="text-base font-serif font-bold text-[#0B1F3A] leading-tight mt-0.5">Spontaneity Speaking Drill</h4>
                    <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                      Record your vocal answers for Day {todayLesson.dayNumber}'s inquiries under a fast-paced timer.
                    </p>
                    <button
                      onClick={onPlayPracticeGameDirectly}
                      className="mt-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-sans font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-lg shadow-[#2563EB]/25 active:scale-[0.98] inline-flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                      id="start-speaking-drill-button"
                    >
                      <Video size={13} /><span>Start Speaking Drill</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column — profile + progress/archive */}
        <div className="flex flex-col gap-6">

          {/* Account profile card */}
          <div className="bg-white rounded-3xl p-6 border border-[#D6E4FA] shadow-sm" id="user-stats">
            <div className="flex items-center gap-3">
              {userProfilePic ? (
                <div className="w-12 h-12 rounded-full overflow-hidden border border-[#2563EB]/30 bg-slate-50 flex items-center justify-center p-0.5 shrink-0">
                  <img src={userProfilePic} alt="Profile" className="max-w-full max-h-full object-contain rounded-full" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#EFF5FE] border border-[#D6E4FA] flex items-center justify-center font-serif font-extrabold text-[#2563EB] text-lg shrink-0">
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Account</p>
                <h2 className="text-sm font-bold text-[#0B1F3A] truncate leading-tight mt-0.5">{displayName}</h2>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'Guest session'}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#D6E4FA]/60 flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-slate-500 min-w-0">
                <Phone size={12} className="text-[#2563EB] shrink-0" />
                <span className="text-slate-700 font-semibold truncate">
                  {userPhoneNumber ? userPhoneNumber : "No phone registered"}
                </span>
              </div>
              <button
                onClick={() => {
                  const phone = prompt("Enter your phone number to coordinate updates:", userPhoneNumber || "");
                  if (phone !== null) onUpdatePhoneNumber(phone.trim());
                }}
                className="text-[#2563EB] hover:text-[#1D4ED8] font-bold cursor-pointer transition-colors shrink-0 ml-2"
                id="update-user-phone-btn"
              >
                {userPhoneNumber ? "Change" : "Add"}
              </button>
            </div>
          </div>

          {/* Progress / archive */}
          <div className="bg-white rounded-3xl p-6 border border-[#D6E4FA] shadow-sm" id="progress-indicator">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Course Progress</span>
              <span className="text-xs font-mono text-[#2563EB] font-extrabold">
                {progress.completedDays.length} / 30 Days
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#2563EB] h-full transition-all duration-700"
                style={{ width: `${(progress.completedDays.length / 30) * 100}%` }}
              />
            </div>
            <button
              onClick={onViewHistory}
              className="w-full mt-4 text-center text-xs font-bold text-[#2563EB] hover:text-white hover:bg-[#2563EB] border border-[#D6E4FA] flex items-center justify-center gap-1.5 py-2.5 rounded-xl cursor-pointer transition-colors uppercase tracking-wider"
              id="view-archive-button"
            >
              <Calendar size={13} /><span>Curriculum Archive</span>
            </button>
          </div>

          {/* Principle callout */}
          <div className="bg-[#0B1F3A] rounded-3xl p-6 text-white shadow-sm relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 opacity-10">
              <Sparkles size={96} />
            </div>
            <span className="text-[9px] font-mono font-bold text-[#93B4F5] uppercase tracking-[0.18em]">Principle</span>
            <p className="text-sm font-serif font-medium leading-relaxed mt-2 relative">
              "Sustainable wealth doesn't come from working harder — it comes from
              building systems that separate your income from your time."
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mt-10">
        <p className="text-[10px] font-mono text-slate-400 tracking-wide">
          The Creative Edge • 30-Day Creative Business Journey
        </p>
      </div>
    </div>
  );
};
