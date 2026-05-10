'use client'

import { useEffect, useState } from 'react'

interface Bubble {
  id: number
  left: number
  top: number
  size: number
  duration: number
  delay: number
  wobbleDuration: number
  direction: 'up' | 'down' | 'left' | 'right'
}

export function BubbleBackground() {
  const [bubbles, setBubbles] = useState<Bubble[]>([])

  useEffect(() => {
    const newBubbles: Bubble[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 14 + 2,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 10,
      wobbleDuration: Math.random() * 2 + 1,
      direction: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'left' : 'right',
    }))
    setBubbles(newBubbles)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="bubble-float absolute rounded-full bg-primary/10 border border-primary/20"
          style={{
            left: `${bubble.left}%`,
            top: `${bubble.top}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            animationDuration: `${bubble.duration}s`,
            animationDelay: `${bubble.delay}s`,
            '--bubble-direction': bubble.direction,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
