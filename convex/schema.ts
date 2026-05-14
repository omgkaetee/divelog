import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  folders: defineTable({
    name: v.string(),
    description: v.string(),
  }).index("by_name", ["name"]),
  
dives: defineTable({
    activityType: v.optional(v.union(v.literal("dive"), v.literal("snorkel"))),
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
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  }).index("by_date", ["date"])
    .index("by_location", ["latitude", "longitude"]),
  
  settings: defineTable({
    key: v.string(),
    value: v.any(),
  }).index("by_key", ["key"]),
});