'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { DiveEntry, UnitPreferences } from '@/lib/types'
import { formatDepth } from '@/lib/types'
import { MapPin, Clock, ArrowDown, Calendar } from 'lucide-react'

interface DiveCardProps {
  dive: DiveEntry
  units: UnitPreferences
  onClick: () => void
}

export function DiveCard({ dive, units, onClick }: DiveCardProps) {
  const formattedDate = new Date(dive.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Card
      onClick={onClick}
      className="card-glow bg-card/80 backdrop-blur-sm border-border/50 cursor-pointer hover:bg-card/90 transition-all"
    >
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Thumbnail */}
          {dive.photos.length > 0 ? (
            <div className="flex-shrink-0">
              <img
                src={dive.photos[0]}
                alt={dive.siteName}
                className="size-20 object-cover rounded-lg border border-border/50"
              />
            </div>
          ) : (
            <div className="flex-shrink-0 size-20 bg-secondary/50 rounded-lg border border-border/50 flex items-center justify-center">
              <ArrowDown className="size-8 text-primary/40" />
            </div>
          )}

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-lg font-semibold text-foreground truncate">
              {dive.siteName}
            </h3>
            
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
              <MapPin className="size-3.5" />
              <span className="truncate">{dive.location || 'Unknown location'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="size-3.5" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5 text-primary">
                <ArrowDown className="size-3.5" />
                <span className="font-medium">{formatDepth(dive.maxDepth, units.depth)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-3.5" />
                <span>{dive.duration} min</span>
              </div>
            </div>

            
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
