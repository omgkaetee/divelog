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
    countryDescription: v.optional(v.string()),
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
    tags: v.optional(v.array(v.string())),
    createdAt: v.string(),
    diveNumber: v.optional(v.number()),
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
    countryDescription: v.optional(v.string()),
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
    tags: v.optional(v.array(v.string())),
    createdAt: v.string(),
    diveNumber: v.optional(v.number()),
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
    const allFolders = await ctx.db.query("folders").collect();
    for (const folder of allFolders) {
      await ctx.db.delete(folder._id);
    }
    return allDives.length;
  },
});

export const updateAllWaterTemp = mutation({
  args: { minTemp: v.number(), maxTemp: v.number() },
  handler: async (ctx, args) => {
    const allDives = await ctx.db.query("dives").collect();
    for (const dive of allDives) {
      const randomTemp = args.minTemp + Math.random() * (args.maxTemp - args.minTemp)
      await ctx.db.patch(dive._id, { waterTemp: Math.round(randomTemp * 10) / 10 })
    }
    return allDives.length
  },
});

export const listFolders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("folders").collect();
  },
});

export const getFolder = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const folders = await ctx.db.query("folders").withIndex("by_name", q => q.eq("name", args.name)).collect();
    return folders[0] || null;
  },
});

export const setFolderDescription = mutation({
  args: { name: v.string(), description: v.string() },
  handler: async (ctx, args) => {
    const folders = await ctx.db.query("folders").withIndex("by_name", q => q.eq("name", args.name)).collect();
    if (folders[0]) {
      await ctx.db.patch(folders[0]._id, { description: args.description });
    } else {
      await ctx.db.insert("folders", { name: args.name, description: args.description });
    }
  },
});

export const deleteFolder = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const folders = await ctx.db.query("folders").withIndex("by_name", q => q.eq("name", args.name)).collect();
    if (folders[0]) {
      await ctx.db.delete(folders[0]._id);
    }
  },
});

export const backfillTags = mutation({
  args: {},
  handler: async (ctx) => {
    const allDives = await ctx.db.query("dives").collect();
    let count = 0;
    for (const dive of allDives) {
      if (!("tags" in dive)) {
        await ctx.db.patch(dive._id, { tags: [] });
        count++;
      }
    }
    return { updated: count, total: allDives.length };
  },
});