'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

export function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    const prompt = deferredPrompt as any
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    setIsVisible(false)
    setDeferredPrompt(null)
  }

  if (!isVisible) return null

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-4 right-4 bg-sky-500 hover:bg-sky-600 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium z-50 transition-all hover:scale-105"
    >
      <Download className="w-5 h-5" />
      <span>Install App</span>
    </button>
  )
}