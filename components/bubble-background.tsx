'use client'

import { useEffect, useState } from 'react'

interface Bubble {
  id: number
  left: number
  size: number
  duration: number
  delay: number
  wobbleDuration: number
}

export function BubbleBackground() {
  const [bubbles, setBubbles] = useState<Bubble[]>([])

  useEffect(() => {
    const newBubbles: Bubble[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 8 + 4,
      duration: Math.random() * 15 + 15,
      delay: Math.random() * 20,
      wobbleDuration: Math.random() * 3 + 2,
    }))
    setBubbles(newBubbles)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="bubble absolute rounded-full bg-primary/10 border border-primary/20"
          style={{
            left: `${bubble.left}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            animationDuration: `${bubble.duration}s, ${bubble.wobbleDuration}s`,
            animationDelay: `${bubble.delay}s, ${bubble.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
