import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("dives").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("dives") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    country: v.optional(v.string()),
    siteName: v.string(),
    date: v.string(),
    dayNumber: v.optional(v.number()),
    location: v.string(),
    maxDepth: v.number(),
    duration: v.number(),
    waterTemp: v.number(),
    buddyName: v.string(),
    marineLife: v.array(
      v.object({
        id: v.optional(v.string()),
        name: v.string(),
        scientificName: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        custom: v.optional(v.boolean()),
      })
    ),
    notes: v.string(),
    photos: v.array(v.string()),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("dives", args);
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("dives"),
    country: v.optional(v.string()),
    siteName: v.string(),
    date: v.string(),
    dayNumber: v.optional(v.number()),
    location: v.string(),
    maxDepth: v.number(),
    duration: v.number(),
    waterTemp: v.number(),
    buddyName: v.string(),
    marineLife: v.array(
      v.object({
        id: v.optional(v.string()),
        name: v.string(),
        scientificName: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        custom: v.optional(v.boolean()),
      })
    ),
    notes: v.string(),
    photos: v.array(v.string()),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.replace(id, rest);
  },
});

export const remove = mutation({
  args: { id: v.id("dives") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const allDives = await ctx.db.query("dives").collect();
    for (const dive of allDives) {
      await ctx.db.delete(dive._id);
    }
    return allDives.length;
  },
});