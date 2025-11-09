'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, X, Menu, User, Maximize2, Trash2, ArrowLeft } from 'lucide-react'
import { faqCategories, FAQCategory } from '@/lib/faq-categories'

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

interface FloatingChatProps {
  initialChatId?: string
  onToggleMode: () => void
}

export default function FloatingChat({ initialChatId, onToggleMode }: FloatingChatProps) {
  const { data: session } = useSession()
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(initialChatId || null)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | null>(null)
  const [loadingChats, setLoadingChats] = useState(false)

  const fetchChats = useCallback(async () => {
    try {
      setLoadingChats(true)
      const res = await fetch('/api/chat')
      const data = await res.json()
      setChats(data.chats || [])
    } catch (error) {
      console.error('Error fetching chats:', error)
    } finally {
      setLoadingChats(false)
    }
  }, [])

  const fetchMessages = useCallback(async (chatId: string) => {
    try {
      const res = await fetch(`/api/chat?chatId=${chatId}`)
      const data = await res.json()
      setMessages(data.messages || [])
      setCurrentChatId(chatId)
      window.history.pushState({}, '', `/c/${chatId}`)
      setShowMenu(false)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchChats()
    }
  }, [session, fetchChats])

  useEffect(() => {
    if (initialChatId && session) {
      fetchMessages(initialChatId)
    }
  }, [initialChatId, session, fetchMessages])

  const startNewChat = () => {
    setMessages([])
    setCurrentChatId(null)
    setQuestion('')
    setSelectedCategory(null)
    window.history.pushState({}, '', '/')
    setShowMenu(false)
  }

  const handleQuestionClick = async (questionText: string) => {
    setSelectedCategory(null)
    await submitQuestion(questionText)
  }

  const submitQuestion = async (questionText: string) => {
    if (!questionText.trim() || loading) return
    
    setLoading(true)
    setQuestion('')

    const tempUserMessage: Message = {
      id: Date.now().toString(),
      content: questionText,
      role: 'user',
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, tempUserMessage])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: questionText,
          chatId: currentChatId,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: errorData.error || 'This question is not related to HR policies.',
          role: 'assistant',
          createdAt: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
        setLoading(false)
        return
      }

      const data = await res.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.answer,
        role: 'assistant',
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      
      // Clear loading immediately after adding the message
      setLoading(false)

      if (!currentChatId && data.chatId) {
        setCurrentChatId(data.chatId)
        window.history.pushState({}, '', `/c/${data.chatId}`)
        await fetchChats()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitQuestion(question)
  }

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await fetch(`/api/chat/${chatId}`, { method: 'DELETE' })
      await fetchChats()
      if (currentChatId === chatId) {
        setMessages([])
        setCurrentChatId(null)
        window.history.pushState({}, '', '/')
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white shadow-2xl hover:shadow-green-500/50 transition-all duration-300 flex items-center justify-center z-50"
      >
        <span className="text-2xl font-bold">H</span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
            <span className="text-xl font-bold text-white">H</span>
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">HR Assist</h2>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-300 animate-pulse"></div>
              <p className="text-white/90 text-xs">Online to assist you</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMode}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="Full Screen Mode"
          >
            <Maximize2 className="h-4 w-4 text-white" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gradient-to-b from-gray-50 to-white">
        {messages.length === 0 ? (
          <div className="mt-4">
            <div className="text-center mb-4">
              <div className="inline-block p-3 rounded-full bg-green-100 mb-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Hello! 👋</h3>
              <p className="text-gray-500 text-xs mb-3">
                {selectedCategory ? 'Choose a question:' : 'Kindly choose one of the options 👇'}
              </p>
            </div>

            {selectedCategory ? (
              <div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center gap-1 text-green-600 hover:text-green-700 mb-3 transition-colors text-xs"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span className="font-medium">Back to categories</span>
                </button>
                <div className="space-y-2">
                  {selectedCategory.questions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuestionClick(q)}
                      className="w-full text-left px-3 py-2 bg-white border-2 border-green-200 hover:border-green-500 hover:bg-green-50 rounded-lg transition-all text-gray-700 hover:text-green-700 text-xs font-medium shadow-sm hover:shadow-md"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {faqCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category)}
                    className="flex flex-col items-center gap-2 p-3 bg-white border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 rounded-xl transition-all shadow-sm hover:shadow-md group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {category.icon}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-700 group-hover:text-green-700 text-center leading-tight">
                      {category.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                      : 'bg-gradient-to-br from-green-500 to-green-600'
                  }`}
                >
                  <span className="text-white font-semibold text-xs">
                    {message.role === 'user' ? 'U' : 'AI'}
                  </span>
                </div>
                <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-xs whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex items-start gap-2">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">AI</span>
                </div>
                <div className="bg-white rounded-xl px-3 py-2 border border-gray-200">
                  <div className="flex gap-1">
                    <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Show categories after messages for continued interaction */}
            {!loading && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-center text-gray-600 text-xs mb-3 font-medium">
                  {selectedCategory ? 'Choose another:' : 'What else can I help with? 👇'}
                </p>
                {selectedCategory ? (
                  <div>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="flex items-center gap-1 text-green-600 hover:text-green-700 mb-3 transition-colors text-xs"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      <span className="font-medium">Back to categories</span>
                    </button>
                    <div className="space-y-2">
                      {selectedCategory.questions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuestionClick(q)}
                          className="w-full text-left px-3 py-2 bg-white border-2 border-green-200 hover:border-green-500 hover:bg-green-50 rounded-lg transition-all text-gray-700 hover:text-green-700 text-xs font-medium shadow-sm hover:shadow-md"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {faqCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category)}
                        className="flex flex-col items-center gap-2 p-3 bg-white border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 rounded-xl transition-all shadow-sm hover:shadow-md group"
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform">
                          {category.icon}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-700 group-hover:text-green-700 text-center leading-tight">
                          {category.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t bg-white px-3 py-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            title="Chat History"
          >
            <Menu className="h-4 w-4 text-gray-600" />
          </button>
          <button
            type="button"
            onClick={startNewChat}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="New Chat"
          >
            <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your question..."
            className="flex-1 border-gray-200 bg-gray-50 focus-visible:ring-green-500 text-sm h-9"
            disabled={loading}
          />
          <Button 
            type="submit" 
            disabled={loading || !question.trim()}
            size="icon"
            className="h-9 w-9 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Chat History Menu */}
      {showMenu && (
        <div className="absolute bottom-16 left-3 right-3 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[300px] overflow-y-auto z-10">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Chat History</h3>
              <button onClick={() => setShowMenu(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="p-2">
            {loadingChats ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-500 border-t-transparent"></div>
                  <p className="text-xs text-gray-400">Loading...</p>
                </div>
              </div>
            ) : chats.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-xs">
                No previous chats
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => fetchMessages(chat.id)}
                  className={`group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-all ${
                    currentChatId === chat.id 
                      ? 'bg-green-50 border border-green-200' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate text-gray-900">
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
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="p-2 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="h-3 w-3 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{session?.user?.name || session?.user?.email}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 hover:bg-gray-100 rounded"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

