"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams, useParams } from "next/navigation"
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


  const searchParams = useSearchParams()
  const params = useParams()


  const postId = params.chat
  const postType = searchParams.get('type')
  const postTitle = searchParams.get('title')
  const documentsParam = searchParams.get('documents')
  const instructor = searchParams.get('instructor')
  console.log("yes----->", instructor)

  let documents = []
  try {
    documents = documentsParam ? JSON.parse(documentsParam) : []
  } catch (error) {
    console.error('Error parsing documents:', error)
    documents = []
  }


  useEffect(() => {
    if (documents.length > 0) {
      documents.forEach((doc, index) => {
        console.log(`Document ${index + 1}:`, {
          id: doc.document_id,
          name: doc.document_name,
          url: doc.document_url
        })
      })
    }
  }, [postId, postType, postTitle, documents])


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


  const getFileKind = (fileName) => {
    if (!fileName) return "Document"
    const extension = fileName.split('.').pop()?.toLowerCase()

    switch (extension) {
      case 'pdf':
        return "PDF"
      case 'doc':
      case 'docx':
        return "Word Doc"
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return "Image"
      case 'txt':
        return "Text File"
      case 'md':
        return "Markdown"
      case 'ppt':
      case 'pptx':
        return "PowerPoint"
      case 'xls':
      case 'xlsx':
        return "Excel"
      default:
        return "Document"
    }
  }


  const notes = useMemo(() => {
    if (documents.length === 0) {
      return []
    }
    return documents.map((doc, index) => ({
      id: doc.document_id || `doc-${index}`,
      title: doc.document_name || `Document ${index + 1}`,
      subtitle: postTitle || "Study Material",
      previewSrc: doc.document_url || "/placeholder.svg?height=64&width=96",
      href: doc.document_url || "#",
      meta: `From ${postType || 'post'}`,
      fileKind: getFileKind(doc.document_name),
    }))
  }, [documents, postTitle, postType])

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
            <div
              className="rounded-full p-2"
              style={{ background: "linear-gradient(135deg, #2563eb, #9333ea)" }}
            >
              <FileText className="h-5 w-5 text-white" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h1 className="truncate text-lg font-semibold text-neutral-900">{postTitle || "Document Chat"}</h1>
                <button
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
                  aria-label="More actions"
                >
                  <EllipsisVertical className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-neutral-500">
                {instructor || 'Instructor'} • {postType === 'work' ? 'Assignment' : 'Post'}
              </p>
            </div>
          </div>
        </div>
        <Separator />
      </header>


      <section className="flex flex-wrap w-full max-w-8xl item-center justify-center py-8">
        {notes.length > 0 ? (
          notes.map((note) => (
            <Card
              key={note.id}
              className="p-3 m-3 w-64 sm:w-72 h-30 hover:shadow-lg transition cursor-pointer"
              onClick={() => window.open(note.href, '_blank')}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-shrink-0">
                  {note.fileKind === "PDF" ? (
                    <div className="w-24 h-16 bg-red-50 border-2 border-red-200 rounded-md flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="h-6 w-6 text-red-600 mx-auto mb-1" />
                        <span className="text-xs text-red-600 font-medium">PDF</span>
                      </div>
                    </div>
                  ) : note.previewSrc.startsWith('http') ? (
                    <img
                      src={note.previewSrc}
                      alt={note.title}
                      width={96}
                      height={64}
                      className="rounded-md object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg?height=64&width=96"
                      }}
                    />
                  ) : (
                    <Image
                      src={note.previewSrc}
                      alt={note.title}
                      width={96}
                      height={64}
                      className="rounded-md object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-col flex-grow min-w-0">
                  <h3 className="font-sans text-sm font-medium truncate leading-tight">{note.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {note.fileKind}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {note.meta}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No documents available for this post</p>
          </div>
        )}
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
        className="fixed right-4 left-64 bottom-6 z-40 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 rounded-t-xl transition-all duration-300 ease-in-out"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto w-full max-w-5xl px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback
                className="text-white"
                style={{ background: "linear-gradient(135deg, #2563eb, #9333ea)" }}
              >
                B
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex h-12 items-center rounded-full border border-neutral-300 bg-white pr-1 pl-4 focus-within:border-blue-500 transition-all duration-200 ease-in-out">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask the bot about this document..."
                  className="h-10 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 transition-all duration-200 ease-in-out"
                  aria-label="Message the bot"
                />
                <Button
                  type="button"
                  onClick={handleSend}
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-full transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95",
                    input.trim()
                      ? "text-white"
                      : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300",
                  )}
                  style={input.trim() ? { background: "linear-gradient(135deg, #2563eb, #9333ea)" } : {}}
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
          isUser ? "text-white" : "bg-white text-neutral-900 shadow-sm border border-neutral-200",
        )}
        style={isUser ? { background: "linear-gradient(135deg, #2563eb, #9333ea)" } : {}}
      >
        {content}
      </div>
      {isUser && (
        <Avatar className="h-6 w-6">
          <AvatarFallback
            className="text-white"
            style={{ background: "linear-gradient(135deg, #2563eb, #9333ea)" }}
          >
            {localStorage.getItem('user') ?
              JSON.parse(localStorage.getItem('user')).name?.charAt(0).toUpperCase() || 'U' :
              'B'
            }
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
