export interface CarouselCard {
  id: string;
  illustrationType: 'baker' | 'tailor' | 'seed' | 'compass' | 'hourglass' | 'bridge' | 'mirror' | 'scale' | string;
  customImageUrl?: string;
  layoutFormat?: 'top' | 'left-bottom' | 'right-bottom';
  showHeading?: boolean;
  showPicture?: boolean;
  title: string;
  text: string;
}

export interface Quiz {
  question: string;
  options: string[];
  correctIndex: number;
  keyInsightText: string;
}

export interface Lesson {
  dayNumber: number;
  title: string;
  tagline: string;
  aboutText: string;
  carouselCards: CarouselCard[];
  quiz: Quiz;
  reflectionQuestions: string[];
  reflectionPlaceholders: string[];
  illustrationType: 'baker' | 'tailor' | 'seed' | 'compass' | 'hourglass' | 'bridge' | 'mirror' | 'scale';
}

export interface UserProgress {
  uid: string;
  currentDay: number;
  completedDays: number[];
  streakCount: number;
  lastCompletedAt?: string; // ISO String
}

export interface UserLessonRecord {
  dayNumber: number;
  quizAnswerSelected?: number;
  quizCorrect?: boolean;
  reflectionAnswers: string[];
  completedAt?: string; // ISO String
  pdfGenerated?: boolean;
  practiceGamePlayed?: boolean;
  practiceRecordingsCount?: number; // Count of recordings stored locally
}
