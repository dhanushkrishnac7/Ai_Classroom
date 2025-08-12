"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { FileText, EllipsisVertical, Send } from "lucide-react"
import { cn } from "@/lib/utils"

export default function DocumentChatPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const footerRef = useRef(null)
  const [footerH, setFooterH] = useState(88)


  useEffect(() => {
    const el = footerRef.current
    if (!el) return
    const setH = () => setFooterH(el.offsetHeight)
    setH()
    const ro = new ResizeObserver(setH)
    ro.observe(el)
    window.addEventListener("resize", setH)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", setH)
    }
  }, [])

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "auto",
    })
  }

  const notes = useMemo(
    () => [
      {
        id: "n11",
        title: "Key Concepts",
        subtitle: "Study Note",
        previewSrc: "/placeholder.svg?height=64&width=96",
        href: "#",
        meta: "Updated 1d ago",
        fileKind: "Google Doc",
      },
      {
        id: "n12",
        title: "Key Concepts",
        subtitle: "Study Note",
        previewSrc: "/placeholder.svg?height=64&width=96",
        href: "#",
        meta: "Updated 1d ago",
        fileKind: "Google Doc",
      },
      {
        id: "n1",
        title: "Key Concepts",
        subtitle: "Study Note",
        previewSrc: "/placeholder.svg?height=64&width=96",
        href: "#",
        meta: "Updated 1d ago",
        fileKind: "Google Doc",
      },
      {
        id: "n2",
        title: "Practice Problems",
        subtitle: "Exercise Set",
        previewSrc: "/placeholder.svg?height=64&width=96",
        href: "#",
        meta: "10 tasks",
        fileKind: "PDF",
      },
      {
        id: "n3",
        title: "Research Notes",
        subtitle: "References",
        previewSrc: "/placeholder.svg?height=64&width=96",
        href: "#",
        meta: "8 links",
        fileKind: "Markdown",
      },
      {
        id: "n4",
        title: "Discussion Points",
        subtitle: "Class Q&A",
        previewSrc: "/placeholder.svg?height=64&width=96",
        href: "#",
        meta: "3 topics",
        fileKind: "Docx",
      },
      {
        id: "n41",
        title: "Discussion Points",
        subtitle: "Class Q&A",
        previewSrc: "/placeholder.svg?height=64&width=96",
        href: "#",
        meta: "3 topics",
        fileKind: "Docx",
      },
    ],
    [],
  )

  function handleSend() {
    const text = input.trim()
    if (!text) return

    const userMsg = { id: crypto.randomUUID(), role: "user", content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput("")

    requestAnimationFrame(scrollToBottom)


    setTimeout(() => {
      const reply = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `You asked: "${text}". I can summarize, list key points, or create practice questions based on the document.`,
      }
      setMessages((prev) => [...prev, reply])
      requestAnimationFrame(scrollToBottom)
    }, 450)
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto w-full max-w-5xl px-4">
          <div className="flex items-center gap-3 py-4">
            <div className="rounded-full bg-neutral-100 p-2">
              <FileText className="h-5 w-5 text-neutral-600" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h1 className="truncate text-lg font-semibold text-neutral-900">Qb unit2&3</h1>
                <button
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
                  aria-label="More actions"
                >
                  <EllipsisVertical className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-neutral-500">Sundhari M • Yesterday</p>
            </div>
          </div>
        </div>
        <Separator />
      </header>


      <section className="flex flex-wrap w-full max-w-8xl item-center justify-center py-8">
        {notes.map((note) => (
          <Card
            key={note.id}
            className="p-3 m-3 w-64 sm:w-72 h-30 hover:shadow-lg transition"
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex-shrink-0">
                <Image
                  src={note.previewSrc}
                  alt={note.title}
                  width={96}
                  height={64}
                  className="rounded-md object-cover"
                />
              </div>
              <div className="flex flex-col flex-grow">
                <h3 className="font-sans">{note.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {note.fileKind}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="mx-auto w-full max-w-5xl px-4" style={{ paddingBottom: footerH + 16 }}>

        <section className="mb-6" aria-label="Chat thread">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center  text-center text-lg font-semibold">
              Happy Learning Barath G!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => (
                <ChatBubble key={m.id} role={m.role} content={m.content} />
              ))}
            </div>
          )}
        </section>
      </div>

      <footer
        ref={footerRef}
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto w-full max-w-5xl px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-emerald-600 text-white">B</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex h-12 items-center rounded-full border border-neutral-300 bg-white pr-1 pl-4 shadow-sm">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask the bot about this document..."
                  className="h-10 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                  aria-label="Message the bot"
                />
                <Button
                  type="button"
                  onClick={handleSend}
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-full",
                    input.trim()
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300",
                  )}
                  aria-label="Send"
                  title="Send"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}



function ChatBubble({ role, content }) {
  const isUser = role === "user"
  return (
    <div className={cn("flex items-start gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="h-6 w-6">
          <AvatarFallback className="bg-neutral-200 text-neutral-700">A</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
          isUser ? "bg-emerald-600 text-white" : "bg-white text-neutral-900 shadow-sm border border-neutral-200",
        )}
      >
        {content}
      </div>
      {isUser && (
        <Avatar className="h-6 w-6">
          <AvatarFallback className="bg-emerald-600 text-white">B</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
