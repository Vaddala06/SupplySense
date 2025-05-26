"use client"

import { usePathname, useRouter } from "next/navigation"
import { LogOut, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === "/") {
    return null
  }

  const handleSignOut = () => {
    router.push("/")
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1" />

        <div className="flex items-center space-x-4">
          {/* Chatbot placeholder */}
          <Button
            variant="outline"
            size="sm"
            className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-600 hover:from-blue-100 hover:to-purple-100 shadow-sm"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat Assistant
          </Button>

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
