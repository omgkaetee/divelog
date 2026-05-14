'use client'

import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowDown, Clock, ExternalLink, Maximize2 } from 'lucide-react'
import type { DiveEntry } from '@/lib/types'

function createClusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount()
  let size = 'small'
  if (count > 10) size = 'medium'
  if (count > 50) size = 'large'
  
  return L.divIcon({
    html: `<div class="cluster-marker ${size}">
      <span>${count}</span>
    </div>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(size === 'large' ? 56 : size === 'medium' ? 40 : 32, size === 'large' ? 56 : size === 'medium' ? 40 : 32, true),
  })
}

const createDiveIcon = (count: number) => L.divIcon({
  html: `<div style="
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    width: ${count > 1 ? 36 : 32}px;
    height: ${count > 1 ? 36 : 32}px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(14, 165, 233, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: ${count > 1 ? 14 : 12}px;
  "><span>${count > 1 ? count : ''}</span></div>`,
  className: 'dive-marker-icon',
  iconSize: [count > 1 ? 36 : 32, count > 1 ? 36 : 32],
  iconAnchor: [count > 1 ? 18 : 16, count > 1 ? 18 : 16],
})

function FitBounds({ dives }: { dives: DiveEntry[] }) {
  const map = useMap()
  
  useEffect(() => {
    if (dives.length > 0) {
      const bounds = L.latLngBounds(dives.map(d => [d.latitude!, d.longitude!]))
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 })
    }
  }, [dives, map])
  
  return null
}

function ResetZoomButton({ dives }: { dives: DiveEntry[] }) {
  const map = useMap()
  
  return (
    <Button
      variant="secondary"
      size="sm"
      className="absolute top-2 right-2 z-[1000] bg-background/90 backdrop-blur-sm"
      onClick={() => {
        if (dives.length > 0) {
          const bounds = L.latLngBounds(dives.map(d => [d.latitude!, d.longitude!]))
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 })
        }
      }}
    >
      <Maximize2 className="size-3 mr-1" />
      Reset View
    </Button>
  )
}

interface LeafletMapCoreProps {
  dives: DiveEntry[]
  onSelectDive: (diveId: string) => void
}

export default function LeafletMapCore({ dives, onSelectDive }: LeafletMapCoreProps) {
  const clusteredDives = useMemo(() => {
    const groups: Record<string, DiveEntry[]> = {}
    dives.forEach(dive => {
      const key = `${dive.siteName.toLowerCase().trim()}|${dive.location.toLowerCase().split(',').pop()?.trim()}`
      if (!groups[key]) groups[key] = []
      groups[key].push(dive)
    })
    return groups
  }, [dives])

  return (
    <Card className="overflow-hidden" style={{ paddingBlock: '0px' }}>
      <div className="h-[500px] relative z-0">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <ResetZoomButton dives={dives} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds dives={dives} />
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterIcon}
            maxClusterRadius={50}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
          >
            {Object.entries(clusteredDives).map(([key, siteDives]) => {
              const center = siteDives[0]
              const count = siteDives.length
              
              return (
                <Marker
                  key={key}
                  position={[center.latitude!, center.longitude!]}
                  icon={createDiveIcon(count)}
                >
                  <Popup className="dive-popup">
                    <div className="min-w-[200px]">
                      <h3 className="font-semibold text-base mb-1">{center.siteName}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{center.location}</p>
                      {count > 1 && (
                        <p className="text-xs text-primary font-medium mb-2">{count} dives at this site</p>
                      )}
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1">
                          <ArrowDown className="size-3" />
                          {center.maxDepth}m
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {center.duration}min
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(center.date + 'T00:00:00').toLocaleDateString()}
                      </p>
                      {count === 1 ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-2 w-full text-xs"
                          onClick={() => onSelectDive(center.id)}
                        >
                          View Dive <ExternalLink className="size-3 ml-1" />
                        </Button>
                      ) : (
                        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                          {siteDives.slice(0, 5).map((d, i) => (
                            <button
                              key={d.id}
                              onClick={() => onSelectDive(d.id)}
                              className="w-full text-left text-xs p-1 hover:bg-secondary rounded flex justify-between"
                            >
                              <span>{new Date(d.date + 'T00:00:00').toLocaleDateString()}</span>
                              <span className="text-muted-foreground">{d.maxDepth}m</span>
                            </button>
                          ))}
                          {siteDives.length > 5 && (
                            <p className="text-xs text-muted-foreground text-center">
                              +{siteDives.length - 5} more
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
      <style>{`
        .custom-cluster-icon {
          background: transparent;
        }
        .cluster-marker {
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
          color: white;
          font-weight: bold;
          transition: transform 0.2s;
        }
        .cluster-marker:hover {
          transform: scale(1.1);
        }
        .cluster-marker.small {
          width: 32px;
          height: 32px;
          font-size: 14px;
        }
        .cluster-marker.medium {
          width: 40px;
          height: 40px;
          font-size: 15px;
        }
        .cluster-marker.large {
          width: 56px;
          height: 56px;
          font-size: 18px;
        }
      `}</style>
    </Card>
  )
}