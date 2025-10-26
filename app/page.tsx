'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Plus, Trash2, Menu, User } from 'lucide-react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  createdAt: Date
}

interface Chat {
  id: string
  title: string | null
  createdAt: Date
  updatedAt: Date
  messages: Message[]
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchChats()
    }
  }, [session])

  const fetchChats = async () => {
    try {
      const res = await fetch('/api/chat')
      const data = await res.json()
      setChats(data.chats || [])
    } catch (error) {
      console.error('Error fetching chats:', error)
    }
  }

  const fetchMessages = async (chatId: string) => {
    try {
      const res = await fetch(`/api/chat?chatId=${chatId}`)
      const data = await res.json()
      setMessages(data.messages || [])
      setCurrentChatId(chatId)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const startNewChat = () => {
    setMessages([])
    setCurrentChatId(null)
    setQuestion('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || loading) return

    const userMessage = question
    setQuestion('')
    setLoading(true)

    // Add user message to UI immediately
    const tempUserMessage: Message = {
      id: Date.now().toString(),
      content: userMessage,
      role: 'user',
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, tempUserMessage])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: userMessage,
          chatId: currentChatId,
        }),
      })

      if (!res.ok) {
        // Handle validation errors (400 status)
        const errorData = await res.json()
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: errorData.error || 'This question is not related to HR policies. Please ask about salary, leaves, benefits, or other HR topics.',
          role: 'assistant',
          createdAt: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
        setLoading(false)
        return
      }

      const data = await res.json()

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.answer,
        role: 'assistant',
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      // If this was a new chat, update the chat list
      if (!currentChatId && data.chatId) {
        setCurrentChatId(data.chatId)
        await fetchChats()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await fetch(`/api/chat/${chatId}`, { method: 'DELETE' })
      await fetchChats()
      if (currentChatId === chatId) {
        setMessages([])
        setCurrentChatId(null)
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-[#1a1a1a] text-gray-100 flex flex-col overflow-hidden`}>
        {/* Logo/Brand */}
        <div className="px-4 py-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-white">H</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">HR Assist</h1>
              <p className="text-xs text-gray-400">AI Assistant</p>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={startNewChat}
            className="w-full flex items-center gap-3 rounded-lg bg-[#2a2a2a] hover:bg-[#333333] px-4 py-3 transition-all duration-200 hover:shadow-lg border border-gray-700"
          >
            <Plus className="h-5 w-5 text-green-400" />
            <span className="font-medium">New Chat</span>
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {chats.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No previous chats
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => fetchMessages(chat.id)}
                className={`group relative flex items-center gap-2 rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-200 ${
                  currentChatId === chat.id 
                    ? 'bg-[#2a2a2a] shadow-md' 
                    : 'hover:bg-[#252525]'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {chat.title || 'New Chat'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(chat.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => deleteChat(chat.id, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* User Info */}
        <div className="border-t border-gray-800 p-3">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#2a2a2a] transition-colors">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">
                {session.user?.name || session.user?.email}
              </p>
              <button
                onClick={() => signOut()}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">HR Assistant</h1>
                <p className="text-sm text-gray-500">Ask me anything about HR policies</p>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center mt-20">
                <div className="inline-block p-4 rounded-full bg-green-100 mb-4">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">How can I help you today?</h2>
                <p className="text-gray-500 text-lg">Ask me anything about HR policies, leave requests, benefits, and more.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-4 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                        : 'bg-gradient-to-br from-green-500 to-green-600'
                    }`}
                  >
                    <span className="text-white font-semibold text-sm">
                      {message.role === 'user' ? 'U' : 'AI'}
                    </span>
                  </div>
                  <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-sm ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {loading && (
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-semibold text-sm">AI</span>
                </div>
                <div className="bg-white rounded-2xl px-5 py-3 border border-gray-200 shadow-sm">
                  <div className="flex gap-2">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t bg-white px-6 py-4 shadow-lg">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200 focus-within:border-green-500 focus-within:shadow-lg transition-all">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Message HR Assist..."
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                disabled={loading}
              />
              <Button 
                type="submit" 
                disabled={loading || !question.trim()}
                size="icon"
                className="h-10 w-10 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-300 shadow-md"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
