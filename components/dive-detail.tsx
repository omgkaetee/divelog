'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { DiveEntry } from '@/lib/types'
import { formatDepthBoth, formatTempBoth } from '@/lib/types'
import {
  ArrowLeft,
  MapPin,
  Map,
  Calendar,
  ArrowDown,
  Clock,
  Eye,
  Thermometer,
  Users,
  Fish,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Hash,
  Check,
} from 'lucide-react'

interface DiveDetailProps {
  dive: DiveEntry
  onBack: () => void
  onDelete: () => void
  onEdit: () => void
  onUpdateCountry?: (country: string) => void
}

export function DiveDetail({ dive, onBack, onDelete, onEdit, onUpdateCountry }: DiveDetailProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditingCountry, setIsEditingCountry] = useState(false)
  const [editCountry, setEditCountry] = useState(dive.country)

  const formattedDate = new Date(dive.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1)
    }
  }

  const handleNextPhoto = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex < dive.photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1)
    }
  }

  return (
    <>
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-5" />
              </Button>
              <CardTitle className="font-serif text-xl">{dive.siteName}</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="text-muted-foreground hover:text-primary"
              >
                <Pencil className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-5" />
              </Button>

              <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this dive?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove "{dive.siteName}" from your dive log. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Photo Gallery */}
          {dive.photos.length > 0 && (
            <div className="space-y-3">
              <div
                className="aspect-video w-full rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setSelectedPhotoIndex(0)}
              >
                <img
                  src={dive.photos[0]}
                  alt={dive.siteName}
                  className="w-full h-full object-cover"
                />
              </div>
              {dive.photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {dive.photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPhotoIndex(index)}
                      className="flex-shrink-0 size-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
                    >
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4" />
              <span>{dive.location || 'Unknown location'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="size-4" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<ArrowDown className="size-5" />}
              label="Max Depth"
              value={formatDepthBoth(dive.maxDepth)}
            />
            <StatCard
              icon={<Clock className="size-5" />}
              label="Duration"
              value={`${dive.duration} min`}
            />
            {dive.dayNumber && (
              <StatCard
                icon={<Hash className="size-5" />}
                label="Day"
                value={`Day ${dive.dayNumber}`}
              />
            )}
            <StatCard
              icon={<Thermometer className="size-5" />}
              label="Water Temp"
              value={formatTempBoth(dive.waterTemp)}
            />
            {dive.country && (
              <StatCard
                icon={<MapPin className="size-5" />}
                label="Country"
                value={
                  isEditingCountry ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editCountry}
                        onChange={(e) => setEditCountry(e.target.value)}
                        className="h-6 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && onUpdateCountry) {
                            onUpdateCountry(editCountry)
                            setIsEditingCountry(false)
                          }
                          if (e.key === 'Escape') {
                            setEditCountry(dive.country)
                            setIsEditingCountry(false)
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-1"
                        onClick={() => {
                          if (onUpdateCountry) {
                            onUpdateCountry(editCountry)
                            setIsEditingCountry(false)
                          }
                        }}
                      >
                        <Check className="size-3" />
                      </Button>
                    </div>
                  ) : (
                    <span 
                      className="cursor-pointer hover:text-primary"
                      onClick={() => {
                        setEditCountry(dive.country)
                        setIsEditingCountry(true)
                      }}
                    >
                      {dive.country}
                    </span>
                  )
                }
              />
            )}
          </div>

          {/* Location Map */}
          {dive.location && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Map className="size-4" />
                <span className="text-sm font-medium">Location</span>
              </div>
              {(() => {
                const mapQuery = dive.country && dive.location 
                  ? `${dive.location}, ${dive.country}` 
                  : dive.country || dive.location || ''
                return (
                  <>
                    <iframe
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                      className="w-full aspect-video rounded-lg border-0"
                      loading="lazy"
                      title={`Map of ${mapQuery}`}
                    />
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Open in Google Maps
                    </a>
                    <p className="text-sm text-muted-foreground">{mapQuery}</p>
                  </>
                )
              })()}
            </div>
          )}

          {/* Buddy */}
          {dive.buddyName && (
            <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
              <Users className="size-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Dive Buddy</p>
                <p className="font-medium">{dive.buddyName}</p>
              </div>
            </div>
          )}

          {/* Marine Life */}
          {dive.marineLife.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Fish className="size-4" />
                <span className="text-sm font-medium">Marine Life Spotted</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {dive.marineLife.map((species, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-primary/20 text-primary border-primary/30 flex items-center gap-1.5"
                  >
                    {species.imageUrl && (
                      <img
                        src={species.imageUrl}
                        alt={species.name}
                        className="w-5 h-5 rounded object-cover"
                      />
                    )}
                    <span>{species.name}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {dive.notes && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Dive Notes</p>
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                {dive.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Lightbox */}
      <Dialog open={selectedPhotoIndex !== null} onOpenChange={() => setSelectedPhotoIndex(null)}>
        <DialogContent className="max-w-4xl bg-background/95 backdrop-blur-md border-border/50 p-2">
          {selectedPhotoIndex !== null && (
            <div className="relative">
              <img
                src={dive.photos[selectedPhotoIndex]}
                alt={`Photo ${selectedPhotoIndex + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              {dive.photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevPhoto}
                    disabled={selectedPhotoIndex === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80"
                  >
                    <ChevronLeft className="size-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNextPhoto}
                    disabled={selectedPhotoIndex === dive.photos.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80"
                  >
                    <ChevronRight className="size-6" />
                  </Button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/50 px-3 py-1 rounded-full text-sm">
                    {selectedPhotoIndex + 1} / {dive.photos.length}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-4 bg-secondary/30 rounded-lg text-center">
      <div className="text-primary flex justify-center mb-2">{icon}</div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold text-foreground">{value}</p>
    </div>
  )
}
