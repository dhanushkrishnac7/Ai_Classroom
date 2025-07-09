"use client"

import { ChevronDown, ChevronRight, Settings, User, BookOpen, Users, Crown, Shield, GraduationCap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar"

const classData = {
  user: {
    name: "Alex Chen",
    grade: "Grade 10",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  classes: [
    {
      id: "math",
      title: "Teaching",
      icon: User,
      role: "Teacher",
      isOpen: false,
      classes: [
        {
          id: "algebra",
          title: "Algebra II",
          role: "Teacher",
        },
        {
          id: "geometry",
          title: "Geometry",
          role: "Techer",
           
        },
      ],
    },
    {
      id: "science",
      title: "Admin",
      icon: Crown,
      role: "admin",
      isOpen: false,
      classes: [
        {
          id: "chemistry",
          title: "Chemistry",
          role: "admin",
        },
        {
          id: "physics",
          title: "Physics",
          role: "admin",
          
        },
      ],
    },
    {
      id: "english",
      title: "My classes",
      icon: GraduationCap,
      role: "student",
      isOpen: false,
      classes: [
        {
          id: "literature",
          title: "English Literature",
          role: "student",
      
        },
      ],
    },
  ],
}
function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="text-base "> 
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground text-lg hover:bg-purple-100 hover:text-purple-700 transition-colors" 
            >
              <div className="flex aspect-square size-10 items-center justify-center rounded-lg "> 
                <BookOpen className="size-6" /> 
              </div>
              <div className="grid flex-1 text-left text-lg leading-tight">  
                <span className="truncate font-semibold">AI Classroom</span>
                
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {classData.classes.map((classCategory) => (
                <Collapsible key={classCategory.id} defaultOpen className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="w-full justify-between text-base hover:bg-purple-100 hover:text-purple-700 transition-colors">  
                        <div className="flex items-center gap-2">
                          <classCategory.icon className="h-5 w-5" />  
                          <span>{classCategory.title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                         
                          <ChevronRight className="h-5 w-5 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </div>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {classCategory.classes.map((individualClass) => (
                          <SidebarMenuSubItem key={individualClass.id}>
                            <SidebarMenuSubButton
                              asChild
                              className="hover:bg-purple-100 hover:text-purple-700 transition-colors"
                            >
                              <a
                                href={`dashboard/classes/${individualClass.id}`}
                                className="flex items-center justify-between w-full text-base"  
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{individualClass.title}</div>
                                  </div>
                                </div>
 
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground text-lg"  
                >
                  <Avatar className="h-10 w-10 rounded-lg">  
                    <AvatarImage src={classData.user.avatar || "/placeholder.svg"} alt={classData.user.name} />
                    <AvatarFallback className="rounded-lg bg-blue-100 text-blue-600">AC</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-lg leading-tight"> 
                    <span className="truncate font-semibold">{classData.user.name}</span>
                    <span className="truncate text-base">{classData.user.grade}</span>
                  </div>
                  <ChevronDown className="ml-auto size-5" />  
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg text-base"  
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <User className="mr-2 h-5 w-5" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-5 w-5" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar
