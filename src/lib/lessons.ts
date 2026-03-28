import { initialAppData } from "@/lib/mock-data";
import { db } from "@/lib/db";
import type { Level, Lesson, LessonType } from "@/types";

type NewLesson = Omit<Lesson, "id" | "created_date" | "updated_date">;

type LessonUpdate = Partial<Omit<Lesson, "id" | "created_date">>;

const makeLessonId = (): string => globalThis.crypto?.randomUUID?.() ?? `lesson-${Date.now()}`;

const normalizeTags = (tags: string[] | undefined): string[] => (Array.isArray(tags) ? tags : []);

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const LESSON_TYPES: LessonType[] = ["vocabulary", "grammar", "listening", "reading", "speaking"];

const isLevel = (value: unknown): value is Level =>
  typeof value === "string" && LEVELS.some((level) => level === value);

const isLessonType = (value: unknown): value is LessonType =>
  typeof value === "string" && LESSON_TYPES.some((lessonType) => lessonType === value);

export const lessonStore = {
  getAll(): Lesson[] {
    return db.get("lessons");
  },

  getById(id: string): Lesson | undefined {
    return this.getAll().find((lesson) => lesson.id === id);
  },

  create(data: NewLesson): Lesson {
    const timestamp = new Date().toISOString();
    const nextLesson: Lesson = {
      ...data,
      id: makeLessonId(),
      tags: normalizeTags(data.tags),
      created_date: timestamp,
      updated_date: timestamp,
    };

    db.set("lessons", [nextLesson, ...this.getAll()]);
    return nextLesson;
  },

  update(id: string, data: LessonUpdate): Lesson | undefined {
    let updatedLesson: Lesson | undefined;
    const nextLessons = this.getAll().map((lesson) => {
      if (lesson.id !== id) {
        return lesson;
      }

      updatedLesson = {
        ...lesson,
        ...data,
        tags: normalizeTags(data.tags ?? lesson.tags),
        updated_date: new Date().toISOString(),
      };
      return updatedLesson;
    });

    db.set("lessons", nextLessons);
    return updatedLesson;
  },

  delete(id: string): void {
    db.set("lessons", this.getAll().filter((lesson) => lesson.id !== id));
  },

  seed(): Lesson[] {
    if (this.getAll().length > 0) {
      return this.getAll();
    }

    const seededLessons = initialAppData.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      language: lesson.language,
      content: lesson.content,
      tags: [],
      description: lesson.description,
      slug: lesson.slug,
      difficulty_level: isLevel(lesson.difficulty_level) ? lesson.difficulty_level : undefined,
      lesson_type: isLessonType(lesson.lesson_type) ? lesson.lesson_type : undefined,
      duration_minutes: lesson.duration_minutes,
      xp_reward: lesson.xp_reward,
      is_published: lesson.is_published,
      view_count: lesson.view_count,
      created_date: lesson.created_date,
      updated_date: lesson.updated_date,
    }));
    db.set("lessons", seededLessons);
    return seededLessons;
  },
};
