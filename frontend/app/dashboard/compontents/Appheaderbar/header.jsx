"use client"

import { useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { CreateClassModal } from "./CreateClassModal"

function StaticHeader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const name = searchParams.get("title")

  const currentPage = name

  const handleCreateClass = (classData) => {
    console.log("Creating class:", classData)
  
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-2 border-b px-4 bg-white/95 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden xl:block">
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden xl:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{currentPage}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center space-x-4">

        <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" />
        </Button>


      </div>

      <CreateClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateClass}
      />
    </header>
  )
}

export default StaticHeader
