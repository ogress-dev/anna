import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // Append-only log of every date Anna has saved. No upsert, each save is a
  // new row so you can see if she changed her mind and when.
  visitDays: defineTable({
    // 'YYYY-MM-DD', constrained to the current week by the date picker.
    date: v.string(),
    // Date.now() from the client at submit time.
    savedAt: v.number(),
  }).index('by_savedAt', ['savedAt']),

  // Append-only log of every successful unlock, so you can see she opened the
  // letter and when, even if she never picks a day.
  unlocks: defineTable({
    // Date.now() from the client at unlock time.
    openedAt: v.number(),
  }).index('by_openedAt', ['openedAt']),
});