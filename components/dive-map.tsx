'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useAction } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

const DiveMapInner = dynamic(() => import('./dive-map-inner'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-card/80 rounded-lg border border-border/50 flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading map...</div>
    </div>
  ),
})

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, AlertCircle, ChevronDown, ChevronUp, Check, Loader2, Lightbulb } from 'lucide-react'
import type { DiveEntry } from '@/lib/types'

interface LocationSuggestion {
  original: string
  suggested: string | null
  geocoded: boolean
  coords: { latitude?: number; longitude?: number }
}

interface DiveMapProps {
  dives: DiveEntry[]
  onBack: () => void
  onSelectDive: (diveId: string) => void
}

export function DiveMap({ dives, onBack, onSelectDive }: DiveMapProps) {
  const [showUnlocated, setShowUnlocated] = useState(false)
  const [suggestions, setSuggestions] = useState<Record<string, LocationSuggestion>>({})
  const [loadingSuggestions, setLoadingSuggestions] = useState<Set<string>>(new Set())
  const [selectedForApply, setSelectedForApply] = useState<Set<string>>(new Set())
  const [applyingFix, setApplyingFix] = useState<Set<string>>(new Set())
  const [applyingAll, setApplyingAll] = useState(false)
  const divesWithCoords = dives.filter(d => d.latitude && d.longitude)
  const unlocatedDives = dives.filter(d => !d.latitude || !d.longitude)
  
  const suggestLocationFix = useAction(api.dives.suggestLocationFix)
  const updateLocationAndGeocode = useAction(api.dives.updateLocationAndGeocode)
  
  const loadSuggestion = useCallback(async (diveId: string, location: string) => {
    setLoadingSuggestions(prev => new Set(prev).add(diveId))
    try {
      const result = await suggestLocationFix({ location })
      setSuggestions(prev => ({ ...prev, [diveId]: result }))
    } catch (e) {
      console.error("Failed to get suggestion:", e)
    }
    setLoadingSuggestions(prev => {
      const next = new Set(prev)
      next.delete(diveId)
      return next
    })
  }, [suggestLocationFix])
  
  const handleApplyFix = async (diveId: string, suggestedLocation: string) => {
    setApplyingFix(prev => new Set(prev).add(diveId))
    try {
      await updateLocationAndGeocode({ id: diveId as Id<"dives">, newLocation: suggestedLocation })
      setSuggestions(prev => {
        const next = { ...prev }
        delete next[diveId]
        return next
      })
      setSelectedForApply(prev => {
        const next = new Set(prev)
        next.delete(diveId)
        return next
      })
    } catch (e) {
      console.error("Failed to apply fix:", e)
    }
    setApplyingFix(prev => {
      const next = new Set(prev)
      next.delete(diveId)
      return next
    })
  }
  
  const handleApplyAll = async () => {
    setApplyingAll(true)
    
    // Load any missing suggestions first
    const currentUnlocated = dives.filter(d => !d.latitude || !d.longitude)
    for (const dive of currentUnlocated) {
      if (!suggestions[dive.id] && !loadingSuggestions.has(dive.id)) {
        await loadSuggestion(dive.id, dive.location)
      }
    }
    
    // Wait for all suggestions to load (give it 3 seconds max)
    const waitForSuggestions = async () => {
      const timeout = Date.now() + 3000
      while (Date.now() < timeout) {
        const allLoaded = currentUnlocated.every(d => suggestions[d.id] || loadingSuggestions.has(d.id))
        if (allLoaded && loadingSuggestions.size === 0) break
        await new Promise(r => setTimeout(r, 200))
      }
    }
    await waitForSuggestions()
    
    const suggestionsToApply = currentUnlocated
      .map(d => ({ id: d.id, suggested: suggestions[d.id]?.suggested }))
      .filter(item => item.suggested)
    
    if (suggestionsToApply.length === 0) {
      setApplyingAll(false)
      alert('No suggestions available for these locations. Try editing them manually.')
      return
    }
    
    for (const item of suggestionsToApply) {
      setApplyingFix(prev => new Set(prev).add(item.id))
      try {
        await updateLocationAndGeocode({ id: item.id as Id<"dives">, newLocation: item.suggested! })
      } catch (e) {
        console.error(`Failed to apply fix for ${item.id}:`, e)
      }
      setApplyingFix(prev => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })
    }
    setApplyingAll(false)
    window.location.reload()
  }
  
  const toggleSelect = (diveId: string) => {
    setSelectedForApply(prev => {
      const next = new Set(prev)
      if (next.has(diveId)) {
        next.delete(diveId)
      } else {
        next.add(diveId)
      }
      return next
    })
  }
  
  const toggleSelectAll = () => {
    const suggestedDiveIds = unlocatedDives
      .filter(d => suggestions[d.id]?.suggested)
      .map(d => d.id)
    
    if (selectedForApply.size === suggestedDiveIds.length) {
      setSelectedForApply(new Set())
    } else {
      setSelectedForApply(new Set(suggestedDiveIds))
    }
  }
  
  useEffect(() => {
    if (showUnlocated) {
      unlocatedDives.forEach(dive => {
        if (!suggestions[dive.id] && !loadingSuggestions.has(dive.id)) {
          loadSuggestion(dive.id, dive.location)
        }
      })
    }
  }, [showUnlocated, unlocatedDives, suggestions, loadingSuggestions, loadSuggestion])
  
  const suggestedDiveIds = unlocatedDives
    .filter(d => suggestions[d.id]?.suggested)
    .map(d => d.id)
  
  const allSuggestedSelected = suggestedDiveIds.length > 0 && 
    suggestedDiveIds.every(id => selectedForApply.has(id))
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <MapPin className="size-5 text-primary" />
        <span className="font-medium">Dive Map</span>
        <Badge className="bg-primary/20 text-primary text-xs">
          {divesWithCoords.length} of {dives.length} dives located
        </Badge>
        {unlocatedDives.length > 0 && (
          <Badge 
            variant="outline" 
            className="border-amber-500 text-amber-600 text-xs cursor-pointer hover:bg-amber-50"
            onClick={() => setShowUnlocated(!showUnlocated)}
          >
            <AlertCircle className="size-3 mr-1" />
            {unlocatedDives.length} unmapped
            {showUnlocated ? <ChevronUp className="size-3 ml-1" /> : <ChevronDown className="size-3 ml-1" />}
          </Badge>
        )}
      </div>
      
