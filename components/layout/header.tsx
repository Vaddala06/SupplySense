"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useGlobalStore } from "@/lib/store";

// Global store for inventory data
let globalInventoryData: any[] = [];

export function setGlobalInventoryData(data: any[]) {
  globalInventoryData = data;
}

export function getGlobalInventoryData() {
  return globalInventoryData;
}

const SYSTEM_PROMPT = `You are the AI assistant for SupplySense, a platform that helps small and mid-sized importers manage landed costs, duty mapping, and supplier optimization. You only answer questions related to SupplySense's features and workflows. If a question is unrelated (e.g., general trivia, personal advice, or tech outside the app), reply ONLY with: "I'm here to help with SupplySense features like landed cost, duty mapping, and supplier optimization. For inventory insights, just ask!" Do not provide explanations, definitions, or lists for unrelated queries. Key features you support include:
- SKU ingestion via CSV/ERP and auto-normalization of product data
- HS code classification and duty lookup using a reasoning-based API (like Sonar)
- Landed cost breakdowns with duties, taxes, shipping, and discounts
- Alerts for duty changes, currency fluctuations, or margin thresholds
- Scenario simulations comparing suppliers, incoterms, or routes
- Vendor benchmarking and savings analysis
- Weekly reporting with embedded citations and visual dashboards
Typical user workflows involve uploading SKUs, reviewing auto-classified data, analyzing cost and margin exposure, setting cost triggers, running scenario planning, and generating reports.`;

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inventory = useGlobalStore((state) => state.inventory);

  // Always clear chat history on reload
  useEffect(() => {
    setMessages([]);
    localStorage.removeItem("ss_chat_history");
  }, []);

  // Save chat history to localStorage on update
  useEffect(() => {
    localStorage.setItem("ss_chat_history", JSON.stringify(messages));
  }, [messages]);

  if (pathname === "/") {
    return null;
  }

  const handleSignOut = () => {
    router.push("/");
  };

  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [chatOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const inventoryData = inventory;
    const userMessage = { role: "user" as const, content: input };
    setInput("");
    setLoading(true);
    try {
      // Combine system prompt and inventory data into one system message
      const systemContent =
        inventoryData.length > 0
          ? SYSTEM_PROMPT +
            "\n\nHere is the user's inventory data as a JSON array: " +
            JSON.stringify(inventoryData) +
            ". Use this for any insights or analysis."
          : SYSTEM_PROMPT;
      // Build the message history for the API call (do not update state yet)
      // Only send system, then alternate user/assistant, ending with the new user message
      const filteredMessages = [...messages];
      // Remove any system messages from previous history
      const nonSystemMessages = filteredMessages.filter(
        (m) => m.role !== "system"
      );
      // Build up alternation, starting after system
      const apiMessages = [{ role: "system", content: systemContent }];
      // Add up to the last 6 messages (3 user/assistant pairs), but always alternate
      let lastRole: "user" | "assistant" | null = null;
      for (
        let i = Math.max(0, nonSystemMessages.length - 6);
        i < nonSystemMessages.length;
        i++
      ) {
        const m = nonSystemMessages[i];
        if (lastRole === m.role) continue; // skip if not alternating
        apiMessages.push(m);
        lastRole = m.role;
      }
      // Always end with the new user message
      if (lastRole !== "user") {
        apiMessages.push(userMessage);
      } else {
        // If last message was user, replace it with the new user message
        apiMessages[apiMessages.length - 1] = userMessage;
      }
      const res = await fetch("/api/perplexity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: apiMessages,
        }),
      });
      if (!res.ok) throw new Error("API error");
      let assistantContent =
        (await res.json()).choices?.[0]?.message?.content || "(No response)";
      // Add extra spacing for API key output if present
      if (assistantContent.includes("pplx-")) {
        assistantContent = assistantContent.replace(
          /(pplx-[a-zA-Z0-9]+)/g,
          "\n\n$1\n\n"
        );
      }
      // Make output concise and readable
      assistantContent = assistantContent
        .replace(/\n{3,}/g, "\n\n") // Remove excessive newlines
        .replace(/\s+$/g, "") // Trim trailing whitespace
        .replace(/\n{2,}/g, "\n\n"); // Normalize double newlines
      // Limit to 20 lines, add summary if too long
      const lines = assistantContent.split("\n");
      if (lines.length > 20) {
        assistantContent =
          lines.slice(0, 18).join("\n") +
          "\n\n... (response truncated for readability)";
      }
      // Now update the chat state with both user and assistant messages
      setMessages((prev) => [
        ...prev,
        userMessage,
        { role: "assistant", content: assistantContent },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        userMessage,
        {
          role: "assistant",
          content: "Sorry, there was an error with the chatbot.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      sendMessage();
    }
  };

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
                <span className="font-semibold text-lg text-blue-700">
                  Chat Assistant
                </span>
                <button
                  onClick={() => setChatOpen(false)}
                  className="p-1 rounded hover:bg-blue-100"
                >
                  <X className="h-5 w-5 text-blue-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto bg-white/70 p-4 text-sm text-gray-700 rounded-b-xl">
                {messages.length === 0 && !loading && (
                  <div className="text-gray-400 text-center mt-8">
                    Ask me anything about your inventory or supply chain!
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={
                      msg.role === "user" ? "text-right mb-2" : "text-left mb-2"
                    }
                  >
                    {msg.role === "user" ? (
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-2 rounded-lg">
                        {msg.content}
                      </span>
                    ) : (
                      <span className="inline-block bg-purple-100 text-purple-800 px-3 py-2 rounded-lg text-left max-w-full break-words">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </span>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="text-blue-500 text-center mt-4 animate-pulse">
                    Thinking...
                  </div>
                )}
              </div>
              <div className="flex gap-2 p-4 border-t border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-b-xl">
                <input
                  ref={inputRef}
                  type="text"
                  className="flex-1 border border-blue-200 rounded px-2 py-1 text-sm bg-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Type your question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  disabled={loading}
                />
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                >
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
  );
}
