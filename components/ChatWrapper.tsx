'use client'

import { useState, useEffect } from 'react'
import ChatInterface from './ChatInterface'
import FloatingChat from './FloatingChat'

interface ChatWrapperProps {
  initialChatId?: string
}

export default function ChatWrapper({ initialChatId }: ChatWrapperProps) {
  const [isFloatingMode, setIsFloatingMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle mounting and load saved preference
  useEffect(() => {
    // This is intentionally updating state in an effect for hydration purposes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const init = () => {
      setMounted(true)
      const savedMode = typeof window !== 'undefined' 
        ? localStorage.getItem('chatMode') === 'floating'
        : false
      setIsFloatingMode(savedMode)
    }
    init()
  }, [])

  const toggleMode = () => {
    const newMode = !isFloatingMode
    setIsFloatingMode(newMode)
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatMode', newMode ? 'floating' : 'full')
    }
  }

  // Prevent hydration mismatch by rendering after client mount
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (isFloatingMode) {
    return <FloatingChat initialChatId={initialChatId} onToggleMode={toggleMode} />
  }

  return <ChatInterface initialChatId={initialChatId} onToggleMode={toggleMode} />
}

