'use client'

import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { UnitToggle } from '@/components/unit-toggle'
import type { UnitPreferences } from '@/lib/types'

interface SettingsPopoverProps {
  units: UnitPreferences
  onUnitsChange: (units: UnitPreferences) => void
}

export function SettingsPopover({ units, onUnitsChange }: SettingsPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
        >
          <Settings className="size-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 bg-card border-border">
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Unit Preferences</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground">Depth / Distance</Label>
              <UnitToggle
                value={units.depth}
                onChange={(depth) => onUnitsChange({ ...units, depth })}
                options={[
                  { value: 'meters', label: 'm' },
                  { value: 'feet', label: 'ft' },
                ]}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground">Temperature</Label>
              <UnitToggle
                value={units.temperature}
                onChange={(temperature) => onUnitsChange({ ...units, temperature })}
                options={[
                  { value: 'celsius', label: '°C' },
                  { value: 'fahrenheit', label: '°F' },
                ]}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
