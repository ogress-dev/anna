import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Record that Anna unlocked the letter. Called on a successful password check,
 * before the letter renders. Fire and forget: a failure here must never block
 * her from reading it.
 */
export const record = mutation({
  args: {
    openedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert('unlocks', {
      openedAt: args.openedAt,
    });

    return id;
  },
});

/**
 * Newest first.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('unlocks')
      .withIndex('by_openedAt')
      .order('desc')
      .take(50);
  },
});

/**
 * When she most recently opened the letter, or null if she never has.
 */
export const latest = query({
  args: {},
  handler: async (ctx) => {
    const newest = await ctx.db
      .query('unlocks')
      .withIndex('by_openedAt')
      .order('desc')
      .first();

    return newest ?? null;
  },
});