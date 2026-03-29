import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, BookOpen, AlertCircle, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: { source: string; content: string }[]
  isError?: boolean
}

const SUGGESTIONS = [
  "What is Nexora's leave policy?",
  "How does the onboarding process work?",
  "What are the IT security guidelines?",
  "Tell me about employee benefits",
]

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    role: 'assistant',
    content: "Hi, I'm **VAULTIQ** — your AI-powered knowledge assistant for Nexora Technologies. Ask me anything about HR policies, product specs, security guidelines, and more.",
    citations: []
  }])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [_error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px'
    }
  }, [input])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text })
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Server error' }))
        throw new Error(err.detail || 'Failed to get response')
      }

      const data = await response.json()

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        citations: data.citations
      }])
    } catch (err: any) {
      setError(err.message)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to the knowledge base right now. Please try again in a moment.",
        isError: true
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const showSuggestions = messages.length <= 1 && !isLoading

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] max-w-4xl mx-auto w-full relative">

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 py-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/10 mt-0.5">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-md'
                  : msg.isError
                    ? 'glass border-red-500/30 text-red-300 rounded-bl-md'
                    : 'glass text-slate-200 rounded-bl-md'
              }`}>
                {msg.isError && <AlertCircle className="w-4 h-4 mb-1.5 text-red-400 inline-block mr-1.5" />}
                <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:text-white prose-strong:text-white">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>

              {/* Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-2 space-y-1.5 w-full">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 px-1">
                    <BookOpen className="w-3 h-3" /> Sources ({msg.citations.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.citations.map((cite, idx) => (
                      <div
                        key={idx}
                        className="glass rounded-lg px-3 py-2 text-xs max-w-[220px] group cursor-default glass-hover"
                      >
                        <span className="font-semibold text-indigo-400 truncate block text-[11px]">
                          {cite.source}
                        </span>
                        <p className="text-slate-500 text-[10px] mt-0.5 line-clamp-2 leading-relaxed group-hover:text-slate-400 transition-colors">
                          {cite.content.substring(0, 80)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/10">
              <Bot className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="glass rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && (
        <div className="px-4 sm:px-6 pb-2">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-medium text-slate-500">Try asking</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                className="glass glass-hover rounded-xl px-4 py-3 text-left text-sm text-slate-300 hover:text-white transition-all duration-200"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/5">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto items-end">
          <div className="relative flex-1 glass rounded-2xl focus-within:border-indigo-500/50 focus-within:shadow-lg focus-within:shadow-indigo-500/5 transition-all duration-200">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about Nexora..."
              className="w-full bg-transparent px-4 py-3 min-h-[48px] max-h-32 resize-none placeholder:text-slate-600 focus:outline-none text-slate-200 text-sm custom-scrollbar"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              rows={1}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-600 mt-2 hidden sm:block">
          VAULTIQ uses AI and may make mistakes. Verify with official documents.
        </p>
      </div>
    </div>
  )
}
