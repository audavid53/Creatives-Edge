import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db, signInWithGoogle, signInAsGuest, logOut } from './firebase';
import { Lesson, UserProgress, UserLessonRecord } from './types';
import { getLessonByDay } from './data/lessons';
import { MarketingLanding } from './components/MarketingLanding';
import { AdmissionView } from './components/AdmissionView';
import { HomeTab } from './components/HomeTab';
import { Landing } from './components/Landing';
import { PracticeTab } from './components/PracticeTab';
import { ProfileTab } from './components/ProfileTab';
import { TabBar, AppTab } from './components/TabBar';
import { LessonCarousel } from './components/LessonCarousel';
import { QuizView } from './components/QuizView';
import { ReflectionView } from './components/ReflectionView';
import { CelebrationView } from './components/CelebrationView';
import { PracticeGame } from './components/PracticeGame';
import { HistoryView } from './components/HistoryView';
import { AdminPanel } from './components/AdminPanel';
import { ProfileModal } from './components/ProfileModal';
import { WelcomeLessonModal } from './components/WelcomeLessonModal';
import { BrandWordmark } from './components/BrandWordmark';
import { generateLessonPDF } from './lib/pdfHelper';
import { uploadSubmissionVideo } from './lib/storageHelper';
import {
  getCommunityStats, registerNewCreative, registerCompletion, CommunityStats,
} from './lib/communityStats';
import { Loader2, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Screen identifiers
type ScreenState =
  | 'welcome' | 'admission' | 'app'
  | 'carousel' | 'quiz' | 'reflection' | 'celebration' | 'game' | 'history' | 'admin';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<ScreenState>('welcome');
  const [activeTab, setActiveTab] = useState<AppTab>('home');

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
    streakCount: 0,
  });
  const [lessonRecords, setLessonRecords] = useState<Record<number, UserLessonRecord>>({});
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);

  // Active Lesson state
  const [activeDay, setActiveDay] = useState<number>(1);
  const [activeLesson, setActiveLesson] = useState<Lesson>(getLessonByDay(1));
  const [activeRecord, setActiveRecord] = useState<UserLessonRecord | null>(null);

  // Overridden lessons and user contact info
  const [customLessons, setCustomLessons] = useState<Record<number, Lesson>>({});
  const [userPhoneNumber, setUserPhoneNumber] = useState<string>('');

  const getMergedLesson = (dayNum: number, customMap = customLessons): Lesson => {
    if (customMap[dayNum]) return customMap[dayNum];
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
        alert('Developer Backdoor Activated: Boardroom Console Unlocked!');
        return 0;
      }
      return next;
    });
  };

  const loadCommunityStats = async () => {
    const s = await getCommunityStats();
    setCommunityStats(s);
  };

  // 1. Auth Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        const loadedProgress = await syncUserData(currentUser);
        loadCommunityStats();
        if (loadedProgress && !loadedProgress.pledgeCommitted) {
          setScreen('admission');
        } else {
          setScreen('app');
          setActiveTab('home');
        }
      } else {
        setUser(null);
        setScreen('welcome');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadCustomLessons = async () => {
    try {
      const lessonsSnap = await getDocs(collection(db, 'lessons'));
      const map: Record<number, Lesson> = {};
      lessonsSnap.forEach((d) => {
        const data = d.data() as Lesson;
        map[data.dayNumber] = data;
      });
      setCustomLessons(map);
      if (activeDay) {
        setActiveLesson(map[activeDay] || getLessonByDay(activeDay));
      }
      return map;
    } catch (err) {
      console.warn('Could not load custom lessons from Firestore:', err);
      return {};
    }
  };

  // Sync user data from Firestore on sign-in. Returns the loaded progress.
  const syncUserData = async (currentUser: User): Promise<UserProgress | null> => {
    try {
      const loadedCustoms = await loadCustomLessons();

      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      let phone = '';
      let name = currentUser.displayName || currentUser.email?.split('@')[0] || 'Creative Practitioner';
      let pic = '';
      let completed = false;

      if (userSnap.exists()) {
        const udata = userSnap.data();
        phone = udata.phoneNumber || '';
        name = udata.displayName || name;
        pic = udata.profilePic || '';
        completed = udata.profileCompleted || false;
      }

      setUserPhoneNumber(phone);
      setUserDisplayName(name);
      setUserProfilePic(pic);

      const isGoogleUser = currentUser.providerData.some((p) => p.providerId === 'google.com');

      await setDoc(
        userRef,
        {
          uid: currentUser.uid,
          email: currentUser.email || 'Anonymous Guest',
          displayName: name,
          phoneNumber: phone,
          profilePic: pic,
          profileCompleted: completed,
          lastActive: new Date().toISOString(),
        },
        { merge: true },
      );

      setShowProfileModal(isGoogleUser && !completed);

      // Progress
      const progressRef = doc(db, 'users', currentUser.uid, 'settings', 'progress');
      const progressSnap = await getDoc(progressRef);

      let userProgress: UserProgress;
      if (progressSnap.exists()) {
        userProgress = progressSnap.data() as UserProgress;
      } else {
        userProgress = { uid: currentUser.uid, currentDay: 1, completedDays: [], streakCount: 0 };
        await setDoc(progressRef, userProgress);
      }
      setProgress(userProgress);
      setActiveDay(userProgress.currentDay);
      setActiveLesson(getMergedLesson(userProgress.currentDay, loadedCustoms));

      // Records
      const recordsColRef = collection(db, 'users', currentUser.uid, 'records');
      const recordsSnap = await getDocs(recordsColRef);
      const recordsMap: Record<number, UserLessonRecord> = {};
      recordsSnap.forEach((d) => {
        const data = d.data() as UserLessonRecord;
        recordsMap[data.dayNumber] = data;
      });
      setLessonRecords(recordsMap);
      setActiveRecord(recordsMap[userProgress.currentDay] || null);

      return userProgress;
    } catch (error) {
      console.error('Error syncing user data from Firestore:', error);
      return null;
    }
  };

  // 2. Auth Actions
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (e) {
      setLoading(false);
      alert("Popup blocked or sign-in interrupted. Try 'Explore as guest' for sandbox preview compatibility!");
    }
  };

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      await signInAsGuest();
    } catch (e) {
      setLoading(false);
      alert('Failed guest sign in. Check internet connection.');
    }
  };

  const handleSaveProfile = async (name: string, phone: string, profilePicData: string) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          displayName: name,
          phoneNumber: phone,
          profilePic: profilePicData,
          profileCompleted: true,
          lastActive: new Date().toISOString(),
        },
        { merge: true },
      );
      setUserDisplayName(name);
      setUserPhoneNumber(phone);
      setUserProfilePic(profilePicData);
      setShowProfileModal(false);
    } catch (err) {
      console.error('Error saving profile completion:', err);
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

  // Admission: pledge + chosen daily time (once)
  const handleCompleteAdmission = async (pledgeTime: string) => {
    if (!user) return;
    try {
      setLoading(true);
      const wasCounted = progress.countedInCommunity;
      const progressRef = doc(db, 'users', user.uid, 'settings', 'progress');
      const updated: UserProgress = {
        ...progress,
        pledgeCommitted: true,
        pledgeTime,
        pledgeCommittedAt: new Date().toISOString(),
        countedInCommunity: true,
      };
      await setDoc(progressRef, updated, { merge: true });
      setProgress(updated);
      if (!wasCounted) await registerNewCreative();
      await loadCommunityStats();
      setScreen('app');
      setActiveTab('home');
    } catch (err) {
      console.error('Error completing admission:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePledgeTime = async (time: string) => {
    if (!user) return;
    try {
      const progressRef = doc(db, 'users', user.uid, 'settings', 'progress');
      await setDoc(progressRef, { pledgeTime: time }, { merge: true });
      setProgress((p) => ({ ...p, pledgeTime: time }));
    } catch (err) {
      console.error('Error updating pledge time:', err);
    }
  };

  // 3. Journey Actions
  const handleBeginLesson = (dayNum = progress.currentDay) => {
    setActiveDay(dayNum);
    setActiveLesson(getMergedLesson(dayNum));
    setShowWelcomeModal(true);
  };

  const handleConfirmWelcomeModal = () => {
    setShowWelcomeModal(false);
    setScreen('carousel');
  };

  const handleFinishCarousel = () => setScreen('quiz');

  const handleQuizSubmit = async (selectedIdx: number, isCorrectFirstTry: boolean) => {
    if (!user) return;
    const recordRef = doc(db, 'users', user.uid, 'records', activeDay.toString());
    const existing = lessonRecords[activeDay];
    const updatedRecord: UserLessonRecord = {
      dayNumber: activeDay,
      quizAnswerSelected: selectedIdx,
      quizCorrect: isCorrectFirstTry,
      reflectionAnswers: existing?.reflectionAnswers || new Array(activeLesson.reflectionQuestions.length).fill(''),
    };
    await setDoc(recordRef, updatedRecord);
    setLessonRecords((prev) => ({ ...prev, [activeDay]: updatedRecord }));
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
      const recordRef = doc(db, 'users', user.uid, 'records', activeDay.toString());
      const updatedRecord: UserLessonRecord = {
        ...(activeRecord || { dayNumber: activeDay }),
        reflectionAnswers,
        completedAt: timestamp,
      };
      await setDoc(recordRef, updatedRecord);

      const progressRef = doc(db, 'users', user.uid, 'settings', 'progress');
      const alreadyCompleted = progress.completedDays.includes(activeDay);
      const newCompletedDays = [...progress.completedDays];
      if (!alreadyCompleted) newCompletedDays.push(activeDay);

      let newStreak = progress.streakCount;
      const todayLocal = getLocalDateString();
      const lastCompletedLocal = progress.lastCompletedAt ? getLocalDateString(progress.lastCompletedAt) : null;
      if (!progress.lastCompletedAt) {
        newStreak = 1;
      } else if (todayLocal !== lastCompletedLocal) {
        const diffTime = Math.abs(new Date(todayLocal).getTime() - new Date(lastCompletedLocal || '').getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        newStreak = diffDays <= 1 ? newStreak + 1 : 1;
      }

      const nextDay =
        activeDay === progress.currentDay && progress.currentDay < 30 ? progress.currentDay + 1 : progress.currentDay;

      const updatedProgress: UserProgress = {
        ...progress,
        currentDay: nextDay,
        completedDays: newCompletedDays,
        streakCount: newStreak,
        lastCompletedAt: timestamp,
      };
      await setDoc(progressRef, updatedProgress, { merge: true });

      setProgress(updatedProgress);
      setLessonRecords((prev) => ({ ...prev, [activeDay]: updatedRecord }));
      setActiveRecord(updatedRecord);
      setActiveDay(nextDay);
      setActiveLesson(getMergedLesson(nextDay));

      // Community aggregate — count this completion once, then refresh
      if (!alreadyCompleted) {
        registerCompletion().then(loadCommunityStats);
      }

      setScreen('celebration');
    } catch (err) {
      console.error('Error completing lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishPracticeGame = async (recordingsCount: number) => {
    if (!user || !activeRecord) return;
    const recordRef = doc(db, 'users', user.uid, 'records', activeDay.toString());
    const updatedRecord: UserLessonRecord = {
      ...activeRecord,
      practiceGamePlayed: true,
      practiceRecordingsCount: recordingsCount,
    };
    await setDoc(recordRef, updatedRecord);
    setLessonRecords((prev) => ({ ...prev, [activeDay]: updatedRecord }));
    setActiveRecord(updatedRecord);
    setScreen('app');
    setActiveTab('practice');
  };

  const handleDownloadDirectly = () => {
    const record = lessonRecords[activeDay];
    if (record) {
      generateLessonPDF(
        activeDay,
        activeLesson.title,
        activeLesson.quiz.keyInsightText,
        activeLesson.reflectionQuestions,
        record.reflectionAnswers,
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
      alert('Please complete the lesson reflections before playing the speaking game!');
    }
  };

  const handleUpdatePhoneNumber = async (phone: string) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { phoneNumber: phone }, { merge: true });
      setUserPhoneNumber(phone);
    } catch (err) {
      console.error('Error updating phone number:', err);
    }
  };

  const completedToday = (): boolean => {
    if (!progress.lastCompletedAt) return false;
    return getLocalDateString() === getLocalDateString(progress.lastCompletedAt);
  };

  const handleSubmitSubmission = async (videoBlob: Blob | null, videoText: string, isSimulated: boolean) => {
    if (!user) return;
    try {
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
        round: 3,
        videoUrl,
        videoText,
        submittedAt: new Date().toISOString(),
        isSimulated,
      });
    } catch (err) {
      console.error('Error submitting video challenge:', err);
    }
  };

  const displayName = user?.isAnonymous
    ? 'Creative Guest'
    : userDisplayName || user?.displayName || user?.email?.split('@')[0] || 'Creative Practitioner';

  const showAppChrome = screen === 'app';
  const isSubScreen = !['welcome', 'admission', 'app'].includes(screen);

  return (
    <div className="min-h-screen bg-[#DCE9FB] font-sans text-[#0B1F3A] flex flex-col relative" id="applet-viewport">
      {/* Ambient brand glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-0" aria-hidden="true">
        <div className="absolute -top-40 -right-32 w-[38rem] h-[38rem] rounded-full bg-[#2563EB]/10 blur-3xl" />
        <div className="absolute -bottom-48 -left-40 w-[42rem] h-[42rem] rounded-full bg-[#FACC15]/10 blur-3xl" />
      </div>

      {/* App header with tabs (main app only) */}
      {showAppChrome && (
        <header className="sticky top-0 z-40 backdrop-blur-md bg-[#DCE9FB]/80 border-b border-[#D6E4FA]" id="app-topbar">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
            <button onClick={handleBackdoorClick} className="cursor-pointer select-none shrink-0">
              <BrandWordmark variant="light" logoClassName="h-8 w-8" className="text-base" />
            </button>
            <TabBar active={activeTab} onChange={setActiveTab} variant="top" />
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#2563EB] bg-white/70 hover:bg-white border border-[#D6E4FA] px-3 py-1.5 rounded-full transition-colors cursor-pointer shrink-0"
              title="Log Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </header>
      )}

      {/* Minimal header on lesson sub-screens */}
      {isSubScreen && (
        <header className="sticky top-0 z-40 backdrop-blur-md bg-[#DCE9FB]/80 border-b border-[#D6E4FA]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center">
            <button onClick={handleBackdoorClick} className="cursor-pointer select-none">
              <BrandWordmark variant="light" logoClassName="h-7 w-7" className="text-sm" />
            </button>
          </div>
        </header>
      )}

      {/* Global Spinner */}
      {loading && (
        <div className="fixed inset-0 bg-[#DCE9FB]/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-6 gap-3">
          <Loader2 className="text-[#2563EB] animate-spin" size={36} />
          <p className="text-sm font-serif font-semibold text-slate-700 animate-pulse">Aligning your creative edge…</p>
        </div>
      )}

      <main className={`relative z-10 flex-1 w-full flex flex-col ${showAppChrome ? 'pb-24 sm:pb-6' : ''}`} id="navigation-root">
        <AnimatePresence mode="wait">
          {/* WELCOME / MARKETING LANDING */}
          {screen === 'welcome' && (
            <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1" id="screen-welcome">
              <MarketingLanding
                onGoogleLogin={handleGoogleLogin}
                onGuestLogin={handleGuestLogin}
                onLogoClick={handleBackdoorClick}
              />
            </motion.div>
          )}

          {/* ADMISSION */}
          {screen === 'admission' && (
            <motion.div key="admission" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex" id="screen-admission">
              <AdmissionView userName={displayName} onComplete={handleCompleteAdmission} />
            </motion.div>
          )}

          {/* MAIN APP (tabbed) */}
          {screen === 'app' && (
            <motion.div key={`app-${activeTab}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full flex-1" id="screen-app">
              {activeTab === 'home' && (
                <HomeTab
                  user={user}
                  progress={progress}
                  todayLesson={activeLesson}
                  todayCompleted={completedToday()}
                  stats={communityStats}
                  displayName={displayName}
                  onContinue={() => handleBeginLesson()}
                  onGoToPractice={() => setActiveTab('practice')}
                />
              )}
              {activeTab === 'journey' && (
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
                  onPlayPracticeGameDirectly={() => setActiveTab('practice')}
                  onDownloadDirectly={handleDownloadDirectly}
                  onUpdatePhoneNumber={handleUpdatePhoneNumber}
                  onOpenAdmin={() => setScreen('admin')}
                  onLogoClick={handleBackdoorClick}
                  userDisplayName={userDisplayName}
                  userProfilePic={userProfilePic}
                />
              )}
              {activeTab === 'practice' && (
                <PracticeTab
                  completedDays={progress.completedDays}
                  lessonRecords={lessonRecords}
                  customLessons={customLessons}
                  onPlayDrill={(day) => handlePlayPracticeGameDirectly(day)}
                  onGoToJourney={() => setActiveTab('journey')}
                />
              )}
              {activeTab === 'profile' && (
                <ProfileTab
                  user={user}
                  progress={progress}
                  displayName={displayName}
                  userProfilePic={userProfilePic}
                  userPhoneNumber={userPhoneNumber}
                  isAdmin={isAdmin}
                  onUpdatePhoneNumber={handleUpdatePhoneNumber}
                  onUpdatePledgeTime={handleUpdatePledgeTime}
                  onViewHistory={() => setScreen('history')}
                  onOpenAdmin={() => setScreen('admin')}
                  onLogout={handleLogout}
                />
              )}
            </motion.div>
          )}

          {/* Profile Completion Modal */}
          {showProfileModal && (
            <ProfileModal initialName={userDisplayName} initialPhone={userPhoneNumber} onSave={handleSaveProfile} />
          )}

          {/* Lesson intro modal */}
          {showWelcomeModal && (
            <WelcomeLessonModal lesson={activeLesson} onConfirm={handleConfirmWelcomeModal} onClose={() => setShowWelcomeModal(false)} />
          )}

          {/* LESSON CAROUSEL */}
          {screen === 'carousel' && (
            <motion.div key="carousel" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="w-full max-w-3xl mx-auto flex-1" id="screen-carousel">
              <LessonCarousel lesson={activeLesson} onFinishCarousel={handleFinishCarousel} onBackToHome={() => setScreen('app')} />
            </motion.div>
          )}

          {/* QUIZ */}
          {screen === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-3xl mx-auto flex-1" id="screen-quiz">
              <QuizView quiz={activeLesson.quiz} dayNumber={activeDay} onNext={handleQuizSubmit} />
            </motion.div>
          )}

          {/* REFLECTIONS */}
          {screen === 'reflection' && (
            <motion.div key="reflection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-3xl mx-auto flex-1" id="screen-reflection">
              <ReflectionView
                questions={activeLesson.reflectionQuestions}
                placeholders={activeLesson.reflectionPlaceholders}
                dayNumber={activeDay}
                onFinishReflections={handleFinishReflections}
                onBackToQuiz={() => setScreen('quiz')}
              />
            </motion.div>
          )}

          {/* CELEBRATION */}
          {screen === 'celebration' && activeRecord && (
            <motion.div key="celebration" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-3xl mx-auto flex-1" id="screen-celebration">
              <CelebrationView
                lesson={activeLesson}
                record={activeRecord}
                streakCount={progress.streakCount}
                onStartPracticeGame={() => handlePlayPracticeGameDirectly()}
                onReturnHome={() => { setScreen('app'); setActiveTab('home'); }}
              />
            </motion.div>
          )}

          {/* PRACTICE GAME */}
          {screen === 'game' && activeRecord && (
            <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-3xl mx-auto flex-1" id="screen-game">
              <PracticeGame
                questions={activeLesson.reflectionQuestions}
                answers={activeRecord.reflectionAnswers}
                dayNumber={activeDay}
                onFinishGame={handleFinishPracticeGame}
                onBackToCelebration={() => { setScreen('app'); setActiveTab('practice'); }}
                onSubmitSubmission={handleSubmitSubmission}
              />
            </motion.div>
          )}

          {/* HISTORY */}
          {screen === 'history' && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-3xl mx-auto flex-1" id="screen-history">
              <HistoryView
                currentDay={progress.currentDay}
                completedDays={progress.completedDays}
                completedToday={completedToday()}
                customLessons={customLessons}
                lessonRecords={lessonRecords}
                onSelectLesson={handleBeginLesson}
                onPlayGame={handlePlayPracticeGameDirectly}
                onBack={() => { setScreen('app'); setActiveTab('journey'); }}
              />
            </motion.div>
          )}

          {/* ADMIN */}
          {screen === 'admin' && isAdmin && (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-3xl mx-auto flex-1" id="screen-admin">
              <AdminPanel
                customLessons={customLessons}
                onBack={() => { setScreen('app'); setActiveTab('profile'); }}
                onRefreshLessons={loadCustomLessons}
                onPreviewLesson={handleBeginLesson}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile bottom tab bar */}
      {showAppChrome && <TabBar active={activeTab} onChange={setActiveTab} variant="bottom" />}
    </div>
  );
}
