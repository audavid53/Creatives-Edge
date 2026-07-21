// Replaced via create_file to handle final App.tsx fully with complete state management and view routing.
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db, signInWithGoogle, signInAsGuest, logOut } from './firebase';
import { Lesson, UserProgress, UserLessonRecord } from './types';
import { getLessonByDay } from './data/lessons';
import { Landing } from './components/Landing';
import { LessonCarousel } from './components/LessonCarousel';
import { QuizView } from './components/QuizView';
import { ReflectionView } from './components/ReflectionView';
import { CelebrationView } from './components/CelebrationView';
import { PracticeGame } from './components/PracticeGame';
import { HistoryView } from './components/HistoryView';
import { AdminPanel } from './components/AdminPanel';
import { ProfileModal } from './components/ProfileModal';
import { WelcomeLessonModal } from './components/WelcomeLessonModal';
import { BrandLogo } from './components/BrandLogo';
import { generateLessonPDF } from './lib/pdfHelper';
import { uploadSubmissionVideo } from './lib/storageHelper';
import { Sparkles, Loader2, Play, ChevronRight, GraduationCap, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Screen identifiers
type ScreenState = 'welcome' | 'landing' | 'carousel' | 'quiz' | 'reflection' | 'celebration' | 'game' | 'history' | 'admin';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<ScreenState>('welcome');

  // Profile fields state
  const [userDisplayName, setUserDisplayName] = useState<string>('');
  const [userProfilePic, setUserProfilePic] = useState<string>('');
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);

  // Core local states syncing with Firestore
  const [progress, setProgress] = useState<UserProgress>({
    uid: '',
    currentDay: 1,
    completedDays: [],
    streakCount: 0
  });
  const [lessonRecords, setLessonRecords] = useState<Record<number, UserLessonRecord>>({});

  // Active Lesson state
  const [activeDay, setActiveDay] = useState<number>(1);
  const [activeLesson, setActiveLesson] = useState<Lesson>(getLessonByDay(1));
  const [activeRecord, setActiveRecord] = useState<UserLessonRecord | null>(null);

  // Overridden lessons and user contact info
  const [customLessons, setCustomLessons] = useState<Record<number, Lesson>>({});
  const [userPhoneNumber, setUserPhoneNumber] = useState<string>('');

  // Helper to retrieve overridden or static lessons dynamically
  const getMergedLesson = (dayNum: number, customMap = customLessons): Lesson => {
    if (customMap[dayNum]) {
      return customMap[dayNum];
    }
    return getLessonByDay(dayNum);
  };

  // Determine if active user is designated administrator
  const [adminOverride, setAdminOverride] = useState(false);
  const isAdmin = user?.email?.toLowerCase() === 'audavid53@gmail.com' || adminOverride;

  const [backdoorClicks, setBackdoorClicks] = useState(0);
  const handleBackdoorClick = () => {
    setBackdoorClicks((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        setAdminOverride(true);
        alert("Developer Backdoor Activated: Boardroom Console Unlocked!");
        return 0;
      }
      return next;
    });
  };

  // 1. Auth Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        await syncUserData(currentUser);
        setScreen('landing');
      } else {
        setUser(null);
        setScreen('welcome');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch custom admin lessons override from Firestore
  const loadCustomLessons = async () => {
    try {
      const lessonsSnap = await getDocs(collection(db, 'lessons'));
      const map: Record<number, Lesson> = {};
      lessonsSnap.forEach((doc) => {
        const data = doc.data() as Lesson;
        map[data.dayNumber] = data;
      });
      setCustomLessons(map);
      if (activeDay) {
        setActiveLesson(map[activeDay] || getLessonByDay(activeDay));
      }
      return map;
    } catch (err) {
      console.warn("Could not load custom lessons from Firestore:", err);
      return {};
    }
  };

  // Sync user data from Firestore on sign-in
  const syncUserData = async (currentUser: User) => {
    try {
      // Load custom lessons from Firestore first
      const loadedCustoms = await loadCustomLessons();

      // a. Get or create root user profile document (for admin to review contact/phone info)
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      let phone = "";
      let name = currentUser.displayName || currentUser.email?.split('@')[0] || 'Creative Practitioner';
      let pic = "";
      let completed = false;

      if (userSnap.exists()) {
        const udata = userSnap.data();
        phone = udata.phoneNumber || "";
        name = udata.displayName || name;
        pic = udata.profilePic || "";
        completed = udata.profileCompleted || false;
      }

      setUserPhoneNumber(phone);
      setUserDisplayName(name);
      setUserProfilePic(pic);

      const isGoogleUser = currentUser.providerData.some(p => p.providerId === 'google.com');

      // Save/merge user info to root user document so admin can browse users
      await setDoc(userRef, {
        uid: currentUser.uid,
        email: currentUser.email || 'Anonymous Guest',
        displayName: name,
        phoneNumber: phone,
        profilePic: pic,
        profileCompleted: completed,
        lastActive: new Date().toISOString()
      }, { merge: true });

      // Trigger profile modal if Google user hasn't completed profile details
      if (isGoogleUser && !completed) {
        setShowProfileModal(true);
      } else {
        setShowProfileModal(false);
      }

      // b. Get or create Progress
      const progressRef = doc(db, 'users', currentUser.uid, 'settings', 'progress');
      const progressSnap = await getDoc(progressRef);
      
      let userProgress: UserProgress;

      if (progressSnap.exists()) {
        userProgress = progressSnap.data() as UserProgress;
      } else {
        // First-time user setup
        userProgress = {
          uid: currentUser.uid,
          currentDay: 1,
          completedDays: [],
          streakCount: 0
        };
        await setDoc(progressRef, userProgress);
      }
      setProgress(userProgress);
      setActiveDay(userProgress.currentDay);
      setActiveLesson(getMergedLesson(userProgress.currentDay, loadedCustoms));

      // c. Fetch all Lesson Records
      const recordsColRef = collection(db, 'users', currentUser.uid, 'records');
      const recordsSnap = await getDocs(recordsColRef);
      const recordsMap: Record<number, UserLessonRecord> = {};
      
      recordsSnap.forEach((d) => {
        const data = d.data() as UserLessonRecord;
        recordsMap[data.dayNumber] = data;
      });
      setLessonRecords(recordsMap);

      // Check active record
      if (recordsMap[userProgress.currentDay]) {
        setActiveRecord(recordsMap[userProgress.currentDay]);
      } else {
        setActiveRecord(null);
      }

    } catch (error) {
      console.error("Error syncing user data from Firestore:", error);
    }
  };

  // 2. Auth Actions
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (e) {
      setLoading(false);
      alert("Popup blocked or sign-in interrupted. Try 'Continue as Guest' for sandbox preview compatibility!");
    }
  };

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      await signInAsGuest();
    } catch (e) {
      setLoading(false);
      alert("Failed guest sign in. Check internet connection.");
    }
  };

  const handleSaveProfile = async (name: string, phone: string, profilePicData: string) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        displayName: name,
        phoneNumber: phone,
        profilePic: profilePicData,
        profileCompleted: true,
        lastActive: new Date().toISOString()
      }, { merge: true });

      setUserDisplayName(name);
      setUserPhoneNumber(phone);
      setUserProfilePic(profilePicData);
      setShowProfileModal(false);
    } catch (err) {
      console.error("Error saving profile completion:", err);
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logOut();
      setProgress({ uid: '', currentDay: 1, completedDays: [], streakCount: 0 });
      setLessonRecords({});
      setScreen('welcome');
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  // 3. User Journey Actions
  const handleBeginLesson = (dayNum = progress.currentDay) => {
    setActiveDay(dayNum);
    setActiveLesson(getMergedLesson(dayNum));
    setShowWelcomeModal(true);
  };

  const handleConfirmWelcomeModal = () => {
    setShowWelcomeModal(false);
    setScreen('carousel');
  };

  const handleFinishCarousel = () => {
    setScreen('quiz');
  };

  const handleQuizSubmit = async (selectedIdx: number, isCorrectFirstTry: boolean) => {
    if (!user) return;

    // Create or update record
    const recordRef = doc(db, 'users', user.uid, 'records', activeDay.toString());
    const existing = lessonRecords[activeDay];
    
    const updatedRecord: UserLessonRecord = {
      dayNumber: activeDay,
      quizAnswerSelected: selectedIdx,
      quizCorrect: isCorrectFirstTry,
      reflectionAnswers: existing?.reflectionAnswers || new Array(activeLesson.reflectionQuestions.length).fill("")
    };

    await setDoc(recordRef, updatedRecord);
    
    // Update local map
    setLessonRecords(prev => ({
      ...prev,
      [activeDay]: updatedRecord
    }));
    setActiveRecord(updatedRecord);

    setScreen('reflection');
  };

  const getLocalDateString = (dateInput?: string | Date) => {
    const d = dateInput ? new Date(dateInput) : new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleFinishReflections = async (reflectionAnswers: string[]) => {
    if (!user) return;

    setLoading(true);
    try {
      const timestamp = new Date().toISOString();

      // a. Save record
      const recordRef = doc(db, 'users', user.uid, 'records', activeDay.toString());
      const updatedRecord: UserLessonRecord = {
        ...(activeRecord || { dayNumber: activeDay }),
        reflectionAnswers,
        completedAt: timestamp
      };
      await setDoc(recordRef, updatedRecord);

      // b. Update completedDays & streak
      const progressRef = doc(db, 'users', user.uid, 'settings', 'progress');
      
      const newCompletedDays = [...progress.completedDays];
      if (!newCompletedDays.includes(activeDay)) {
        newCompletedDays.push(activeDay);
      }

      // Calculate streak using local dates
      let newStreak = progress.streakCount;
      const todayLocal = getLocalDateString();
      const lastCompletedLocal = progress.lastCompletedAt ? getLocalDateString(progress.lastCompletedAt) : null;

      if (!progress.lastCompletedAt) {
        newStreak = 1;
      } else if (todayLocal !== lastCompletedLocal) {
        // Completed on a new day
        const diffTime = Math.abs(new Date(todayLocal).getTime() - new Date(lastCompletedLocal || '').getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) {
          newStreak += 1;
        } else {
          newStreak = 1; // Streak broken
        }
      }

      // Move to next day (limit 30)
      const nextDay = activeDay === progress.currentDay && progress.currentDay < 30 
        ? progress.currentDay + 1 
        : progress.currentDay;

      const updatedProgress: UserProgress = {
        ...progress,
        currentDay: nextDay,
        completedDays: newCompletedDays,
        streakCount: newStreak,
        lastCompletedAt: timestamp
      };

      await setDoc(progressRef, updatedProgress);

      // c. Update local states
      setProgress(updatedProgress);
      setLessonRecords(prev => ({
        ...prev,
        [activeDay]: updatedRecord
      }));
      setActiveRecord(updatedRecord);
      
      // Advance active day and active lesson
      setActiveDay(nextDay);
      setActiveLesson(getMergedLesson(nextDay));

      setScreen('celebration');
    } catch (err) {
      console.error("Error completing lesson:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishPracticeGame = async (recordingsCount: number) => {
    if (!user || !activeRecord) return;
    
    // Update local record to track game played
    const recordRef = doc(db, 'users', user.uid, 'records', activeDay.toString());
    const updatedRecord: UserLessonRecord = {
      ...activeRecord,
      practiceGamePlayed: true,
      practiceRecordingsCount: recordingsCount
    };
    await setDoc(recordRef, updatedRecord);

    setLessonRecords(prev => ({
      ...prev,
      [activeDay]: updatedRecord
    }));
    setActiveRecord(updatedRecord);

    // Return to main screen
    setScreen('landing');
  };

  const handleDownloadDirectly = () => {
    const record = lessonRecords[activeDay];
    if (record) {
      generateLessonPDF(
        activeDay,
        activeLesson.title,
        activeLesson.quiz.keyInsightText,
        activeLesson.reflectionQuestions,
        record.reflectionAnswers
      );
    }
  };

  const handlePlayPracticeGameDirectly = (dayNum = activeDay) => {
    setActiveDay(dayNum);
    setActiveLesson(getMergedLesson(dayNum));
    const record = lessonRecords[dayNum];
    if (record) {
      setActiveRecord(record);
      setScreen('game');
    } else {
      alert("Please complete the lesson reflections before playing the speaking game!");
    }
  };

  const handleUpdatePhoneNumber = async (phone: string) => {
    if (!user) return;
    try {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { phoneNumber: phone }, { merge: true });
      setUserPhoneNumber(phone);
    } catch (err) {
      console.error("Error updating phone number:", err);
    } finally {
      setLoading(false);
    }
  };

  const completedToday = (): boolean => {
    if (!progress.lastCompletedAt) return false;
    return getLocalDateString() === getLocalDateString(progress.lastCompletedAt);
  };

  const handleSubmitSubmission = async (videoBlob: Blob | null, videoText: string, isSimulated: boolean) => {
    if (!user) return;
    try {
      // Upload the recording to Storage first - Firestore only ever stores the URL.
      const videoUrl = videoBlob ? await uploadSubmissionVideo(user.uid, activeDay, videoBlob) : '';

      const subId = `${user.uid}_day${activeDay}`;
      const subRef = doc(db, 'submissions', subId);
      await setDoc(subRef, {
        id: subId,
        userId: user.uid,
        userEmail: user.email || 'Anonymous Guest',
        userPhone: userPhoneNumber || '',
        userName: user.displayName || user.email?.split('@')[0] || 'Creative Practitioner',
        dayNumber: activeDay,
        round: 4,
        videoUrl,
        videoText,
        submittedAt: new Date().toISOString(),
        isSimulated
      });
    } catch (err) {
      console.error("Error submitting video challenge:", err);
    }
  };

  // Whether we should render the persistent top navigation (all signed-in app screens).
  const showAppChrome = screen !== 'welcome';

  return (
    <div className="min-h-screen bg-[#DCE9FB] font-sans text-[#0B1F3A] flex flex-col relative" id="applet-viewport">
      {/* Ambient brand glows for the desktop backdrop */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-0" aria-hidden="true">
        <div className="absolute -top-40 -right-32 w-[38rem] h-[38rem] rounded-full bg-[#2563EB]/10 blur-3xl" />
        <div className="absolute -bottom-48 -left-40 w-[42rem] h-[42rem] rounded-full bg-[#2563EB]/10 blur-3xl" />
      </div>

      {/* Persistent Top Navigation (desktop + mobile) */}
      {showAppChrome && (
        <header className="sticky top-0 z-40 backdrop-blur-md bg-[#DCE9FB]/80 border-b border-[#D6E4FA]" id="app-topbar">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <button
              onClick={handleBackdoorClick}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
              id="brand-mark"
            >
              <BrandLogo className="h-8 w-8" />
              <div className="text-left leading-none">
                <span className="block font-serif font-extrabold text-[#0B1F3A] text-lg tracking-tight">The Creative Edge</span>
                <span className="block text-[9px] font-mono font-bold text-[#2563EB] uppercase tracking-[0.18em] mt-0.5">Decouple your income from your time</span>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono font-semibold text-emerald-600 bg-white/70 border border-emerald-200 px-2.5 py-1.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Operational
              </span>
              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#2563EB] bg-white/70 hover:bg-white border border-[#D6E4FA] px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                  title="Log Out"
                  id="topbar-logout"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Log out</span>
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Global Spinner Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-[#DCE9FB]/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-6 gap-3">
          <Loader2 className="text-[#2563EB] animate-spin" size={36} />
          <p className="text-sm font-serif font-semibold text-slate-700 animate-pulse">Aligning your creative edge…</p>
        </div>
      )}

      {/* Main content region */}
      <main className="relative z-10 flex-1 w-full flex flex-col" id="navigation-root">
          <AnimatePresence mode="wait">
            
            {/* Screen: WELCOME / LOGIN */}
            {screen === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10"
                id="screen-welcome"
              >
                <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                  {/* Left: Brand narrative */}
                  <div className="text-center lg:text-left">
                    <button
                      onClick={handleBackdoorClick}
                      className="inline-flex items-center gap-3 cursor-pointer select-none mb-8"
                    >
                      <BrandLogo className="h-11 w-11" />
                      <span className="font-serif font-extrabold text-2xl tracking-tight text-[#0B1F3A]">The Creative Edge</span>
                    </button>

                    <span className="inline-block text-[11px] font-mono font-bold text-[#2563EB] uppercase tracking-[0.18em] mb-4 bg-white/60 border border-[#D6E4FA] px-3 py-1.5 rounded-full">
                      A 30-Day Creative Business Journey
                    </span>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-[#0B1F3A] tracking-tight leading-[1.05]">
                      Decouple your income<br className="hidden sm:block" /> from your time.
                    </h1>

                    <p className="text-base sm:text-lg text-slate-600 mt-6 leading-relaxed max-w-xl mx-auto lg:mx-0 font-sans">
                      Stop trading hours for money. Over 30 days, discover the unserved
                      market hidden inside your creative skill — and build a business
                      around it before you ever launch.
                    </p>

                    {/* Trust chips */}
                    <div className="mt-8 flex flex-wrap gap-2 justify-center lg:justify-start">
                      {['E-Myth mindset', 'Blue Ocean Strategy', 'Daily speaking drills', 'Real customer by Day 20'].map((chip) => (
                        <span key={chip} className="text-xs font-semibold text-[#0B1F3A] bg-white/70 border border-[#D6E4FA] px-3 py-1.5 rounded-full">
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: Login card */}
                  <div className="w-full max-w-md mx-auto bg-white rounded-3xl border border-[#D6E4FA] shadow-xl shadow-[#2563EB]/5 p-7 sm:p-9">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-[#EFF5FE] rounded-2xl border border-[#D6E4FA]">
                        <GraduationCap size={26} className="text-[#2563EB]" />
                      </div>
                      <div>
                        <h2 className="font-serif font-bold text-xl text-[#0B1F3A] leading-tight">Start your journey</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Free · One lesson unlocks each day</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 mb-6">
                      <div className="bg-[#EFF5FE] p-4 rounded-2xl border border-[#D6E4FA] flex items-start gap-3">
                        <span className="text-[#2563EB] font-serif font-extrabold text-lg leading-none mt-0.5">30</span>
                        <div>
                          <h4 className="text-sm font-semibold text-[#0B1F3A]">Days of guided growth</h4>
                          <p className="text-xs text-slate-500 mt-0.5 font-sans leading-relaxed">Bite-sized stories, active-recall quizzes, and reflection worksheets.</p>
                        </div>
                      </div>
                      <div className="bg-[#EFF5FE] p-4 rounded-2xl border border-[#D6E4FA] flex items-start gap-3">
                        <Play size={18} className="text-[#2563EB] shrink-0 mt-0.5 fill-[#2563EB]" />
                        <div>
                          <h4 className="text-sm font-semibold text-[#0B1F3A]">Spontaneity speaking drill</h4>
                          <p className="text-xs text-slate-500 mt-0.5 font-sans leading-relaxed">Turn your reflections into confident, on-demand pitches.</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={handleGoogleLogin}
                        className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-sans font-semibold py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-[#2563EB]/25 flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98] text-sm"
                        id="welcome-google-login-btn"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.743-.08-1.3-.176-1.856l-10.617-.353z" />
                        </svg>
                        <span>Sign in with Google</span>
                      </button>

                      <button
                        onClick={handleGuestLogin}
                        className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-sans font-semibold py-3 px-6 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-sm"
                        id="welcome-guest-login-btn"
                      >
                        <span>Continue as guest</span>
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Screen: LANDING */}
            {screen === 'landing' && (
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex-1"
                id="screen-landing"
              >
                <Landing
                  user={user}
                  progress={progress}
                  todayLesson={activeLesson}
                  todayCompleted={progress.completedDays.includes(activeDay)}
                  completedToday={completedToday()}
                  userPhoneNumber={userPhoneNumber}
                  isAdmin={isAdmin}
                  onBeginLesson={() => handleBeginLesson()}
                  onLogout={handleLogout}
                  onViewHistory={() => setScreen('history')}
                  onPlayPracticeGameDirectly={() => handlePlayPracticeGameDirectly()}
                  onDownloadDirectly={handleDownloadDirectly}
                  onUpdatePhoneNumber={handleUpdatePhoneNumber}
                  onOpenAdmin={() => setScreen('admin')}
                  onLogoClick={handleBackdoorClick}
                  userDisplayName={userDisplayName}
                  userProfilePic={userProfilePic}
                />
              </motion.div>
            )}

            {/* Profile Completion Modal */}
            {showProfileModal && (
              <ProfileModal
                initialName={userDisplayName}
                initialPhone={userPhoneNumber}
                onSave={handleSaveProfile}
              />
            )}

            {/* Welcome / Axiom Agreement Modal */}
            {showWelcomeModal && (
              <WelcomeLessonModal
                lesson={activeLesson}
                onConfirm={handleConfirmWelcomeModal}
                onClose={() => setShowWelcomeModal(false)}
              />
            )}

            {/* Screen: LESSON CAROUSEL */}
            {screen === 'carousel' && (
              <motion.div
                key="carousel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full max-w-3xl mx-auto flex-1"
                id="screen-carousel"
              >
                <LessonCarousel
                  lesson={activeLesson}
                  onFinishCarousel={handleFinishCarousel}
                  onBackToHome={() => setScreen('landing')}
                />
              </motion.div>
            )}

            {/* Screen: ACTIVE RECALL QUIZ */}
            {screen === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-3xl mx-auto flex-1"
                id="screen-quiz"
              >
                <QuizView
                  quiz={activeLesson.quiz}
                  dayNumber={activeDay}
                  onNext={handleQuizSubmit}
                />
              </motion.div>
            )}

            {/* Screen: REFLECTIONS */}
            {screen === 'reflection' && (
              <motion.div
                key="reflection"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-3xl mx-auto flex-1"
                id="screen-reflection"
              >
                <ReflectionView
                  questions={activeLesson.reflectionQuestions}
                  placeholders={activeLesson.reflectionPlaceholders}
                  dayNumber={activeDay}
                  onFinishReflections={handleFinishReflections}
                  onBackToQuiz={() => setScreen('quiz')}
                />
              </motion.div>
            )}

            {/* Screen: CELEBRATION */}
            {screen === 'celebration' && activeRecord && (
              <motion.div
                key="celebration"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-3xl mx-auto flex-1"
                id="screen-celebration"
              >
                <CelebrationView
                  lesson={activeLesson}
                  record={activeRecord}
                  streakCount={progress.streakCount}
                  onStartPracticeGame={() => handlePlayPracticeGameDirectly()}
                  onReturnHome={() => setScreen('landing')}
                />
              </motion.div>
            )}

            {/* Screen: PRACTICE GAME */}
            {screen === 'game' && activeRecord && (
              <motion.div
                key="game"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-3xl mx-auto flex-1"
                id="screen-game"
              >
                <PracticeGame
                  questions={activeLesson.reflectionQuestions}
                  answers={activeRecord.reflectionAnswers}
                  dayNumber={activeDay}
                  onFinishGame={handleFinishPracticeGame}
                  onBackToCelebration={() => setScreen('celebration')}
                  onSubmitSubmission={handleSubmitSubmission}
                />
              </motion.div>
            )}

            {/* Screen: CURRICULUM ARCHIVE HISTORY */}
            {screen === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-3xl mx-auto flex-1"
                id="screen-history"
              >
                <HistoryView
                  currentDay={progress.currentDay}
                  completedDays={progress.completedDays}
                  completedToday={completedToday()}
                  customLessons={customLessons}
                  lessonRecords={lessonRecords}
                  onSelectLesson={handleBeginLesson}
                  onPlayGame={handlePlayPracticeGameDirectly}
                  onBack={() => setScreen('landing')}
                />
              </motion.div>
            )}

            {/* Screen: ADMIN BOARDROOM */}
            {screen === 'admin' && isAdmin && (
              <motion.div
                key="admin"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-3xl mx-auto flex-1"
                id="screen-admin"
              >
                <AdminPanel
                  customLessons={customLessons}
                  onBack={() => setScreen('landing')}
                  onRefreshLessons={loadCustomLessons}
                  onPreviewLesson={handleBeginLesson}
                />
              </motion.div>
            )}

          </AnimatePresence>
      </main>
    </div>
  );
}
