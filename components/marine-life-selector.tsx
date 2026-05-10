'use client'

import { useState, useMemo } from 'react'
import { Search, X, Plus, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { searchMarineSpecies, MarineSpecies } from '@/lib/marine-species'
import type { MarineLifeEntry } from '@/lib/types'

interface MarineLifeSelectorProps {
  value: MarineLifeEntry[]
  onChange: (entries: MarineLifeEntry[]) => void
  placeholder?: string
}

export function MarineLifeSelector({ value, onChange, placeholder = 'Search marine life...', className }: MarineLifeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [customInput, setCustomInput] = useState('')

  const searchResults = useMemo(() => {
    return searchMarineSpecies(searchQuery)
  }, [searchQuery])

  const handleSelectSpecies = (species: MarineSpecies) => {
    const newEntry: MarineLifeEntry = {
      id: species.id,
      name: species.name,
      scientificName: species.scientificName,
      imageUrl: species.imageUrl,
      custom: false,
    }

    if (!value.some(v => v.id === newEntry.id)) {
      onChange([...value, newEntry])
    }

    setSearchQuery('')
  }

  const handleAddCustom = () => {
    if (!customInput.trim()) return

    const newEntry: MarineLifeEntry = {
      name: customInput.trim(),
      custom: true,
    }

    if (!value.some(v => v.name.toLowerCase() === newEntry.name.toLowerCase())) {
      onChange([...value, newEntry])
    }

    setCustomInput('')
  }

  const removeEntry = (entryToRemove: MarineLifeEntry) => {
    onChange(value.filter(entry => entry !== entryToRemove))
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full justify-start text-left h-10 bg-secondary/50"
      >
        <Search className="mr-2 size-4" />
        {value.length > 0 ? `${value.length} species selected` : placeholder}
      </Button>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((entry, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 cursor-default flex items-center gap-1"
            >
              {entry.imageUrl && (
                <img
                  src={entry.imageUrl}
                  alt={entry.name}
                  className="w-4 h-4 rounded object-cover"
                />
              )}
              {entry.name}
              <button
                type="button"
                onClick={() => removeEntry(entry)}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Marine Life Spotted</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search species..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <p className="text-xs text-muted-foreground">Select from database:</p>
                {searchResults.map((species) => {
                  const isSelected = value.some(v => v.id === species.id)
                  return (
                    <button
                      key={species.id}
                      onClick={() => !isSelected && handleSelectSpecies(species)}
                      disabled={isSelected}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                        isSelected
                          ? 'bg-primary/10 border border-primary/30 cursor-default'
                          : 'hover:bg-secondary/50'
                      }`}
                    >
                      {species.imageUrl ? (
                        <img
                          src={species.imageUrl}
                          alt={species.name}
                          className="w-10 h-10 rounded object-cover bg-secondary"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">No img</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{species.name}</p>
                        <p className="text-xs text-muted-foreground italic">{species.scientificName}</p>
                        <p className="text-xs text-primary/70">{species.category}</p>
                      </div>
                      {isSelected && (
                        <Check className="size-5 text-primary shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {searchResults.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No results found</p>
            )}

            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground mb-2">Or add custom species:</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Custom species name..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                  className="flex-1"
                />
                <Button onClick={handleAddCustom} size="icon">
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}