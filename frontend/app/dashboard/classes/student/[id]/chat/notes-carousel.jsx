"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NoteAttachmentCard } from "./note-attachment-card"
import { cn } from "@/lib/utils"

export default function NotesCarousel({ notes = [], className }) {
    const containerRef = useRef(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    // Track scroll bounds to toggle arrows
    const updateScrollState = () => {
        const el = containerRef.current
        if (!el) return
        setCanScrollLeft(el.scrollLeft > 0)
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }

    useEffect(() => {
        updateScrollState()
        const el = containerRef.current
        if (!el) return
        const onScroll = () => updateScrollState()
        el.addEventListener("scroll", onScroll, { passive: true })
        const ro = new ResizeObserver(updateScrollState)
        ro.observe(el)
        return () => {
            el.removeEventListener("scroll", onScroll)
            ro.disconnect()
        }
    }, [])

    const scrollByCards = (dir) => {
        const el = containerRef.current
        if (!el) return
        const cardWidth = 360 // min card width
        const delta = dir === "left" ? -cardWidth : cardWidth
        el.scrollBy({ left: delta, behavior: "smooth" })
    }

    // Translate vertical wheel to horizontal for easier scrolling
    const onWheel = (e) => {
        const el = containerRef.current
        if (!el) return
        if (!e.shiftKey && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault()
            el.scrollLeft += e.deltaY
        }
    }

    // Click-and-drag (pointer) scroll
    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        let isDown = false
        let startX = 0
        let scrollLeft = 0

        const down = (e) => {
            isDown = true
            startX = e.clientX
            scrollLeft = el.scrollLeft
            el.setPointerCapture(e.pointerId)
            el.style.cursor = "grabbing"
        }
        const move = (e) => {
            if (!isDown) return
            const walk = e.clientX - startX
            el.scrollLeft = scrollLeft - walk
        }
        const up = (e) => {
            isDown = false
            try {
                el.releasePointerCapture(e.pointerId)
            } catch { }
            el.style.cursor = ""
        }

        el.addEventListener("pointerdown", down)
        el.addEventListener("pointermove", move)
        el.addEventListener("pointerup", up)
        el.addEventListener("pointercancel", up)
        return () => {
            el.removeEventListener("pointerdown", down)
            el.removeEventListener("pointermove", move)
            el.removeEventListener("pointerup", up)
            el.removeEventListener("pointercancel", up)
        }
    }, [])

    // Keyboard arrows
    const onKeyDown = (e) => {
        if (e.key === "ArrowRight") {
            e.preventDefault()
            scrollByCards("right")
        } else if (e.key === "ArrowLeft") {
            e.preventDefault()
            scrollByCards("left")
        }
    }

    return (
        <div className={cn("relative", className)}>
            {/* Edge gradients */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent" />

            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0"
                    onClick={() => scrollByCards("left")}
                    disabled={!canScrollLeft}
                    aria-label="Scroll notes left"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div
                    ref={containerRef}
                    onWheel={onWheel}
                    onKeyDown={onKeyDown}
                    tabIndex={0}
                    aria-label="Notes carousel"
                    className={cn(
                        "flex w-full snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus:outline-none",
                    )}
                >
                    {notes.length === 0 ? (
                        <div className="text-sm text-neutral-500">No notes yet.</div>
                    ) : (
                        notes.map((n) => <NoteAttachmentCard key={n.id} note={n} className="min-w-[360px] snap-start" />)
                    )}
                </div>

                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0"
                    onClick={() => scrollByCards("right")}
                    disabled={!canScrollRight}
                    aria-label="Scroll notes right"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
