"use client"

import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function NoteAttachmentCard({
  note = {
    id: "default",
    title: "Untitled Note",
    subtitle: "Note",
    href: "#",
    previewSrc: "/placeholder.svg?height=64&width=96",
    meta: "Just now",
    fileKind: "Doc",
  },
  className,
}) {
  return (
    <Card
      className={cn("group flex items-center gap-3 overflow-hidden border-neutral-200 p-2 hover:shadow-sm", className)}
    >
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
        {/* Above-the-fold card images can use priority if critical; here we keep lazy default [^2] */}
        <Image
          src={note.previewSrc || "/placeholder.svg?height=64&width=96&query=note%20preview"}
          alt={`${note.title} preview`}
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <Link href={note.href || "#"} className="line-clamp-1 font-medium text-neutral-900 hover:underline">
          {note.title}
        </Link>
        <p className="line-clamp-1 text-xs text-neutral-500">{note.subtitle}</p>
        <p className="mt-1 text-xs text-neutral-400">
          {note.fileKind ? `${note.fileKind} • ` : ""}
          {note.meta}
        </p>
      </div>
    </Card>
  )
}
