'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/logo'
import { BubbleBackground } from '@/components/bubble-background'
import { DiveForm } from '@/components/dive-form'
import { DiveCard } from '@/components/dive-card'
import { DiveDetail } from '@/components/dive-detail'
import { useDiveStorage } from '@/hooks/use-dive-storage'
import type { DiveEntry } from '@/lib/types'
import { Plus, Waves, Clock, Hash, Search, SlidersHorizontal, X, List, FolderOpen, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react'

type View = 'list' | 'form' | 'detail' | 'edit' | 'country'
type SortOption = 'newest' | 'oldest' | 'deepest' | 'longest'
type ListViewMode = 'list' | 'folder'

export function DiveLog() {
  const {
    dives,
    isLoaded,
    addDive,
    updateDive,
    deleteDive,
    getDive,
    totalDives,
    totalBottomTime,
  } = useDiveStorage()

  const [view, setView] = useState<View>('list')
  const [selectedDiveId, setSelectedDiveId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [yearFilter, setYearFilter] = useState<string>('')
  const [countryFilter, setCountryFilter] = useState<string>('')
  const [maxDepthFilter, setMaxDepthFilter] = useState<number | null>(null)
  const [listViewMode, setListViewMode] = useState<ListViewMode>('folder')
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set())
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)

  const handleAddDive = (dive: Omit<DiveEntry, 'id' | 'createdAt'>) => {
    addDive(dive)
    setView('list')
  }

  const handleEditDive = (dive: Omit<DiveEntry, 'id' | 'createdAt'>) => {
    if (selectedDiveId) {
      updateDive(selectedDiveId, dive)
      setView('detail')
    }
  }

  const handleViewDive = (id: string) => {
    setSelectedDiveId(id)
    setView('detail')
  }

  const handleDeleteDive = () => {
    if (selectedDiveId) {
      deleteDive(selectedDiveId)
      setSelectedDiveId(null)
      setView('list')
    }
  }

  const selectedDive = selectedDiveId ? getDive(selectedDiveId) : null

  const filteredDives = useMemo(() => {
    let result = [...dives]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(dive =>
        dive.siteName.toLowerCase().includes(query) ||
        dive.location.toLowerCase().includes(query) ||
        dive.marineLife.some(m => m.toLowerCase().includes(query)) ||
        dive.notes.toLowerCase().includes(query)
      )
    }

    if (yearFilter) {
      result = result.filter(dive => dive.date.startsWith(yearFilter))
    }

    if (countryFilter) {
      const countryQuery = countryFilter.toLowerCase()
      result = result.filter(dive => {
        const locationParts = dive.location.split(',')
        const country = locationParts[locationParts.length - 1]?.trim().toLowerCase() || ''
        return country.includes(countryQuery)
      })
    }

    if (maxDepthFilter !== null) {
      result = result.filter(dive => dive.maxDepth <= maxDepthFilter)
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        break
      case 'deepest':
        result.sort((a, b) => b.maxDepth - a.maxDepth)
        break
      case 'longest':
        result.sort((a, b) => b.duration - a.duration)
        break
    }

    return result
  }, [dives, searchQuery, sortBy, yearFilter, countryFilter, maxDepthFilter])

  const groupedByCountry = useMemo(() => {
    const groups: Record<string, DiveEntry[]> = {}
    filteredDives.forEach(dive => {
      const locationParts = dive.location.split(',')
      const country = locationParts[locationParts.length - 1]?.trim() || 'Unknown'
      if (!groups[country]) groups[country] = []
      groups[country].push(dive)
    })
    return Object.fromEntries(
      Object.entries(groups).sort((a, b) => b[1].length - a[1].length)
    )
  }, [filteredDives])

  const toggleCountry = (country: string) => {
    setExpandedCountries(prev => {
      const next = new Set(prev)
      if (next.has(country)) next.delete(country)
      else next.add(country)
      return next
    })
  }

  const handleCountryClick = (country: string) => {
    setSelectedCountry(country)
    setView('country')
  }

  const handleBackToList = () => {
    setSelectedCountry(null)
    setView('list')
  }

  const hasHydrated = useRef(false)
  useEffect(() => {
    if (!hasHydrated.current && Object.keys(groupedByCountry).length > 0) {
      hasHydrated.current = true
      const countries = Object.keys(groupedByCountry)
      setExpandedCountries(new Set(countries))
    }
  }, [groupedByCountry])

  const clearFilters = () => {
    setSearchQuery('')
    setSortBy('newest')
    setYearFilter('')
    setCountryFilter('')
    setMaxDepthFilter(null)
  }

  const hasActiveFilters = searchQuery || yearFilter || countryFilter || maxDepthFilter !== null

  const formatBottomTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    return `${hours}h ${mins}m`
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary animate-pulse">
          <Waves className="size-12" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <BubbleBackground />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
