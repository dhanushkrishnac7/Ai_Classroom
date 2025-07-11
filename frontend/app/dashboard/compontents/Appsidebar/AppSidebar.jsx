"use client"

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
  const { dashboardResponse ,user} = useContext(fetchdata)
console.log("user",user)
  

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
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="flex justify-between items-center hover:bg-purple-100 hover:text-purple-700">
                      <div className="flex gap-2 items-center">
                        <User className="h-4 w-4" />
                        <span>Teaching</span>
                      </div>
                      <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="ml-6 mt-1 space-y-1">
                    {dashboardResponse?.ownedClassrooms?.map((cls) => (
                      <SidebarMenuButton
                        key={cls}
                        className="text-sm hover:bg-purple-100 hover:text-purple-700"
                      >
                        {cls}
                      </SidebarMenuButton>
                    ))}
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              
              <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="flex justify-between items-center hover:bg-purple-100 hover:text-purple-700">
                      <div className="flex gap-2 items-center">
                        <Crown className="h-4 w-4" />
                        <span>Admin</span>
                      </div>
                      <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="ml-6 mt-1 space-y-1">
                    {dashboardResponse?.enrolledClassroomsAsAdmins?.map((cls) => (
                      <SidebarMenuButton
                        key={cls.classroomName}
                        className="text-sm hover:bg-purple-100 hover:text-purple-700"
                      >
                        {cls.classroomName}{" "}
                        <span className="text-xs text-muted-foreground">(by {cls.ownerName})</span>
                      </SidebarMenuButton>
                    ))}
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              
              <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="flex justify-between items-center hover:bg-purple-100 hover:text-purple-700">
                      <div className="flex gap-2 items-center">
                        <GraduationCap className="h-4 w-4" />
                        <span>My Classes</span>
                      </div>
                      <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="ml-6 mt-1 space-y-1">
                    {dashboardResponse?.enrolledClassroomsAsStudents?.map((cls) => (
                      <SidebarMenuButton
                        key={cls.classroomName}
                        className="text-sm hover:bg-purple-100 hover:text-purple-700"
                      >
                        {cls.classroomName}{" "}
                        <span className="text-xs text-muted-foreground">(by {cls.ownerName})</span>
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
                      src= {user?.user_metadata?.avatar_url}
                      alt={user?.user_metadata?.avatar_url}
                    />
                    <AvatarFallback className="rounded-lg bg-blue-100 text-blue-600">
                      AC
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-lg leading-tight">
                    <span className="truncate font-semibold">{user?.user_metadata?.user_name|| user?.user_metadata?.name}</span>
                    
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
