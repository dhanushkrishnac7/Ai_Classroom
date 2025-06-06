"use client"

import { Bell, ChevronDown, Rocket } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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

function StaticHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden xl:block">
            <BreadcrumbLink href="#">AI Classroom</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden xl:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center space-x-4">
        <nav className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" className="text-blue-600 bg-blue-50">
            Launchpad
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-slate-600">
                Spaces <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>My Spaces</DropdownMenuItem>
              <DropdownMenuItem>Shared Spaces</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" className="text-slate-600">
            Tools
          </Button>

          <Button variant="ghost" className="text-slate-600">
            Assistants
          </Button>
        </nav>

        <Button variant="outline" className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700">
          <Rocket className="h-4 w-4 mr-2" />
          Launch a Space
        </Button>

        <Button variant="ghost" size="sm">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}

export default StaticHeader