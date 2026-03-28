import { db } from "@/lib/db";
import type { AnalyticsEvent } from "@/types";

const makeEventId = (): string => globalThis.crypto?.randomUUID?.() ?? `event-${Date.now()}`;

export const analytics = {
  track(type: string, data: Record<string, unknown> = {}, userId?: string): AnalyticsEvent {
    const events = db.get("analyticsEvents");
    const event: AnalyticsEvent = {
      id: makeEventId(),
      type,
      userId,
      data,
      timestamp: new Date().toISOString(),
    };

    db.set("analyticsEvents", [...events.slice(-499), event]);
    return event;
  },

  getLast(count = 20): AnalyticsEvent[] {
    return [...db.get("analyticsEvents")].slice(-count).reverse();
  },

  countByType(type: string): number {
    return db.get("analyticsEvents").filter((event) => event.type === type).length;
  },

  getThisWeek(): AnalyticsEvent[] {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return db
      .get("analyticsEvents")
      .filter((event) => new Date(event.timestamp).getTime() >= cutoff);
  },
};
