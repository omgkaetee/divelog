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
import { ArrowLeft, Waves } from 'lucide-react'

interface DiveFormProps {
  onSubmit: (dive: Omit<DiveEntry, 'id' | 'createdAt'>) => void
  onCancel: () => void
  initialData?: DiveEntry
}

export function DiveForm({ onSubmit, onCancel, initialData }: DiveFormProps) {
  const isEditing = !!initialData

  const [country, setCountry] = useState(initialData?.country || '')
  const [siteName, setSiteName] = useState(initialData?.siteName || '')
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0])
  const [dayNumber, setDayNumber] = useState(initialData?.dayNumber?.toString() || '')
  const [maxDepth, setMaxDepth] = useState(initialData?.maxDepth?.toString() || '')
  const [duration, setDuration] = useState(initialData?.duration?.toString() || '')
  const [waterTemp, setWaterTemp] = useState(initialData?.waterTemp?.toString() || '')
  const [location, setLocation] = useState(initialData?.location || '')
  const [buddyName, setBuddyName] = useState(initialData?.buddyName || '')
  const [marineLife, setMarineLife] = useState<MarineLifeEntry[]>(initialData?.marineLife || [])
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    onSubmit({
      country,
      siteName,
      date,
      dayNumber: parseInt(dayNumber) || undefined,
      location,
      maxDepth: parseFloat(maxDepth) || 0,
      duration: parseInt(duration) || 0,
      waterTemp: parseFloat(waterTemp) || 0,
      buddyName,
      marineLife,
      notes,
      photos,
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
          {/* Country & Site Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Belize"
                className="bg-secondary/50"
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
              <Label htmlFor="maxDepth">Max Depth (m)</Label>
              <Input
                id="maxDepth"
                type="number"
                value={maxDepth}
                onChange={(e) => setMaxDepth(e.target.value)}
                placeholder="30"
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

          {/* Water Temp & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="waterTemp">Water Temperature (°C)</Label>
              <Input
                id="waterTemp"
                type="number"
                value={waterTemp}
                onChange={(e) => setWaterTemp(e.target.value)}
                placeholder="26"
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Lighthouse Reef"
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