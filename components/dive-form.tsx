'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { MarineLifeSelector } from '@/components/marine-life-selector'
import { PhotoUpload } from '@/components/photo-upload'
import type { DiveEntry, MarineLifeEntry } from '@/lib/types'
import { ArrowLeft, Waves, Tag } from 'lucide-react'

const DIVE_TAGS = [
  'Wreck',
  'Night',
  'Cave',
  'Drift',
  'Deep',
  'Shallow',
  'Shore',
  'Boat',
  'Training',
  'Technical',
  'Wall',
  'Reef',
]

interface DiveFormProps {
  onSubmit: (dive: Omit<DiveEntry, 'id' | 'createdAt'>) => void
  onCancel: () => void
  initialData?: DiveEntry
}

export function DiveForm({ onSubmit, onCancel, initialData }: DiveFormProps) {
  const isEditing = !!initialData

  const [location, setLocation] = useState(initialData?.location || initialData?.country || '')
  const [siteName, setSiteName] = useState(initialData?.siteName || '')
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0])
  const [dayNumber, setDayNumber] = useState(initialData?.dayNumber?.toString() || '')
  const [depthUnit, setDepthUnit] = useState<'meters' | 'feet'>('meters')
  const [maxDepth, setMaxDepth] = useState(initialData?.maxDepth?.toString() || '')
  const [duration, setDuration] = useState(initialData?.duration?.toString() || '')
  const [tempUnit, setTempUnit] = useState<'celsius' | 'fahrenheit'>('celsius')
  const [waterTemp, setWaterTemp] = useState(initialData?.waterTemp?.toString() || '')
  const [buddyName, setBuddyName] = useState(initialData?.buddyName || '')
  const [marineLife, setMarineLife] = useState<MarineLifeEntry[]>(initialData?.marineLife || [])
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || [])
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const depthValue = parseFloat(maxDepth) || 0
    const finalDepth = depthUnit === 'feet' ? depthValue / 3.28084 : depthValue
    
    const tempValue = parseFloat(waterTemp) || 0
    const finalTemp = tempUnit === 'fahrenheit' ? (tempValue - 32) * 5 / 9 : tempValue

    onSubmit({
      location,
      country: location,
      siteName,
      date,
      dayNumber: parseInt(dayNumber) || undefined,
      maxDepth: Math.round(finalDepth * 100) / 100,
      duration: parseInt(duration) || 0,
      waterTemp: Math.round(finalTemp * 10) / 10,
      buddyName,
      marineLife,
      notes,
      photos,
      tags,
    })
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Waves className="size-5 text-primary" />
            <CardTitle className="font-serif text-xl">{isEditing ? 'Edit Dive' : 'Log New Dive'}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location & Site Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Belize"
                className="bg-secondary/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteName">Dive Site Name</Label>
              <Input
                id="siteName"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Blue Hole"
                className="bg-secondary/50"
                required
              />
            </div>
          </div>

          {/* Date & Day Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-secondary/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dayNumber">Day Number (trip day)</Label>
              <Input
                id="dayNumber"
                type="number"
                value={dayNumber}
                onChange={(e) => setDayNumber(e.target.value)}
                placeholder="1"
                className="bg-secondary/50"
              />
            </div>
          </div>

          {/* Max Depth & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="maxDepth">Max Depth</Label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setDepthUnit('meters')}
                    className={`text-xs px-2 py-0.5 rounded ${depthUnit === 'meters' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                  >
                    m
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepthUnit('feet')}
                    className={`text-xs px-2 py-0.5 rounded ${depthUnit === 'feet' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                  >
                    ft
                  </button>
                </div>
              </div>
              <Input
                id="maxDepth"
                type="number"
                value={maxDepth}
                onChange={(e) => setMaxDepth(e.target.value)}
                placeholder={depthUnit === 'meters' ? '30' : '100'}
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="45"
                className="bg-secondary/50"
              />
            </div>
          </div>

          {/* Water Temperature */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="waterTemp">Water Temperature</Label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setTempUnit('celsius')}
                    className={`text-xs px-2 py-0.5 rounded ${tempUnit === 'celsius' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                  >
                    °C
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempUnit('fahrenheit')}
                    className={`text-xs px-2 py-0.5 rounded ${tempUnit === 'fahrenheit' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                  >
                    °F
                  </button>
                </div>
              </div>
              <Input
                id="waterTemp"
                type="number"
                value={waterTemp}
                onChange={(e) => setWaterTemp(e.target.value)}
                placeholder={tempUnit === 'celsius' ? '26' : '79'}
                className="bg-secondary/50"
              />
            </div>
          </div>

          {/* Buddy */}
          <div className="space-y-2">
            <Label htmlFor="buddyName">Dive Buddy</Label>
            <Input
              id="buddyName"
              value={buddyName}
              onChange={(e) => setBuddyName(e.target.value)}
              placeholder="Name of your dive buddy"
              className="bg-secondary/50"
            />
          </div>

          {/* Marine Life */}
          <div className="space-y-2">
            <Label>Marine Life Spotted</Label>
            <MarineLifeSelector
              value={marineLife}
              onChange={setMarineLife}
              placeholder="Search species or add custom..."
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {DIVE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setTags(prev => 
                      prev.includes(tag) 
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    )
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    tags.includes(tag)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <Tag className="size-3 inline mr-1" />
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Dive Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe your underwater adventure..."
              className="bg-secondary/50 min-h-[120px]"
            />
          </div>

          {/* Photos */}
          <div className="space-y-2">
            <Label>Memory Photos</Label>
            <PhotoUpload photos={photos} onChange={setPhotos} />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-lg font-medium"
          >
            {isEditing ? 'Save Changes' : 'Log This Dive'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}