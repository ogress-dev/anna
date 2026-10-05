import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Append a new visit day. Rows are never updated or deleted so the admin page
 * can show the full history of what Anna picked and when.
 */
export const save = mutation({
  args: {
    date: v.string(),
    savedAt: v.number(),
  },
  handler: async (ctx, args) => {
    if (!DATE_PATTERN.test(args.date)) {
      throw new Error(`invalid date format: ${args.date}`);
    }

    const id = await ctx.db.insert('visitDays', {
      date: args.date,
      savedAt: args.savedAt,
    });

    return id;
  },
});

/**
 * Newest first, so the current choice sits at the top of the admin table.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('visitDays')
      .withIndex('by_savedAt')
      .order('desc')
      .take(50);
  },
});

/**
 * Anna's most recent choice, or null if she has never saved one.
 */
export const latest = query({
  args: {},
  handler: async (ctx) => {
    const newest = await ctx.db
      .query('visitDays')
      .withIndex('by_savedAt')
      .order('desc')
      .first();

    return newest ?? null;
  },
});