export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type LessonType = "vocabulary" | "grammar" | "listening" | "reading" | "speaking";

export type ProgressStatus = "not_started" | "in_progress" | "completed";

export type UserRole = "user" | "admin";

export type Lesson = {
  id: string;
  title: string;
  language: string;
  content: string;
  tags: string[];
  level?: Level;
  difficulty_level?: Level;
  description?: string;
  slug?: string;
  lesson_type?: LessonType;
  duration_minutes?: number;
  xp_reward?: number;
  is_published?: boolean;
  view_count?: number;
  createdAt?: string;
  created_date?: string;
  updated_date?: string;
};

export type User = {
  id: string;
  name?: string;
  full_name?: string;
  email: string;
  role?: UserRole;
  passwordHash?: string;
  bio?: string;
  native_language?: string;
  target_languages?: string;
  streak_count?: number;
  longest_streak?: number;
  total_xp?: number;
  current_level?: number;
  daily_goal_minutes?: number;
  createdAt?: string;
  created_date?: string;
  updated_date?: string;
};

export type Session = {
  userId: string;
  token: string;
  expiresAt: string;
};

export type LessonProgress = {
  completed: boolean;
  score: number;
  attempts: number;
  lastAt: string;
};

export type AnalyticsEvent = {
  id: string;
  type: string;
  userId?: string;
  data: Record<string, unknown>;
  timestamp: string;
};

export type AuthState = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
};

export type Flashcard = {
  id: string;
  front: string;
  back: string;
  language?: string;
  deck_name?: string;
  example_sentence?: string;
  ease_factor?: number;
  interval_days?: number;
  repetitions?: number;
  next_review_date?: string;
  created_date?: string;
  updated_date?: string;
};

export type VocabularyEntry = {
  id: string;
  word: string;
  language?: string;
  definition?: string;
  translation?: string;
  phonetic?: string;
  example_sentence?: string;
  is_mastered?: boolean;
  created_date?: string;
  updated_date?: string;
};

export type ForumThread = {
  id: string;
  title: string;
  body: string;
  language_tag?: string;
  category?: string;
  upvotes?: number;
  view_count?: number;
  reply_count?: number;
  is_pinned?: boolean;
  author_name?: string;
  created_date?: string;
  updated_date?: string;
};

export type ForumReply = {
  id: string;
  thread_id: string;
  body: string;
  upvotes?: number;
  is_accepted?: boolean;
  author_name?: string;
  created_date?: string;
  updated_date?: string;
};

export type UserProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  status: ProgressStatus;
  score: number;
  attempts: number;
  time_spent_seconds?: number;
  started_at?: string;
  completed_at?: string;
  created_date?: string;
  updated_date?: string;
};

export type AppStore = {
  currentUser: User;
  users: User[];
  lessons: Lesson[];
  userProgress: UserProgress[];
  flashcards: Flashcard[];
  vocabularyEntries: VocabularyEntry[];
  forumThreads: ForumThread[];
  forumReplies: ForumReply[];
  analyticsEvents: AnalyticsEvent[];
  session: Session | null;
};
