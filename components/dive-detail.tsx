'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  
  Calendar,
  MapPin,
  Clock,
  Thermometer,
  Waves,
  Anchor,
  User,
  Fish,
  Image,
  Map,
  Trash2,
  Pencil,
  Hash,
  Check,
  MapPinOff,
  
} from 'lucide-react'

interface DiveDetailProps {
  dive: DiveEntry
  onBack: () => void
  onDelete: () => void
  onEdit: () => void
  onUpdateCountry?: (country: string, countryDescription?: string) => void
  onNext?: () => void
  onPrev?: () => void
}

export function DiveDetail({ dive, onBack, onDelete, onEdit, onUpdateCountry, onNext, onPrev }: DiveDetailProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditingCountry, setIsEditingCountry] = useState(false)
  const [editCountry, setEditCountry] = useState(dive.country)
  const [editCountryDescription, setEditCountryDescription] = useState(dive.countryDescription || '')
  const [showMap, setShowMap] = useState(false)

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
                className="text-muted-foreground hover:bg-destructive hover:text-white"
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
                      autoFocus
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {onPrev && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onPrev}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="size-5" />
                </Button>
              )}
              {onNext && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNext}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ChevronRight className="size-5" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Location & Date */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="size-4" />
              <span>{formattedDate}</span>
            </div>
            {dive.location && (
              <button
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <MapPin className="size-4 text-primary" />
                <span className="underline decoration-dotted">{dive.location}</span>
                {showMap ? <MapPinOff className="size-3 text-primary" /> : <ChevronDown className="size-3" />}
              </button>
            )}
            {showMap && dive.location && (
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(dive.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-40 rounded-lg border-0 mt-2"
                loading="lazy"
                title={`Map of ${dive.location}`}
              />
            )}
          </div>

          {/* Stats Grid */}
          <div className="flex flex-wrap gap-4">
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
          </div>

          {/* Photo Gallery */}
          {dive.photos.length > 0 && (
            <div className="space-y-3">
              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-secondary/30">
                {dive.photos.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedPhotoIndex(prev => prev === null ? 0 : (prev > 0 ? prev - 1 : dive.photos.length - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80 z-10"
                    >
                      <ChevronLeft className="size-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedPhotoIndex(prev => prev === null ? 1 : (prev < dive.photos.length - 1 ? prev + 1 : 0))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80 z-10"
                    >
                      <ChevronRight className="size-6" />
                    </Button>
                  </>
                )}
                <img
                  src={dive.photos[selectedPhotoIndex ?? 0]}
                  alt={dive.siteName}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={() => setSelectedPhotoIndex(selectedPhotoIndex ?? 0)}
                />
                {dive.photos.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/50 px-2 py-1 rounded text-xs">
                    {(selectedPhotoIndex ?? 0) + 1} / {dive.photos.length}
                  </div>
                )}
              </div>
              {dive.photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {dive.photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPhotoIndex(index)}
                      className={`flex-shrink-0 size-14 rounded-lg overflow-hidden border-2 transition-colors ${
                        (selectedPhotoIndex ?? 0) === index ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
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

          {/* Tags */}
          {dive.tags && dive.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dive.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {tag}
                </Badge>
              ))}
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
    </>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex-1 p-4 bg-secondary/30 rounded-lg text-center min-w-[120px]">
      <div className="text-primary flex justify-center mb-2">{icon}</div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="font-semibold text-foreground">{value}</div>
    </div>
  )
}
