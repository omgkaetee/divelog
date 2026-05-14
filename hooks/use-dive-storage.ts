'use client'

import { useCallback } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import type { DiveEntry } from '@/lib/types'

export function useDiveStorage() {
  const rawDives = useQuery(api.dives.list)
  const folders = useQuery(api.dives.listFolders) || []
  
  const setFolderDescriptionMutation = useMutation(api.dives.setFolderDescription)
  const deleteFolderMutation = useMutation(api.dives.deleteFolder)
  const dives: DiveEntry[] = rawDives?.map((d) => ({
    id: d._id,
    activityType: d.activityType,
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
    tags: d.tags || [],
    createdAt: d.createdAt,
    diveNumber: d.diveNumber,
    latitude: d.latitude,
    longitude: d.longitude,
  })) || []
  
  const createDiveMutation = useMutation(api.dives.create)
  const updateDiveMutation = useMutation(api.dives.update)
  const deleteDiveMutation = useMutation(api.dives.remove)
  const duplicateDiveMutation = useMutation(api.dives.duplicate)

  const addDive = useCallback(async (dive: Omit<DiveEntry, 'id' | 'createdAt'>) => {
    const createdAt = new Date().toISOString()
    const id = await createDiveMutation({
      activityType: dive.activityType,
      siteName: dive.siteName,
      date: dive.date,
      location: dive.location,
      country: dive.country,
      countryDescription: dive.countryDescription,
      maxDepth: dive.maxDepth,
      duration: dive.duration,
      visibility: dive.visibility,
      waterTemp: dive.waterTemp,
      buddyName: dive.buddyName,
      marineLife: dive.marineLife,
      notes: dive.notes,
      photos: dive.photos,
      tags: dive.tags || [],
      createdAt,
      diveNumber: dive.diveNumber,
    })
    return { ...dive, id, createdAt } as DiveEntry
  }, [createDiveMutation])

  const updateDiveEntry = useCallback(async (id: string, updates: Partial<DiveEntry>) => {
    const existing = dives.find(d => d.id === id)
    if (!existing) return
    const data = {
      activityType: updates.activityType ?? existing.activityType,
      siteName: updates.siteName ?? existing.siteName,
      date: updates.date ?? existing.date,
      location: updates.location ?? existing.location,
      country: updates.country ?? existing.country,
      countryDescription: updates.countryDescription ?? existing.countryDescription,
      maxDepth: updates.maxDepth ?? existing.maxDepth,
      duration: updates.duration ?? existing.duration,
      waterTemp: updates.waterTemp ?? existing.waterTemp,
      buddyName: updates.buddyName ?? existing.buddyName,
      marineLife: updates.marineLife ?? existing.marineLife,
      notes: updates.notes ?? existing.notes,
      photos: updates.photos ?? existing.photos,
      tags: updates.tags ?? existing.tags ?? [],
      createdAt: updates.createdAt ?? existing.createdAt,
      diveNumber: updates.diveNumber ?? existing.diveNumber,
      dayNumber: updates.dayNumber ?? existing.dayNumber,
      latitude: updates.latitude ?? existing.latitude,
      longitude: updates.longitude ?? existing.longitude,
    }
    await updateDiveMutation({ id: id as Id<"dives">, data })
  }, [dives, updateDiveMutation])

  const deleteDiveEntry = useCallback(async (id: string) => {
    await deleteDiveMutation({ id: id as Id<"dives"> })
  }, [deleteDiveMutation])

  const duplicateDiveEntry = useCallback(async (id: string) => {
    await duplicateDiveMutation({ id: id as Id<"dives"> })
  }, [duplicateDiveMutation])

  const getDive = useCallback((id: string) => {
    return dives.find(d => d.id === id)
  }, [dives])

  const setFolderDescription = useCallback(async (name: string, description: string) => {
    await setFolderDescriptionMutation({ name, description })
  }, [setFolderDescriptionMutation])

  const deleteFolder = useCallback(async (name: string) => {
    await deleteFolderMutation({ name })
  }, [deleteFolderMutation])

  const getFolderDescription = useCallback((name: string) => {
    const folder = folders.find(f => f.name === name)
    return folder?.description || ''
  }, [folders])

  const totalDives = dives.filter(d => d.activityType !== 'snorkel').length
  const totalSnorkels = dives.filter(d => d.activityType === 'snorkel').length
  const totalBottomTime = dives.reduce((acc, dive) => acc + dive.duration, 0)
  
  const statsByCountry = dives.reduce((acc, dive) => {
    const country = dive.location.split(',').pop()?.trim() || 'Unknown'
    acc[country] = (acc[country] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const statsByYear = dives.reduce((acc, dive) => {
    const year = dive.date ? new Date(dive.date).getFullYear().toString() : 'Unknown'
    acc[year] = (acc[year] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    dives,
    folders,
    isLoaded: true,
    addDive,
    updateDive: updateDiveEntry,
    deleteDive: deleteDiveEntry,
    duplicateDive: duplicateDiveEntry,
    getDive,
    setFolderDescription,
    getFolderDescription,
    deleteFolder,
    totalDives,
    totalSnorkels,
    totalBottomTime,
    statsByCountry,
    statsByYear,
  }
}