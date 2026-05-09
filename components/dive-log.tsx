'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Logo } from '@/components/logo'
import { BubbleBackground } from '@/components/bubble-background'
import { SettingsPopover } from '@/components/settings-popover'
import { DiveForm } from '@/components/dive-form'
import { DiveCard } from '@/components/dive-card'
import { DiveDetail } from '@/components/dive-detail'
import { useDiveStorage } from '@/hooks/use-dive-storage'
import type { DiveEntry } from '@/lib/types'
import { Plus, Waves, Clock, Hash } from 'lucide-react'

type View = 'list' | 'form' | 'detail' | 'edit'

export function DiveLog() {
  const {
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
  } = useDiveStorage()

  const [view, setView] = useState<View>('list')
  const [selectedDiveId, setSelectedDiveId] = useState<string | null>(null)

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
              setSelectedDiveId(null)
              setView('list')
            }}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Logo className="size-10 text-primary" />
            <div className="text-left">
              <h1 className="font-serif text-2xl font-bold text-foreground">DeepLog</h1>
              <p className="text-xs text-muted-foreground">Premium Dive Journal</p>
            </div>
          </button>
          <SettingsPopover units={units} onUnitsChange={saveUnits} />
        </header>

        {/* Main Content */}
        {view === 'list' && (
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
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-lg font-medium gap-2"
            >
              <Plus className="size-5" />
              Log New Dive
            </Button>

            {/* Dive List */}
            {dives.length === 0 ? (
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardContent className="py-12 text-center">
                  <Waves className="size-12 text-primary/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No dives logged yet</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">
                    Start your underwater journey by logging your first dive
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {dives.map((dive) => (
                  <DiveCard
                    key={dive.id}
                    dive={dive}
                    units={units}
                    onClick={() => handleViewDive(dive.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'form' && (
          <DiveForm
            units={units}
            onSubmit={handleAddDive}
            onCancel={() => setView('list')}
          />
        )}

        {view === 'detail' && selectedDive && (
          <DiveDetail
            dive={selectedDive}
            units={units}
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
            units={units}
            onSubmit={handleEditDive}
            onCancel={() => setView('detail')}
            initialData={selectedDive}
          />
        )}
      </div>
    </div>
  )
}
