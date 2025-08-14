"use client"
import Link from 'next/link';
import React from 'react';
import {
  ChevronDown,
  ChevronRight,
  Settings,
  User,
  BookOpen,
  Crown,
  GraduationCap,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { useContext } from "react"
import { fetchdata } from "../../layout"

function AppSidebar() {
  const { dashboardResponse, user } = useContext(fetchdata)
  console.log("user", user)

  // Helper function to generate consistent colors and create URL with parameters
  const createClassUrl = (cls, role) => {
    const generateClassColor = (className, classId) => {
      const colors = [
        '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
        '#3b82f6', '#ef4444', '#f97316', '#84cc16', '#06b6d4'
      ];
      const seed = className || classId || '';
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    };

    const queryParams = new URLSearchParams({
      name: cls.classroomName || '',
      title: cls.classroomName || '',
      instructor: cls.ownerName || '',
      color: generateClassColor(cls.classroomName, cls.classroomId)
    });

    return `/dashboard/classes/${role}/${cls.classroomId}?${queryParams.toString()}`;
  };


  return (
    <Sidebar collapsible="icon" className="text-base">

      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground text-lg hover:bg-purple-100 hover:text-purple-700 transition-colors"
            >
              <div className="flex aspect-square size-10 items-center justify-center rounded-lg">
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

              <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild className="h-13">
                    <SidebarMenuButton className="flex justify-between items-center data-[state=active]:text-purple-700 data-[state=active]:bg-purple-100 hover:bg-purple-100 hover:text-purple-700 ">
                      <div className="flex gap-2 items-center">
                        <User className="size-5" />
                        <span className="text-lg p-4">Teaching</span>
                      </div>
                      <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="p-3 ml-6 mt-1 space-y-1">
                    {dashboardResponse?.ownedClassrooms?.map((cls) => (
                      <SidebarMenuButton
                        key={cls.classroomId}
                        className="text-sm hover:bg-purple-100 hover:text-purple-700"
                        asChild
                      >
                        <Link href={createClassUrl(cls, 'teacher')}>
                          {cls.classroomName}
                        </Link>
                      </SidebarMenuButton>
                    ))}
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>


              <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild className="h-13">
                    <SidebarMenuButton className="flex justify-between items-center hover:bg-purple-100 hover:text-purple-700">
                      <div className="flex gap-2 items-center">
                        <Crown className="size-5" />
                        <span className="text-lg p-4">Admin</span>
                      </div>
                      <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="p-3 ml-6 mt-1 space-y-1">
                    {dashboardResponse?.enrolledAsAdmins?.map((cls) => (
                      <SidebarMenuButton
                        key={cls.classroomId}
                        className="text-sm hover:bg-purple-100 hover:text-purple-700"
                        asChild
                      >
                        <Link href={createClassUrl(cls, 'admin')}>
                          {cls.classroomName}{" "}
                          <span className="text-xs text-muted-foreground">(by {cls.ownerName})</span>
                        </Link>
                      </SidebarMenuButton>
                    ))}
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>


              <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild className="h-13">
                    <SidebarMenuButton className="flex justify-between items-center hover:bg-purple-100 hover:text-purple-700">
                      <div className="flex gap-2 items-center">
                        <GraduationCap className="size-5" />
                        <span className="text-lg p-4">Learning</span>
                      </div>
                      <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="p-3 ml-6  mt-1 space-y-1">
                    {dashboardResponse?.enrolledAsStudents?.map((cls) => (
                      <SidebarMenuButton
                        key={cls.classroomId}
                        className="text-sm hover:bg-purple-100 hover:text-purple-700"
                        asChild
                      >
                        <Link href={createClassUrl(cls, 'student')}>
                          {cls.classroomName}{" "}
                          <span className="text-xs text-muted-foreground">(by {cls.ownerName})</span>
                        </Link>
                      </SidebarMenuButton>
                    ))}
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
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
                    <AvatarImage
                      src={user?.user_metadata?.avatar_url}
                      alt={user?.user_metadata?.avatar_url}
                    />
                    <AvatarFallback className="rounded-lg bg-blue-100 text-blue-600">
                      AC
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-lg leading-tight">
                    <span className="truncate font-semibold">{dashboardResponse?.userName}</span>

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
