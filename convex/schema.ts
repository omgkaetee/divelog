import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  dives: defineTable({
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
    visibility: v.optional(v.number()), // Legacy field - will be removed
  }).index("by_date", ["date"]),
  
  settings: defineTable({
    key: v.string(),
    value: v.any(),
  }).index("by_key", ["key"]),
});