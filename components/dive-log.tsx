'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Logo } from '@/components/logo'
import { BubbleBackground } from '@/components/bubble-background'
import { DiveForm } from '@/components/dive-form'
import { DiveCard } from '@/components/dive-card'
import { DiveDetail } from '@/components/dive-detail'
import { useDiveStorage } from '@/hooks/use-dive-storage'
import type { DiveEntry } from '@/lib/types'
import { importDives } from '@/lib/import-dives'
import { Plus, Waves, Clock, Hash, Search, SlidersHorizontal, X, List, FolderOpen, ChevronDown, ChevronRight, ChevronLeft, Upload, Trash2, CheckSquare, Square, Check, Pencil, Loader2 } from 'lucide-react'

type View = 'list' | 'form' | 'detail' | 'edit' | 'country'
type SortOption = 'newest' | 'oldest' | 'deepest' | 'longest' | 'byNumber'
type ListViewMode = 'list' | 'folder'

export function DiveLog() {
  const {
    dives,
    folders,
    isLoaded,
    addDive,
    updateDive,
    deleteDive,
    getDive,
    setFolderDescription,
    getFolderDescription,
    deleteFolder,
    totalDives,
    totalBottomTime,
    statsByCountry,
    statsByYear,
  } = useDiveStorage()

  const [view, setView] = useState<View>('list')
  const [selectedDiveId, setSelectedDiveId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('byNumber')
  const [showFilters, setShowFilters] = useState(false)
  const [yearFilter, setYearFilter] = useState<string>('')
  const [countryFilter, setCountryFilter] = useState<string>('')
  const [maxDepthFilter, setMaxDepthFilter] = useState<number | null>(null)
  const [listViewMode, setListViewMode] = useState<ListViewMode>('folder')
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set())
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importPreview, setImportPreview] = useState<DiveEntry[] | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [deleteCountryConfirm, setDeleteCountryConfirm] = useState<string | null>(null)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedDives, setSelectedDives] = useState<Set<string>>(new Set())
  const [editingFolder, setEditingFolder] = useState<string | null>(null)
  const [folderNameValue, setFolderNameValue] = useState('')
  const [folderYearValue, setFolderYearValue] = useState('')
  const [folderDescValue, setFolderDescValue] = useState('')

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

  const navigateToNextDive = () => {
    const sortedDives = [...filteredDives].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const currentIndex = sortedDives.findIndex(d => d.id === selectedDiveId)
    if (currentIndex < sortedDives.length - 1) {
      setSelectedDiveId(sortedDives[currentIndex + 1].id)
    }
  }

  const navigateToPrevDive = () => {
    const sortedDives = [...filteredDives].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const currentIndex = sortedDives.findIndex(d => d.id === selectedDiveId)
    if (currentIndex > 0) {
      setSelectedDiveId(sortedDives[currentIndex - 1].id)
    }
  }

  const handleDeleteDive = () => {
    if (selectedDiveId) {
      deleteDive(selectedDiveId)
      setSelectedDiveId(null)
      setView('list')
    }
  }

  const handleDeleteCountry = async (country: string) => {
    const countryName = getCountryFromKey(country)
    const countryDives = filteredDives.filter(dive => {
      const locationParts = dive.location.split(',')
      const diveCountry = locationParts[locationParts.length - 1]?.trim() || dive.country || 'Unknown'
      return diveCountry.toLowerCase() === countryName.toLowerCase()
    })
    for (const dive of countryDives) {
      await deleteDive(dive.id)
    }
    await deleteFolder(countryName)
    setDeleteCountryConfirm(null)
    setSelectedCountry(null)
    setView('list')
  }

  const toggleSelectDive = (id: string) => {
    setSelectedDives(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBulkDelete = () => {
    selectedDives.forEach(id => deleteDive(id))
    setSelectedDives(new Set())
    setIsSelectionMode(false)
  }

  const selectAll = () => {
    if (selectedDives.size === filteredDives.length) {
      setSelectedDives(new Set())
    } else {
      setSelectedDives(new Set(filteredDives.map(d => d.id)))
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsImporting(true)
    try {
      const imported = await importDives(file)
      
      const existingKeys = new Set(dives.map(d => `${d.diveNumber}-${d.date}`))
      const duplicates = imported.filter(d => d.diveNumber && existingKeys.has(`${d.diveNumber}-${d.date}`))
      
      if (duplicates.length > 0) {
        const proceed = confirm(`Found ${duplicates.length} duplicates (matching dive number + date). Import anyway?`)
        if (!proceed) {
          setIsImporting(false)
          return
        }
      }
      
      setImportPreview(imported)
    } catch (error) {
      console.error('Import failed:', error)
      alert('Failed to import file. Please check the format.')
    } finally {
      setIsImporting(false)
    }
  }

  const handleConfirmImport = () => {
    if (importPreview) {
      importPreview.forEach(dive => {
        addDive(dive)
      })
      setImportPreview(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    
    setIsImporting(true)
    try {
      const imported = await importDives(file)
      setImportPreview(imported)
    } catch (error) {
      console.error('Import failed:', error)
      alert('Failed to import file. Please check the format.')
    } finally {
      setIsImporting(false)
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
      case 'byNumber':
        result.sort((a, b) => (b.diveNumber || 0) - (a.diveNumber || 0))
        break
    }

    return result
  }, [dives, searchQuery, sortBy, yearFilter, countryFilter, maxDepthFilter])

  const divesWithNumbers = useMemo(() => {
    const numbers: Record<string, number> = {}
    dives.forEach(d => {
      if (d.diveNumber !== undefined) {
        numbers[d.id] = d.diveNumber
      }
    })
    return numbers
  }, [dives])

  const groupedByCountry = useMemo(() => {
    const groups: Record<string, DiveEntry[]> = {}
    filteredDives.forEach(dive => {
      const locationParts = dive.location.split(',')
      const country = locationParts[locationParts.length - 1]?.trim() || 'Unknown'
      const dateYear = dive.date ? new Date(dive.date).getFullYear() : null
      const year = (dateYear && !isNaN(dateYear)) ? dateYear.toString() : ''
      const key = year ? `${country} ${year}` : country
      if (!groups[key]) groups[key] = []
      groups[key].push(dive)
    })
    return Object.fromEntries(
      Object.entries(groups).sort((a, b) => {
        const extractYear = (key: string) => {
          const match = key.match(/(\d{4})$/)
          return match ? parseInt(match[1]) : 0
        }
        const yearA = extractYear(a[0])
        const yearB = extractYear(b[0])
        return yearB - yearA
      })
    )
  }, [filteredDives])

  const getCountryFromKey = (key: string) => {
    const parts = key.split(' ')
    if (parts.length < 2) return key
    const possibleYear = parts[parts.length - 1]
    if (possibleYear && !isNaN(Number(possibleYear)) && possibleYear.length === 4) {
      return parts.slice(0, -1).join(' ')
    }
    return key
  }

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

  const startEditFolderDesc = (e: React.MouseEvent, countryKey: string) => {
    e.stopPropagation()
    const countryName = getCountryFromKey(countryKey)
    setEditingFolderDesc(countryName)
    setFolderDescValue(getFolderDescription(countryName))
  }

  const startEditFolder = (e: React.MouseEvent, countryKey: string) => {
    e.stopPropagation()
    const countryName = getCountryFromKey(countryKey)
    const yearMatch = countryKey.match(/(\d{4})$/)
    const year = yearMatch ? yearMatch[1] : ''
    setEditingFolder(countryKey)
    setFolderNameValue(countryName)
    setFolderYearValue(year)
    setFolderDescValue(getFolderDescription(countryName))
  }

  const saveFolder = async () => {
    if (!editingFolder || !folderNameValue) return
    const oldCountryName = getCountryFromKey(editingFolder)
    
    const divesInFolder = groupedByCountry[editingFolder] || []
    for (const dive of divesInFolder) {
      const newLocation = folderYearValue 
        ? `${dive.location}, ${folderNameValue}` 
        : dive.location
      await updateDive(dive.id, { 
        location: newLocation,
        country: folderNameValue
      })
    }
    
    await setFolderDescription(folderNameValue, folderDescValue)
    
    setEditingFolder(null)
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
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsSelectionMode(!isSelectionMode)
                setSelectedDives(new Set())
              }}
              className={isSelectionMode ? 'text-primary' : 'text-muted-foreground'}
              title="Select multiple"
            >
              <CheckSquare className="size-5" />
            </Button>
            {isSelectionMode && selectedDives.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteCountryConfirm('selected')}
              >
                Delete ({selectedDives.size})
              </Button>
            )}
            <label className="cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50">
              {isImporting ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Upload className="size-5" />
              )}
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleImport}
                disabled={isImporting}
                className="hidden"
              />
            </label>
          </div>
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
                {totalDives > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-muted-foreground mb-1">Top Countries</p>
                        {Object.entries(statsByCountry).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([country, count]) => (
                          <div key={country} className="flex justify-between">
                            <span className="truncate">{country}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Dives by Year</p>
                        {Object.entries(statsByYear).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 3).map(([year, count]) => (
                          <div key={year} className="flex justify-between">
                            <span>{year}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
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
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Sort by</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as SortOption)}
                          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm pr-10 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2215%22%20height%3D%2215%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23aaa%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%205%205%205-5%22%2F%3E%3C%2Fsvg%3E')] bg-[right_0.5rem_center] bg-no-repeat"
                        >
                          <option value="byNumber">By Dive Number</option>
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
                  {searchQuery ? `Found ${filteredDives.length} results for "${searchQuery}"` : 
                    filteredDives.length === dives.length ? `${dives.length} dives` : 
                    `Showing ${filteredDives.length} of ${dives.length} dives`}
                </p>
              )}
            </div>

            {/* Dive List */}
            {filteredDives.length === 0 ? (
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardContent className="py-12 text-center">
                  <Waves className="size-12 text-primary/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? `No dives found for "${searchQuery}"` : 
                     hasActiveFilters ? 'No dives match your filters' : 
                     dives.length === 0 ? 'No dives logged yet - import an Excel file to get started' : 
                     'No dives match your current filters'}
                  </p>
                  {(searchQuery || hasActiveFilters) && (
                    <Button variant="link" onClick={() => { setSearchQuery(''); clearFilters() }} className="mt-2">
                      Clear search and filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : listViewMode === 'folder' && view === 'list' ? (
              <div className="space-y-4">
                {isSelectionMode && Object.keys(groupedByCountry).length > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const allDives = Object.values(groupedByCountry).flat()
                        if (selectedDives.size === allDives.length) {
                          setSelectedDives(new Set())
                        } else {
                          setSelectedDives(new Set(allDives.map(d => d.id)))
                        }
                      }}
                      className="text-muted-foreground"
                    >
                      <span className="flex items-center gap-1">
                        {selectedDives.size === Object.values(groupedByCountry).flat().length ? <Check className="size-4" /> : <Square className="size-4" />}
                        Select All ({Object.values(groupedByCountry).flat().length})
                      </span>
                    </Button>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(groupedByCountry).map(([country, countryDives]) => (
                    <div key={country} className="relative h-full">
                      {isSelectionMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const countryIds = countryDives.map(d => d.id)
                            const allSelected = countryIds.every(id => selectedDives.has(id))
                            if (allSelected) {
                              setSelectedDives(prev => {
                                const next = new Set(prev)
                                countryIds.forEach(id => next.delete(id))
                                return next
                              })
                            } else {
                              setSelectedDives(prev => {
                                const next = new Set(prev)
                                countryIds.forEach(id => next.add(id))
                                return next
                              })
                            }
                          }}
                          className="absolute left-3 top-3 z-10"
                        >
                          {countryDives.every(d => selectedDives.has(d.id)) ? (
                            <CheckSquare className="size-5 text-primary" />
                          ) : (
                            <Square className="size-5 text-muted-foreground" />
                          )}
                        </button>
                      )}
                      <Card
                        onClick={() => handleCountryClick(country)}
                        className={`group relative bg-card/80 backdrop-blur-sm border-border/50 cursor-pointer hover:bg-card/90 hover:border-primary/50 transition-all p-4 h-full min-h-[100px] flex items-center justify-center ${isSelectionMode ? 'pl-10' : ''}`}
                      >
                        {(() => {
                          const countryName = getCountryFromKey(country)
                          const folderDesc = getFolderDescription(countryName)
                          return (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 size-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                onClick={(e) => startEditFolder(e, country)}
                              >
                                <Pencil className="size-3" />
                              </Button>
                              <div className="flex flex-col items-center gap-2 w-full">
                                <span className="font-medium text-center truncate w-full">{country}</span>
                                {folderDesc ? (
                                  <p className="text-xs text-muted-foreground text-center line-clamp-2 w-full">{folderDesc}</p>
                                ) : (
                                  <p className="text-xs text-muted-foreground/50 text-center line-clamp-2 w-full italic">Add notes...</p>
                                )}
                                <Badge className="bg-primary/20 text-primary text-xs flex-shrink-0">{countryDives.length} dives</Badge>
                              </div>
                            </>
                          )
                        })()}
                      </Card>
                    </div>
                  ))}
                </div>
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteCountryConfirm(selectedCountry)}
                    className="ml-auto text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                {isSelectionMode && (
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const countryDives = groupedByCountry[selectedCountry] || []
                        if (selectedDives.size === countryDives.length) {
                          setSelectedDives(new Set())
                        } else {
                          setSelectedDives(new Set(countryDives.map(d => d.id)))
                        }
                      }}
                      className="text-muted-foreground"
                    >
                      <span className="flex items-center gap-1">
                        {selectedDives.size === (groupedByCountry[selectedCountry] || []).length ? <Check className="size-4" /> : <Square className="size-4" />}
                        Select All ({(groupedByCountry[selectedCountry] || []).length})
                      </span>
                    </Button>
                  </div>
                )}
                <div className="space-y-3">
                  {groupedByCountry[selectedCountry]?.map((dive) => (
                    <div key={dive.id} className="relative">
                      {isSelectionMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSelectDive(dive.id)
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-1"
                        >
                          {selectedDives.has(dive.id) ? (
                            <CheckSquare className="size-5 text-primary" />
                          ) : (
                            <Square className="size-5 text-muted-foreground" />
                          )}
                        </button>
                      )}
                      <div className={isSelectionMode ? 'pl-10' : ''}>
                        <DiveCard
                          dive={dive}
                          onClick={() => handleViewDive(dive.id)}
                          diveNumber={divesWithNumbers[dive.id]}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {isSelectionMode && (
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={selectAll}
                      className="text-muted-foreground"
                    >
                      {selectedDives.size === filteredDives.length ? (
                        <span className="flex items-center gap-1"><Check className="size-4" /> Deselect All</span>
                      ) : (
                        <span className="flex items-center gap-1"><Square className="size-4" /> Select All ({filteredDives.length})</span>
                      )}
                    </Button>
                  </div>
                )}
                {filteredDives.map((dive) => (
                  <div key={dive.id} className="relative">
                    {isSelectionMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSelectDive(dive.id)
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-1"
                      >
                        {selectedDives.has(dive.id) ? (
                          <CheckSquare className="size-5 text-primary" />
                        ) : (
                          <Square className="size-5 text-muted-foreground" />
                        )}
                      </button>
                    )}
                    <div className={isSelectionMode ? 'pl-10' : ''}>
                      <DiveCard
                        dive={dive}
                        onClick={() => handleViewDive(dive.id)}
                        diveNumber={divesWithNumbers[dive.id]}
                      />
                    </div>
                  </div>
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
            onUpdateCountry={(country, countryDescription) => {
              if (selectedDiveId) {
                updateDive(selectedDiveId, { 
                  country, 
                  countryDescription,
                  location: country,
                })
              }
            }}
            onNext={navigateToNextDive}
            onPrev={navigateToPrevDive}
          />
        )}

        {view === 'edit' && selectedDive && (
          <DiveForm
            onSubmit={handleEditDive}
            onCancel={() => setView('detail')}
            initialData={selectedDive}
          />
        )}

        {/* Import Preview Dialog */}
        <Dialog open={!!importPreview} onOpenChange={() => setImportPreview(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Import Preview</DialogTitle>
              <DialogDescription>
                Found {importPreview?.length || 0} dives. Review and confirm import.
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[50vh] space-y-2">
              {importPreview?.map((dive, index) => (
                <div key={index} className="p-3 bg-secondary/30 rounded-lg text-sm">
                  <div className="font-medium">{dive.siteName}</div>
                  <div className="text-muted-foreground text-xs">
                    {dive.date} • {dive.location} • {dive.maxDepth}m • {dive.duration}min
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setImportPreview(null)}>Cancel</Button>
              <Button onClick={handleConfirmImport} autoFocus>Import {importPreview?.length || 0} Dives</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Country / Bulk Delete Confirmation */}
        <Dialog open={!!deleteCountryConfirm} onOpenChange={() => setDeleteCountryConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {deleteCountryConfirm === 'selected' 
                  ? `Delete ${selectedDives.size} Selected Dives?`
                  : `Delete All Dives in ${deleteCountryConfirm}?`
                }
              </DialogTitle>
              <DialogDescription>
                {deleteCountryConfirm === 'selected'
                  ? `This will permanently delete ${selectedDives.size} selected dives. This action cannot be undone.`
                  : `This will permanently delete all ${groupedByCountry[deleteCountryConfirm || '']?.length || 0} dives in this country. This action cannot be undone.`
                }
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteCountryConfirm(null)}>Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  if (deleteCountryConfirm === 'selected') {
                    handleBulkDelete()
                  } else {
                    handleDeleteCountry(deleteCountryConfirm)
                  }
                  setDeleteCountryConfirm(null)
                }}
                autoFocus
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingFolder} onOpenChange={(open) => !open && setEditingFolder(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Folder</DialogTitle>
              <DialogDescription>
                Update folder name, year, and trip notes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="folderName">Country / Location</Label>
                  <Input
                    id="folderName"
                    value={folderNameValue}
                    onChange={(e) => setFolderNameValue(e.target.value)}
                    placeholder="e.g., Indonesia"
                  />
                </div>
                <div>
                  <Label htmlFor="folderYear">Year (optional)</Label>
                  <Input
                    id="folderYear"
                    value={folderYearValue}
                    onChange={(e) => setFolderYearValue(e.target.value)}
                    placeholder="e.g., 2024"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="folderDesc">Trip Notes</Label>
                <textarea
                  id="folderDesc"
                  value={folderDescValue}
                  onChange={(e) => setFolderDescValue(e.target.value)}
                  placeholder="Add notes about your trip..."
                  className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm resize-y"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingFolder(null)}>Cancel</Button>
              <Button onClick={saveFolder}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