{showUnlocated && unlocatedDives.length > 0 && (
        <Card className="border-[#1e5d69]">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-amber-600 flex items-center gap-2">
                <Lightbulb className="size-4" />
                {suggestedDiveIds.length} of {unlocatedDives.length} with suggestions
              </p>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-green-600 text-green-600 hover:bg-green-50"
                disabled={applyingAll}
                onClick={handleApplyAll}
              >
                {applyingAll ? (
                  <><Loader2 className="size-3 mr-1 animate-spin" /> Applying...</>
                ) : (
                  <><Check className="size-3 mr-1" /> Apply All</>
                )}
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {unlocatedDives.map((dive) => {
                const suggestion = suggestions[dive.id]
                const isLoading = loadingSuggestions.has(dive.id)
                const isApplying = applyingFix.has(dive.id)
                const hasSuggestion = suggestion?.suggested
                
                return (
                  <div key={dive.id} style={{ borderWidth: '0px', padding: '0px' }}>
                    <div className="flex justify-between items-start gap-2">
                      <div
                        onClick={() => onSelectDive(dive.id)}
                        className="text-left flex-1 flex items-center gap-2 cursor-pointer"
                      >
                        <div>
                          <span className="font-medium text-sm">{dive.siteName}</span>
                          <span className="text-xs text-muted-foreground ml-2">{dive.location}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-7"
                        onClick={() => onSelectDive(dive.id)}
                      >
                        Edit
                      </Button>
                    </div>
                    
                    {isLoading && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Loader2 className="size-3 animate-spin" />
                        Checking for suggestions...
                      </div>
                    )}
                    
                    {suggestion && !isLoading && (
                      <div className="mt-2 text-xs">
                        {suggestion.suggested && (
                          <div className="flex items-center gap-2 p-2 rounded" style={{ borderWidth: '0px', backgroundColor: '#1237438a' }}>
                            <Lightbulb className="size-3 shrink-0" style={{ color: '#dfdfdf' }} />
                            <span style={{ color: '#dfdfdf' }}>
                              Did you mean: <strong>"{suggestion.suggested}"</strong>?
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs ml-auto text-white hover:bg-primary/80"
                              disabled={isApplying}
                              onClick={() => handleApplyFix(dive.id, suggestion.suggested!)}
                            >
                              {isApplying ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <>
                                  <Check className="size-3 mr-1" />
                                  Apply
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                        {!suggestion.suggested && !suggestion.geocoded && (
                          <div className="text-amber-700 mt-1">
                            No suggestion available. Try editing the location manually.
                          </div>
                        )}
                        {suggestion.geocoded && !suggestion.suggested && (
                          <div className="text-green-700 mt-1 flex items-center gap-2">
                            <Check className="size-3" />
                            This location can be geocoded!
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs ml-auto bg-green-500 text-white hover:bg-green-600"
                              disabled={isApplying}
                              onClick={() => handleApplyFix(dive.id, suggestion.original)}
                            >
                              {isApplying ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <>
                                  <Check className="size-3 mr-1" />
                                  Apply
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {divesWithCoords.length === 0 ? (
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-8 text-center">
            <MapPin className="size-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No dives have been geocoded yet.</p>
            <p className="text-xs text-muted-foreground mt-2">
              Run `npx convex run dives:geocodeAll` to geocode existing dives.
            </p>
          </CardContent>
        </Card>
      ) : (
        <DiveMapInner dives={divesWithCoords} onSelectDive={onSelectDive} />
      )}
    </div>
  )
}