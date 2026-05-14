'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import type { DiveEntry } from '@/lib/types'

const LeafletMap = dynamic(() => import('./leaflet-map-core'), {
  ssr: false,
  loading: () => (
    <Card className="overflow-hidden border-border/50">
      <div className="h-[500px] flex items-center justify-center text-muted-foreground">
        Loading map...
      </div>
    </Card>
  ),
})

interface DiveMapInnerProps {
  dives: DiveEntry[]
  onSelectDive: (diveId: string) => void
}

export default function DiveMapInner({ dives, onSelectDive }: DiveMapInnerProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card className="overflow-hidden border-border/50">
        <div className="h-[500px] flex items-center justify-center text-muted-foreground">
          Loading map...
        </div>
      </Card>
    )
  }

  return <LeafletMap dives={dives} onSelectDive={onSelectDive} />
}