<button
            onClick={() => {
              setView('list')
              setSelectedDiveId(null)
              setSelectedCountry(null)
              setSearchQuery('')
              setYearFilter('')
              setCountryFilter('')
              setMaxDepthFilter(null)
            }}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Logo className="size-10 text-primary" />
            <div className="text-left">
              <h1 className="font-serif text-2xl font-bold text-foreground">DeepLog</h1>
              <p className="text-xs text-muted-foreground">Premium Dive Journal</p>
            </div>
          </button>
        </header>

        {/* Main Content */}
        {(view === 'list' || view === 'country') && (
          <div className="space-y-6">
            {/* Stats */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-around">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-primary mb-1">
                      <Hash className="size-4" />
                      <span className="text-2xl font-bold">{totalDives}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Total Dives</p>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-primary mb-1">
                      <Clock className="size-4" />
                      <span className="text-2xl font-bold">{formatBottomTime(totalBottomTime)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Bottom Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Dive Button */}
            <Button
              onClick={() => setView('form')}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-medium gap-2"
            >
              <Plus className="size-5" />
              Log New Dive
            </Button>

            {/* Filter Bar */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search dives..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-card/80 border-border/50"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`bg-card/80 border-border/50 ${showFilters ? 'bg-primary/20 border-primary/50' : ''}`}
                >
                  <SlidersHorizontal className="size-4" />
                </Button>
                <div className="flex rounded-md border border-border/50 overflow-hidden">
                  <Button
                    variant={listViewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setListViewMode('list')}
                    className="rounded-none h-9 px-3"
                  >
                    <List className="size-4" />
                  </Button>
                  <Button
                    variant={listViewMode === 'folder' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setListViewMode('folder')}
                    className="rounded-none h-9 px-3"
                  >
                    <FolderOpen className="size-4" />
                  </Button>
                </div>
              </div>

              {showFilters && (
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Sort & Filter</p>
                      {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-6">
                          <X className="size-3 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Sort by</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as SortOption)}
                          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm pr-10 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2215%22%20height%3D%2215%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23aaa%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%205%205%205-5%22%2F%3E%3C%2Fsvg%3E')] bg-[right_0.5rem_center] bg-no-repeat"
                        >
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                          <option value="deepest">Deepest</option>
                          <option value="longest">Longest</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Year</label>
                        <Input
                          placeholder="e.g. 2024"
                          value={yearFilter}
                          onChange={(e) => setYearFilter(e.target.value)}
                          className="h-9 bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Country</label>
                        <Input
                          placeholder="e.g. Australia"
                          value={countryFilter}
                          onChange={(e) => setCountryFilter(e.target.value)}
                          className="h-9 bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Max Depth (m)</label>
                        <Input
                          type="number"
                          placeholder="Any"
                          value={maxDepthFilter ?? ''}
                          onChange={(e) => setMaxDepthFilter(e.target.value ? parseInt(e.target.value) : null)}
                          className="h-9 bg-background"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {hasActiveFilters && (
                <p className="text-sm text-muted-foreground">
                  Showing {filteredDives.length} of {dives.length} dives
                </p>
              )}
            </div>

            {/* Dive List */}
            {filteredDives.length === 0 ? (
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardContent className="py-12 text-center">
                  <Waves className="size-12 text-primary/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {hasActiveFilters ? 'No dives match your filters' : 'No dives logged yet'}
                  </p>
                  {hasActiveFilters && (
                    <Button variant="link" onClick={clearFilters} className="mt-2">
                      Clear filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : listViewMode === 'folder' && view === 'list' ? (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(groupedByCountry).map(([country, countryDives]) => (
                  <Card
                    key={country}
                    onClick={() => handleCountryClick(country)}
                    className="bg-card/80 backdrop-blur-sm border-border/50 cursor-pointer hover:bg-card/90 hover:border-primary/50 transition-all p-4"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <FolderOpen className="size-10 text-primary" />
                      <span className="font-medium text-center">{country}</span>
                      <Badge className="bg-primary/20 text-primary text-xs">{countryDives.length} dives</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            ) : listViewMode === 'folder' && view === 'country' && selectedCountry ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackToList}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ChevronLeft className="size-5" />
                  </Button>
                  <FolderOpen className="size-5 text-primary" />
                  <span className="font-medium">{selectedCountry}</span>
                  <Badge className="bg-primary/20 text-primary text-xs">{groupedByCountry[selectedCountry]?.length || 0}</Badge>
                </div>
                <div className="space-y-3">
                  {groupedByCountry[selectedCountry]?.map((dive) => (
                    <DiveCard
                      key={dive.id}
                      dive={dive}
                      onClick={() => handleViewDive(dive.id)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDives.map((dive) => (
                  <DiveCard
                    key={dive.id}
                    dive={dive}
                    onClick={() => handleViewDive(dive.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'form' && (
          <DiveForm
            onSubmit={handleAddDive}
            onCancel={() => setView('list')}
          />
        )}

        {view === 'detail' && selectedDive && (
          <DiveDetail
            dive={selectedDive}
            onBack={() => {
              setSelectedDiveId(null)
              setView('list')
            }}
            onDelete={handleDeleteDive}
            onEdit={() => setView('edit')}
          />
        )}

        {view === 'edit' && selectedDive && (
          <DiveForm
            onSubmit={handleEditDive}
            onCancel={() => setView('detail')}
            initialData={selectedDive}
          />
        )}
      </div>
    </div>
  )
}
