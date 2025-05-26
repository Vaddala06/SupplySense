"use client"

import { usePathname, useRouter } from "next/navigation"
import { LogOut, MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"

const PPLX_API_KEY = "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"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [chatOpen, setChatOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<{role: "user"|"assistant", content: string}[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  if (pathname === "/") {
    return null
  }

  const handleSignOut = () => {
    router.push("/")
  }

  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [chatOpen])

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMessage = { role: "user" as const, content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)
    try {
      const res = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${PPLX_API_KEY}`,
        },
        body: JSON.stringify({
          model: "pplx-70b-online",
          messages: [...messages, userMessage].map(m => ({role: m.role, content: m.content})),
        }),
      })
      if (!res.ok) throw new Error("API error")
      const data = await res.json()
      const assistantMessage = { role: "assistant" as const, content: data.choices?.[0]?.message?.content || "(No response)" }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, there was an error with the chatbot." }])
    } finally {
      setLoading(false)
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      sendMessage()
    }
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1" />
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-600 hover:from-blue-100 hover:to-purple-100 shadow-sm"
            onClick={() => setChatOpen((v) => !v)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat Assistant
          </Button>
          {chatOpen && (
            <div className="fixed top-6 right-6 z-50 w-80 max-w-full rounded-xl shadow-2xl flex flex-col border border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 min-h-[480px]">
              <div className="flex items-center justify-between px-4 py-2 border-b border-blue-200 bg-gradient-to-r from-blue-100 to-purple-100 rounded-t-xl">
                <span className="font-semibold text-lg text-blue-700">Chat Assistant</span>
                <button onClick={() => setChatOpen(false)} className="p-1 rounded hover:bg-blue-100">
                  <X className="h-5 w-5 text-blue-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto bg-white/70 p-4 text-sm text-gray-700 rounded-b-xl">
                {messages.length === 0 && !loading && (
                  <div className="text-gray-400 text-center mt-8">Ask me anything about your inventory or supply chain!</div>
                )}
                {messages.map((msg, idx) => (
                  <div key={idx} className={msg.role === "user" ? "text-right mb-2" : "text-left mb-2"}>
                    <span className={msg.role === "user" ? "inline-block bg-blue-100 text-blue-800 px-3 py-2 rounded-lg" : "inline-block bg-purple-100 text-purple-800 px-3 py-2 rounded-lg"}>
                      {msg.content}
                    </span>
                  </div>
                ))}
                {loading && (
                  <div className="text-blue-500 text-center mt-4 animate-pulse">Thinking...</div>
                )}
              </div>
              <div className="flex gap-2 p-4 border-t border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-b-xl">
                <input
                  ref={inputRef}
                  type="text"
                  className="flex-1 border border-blue-200 rounded px-2 py-1 text-sm bg-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Type your question..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  disabled={loading}
                />
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" onClick={sendMessage} disabled={loading || !input.trim()}>
                  Send
                </Button>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
