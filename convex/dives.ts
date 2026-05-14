import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

async function geocodeLocation(location: string): Promise<{ latitude?: number; longitude?: number }> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
      { headers: { "User-Agent": "DeepLog/1.0" } }
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
    }
  } catch (e) {
    console.error("Geocoding failed:", e);
  }
  return {};
}

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
  },
  handler: async (ctx, args) => {
    // Auto-assign dive number if not provided
    let diveNumber = args.diveNumber
    if (diveNumber === undefined) {
      const allDives = await ctx.db.query("dives").collect()
      const maxNumber = allDives.reduce((max, d) => {
        const num = d.diveNumber
        return num && num > max ? num : max
      }, 0)
      diveNumber = maxNumber + 1
    }
    
    const id = await ctx.db.insert("dives", { ...args, diveNumber });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("dives"),
    data: v.object({
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
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, args.data);
  },
});

export const remove = mutation({
  args: { id: v.id("dives") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const duplicate = mutation({
  args: { id: v.id("dives") },
  handler: async (ctx, args) => {
    const original = await ctx.db.get(args.id);
    if (!original) throw new Error("Dive not found");
    
    // Find max dive number and assign new one
    const allDives = await ctx.db.query("dives").collect();
    const maxNumber = allDives.reduce((max, d) => {
      const num = d.diveNumber
      return num && num > max ? num : max
    }, 0)
    
    const { _id, _creationTime, diveNumber, ...data } = original;
    const newId = await ctx.db.insert("dives", { 
      ...data, 
      diveNumber: maxNumber + 1 
    });
    return newId;
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

export const geocodeAll = action({
  args: {},
  handler: async (ctx): Promise<{ geocoded: number; total: number }> => {
    const allDives = await ctx.runQuery(api.dives.list);
    let count = 0;
    for (const dive of allDives) {
      if (!dive.latitude || !dive.longitude) {
        const coords = await geocodeLocation(dive.location);
        if (coords.latitude && coords.longitude) {
          await ctx.runMutation(api.dives.patchCoords, { 
            id: dive._id, 
            latitude: coords.latitude, 
            longitude: coords.longitude 
          });
          count++;
        }
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    return { geocoded: count, total: allDives.length };
  },
});

export const patchCoords = mutation({
  args: { id: v.id("dives"), latitude: v.number(), longitude: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { latitude: args.latitude, longitude: args.longitude });
  },
});

export const getUnmapped = query({
  args: {},
  handler: async (ctx) => {
    const allDives = await ctx.db.query("dives").collect();
    const unmapped = allDives.filter(d => !d.latitude || !d.longitude);
    return {
      count: unmapped.length,
      samples: unmapped.slice(0, 5).map(d => ({ 
        id: d._id, 
        siteName: d.siteName,
        location: d.location, 
        lat: d.latitude, 
        lng: d.longitude 
      }))
    };
  },
});

const commonTypos: Record<string, string> = {
  'indoneisa': 'indonesia',
  'indonasia': 'indonesia',
  'indon': 'indonesia',
  'indoness': 'indonesia',
  'indonessia': 'indonesia',
  'indonesiaesia': 'indonesia',
  'indonesi': 'indonesia',
  'indones': 'indonesia',
  'thialand': 'thailand',
  'thial': 'thailand',
  'phillipines': 'philippines',
  'philipines': 'philippines',
  'phillipine': 'philippines',
  'vietnam': 'vietnam',
  'malaysia': 'malaysia',
  'maldvies': 'maldives',
  'maldive': 'maldives',
  'caribbean': 'caribbean',
  'bahamas': 'bahamas',
  'hawaii': 'hawaii',
  'mexico': 'mexico',
  'australia': 'australia',
  'egypt': 'egypt',
  'red sea': 'red sea',
  'galapagos': 'galapagos',
  'cocos': 'cocos island',
  'cocos island': 'cocos island',
  'lembeh': 'lembeh',
  'bitung': 'bitung',
  'sulawesi': 'sulawesi',
};

export const suggestLocationFix = action({
  args: { location: v.string() },
  handler: async (ctx, args) => {
    let fixedLocation = args.location;
    let typoFound = false;
    
    const lowerLocation = args.location.toLowerCase();
    
    // First, try to fix "Lembeh" locations - common dive destination
    if (lowerLocation.includes('lembeh')) {
      const lembehMatch = lowerLocation.match(/lembeh\s*(.*)/i);
      if (lembehMatch && lembehMatch[1]) {
        const afterLembeh = lembehMatch[1].trim();
        if (!afterLembeh.includes('indonesia') || /[a-z]{3,}/.test(afterLembeh.replace('indonesia', ''))) {
          fixedLocation = 'Lembeh, Indonesia';
          typoFound = true;
        }
      } else if (!lowerLocation.includes('indonesia')) {
        fixedLocation = 'Lembeh, Indonesia';
        typoFound = true;
      }
    }
    
    // Then check common typos
    if (!typoFound) {
      for (const [typo, correction] of Object.entries(commonTypos)) {
        if (lowerLocation.includes(typo) && typo !== correction) {
          fixedLocation = args.location.replace(new RegExp(typo, 'gi'), correction);
          typoFound = true;
          break;
        }
      }
    }
    
    // Always try to geocode - if original can be geocoded, use it
    const coords = await geocodeLocation(fixedLocation);
    
    // If typo found, use the fixed location as suggestion
    // If original location can be geocoded directly, also use it as suggestion
    const suggested = typoFound ? fixedLocation : (coords.latitude ? args.location : null);
    
    return {
      original: args.location,
      suggested: suggested,
      geocoded: !!coords.latitude,
      coords: coords,
    };
  },
});

export const updateLocationAndGeocode = action({
  args: { id: v.id("dives"), newLocation: v.string() },
  handler: async (ctx, args) => {
    const coords = await geocodeLocation(args.newLocation);
    await ctx.runMutation(api.dives.patchLocationCoords, {
      id: args.id,
      location: args.newLocation,
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
    return {
      success: !!coords.latitude,
      coords: coords,
    };
  },
});

export const patchLocationCoords = mutation({
  args: { 
    id: v.id("dives"), 
    location: v.string(),
    latitude: v.optional(v.number()), 
    longitude: v.optional(v.number()) 
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { 
      location: args.location,
      latitude: args.latitude,
      longitude: args.longitude,
    });
  },
});

export const fixAllLembeh = mutation({
  args: {},
  handler: async (ctx) => {
    const allDives = await ctx.db.query("dives").collect();
    let count = 0;
    
    for (const dive of allDives) {
      const lowerLocation = dive.location.toLowerCase();
      if (lowerLocation.includes('lembeh')) {
        await ctx.db.patch(dive._id, {
          location: 'Lembeh, Indonesia',
          latitude: 1.4684975,
          longitude: 125.2589817,
        });
        count++;
      }
    }
    
    return { fixed: count };
  },
});

export const createTestDive = mutation({
  args: {},
  handler: async (ctx) => {
    const id = await ctx.db.insert("dives", {
      siteName: "Test Site",
      date: new Date().toISOString().split('T')[0],
      location: "Nowhere Island",
      maxDepth: 20,
      duration: 45,
      waterTemp: 26,
      buddyName: "",
      marineLife: [],
      notes: "Test dive without coordinates",
      photos: [],
      tags: ["Test"],
      createdAt: new Date().toISOString(),
    });
    return id;
  },
});

export const assignIndonesiaNumbers = mutation({
  args: {},
  handler: async (ctx) => {
    const allDives = await ctx.db.query("dives").collect()
    
    // Find current max dive number
    const maxNumber = allDives.reduce((max, d) => {
      const num = d.diveNumber
      return num && num > max ? num : max
    }, 0)
    
    // Find Indonesia dives without numbers
    const indonesiaDives = allDives
      .filter(d => d.location.toLowerCase().includes('indonesia') && !d.diveNumber)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    // Assign sequential numbers
    for (let i = 0; i < indonesiaDives.length; i++) {
      await ctx.db.patch(indonesiaDives[i]._id, { 
        diveNumber: maxNumber + 1 + i 
      })
    }
    
    return { 
      assigned: indonesiaDives.length, 
      startNumber: maxNumber + 1,
      endNumber: maxNumber + indonesiaDives.length
    }
  },
});