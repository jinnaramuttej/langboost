import { initialAppData } from "@/lib/mock-data";
import type {
  AnalyticsEvent,
  AppStore,
  Flashcard,
  ForumReply,
  ForumThread,
  Level,
  Lesson,
  LessonType,
  ProgressStatus,
  Session,
  User,
  UserProgress,
  VocabularyEntry,
} from "@/types";

const STORAGE_KEY = "languageboost.demo-data.v1";

const clone = <T,>(value: T): T => structuredClone(value);

const hasWindow = (): boolean => typeof window !== "undefined" && !!window.localStorage;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const LESSON_TYPES: LessonType[] = ["vocabulary", "grammar", "listening", "reading", "speaking"];
const PROGRESS_STATUSES: ProgressStatus[] = ["not_started", "in_progress", "completed"];

const isLevel = (value: unknown): value is Level =>
  typeof value === "string" && LEVELS.some((level) => level === value);

const isLessonType = (value: unknown): value is LessonType =>
  typeof value === "string" && LESSON_TYPES.some((lessonType) => lessonType === value);

const isProgressStatus = (value: unknown): value is ProgressStatus =>
  typeof value === "string" && PROGRESS_STATUSES.some((status) => status === value);

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const withRole = (user: User): User => {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (user.role) {
    return user;
  }
  if (adminEmail && user.email === adminEmail) {
    return { ...user, role: "admin" };
  }
  return { ...user, role: "user" };
};

const normalizeLesson = (value: unknown): Lesson => {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.title !== "string" || typeof value.language !== "string" || typeof value.content !== "string") {
    return {
      id: `lesson-${Date.now()}`,
      title: "Untitled lesson",
      language: "Unknown",
      content: "",
      tags: [],
    };
  }

  return {
    id: value.id,
    title: value.title,
    language: value.language,
    content: value.content,
    tags: toStringArray(value.tags),
    description: typeof value.description === "string" ? value.description : undefined,
    slug: typeof value.slug === "string" ? value.slug : undefined,
    difficulty_level: isLevel(value.difficulty_level) ? value.difficulty_level : undefined,
    level: isLevel(value.level) ? value.level : undefined,
    lesson_type: isLessonType(value.lesson_type) ? value.lesson_type : undefined,
    duration_minutes: typeof value.duration_minutes === "number" ? value.duration_minutes : undefined,
    xp_reward: typeof value.xp_reward === "number" ? value.xp_reward : undefined,
    is_published: typeof value.is_published === "boolean" ? value.is_published : undefined,
    view_count: typeof value.view_count === "number" ? value.view_count : undefined,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : undefined,
    created_date: typeof value.created_date === "string" ? value.created_date : undefined,
    updated_date: typeof value.updated_date === "string" ? value.updated_date : undefined,
  };
};

const normalizeUserProgress = (value: unknown): UserProgress => {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.user_id !== "string" || typeof value.lesson_id !== "string") {
    return {
      id: `progress-${Date.now()}`,
      user_id: "unknown-user",
      lesson_id: "unknown-lesson",
      status: "not_started",
      score: 0,
      attempts: 0,
    };
  }

  return {
    id: value.id,
    user_id: value.user_id,
    lesson_id: value.lesson_id,
    status: isProgressStatus(value.status) ? value.status : "not_started",
    score: typeof value.score === "number" ? value.score : 0,
    attempts: typeof value.attempts === "number" ? value.attempts : 0,
    time_spent_seconds: typeof value.time_spent_seconds === "number" ? value.time_spent_seconds : undefined,
    started_at: typeof value.started_at === "string" ? value.started_at : undefined,
    completed_at: typeof value.completed_at === "string" ? value.completed_at : undefined,
    created_date: typeof value.created_date === "string" ? value.created_date : undefined,
    updated_date: typeof value.updated_date === "string" ? value.updated_date : undefined,
  };
};

const createSeedStore = (): AppStore => ({
  currentUser: withRole(clone(initialAppData.currentUser)),
  users: clone(initialAppData.users).map(withRole),
  lessons: clone(initialAppData.lessons).map(normalizeLesson),
  userProgress: clone(initialAppData.userProgress).map(normalizeUserProgress),
  flashcards: clone(initialAppData.flashcards),
  vocabularyEntries: clone(initialAppData.vocabularyEntries),
  forumThreads: clone(initialAppData.forumThreads),
  forumReplies: clone(initialAppData.forumReplies),
  analyticsEvents: [],
  session: null,
});

let memoryStore: AppStore = createSeedStore();

const readStore = (): AppStore => {
  if (!hasWindow()) {
    return clone(memoryStore);
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = createSeedStore();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    memoryStore = clone(seeded);
    return seeded;
  }

  try {
    const parsed = JSON.parse(raw);
    const seeded = createSeedStore();
    const nextStore: AppStore = {
      ...seeded,
      ...parsed,
      currentUser: withRole({ ...seeded.currentUser, ...parsed?.currentUser }),
      users: Array.isArray(parsed?.users) ? parsed.users.map((user: User) => withRole({ ...user })) : seeded.users,
      lessons: Array.isArray(parsed?.lessons) ? parsed.lessons.map((lesson: unknown) => normalizeLesson(lesson)) : seeded.lessons,
      userProgress: Array.isArray(parsed?.userProgress) ? parsed.userProgress.map((item: unknown) => normalizeUserProgress(item)) : seeded.userProgress,
      flashcards: Array.isArray(parsed?.flashcards) ? parsed.flashcards : seeded.flashcards,
      vocabularyEntries: Array.isArray(parsed?.vocabularyEntries) ? parsed.vocabularyEntries : seeded.vocabularyEntries,
      forumThreads: Array.isArray(parsed?.forumThreads) ? parsed.forumThreads : seeded.forumThreads,
      forumReplies: Array.isArray(parsed?.forumReplies) ? parsed.forumReplies : seeded.forumReplies,
      analyticsEvents: Array.isArray(parsed?.analyticsEvents) ? parsed.analyticsEvents : seeded.analyticsEvents,
      session: parsed?.session ?? seeded.session,
    };
    memoryStore = clone(nextStore);
    return nextStore;
  } catch {
    const seeded = createSeedStore();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    memoryStore = clone(seeded);
    return seeded;
  }
};

const writeStore = (nextStore: AppStore): void => {
  memoryStore = clone(nextStore);
  if (hasWindow()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore));
  }
};

export type StoreKey = keyof AppStore;

export const db = {
  storageKey: STORAGE_KEY,

  hasWindow,

  getStore(): AppStore {
    return readStore();
  },

  setStore(nextStore: AppStore): void {
    writeStore(nextStore);
  },

  get<K extends StoreKey>(key: K): AppStore[K] {
    return clone(readStore()[key]);
  },

  set<K extends StoreKey>(key: K, value: AppStore[K]): void {
    const store = readStore();
    store[key] = clone(value);
    writeStore(store);
  },

  delete<K extends StoreKey>(key: K): void {
    const seeded = createSeedStore();
    const store = readStore();
    store[key] = clone(seeded[key]);
    writeStore(store);
  },

  reset(): AppStore {
    const seeded = createSeedStore();
    writeStore(seeded);
    return seeded;
  },
};

export type AppStoreCollections = {
  analyticsEvents: AnalyticsEvent[];
  flashcards: Flashcard[];
  forumReplies: ForumReply[];
  forumThreads: ForumThread[];
  lessons: Lesson[];
  userProgress: UserProgress[];
  users: User[];
  vocabularyEntries: VocabularyEntry[];
};
