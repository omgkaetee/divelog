'use client'

import { useState, useEffect, useCallback } from 'react'
import type { DiveEntry, UnitPreferences } from '@/lib/types'

const DIVES_KEY = 'deeplog_dives'
const UNITS_KEY = 'deeplog_units'

export function useDiveStorage() {
  const [dives, setDives] = useState<DiveEntry[]>([])
  const [units, setUnits] = useState<UnitPreferences>({
    depth: 'meters',
    temperature: 'celsius',
  })
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const storedDives = localStorage.getItem(DIVES_KEY)
    const storedUnits = localStorage.getItem(UNITS_KEY)

    if (storedDives) {
      try {
        setDives(JSON.parse(storedDives))
      } catch (e) {
        console.error('Failed to parse dives from localStorage', e)
      }
    }

    if (storedUnits) {
      try {
        setUnits(JSON.parse(storedUnits))
      } catch (e) {
        console.error('Failed to parse units from localStorage', e)
      }
    }

    setIsLoaded(true)
  }, [])

  // Save dives to localStorage
  const saveDives = useCallback((newDives: DiveEntry[]) => {
    setDives(newDives)
    localStorage.setItem(DIVES_KEY, JSON.stringify(newDives))
  }, [])

  // Save units to localStorage
  const saveUnits = useCallback((newUnits: UnitPreferences) => {
    setUnits(newUnits)
    localStorage.setItem(UNITS_KEY, JSON.stringify(newUnits))
  }, [])

  const addDive = useCallback((dive: Omit<DiveEntry, 'id' | 'createdAt'>) => {
    const newDive: DiveEntry = {
      ...dive,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    saveDives([newDive, ...dives])
    return newDive
  }, [dives, saveDives])

  const updateDive = useCallback((id: string, updates: Partial<DiveEntry>) => {
    const newDives = dives.map((dive) =>
      dive.id === id ? { ...dive, ...updates } : dive
    )
    saveDives(newDives)
  }, [dives, saveDives])

  const deleteDive = useCallback((id: string) => {
    saveDives(dives.filter((dive) => dive.id !== id))
  }, [dives, saveDives])

  const getDive = useCallback((id: string) => {
    return dives.find((dive) => dive.id === id)
  }, [dives])

  const totalDives = dives.length
  const totalBottomTime = dives.reduce((acc, dive) => acc + dive.duration, 0)

  return {
    dives,
    units,
    isLoaded,
    addDive,
    updateDive,
    deleteDive,
    getDive,
    saveUnits,
    totalDives,
    totalBottomTime,
  }
}
