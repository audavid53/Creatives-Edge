import React from 'react';
import { User } from 'firebase/auth';
import { Lesson, UserProgress } from '../types';
import { Illustration } from './Illustration';
import { 
  BookOpen, Award, Flame, LogOut, CheckCircle, Calendar, 
  Sparkles, Lock, Phone, PenTool, Users, Package, Trophy, RefreshCw,
  Mic, Video
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
  onLogout,
  onViewHistory,
  onPlayPracticeGameDirectly,
  onDownloadDirectly,
  onUpdatePhoneNumber,
  onOpenAdmin,
  onLogoClick,
  userDisplayName,
  userProfilePic
}) => {
  const isGuest = user?.isAnonymous;
  const currentDay = progress.currentDay || todayLesson.dayNumber || 1;

  // Milestone mapping and active checking based on currentDay reach
  const milestones = [
    { day: 5, label: "Create Content", icon: PenTool },
    { day: 10, label: "Build Community", icon: Users },
    { day: 15, label: "Create Product", icon: Package },
    { day: 20, label: "Get Customer", icon: Trophy }
  ];

  // Calculate visual progress along the straight line
  // 0 milestones reached = 0%
  // Day 5+ = 15%
  // Day 10+ = 48%
  // Day 15+ = 80%
  // Day 20+ = 100%
  const getLineProgress = () => {
    if (currentDay >= 20) return 100;
    if (currentDay >= 15) return 80;
    if (currentDay >= 10) return 48;
    if (currentDay >= 5) return 15;
    return 0;
  };

  return (
    <div className="flex flex-col min-h-full justify-between pb-8 px-5 py-6 bg-[#FDFBF7]">
      <div>
        {/* Header / Brand */}
        <div className="flex justify-between items-start mb-6" id="landing-header">
          <div onClick={onLogoClick} className="cursor-pointer select-none">
            <span className="text-[10px] font-mono tracking-widest text-[#C85A32] uppercase font-bold">The Academy</span>
            <h1 className="text-3xl font-serif font-extrabold text-[#1C1917] tracking-tight mt-0.5">The Creative Edge</h1>
            {isAdmin && (
              <button
                onClick={onOpenAdmin}
                className="mt-2 inline-flex items-center gap-1.5 bg-[#1C1917] hover:bg-[#C85A32] text-white text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer uppercase tracking-wider"
                id="open-admin-boardroom-btn"
              >
                <Sparkles size={11} className="animate-pulse text-amber-400" />
                <span>Boardroom Console</span>
              </button>
            )}
          </div>
          {user && (
            <button 
              onClick={onLogout}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-500 transition-colors cursor-pointer"
              title="Log Out"
              id="logout-button"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>

        {/* Welcome Card: STRICTLY JUST Account Details */}
        <div className="bg-[#FAF6F0] rounded-2xl p-4 border border-[#EBE3D5] mb-6 shadow-3xs" id="user-stats">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {userProfilePic ? (
                <div className="w-10 h-10 rounded-full overflow-hidden border border-[#C85A32]/30 bg-stone-50 flex items-center justify-center p-0.5 shrink-0">
                  <img 
                    src={userProfilePic} 
                    alt="Profile" 
                    className="max-w-full max-h-full object-contain rounded-full" 
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-white border border-[#EBE3D5] flex items-center justify-center font-serif font-extrabold text-[#C85A32] text-sm shrink-0">
                  {(userDisplayName || user?.displayName || user?.email?.[0] || 'P').slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">Account Profile</p>
                <h2 className="text-sm font-bold text-stone-900 truncate max-w-[160px] leading-tight mt-0.5">
                  {isGuest ? "Creative Guest Account" : (userDisplayName || user?.displayName || user?.email?.split('@')[0] || "Creative Practitioner")}
                </h2>
                <p className="text-[10px] text-stone-500 truncate max-w-[160px]">
                  {user?.email || 'Guest Session'}
                </p>
              </div>
            </div>

            {/* Streak Counter */}
            <div className="flex items-center gap-1 bg-amber-50/80 px-2.5 py-1 rounded-full border border-amber-200">
              <Flame size={14} className="text-amber-500 fill-amber-500" />
              <span className="text-[10px] font-bold text-amber-800">{progress.streakCount}d Streak</span>
            </div>
          </div>

          {/* User Phone & System Details */}
          <div className="mt-3 pt-3 border-t border-[#EBE3D5]/60 flex items-center justify-between text-[10px] font-mono">
            <div className="flex items-center gap-1 text-stone-500">
              <Phone size={10} className="text-[#C85A32]" />
              <span className="text-stone-700 font-semibold truncate max-w-[170px]">
                {userPhoneNumber ? userPhoneNumber : "No phone registered"}
              </span>
            </div>
            <button
              onClick={() => {
                const phone = prompt("Please enter your phone number to coordinate updates:", userPhoneNumber || "");
                if (phone !== null) {
                  onUpdatePhoneNumber(phone.trim());
                }
              }}
              className="text-[#C85A32] hover:text-[#b04a25] font-bold cursor-pointer transition-colors"
              id="update-user-phone-btn"
            >
              {userPhoneNumber ? "Change" : "Add Phone"}
            </button>
          </div>
        </div>

        {/* Redesigned Next Session: The 30-Day Blueprint and Straight-Line Milestones */}
        <div className="mb-6 bg-white border border-[#EBE3D5] rounded-3xl p-5 shadow-3xs" id="academy-milestones">
          <div className="space-y-1.5 mb-5">
            <span className="text-[9px] font-mono text-[#C85A32] font-bold tracking-widest uppercase">The Path Ahead</span>
            <p className="text-sm font-serif font-bold text-stone-800 leading-snug">
              30 days to sell your creativity to your first customer without selling your time.
            </p>
          </div>

          {/* Straight-line Milestone Progress Tracker */}
          <div className="relative pt-2 pb-6 px-1">
            {/* Horizontal Line background */}
            <div className="absolute top-[20px] left-3 right-3 h-[3px] bg-stone-100 rounded-full" />
            {/* Active filled line */}
            <div 
              className="absolute top-[20px] left-3 h-[3px] bg-[#C85A32] rounded-full transition-all duration-700"
              style={{ width: `calc(${getLineProgress()}% - ${getLineProgress() === 0 ? '0px' : getLineProgress() === 100 ? '24px' : '12px'})` }}
            />

            <div className="relative flex justify-between">
              {milestones.map((m, idx) => {
                const isReached = currentDay >= m.day;
                const Icon = m.icon;
                return (
                  <div key={m.day} className="flex flex-col items-center group relative z-10">
                    {/* Node Circle */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-3xs ${
                      isReached 
                        ? 'bg-[#C85A32] border-[#C85A32] text-white scale-110' 
                        : 'bg-white border-stone-200 text-stone-400 group-hover:border-stone-300'
                    }`}>
                      <Icon size={14} />
                    </div>

                    {/* Day badge below circle */}
                    <span className={`text-[8px] font-mono font-bold uppercase mt-1 px-1.5 py-0.5 rounded-md transition-colors duration-500 ${
                      isReached 
                        ? 'bg-[#C85A32]/10 text-[#C85A32]' 
                        : 'bg-stone-50 text-stone-400'
                    }`}>
                      Day {m.day}
                    </span>

                    {/* Label */}
                    <span className={`text-[10px] font-sans font-semibold tracking-tight mt-1 text-center max-w-[70px] leading-tight ${
                      isReached ? 'text-stone-900' : 'text-stone-400'
                    }`}>
                      {m.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Today's Focus section (Only Today's Lesson display) */}
        <div className="mb-6" id="todays-lesson-container">
          <h3 className="text-[10px] font-mono tracking-widest text-[#C85A32] uppercase font-bold mb-3 flex items-center gap-1">
            <Sparkles size={11} /> Today's Focus
          </h3>

          {completedToday && !todayCompleted ? (
            /* 1. Locked state */
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-3xs flex flex-col items-center text-center">
              <div className="p-3 bg-stone-50 rounded-full text-stone-400 mb-3 border border-stone-200">
                <Lock size={24} className="text-[#C85A32]" />
              </div>
              <span className="text-[10px] font-mono font-bold text-[#C85A32] uppercase">Day {todayLesson.dayNumber} Locked</span>
              <h3 className="text-base font-serif font-bold text-stone-800 mt-1">One Lesson Per Day</h3>
              <p className="text-xs text-stone-600 mt-2 px-3 leading-relaxed">
                You've completed your lesson for today! Under the rules of the Academy, you can only see previous lessons and can't move to the next. Day {todayLesson.dayNumber} will unlock tomorrow.
              </p>
              <button
                disabled
                className="w-full bg-stone-100 text-stone-400 font-sans font-bold py-3.5 px-6 rounded-2xl mt-5 flex items-center justify-center gap-2 cursor-not-allowed text-xs border border-stone-200 uppercase tracking-wider"
              >
                <Lock size={13} />
                <span>Unlocks Tomorrow</span>
              </button>
            </div>
          ) : !todayCompleted ? (
            /* 2. Uncompleted lesson available */
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-3xs flex flex-col justify-between hover:border-stone-300 transition-all">
              <div className="flex flex-col items-center text-center mb-5">
                <div className="mb-4 bg-[#FAF6F0] p-4 rounded-full border border-[#EBE3D5]/30">
                  <Illustration type={todayLesson.illustrationType} size={110} />
                </div>
                <span className="text-[10px] font-mono font-bold text-[#C85A32] uppercase">Day {todayLesson.dayNumber} of 30</span>
                <h3 className="text-lg font-serif font-bold text-stone-900 mt-1">{todayLesson.title}</h3>
                <p className="text-xs text-stone-500 italic mt-1 px-4">{todayLesson.tagline}</p>
                <p className="text-xs text-stone-600 mt-3 px-2 line-clamp-2 leading-relaxed">
                  {todayLesson.aboutText}
                </p>
              </div>

              <button
                onClick={onBeginLesson}
                className="w-full bg-[#1C1917] hover:bg-[#C85A32] text-white font-sans font-bold text-xs py-3.5 px-6 rounded-2xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                id="begin-lesson-button"
              >
                <BookOpen size={14} />
                <span>Begin Today's Lesson</span>
              </button>
            </div>
          ) : (
            /* 3. Completed lesson */
            <div className="bg-[#EBF4EB] rounded-3xl p-6 border border-[#D0E5D0] shadow-3xs flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-4 bg-white px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle size={14} className="text-emerald-600 fill-emerald-50" />
                <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">Day {todayLesson.dayNumber} Completed</span>
              </div>

              <div className="mb-4 bg-white/70 p-4 rounded-full border border-emerald-100">
                <Illustration type={todayLesson.illustrationType} size={100} />
              </div>

              <h3 className="text-lg font-serif font-bold text-stone-900 leading-tight mt-1">{todayLesson.title}</h3>
              <p className="text-xs text-stone-500 italic mt-1 px-4">{todayLesson.tagline}</p>

              <div className="bg-white/80 rounded-2xl p-4 border border-[#D0E5D0]/60 my-4 text-left w-full">
                <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest block mb-1">Today's Focus Summary</span>
                <p className="text-xs text-stone-700 leading-relaxed font-sans">
                  {todayLesson.aboutText}
                </p>
              </div>

              <p className="text-[11px] font-serif italic text-emerald-800 bg-emerald-50/50 px-3 py-2 rounded-xl border border-emerald-200/40 w-full mb-4">
                Your custom reflections and recall answers are saved.
              </p>

              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  onClick={onDownloadDirectly}
                  className="bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 text-[11px] font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  id="direct-download-button"
                >
                  Journal PDF
                </button>
                <button
                  onClick={onBeginLesson}
                  className="bg-[#1C1917] hover:bg-[#C85A32] text-white text-[11px] font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  id="direct-redo-button"
                >
                  <RefreshCw size={12} />
                  <span>Redo Lesson</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Daily Speaking Drill Challenge Section */}
        <div className="mb-6" id="speaking-drill-container">
          <h3 className="text-[10px] font-mono tracking-widest text-[#C85A32] uppercase font-bold mb-3 flex items-center gap-1.5">
            <Mic size={11} /> Spontaneity Training
          </h3>

          {!todayCompleted ? (
            /* Locked / Ask to do daily lesson first state because there's no entry */
            <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 shadow-3xs flex flex-col justify-between hover:border-stone-200 transition-all relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-stone-200/50 text-stone-500 p-1.5 rounded-full" title="Locked">
                <Lock size={12} />
              </div>
              <div className="flex gap-4 items-start mb-4">
                <div className="bg-stone-200/50 p-2.5 rounded-2xl text-stone-400 shrink-0 border border-stone-200/30">
                  <Mic size={20} />
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-wider block">Daily Speaking Drill</span>
                  <h4 className="text-sm font-serif font-bold text-stone-700 leading-tight mt-0.5">Spontaneous Pitching Challenge</h4>
                  <p className="text-[11px] text-stone-500 mt-1 leading-normal">
                    Practicing spontaneity turns insights into active recall pitches. Complete today's curriculum lesson to unlock this speaking drill!
                  </p>
                </div>
              </div>

              <button
                onClick={onBeginLesson}
                className="w-full bg-[#1C1917]/10 hover:bg-[#C85A32]/15 text-stone-700 hover:text-[#C85A32] border border-stone-200 font-sans font-bold text-[11px] py-3 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                id="unlock-drill-button"
              >
                <BookOpen size={12} />
                <span>Complete Lesson {currentDay} First</span>
              </button>
            </div>
          ) : (
            /* Unlocked / Active Challenge state because they have completed the lesson */
            <div className="bg-[#FAF6F0] rounded-3xl p-5 border border-[#EBE3D5] shadow-3xs flex flex-col justify-between hover:border-stone-300 transition-all relative overflow-hidden">
              <div className="absolute top-2.5 right-2.5 bg-amber-50 text-[#C85A32] text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border border-[#C85A32]/20 uppercase tracking-widest animate-pulse">
                Active
              </div>
              <div className="flex gap-4 items-start mb-4">
                <div className="bg-amber-50 p-2.5 rounded-2xl text-[#C85A32] shrink-0 border border-[#C85A32]/25 shadow-3xs animate-pulse">
                  <Mic size={20} />
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold text-[#C85A32] uppercase tracking-wider block">Daily Challenge • Day {todayLesson.dayNumber}</span>
                  <h4 className="text-sm font-serif font-bold text-stone-900 leading-tight mt-0.5">Spontaneity Speaking Drill</h4>
                  <p className="text-[11px] text-stone-600 mt-1 leading-normal">
                    Active recall challenge: Record your vocal answers for Day {todayLesson.dayNumber}'s inquiries under a fast-paced timer. Let's practice.
                  </p>
                </div>
              </div>

              <button
                onClick={onPlayPracticeGameDirectly}
                className="w-full bg-[#1C1917] hover:bg-[#C85A32] text-white font-sans font-bold text-xs py-3 px-6 rounded-2xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider animate-pulse"
                id="start-speaking-drill-button"
              >
                <Video size={13} />
                <span>Start Speaking Drill Challenge</span>
              </button>
            </div>
          )}
        </div>

        {/* Archives / History Panel */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-150" id="progress-indicator">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">Course Completed</span>
            <span className="text-xs font-mono text-[#C85A32] font-extrabold">
              {progress.completedDays.length} / 30 Days
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#C85A32] h-full transition-all duration-700"
              style={{ width: `${(progress.completedDays.length / 30) * 100}%` }}
            />
          </div>

          <button
            onClick={onViewHistory}
            className="w-full mt-3 text-center text-xs font-bold text-[#C85A32] hover:text-[#b04a25] flex items-center justify-center gap-1.5 py-2 hover:bg-stone-100 rounded-xl cursor-pointer transition-colors uppercase tracking-wider"
            id="view-archive-button"
          >
            <Calendar size={13} />
            <span>Open Curriculum Archive</span>
          </button>
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="text-[9px] font-mono text-stone-400">
          The Creative Edge Academy • 30-Day Devotional Journey
        </p>
      </div>
    </div>
  );
};
