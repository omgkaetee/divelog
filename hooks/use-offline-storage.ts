'use client'

import { useState, useEffect, useCallback } from 'react'
import type { DiveEntry } from '@/lib/types'

const OFFLINE_DIVES_KEY = 'deeplog_offline_dives'

interface OfflineDive extends Omit<DiveEntry, 'id'> {
  tempId: string
  createdAt: string
  pendingSync: boolean
}

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(true)
  const [offlineDives, setOfflineDives] = useState<OfflineDive[]>([])
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true)
    
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    const stored = localStorage.getItem(OFFLINE_DIVES_KEY)
    if (stored) {
      try {
        setOfflineDives(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse offline dives:', e)
      }
    }
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const saveOfflineDive = useCallback((dive: Omit<DiveEntry, 'id' | 'createdAt'>) => {
    const tempId = `temp_${Date.now()}`
    const offlineDive: OfflineDive = {
      ...dive,
      tempId,
      createdAt: new Date().toISOString(),
      pendingSync: true,
    }
    
    const newOfflineDives = [...offlineDives, offlineDive]
    setOfflineDives(newOfflineDives)
    localStorage.setItem(OFFLINE_DIVES_KEY, JSON.stringify(newOfflineDives))
    
    return tempId
  }, [offlineDives])

  const removeOfflineDive = useCallback((tempId: string) => {
    const newOfflineDives = offlineDives.filter(d => d.tempId !== tempId)
    setOfflineDives(newOfflineDives)
    localStorage.setItem(OFFLINE_DIVES_KEY, JSON.stringify(newOfflineDives))
  }, [offlineDives])

  const syncOfflineDives = useCallback(async (createDiveMutation: (dive: Omit<DiveEntry, 'id'>) => Promise<void>) => {
    if (!isOnline || offlineDives.length === 0) return
    
    setIsSyncing(true)
    
    for (const dive of offlineDives) {
      try {
        const { tempId, pendingSync, ...diveData } = dive
        await createDiveMutation(diveData as Omit<DiveEntry, 'id' | 'createdAt'>)
        removeOfflineDive(tempId)
      } catch (e) {
        console.error('Failed to sync dive:', e)
      }
    }
    
    setIsSyncing(false)
  }, [isOnline, offlineDives, removeOfflineDive])

  const clearOfflineDives = useCallback(() => {
    setOfflineDives([])
    localStorage.removeItem(OFFLINE_DIVES_KEY)
  }, [])

  return {
    isOnline,
    offlineDives,
    isSyncing,
    saveOfflineDive,
    removeOfflineDive,
    syncOfflineDives,
    clearOfflineDives,
    hasPendingDives: offlineDives.length > 0,
  }
}