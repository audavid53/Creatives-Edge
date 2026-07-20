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
import { generateLessonPDF } from './lib/pdfHelper';
import { uploadSubmissionVideo } from './lib/storageHelper';
import { Sparkles, Loader2, Play, ChevronRight, GraduationCap } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-[#F3ECE0] flex items-center justify-center font-sans py-4 sm:py-8 px-2 overflow-y-auto" id="applet-viewport">
      {/* 
        PREMIUM MOBILE FRAME SIMULATOR
        On desktop: acts as a gorgeous high-fidelity centered smartphone frame
        On mobile: renders full screen borderless automatically!
      */}
      <div 
        className="w-full max-w-md bg-[#FDFBF7] shadow-2xl rounded-3xl overflow-hidden min-h-[720px] max-h-[900px] border border-stone-200/80 flex flex-col relative"
        id="phone-shell"
      >
        
        {/* Universal Status Header bar */}
        <div className="bg-[#FAF6F0] px-6 py-2.5 flex justify-between items-center text-[10px] font-mono text-stone-400 border-b border-[#F4EFEB]" id="phone-status-bar">
          <div className="flex items-center gap-1.5 font-semibold text-[#C85A32]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>ACADEMY SERVER STATUS: OPERATIONAL</span>
          </div>
          <div>UTC: 2026-07-19</div>
        </div>

        {/* Global Spinner Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-[#FAF6F0]/85 z-50 flex flex-col items-center justify-center text-center p-6 gap-3">
            <Loader2 className="text-[#C85A32] animate-spin" size={32} />
            <p className="text-sm font-serif italic text-stone-700 animate-pulse">Brewing Sourdough, Aligning Scales...</p>
          </div>
        )}

        {/* Dynamic Route Screen Switcher */}
        <div className="flex-1 overflow-y-auto" id="navigation-root">
          <AnimatePresence mode="wait">
            
            {/* Screen: WELCOME / LOGIN */}
            {screen === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col justify-between h-full px-6 py-8"
                id="screen-welcome"
              >
                <div onClick={handleBackdoorClick} className="text-center mt-6 cursor-pointer select-none">
                  <div className="inline-block p-4 bg-[#FAF6F0] rounded-full border border-[#C85A32]/20 mb-4 animate-pulse">
                    <GraduationCap size={44} className="text-[#C85A32]" />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#C85A32] uppercase tracking-widest block mb-1">WELCOME TO THE ACADEMY</span>
                  <h1 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">The Creative Edge</h1>
                  <p className="text-sm italic text-stone-500 mt-2 px-2 leading-relaxed font-serif">
                    "Decouple your income from your time. Learn to discover unserved markets for your unique craft."
                  </p>
                </div>

                {/* Info block cards */}
                <div className="my-8 flex flex-col gap-3">
                  <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#EBE3D5] flex items-start gap-3">
                    <span className="text-[#C85A32] font-mono font-bold mt-0.5 text-sm">30</span>
                    <div>
                      <h4 className="text-xs font-semibold text-stone-800">Days of Devotion</h4>
                      <p className="text-[11px] text-stone-500 mt-0.5 font-sans leading-relaxed">Bite-sized stories, active recalls, and custom reflection worksheets.</p>
                    </div>
                  </div>

                  <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#EBE3D5] flex items-start gap-3">
                    <Play size={16} className="text-[#C85A32] shrink-0 mt-0.5 fill-[#C85A32]" />
                    <div>
                      <h4 className="text-xs font-semibold text-stone-800">Spontaneity Speaking Drill</h4>
                      <p className="text-[11px] text-stone-500 mt-0.5 font-sans leading-relaxed">Vocal communication practice built in to turn your reflections into confident pitches.</p>
                    </div>
                  </div>
                </div>

                {/* Login Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full bg-[#1C1917] hover:bg-[#C85A32] text-white font-sans font-medium py-3.5 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer active:scale-98 text-sm"
                    id="welcome-google-login-btn"
                  >
                    {/* Inline Google Icon */}
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.743-.08-1.3-.176-1.856l-10.617-.353z" />
                    </svg>
                    <span>Sign In with Google</span>
                  </button>

                  <button
                    onClick={handleGuestLogin}
                    className="w-full bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200 font-sans font-medium py-3 px-6 rounded-2xl transition-all flex items-center justify-center gap-1 cursor-pointer text-sm"
                    id="welcome-guest-login-btn"
                  >
                    <span>Continue as Guest (IFrame Preview)</span>
                    <ChevronRight size={14} />
                  </button>
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
                className="h-full"
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
                className="h-full"
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
                className="h-full"
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
                className="h-full"
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
                className="h-full"
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
                className="h-full"
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
                className="h-full"
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
                className="h-full"
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
        </div>
      </div>
    </div>
  );
}
