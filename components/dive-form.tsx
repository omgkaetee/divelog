'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { UnitToggle } from '@/components/unit-toggle'
import { TagInput } from '@/components/tag-input'
import { PhotoUpload } from '@/components/photo-upload'
import type { DiveEntry, UnitPreferences } from '@/lib/types'
import { convertDepth, convertTemp, FEET_TO_METERS, FAHRENHEIT_TO_CELSIUS } from '@/lib/types'
import { ArrowLeft, Waves } from 'lucide-react'

interface DiveFormProps {
  units: UnitPreferences
  onSubmit: (dive: Omit<DiveEntry, 'id' | 'createdAt'>) => void
  onCancel: () => void
  initialData?: DiveEntry
}

export function DiveForm({ units, onSubmit, onCancel, initialData }: DiveFormProps) {
  const isEditing = !!initialData
  
  // Convert stored values (meters/celsius) to display units
  const getInitialDepth = (value: number) => {
    if (units.depth === 'feet') {
      return Math.round(value * 3.28084).toString()
    }
    return Math.round(value).toString()
  }
  
  const getInitialTemp = (value: number) => {
    if (units.temperature === 'fahrenheit') {
      return Math.round((value * 9/5) + 32).toString()
    }
    return Math.round(value).toString()
  }

  const [siteName, setSiteName] = useState(initialData?.siteName || '')
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0])
  const [location, setLocation] = useState(initialData?.location || '')
  const [maxDepth, setMaxDepth] = useState(initialData ? getInitialDepth(initialData.maxDepth) : '')
  const [depthUnit, setDepthUnit] = useState<'meters' | 'feet'>(units.depth)
  const [duration, setDuration] = useState(initialData?.duration?.toString() || '')
  const [visibility, setVisibility] = useState(initialData ? getInitialDepth(initialData.visibility) : '')
  const [visibilityUnit, setVisibilityUnit] = useState<'meters' | 'feet'>(units.depth)
  const [waterTemp, setWaterTemp] = useState(initialData ? getInitialTemp(initialData.waterTemp) : '')
  const [tempUnit, setTempUnit] = useState<'celsius' | 'fahrenheit'>(units.temperature)
  const [buddyName, setBuddyName] = useState(initialData?.buddyName || '')
  const [marineLife, setMarineLife] = useState<string[]>(initialData?.marineLife || [])
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || [])

  // Update local units when global units change
  useEffect(() => {
    setDepthUnit(units.depth)
    setVisibilityUnit(units.depth)
    setTempUnit(units.temperature)
  }, [units])

  const handleDepthUnitChange = (newUnit: 'meters' | 'feet') => {
    if (maxDepth) {
      const converted = convertDepth(parseFloat(maxDepth), depthUnit, newUnit)
      setMaxDepth(Math.round(converted).toString())
    }
    setDepthUnit(newUnit)
  }

  const handleVisibilityUnitChange = (newUnit: 'meters' | 'feet') => {
    if (visibility) {
      const converted = convertDepth(parseFloat(visibility), visibilityUnit, newUnit)
      setVisibility(Math.round(converted).toString())
    }
    setVisibilityUnit(newUnit)
  }

  const handleTempUnitChange = (newUnit: 'celsius' | 'fahrenheit') => {
    if (waterTemp) {
      const converted = convertTemp(parseFloat(waterTemp), tempUnit, newUnit)
      setWaterTemp(Math.round(converted).toString())
    }
    setTempUnit(newUnit)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Convert to standard units (meters, celsius) for storage
    const depthInMeters = depthUnit === 'meters'
      ? parseFloat(maxDepth) || 0
      : FEET_TO_METERS(parseFloat(maxDepth) || 0)

    const visibilityInMeters = visibilityUnit === 'meters'
      ? parseFloat(visibility) || 0
      : FEET_TO_METERS(parseFloat(visibility) || 0)

    const tempInCelsius = tempUnit === 'celsius'
      ? parseFloat(waterTemp) || 0
      : FAHRENHEIT_TO_CELSIUS(parseFloat(waterTemp) || 0)

    onSubmit({
      siteName,
      date,
      location,
      maxDepth: depthInMeters,
      duration: parseInt(duration) || 0,
      visibility: visibilityInMeters,
      waterTemp: tempInCelsius,
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
          {/* Dive Site & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Dive Site Name</Label>
              <Input
                id="siteName"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Blue Hole, Belize"
                className="bg-secondary/50"
                required
              />
            </div>
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
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location / Country</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Lighthouse Reef, Belize"
              className="bg-secondary/50"
            />
          </div>

          {/* Depth & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="maxDepth">Max Depth</Label>
                <UnitToggle
                  value={depthUnit}
                  onChange={handleDepthUnitChange}
                  options={[
                    { value: 'meters', label: 'm' },
                    { value: 'feet', label: 'ft' },
                  ]}
                />
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

          {/* Visibility & Temperature */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="visibility">Visibility</Label>
                <UnitToggle
                  value={visibilityUnit}
                  onChange={handleVisibilityUnitChange}
                  options={[
                    { value: 'meters', label: 'm' },
                    { value: 'feet', label: 'ft' },
                  ]}
                />
              </div>
              <Input
                id="visibility"
                type="number"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                placeholder={visibilityUnit === 'meters' ? '20' : '65'}
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="waterTemp">Water Temperature</Label>
                <UnitToggle
                  value={tempUnit}
                  onChange={handleTempUnitChange}
                  options={[
                    { value: 'celsius', label: '°C' },
                    { value: 'fahrenheit', label: '°F' },
                  ]}
                />
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
            <TagInput
              value={marineLife}
              onChange={setMarineLife}
              placeholder="Type species and press Enter..."
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
