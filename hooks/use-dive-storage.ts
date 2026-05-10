'use client'

import { useCallback } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import type { DiveEntry } from '@/lib/types'

export function useDiveStorage() {
  const rawDives = useQuery(api.dives.list)
  const dives: DiveEntry[] = rawDives?.map((d) => ({
    id: d._id,
    siteName: d.siteName,
    date: d.date,
    location: d.location,
    maxDepth: d.maxDepth,
    duration: d.duration,
    visibility: d.visibility,
    waterTemp: d.waterTemp,
    buddyName: d.buddyName,
    marineLife: d.marineLife,
    notes: d.notes,
    photos: d.photos,
    createdAt: d.createdAt,
  })) || []
  
  const createDiveMutation = useMutation(api.dives.create)
  const updateDiveMutation = useMutation(api.dives.update)
  const deleteDiveMutation = useMutation(api.dives.remove)

  const addDive = useCallback(async (dive: Omit<DiveEntry, 'id' | 'createdAt'>) => {
    const createdAt = new Date().toISOString()
    const id = await createDiveMutation({
      siteName: dive.siteName,
      date: dive.date,
      location: dive.location,
      maxDepth: dive.maxDepth,
      duration: dive.duration,
      visibility: dive.visibility,
      waterTemp: dive.waterTemp,
      buddyName: dive.buddyName,
      marineLife: dive.marineLife,
      notes: dive.notes,
      photos: dive.photos,
      createdAt,
    })
    return { ...dive, id, createdAt } as DiveEntry
  }, [createDiveMutation])

  const updateDiveEntry = useCallback(async (id: string, updates: Partial<DiveEntry>) => {
    const existing = dives.find(d => d.id === id)
    if (!existing) return
    await updateDiveMutation({
      id: id as Id<"dives">,
      siteName: updates.siteName ?? existing.siteName,
      date: updates.date ?? existing.date,
      location: updates.location ?? existing.location,
      maxDepth: updates.maxDepth ?? existing.maxDepth,
      duration: updates.duration ?? existing.duration,
      visibility: updates.visibility ?? existing.visibility,
      waterTemp: updates.waterTemp ?? existing.waterTemp,
      buddyName: updates.buddyName ?? existing.buddyName,
      marineLife: updates.marineLife ?? existing.marineLife,
      notes: updates.notes ?? existing.notes,
      photos: updates.photos ?? existing.photos,
      createdAt: updates.createdAt ?? existing.createdAt,
    })
  }, [dives, updateDiveMutation])

  const deleteDiveEntry = useCallback(async (id: string) => {
    await deleteDiveMutation({ id: id as Id<"dives"> })
  }, [deleteDiveMutation])

  const getDive = useCallback((id: string) => {
    return dives.find(d => d.id === id)
  }, [dives])

  const totalDives = dives.length
  const totalBottomTime = dives.reduce((acc, dive) => acc + dive.duration, 0)

  return {
    dives,
    isLoaded: true,
    addDive,
    updateDive: updateDiveEntry,
    deleteDive: deleteDiveEntry,
    getDive,
    totalDives,
    totalBottomTime,
  }
}