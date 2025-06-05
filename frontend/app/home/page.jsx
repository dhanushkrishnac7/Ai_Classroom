// "use client"

// import {
//   Brain,
//   Bell,
//   Plus,
//   Clock,
//   CheckCircle,
//   PenTool,
//   GraduationCap,
//   MessageSquare,
//   ChevronDown,
//   Rocket,
//   Zap,
//   Home,
//   BookOpen,
//   Users,
//   Calendar,
//   Settings,
//   Search,
//   User,
//   BarChart3,
//   FileText,
//   Award,
// } from "lucide-react"

// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import { Progress } from "@/components/ui/progress"
// import { Label } from "@/components/ui/label"
// import { Separator } from "@/components/ui/separator"
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb"
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarInput,
//   SidebarInset,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarProvider,
//   SidebarRail,
//   SidebarTrigger,
//   SidebarFooter,
// } from "@/components/ui/sidebar"





// const classrooms = [
//   {
//     id: 1,
//     name: "Advanced Mathematics",
//     teacher: "Dr. Smith",
//     students: 24,
//     color: "bg-gradient-to-br from-blue-500 to-blue-600",
//     assignments: 3,
//     nextClass: "Today 10:00 AM",
//     progress: 85,
//   },
//   {
//     id: 2,
//     name: "Physics Laboratory",
//     teacher: "Prof. Johnson",
//     students: 18,
//     color: "bg-gradient-to-br from-green-500 to-green-600",
//     assignments: 2,
//     nextClass: "Tomorrow 2:00 PM",
//     progress: 92,
//   },
//   {
//     id: 3,
//     name: "English Literature",
//     teacher: "Ms. Davis",
//     students: 22,
//     color: "bg-gradient-to-br from-purple-500 to-purple-600",
//     assignments: 1,
//     nextClass: "Today 1:00 PM",
//     progress: 78,
//   },
//   {
//     id: 4,
//     name: "World History",
//     teacher: "Mr. Wilson",
//     students: 20,
//     color: "bg-gradient-to-br from-orange-500 to-orange-600",
//     assignments: 4,
//     nextClass: "Friday 11:00 AM",
//     progress: 88,
//   },
//   {
//     id: 5,
//     name: "Chemistry",
//     teacher: "Dr. Brown",
//     students: 16,
//     color: "bg-gradient-to-br from-red-500 to-red-600",
//     assignments: 2,
//     nextClass: "Monday 9:00 AM",
//     progress: 95,
//   },
//   {
//     id: 6,
//     name: "Computer Science",
//     teacher: "Prof. Lee",
//     students: 28,
//     color: "bg-gradient-to-br from-teal-500 to-teal-600",
//     assignments: 5,
//     nextClass: "Today 3:00 PM",
//     progress: 82,
//   },
// ]

// const assignments = [
//   {
//     title: "Physics Lab Report",
//     subject: "Physics",
//     dueDate: "Tomorrow",
//     priority: "high",
//     progress: 60,
//     timeLeft: "18 hours",
//   },
//   {
//     title: "Math Problem Set",
//     subject: "Mathematics",
//     dueDate: "Friday",
//     priority: "medium",
//     progress: 30,
//     timeLeft: "3 days",
//   },
//   {
//     title: "History Essay",
//     subject: "History",
//     dueDate: "Next Week",
//     priority: "low",
//     progress: 10,
//     timeLeft: "7 days",
//   },
// ]

// const studyPlan = [
//   {
//     time: "9:00 AM",
//     subject: "Mathematics",
//     topic: "Calculus Review",
//     duration: "45 min",
//     type: "study",
//     status: "current",
//   },
//   {
//     time: "11:00 AM",
//     subject: "Physics",
//     topic: "Lab Preparation",
//     duration: "30 min",
//     type: "prep",
//     status: "upcoming",
//   },
//   {
//     time: "2:00 PM",
//     subject: "English",
//     topic: "Essay Writing",
//     duration: "60 min",
//     type: "assignment",
//     status: "upcoming",
//   },
//   {
//     time: "4:00 PM",
//     subject: "AI Tutor",
//     topic: "Q&A Session",
//     duration: "20 min",
//     type: "ai",
//     status: "upcoming",
//   },
// ]



// export default function HomePage() {
//   return (
//     <SidebarProvider>
      
//       <SidebarInset>
//         {/* Top Navigation Header */}
//         <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
//           <SidebarTrigger className="-ml-1" />
//           <Separator orientation="vertical" className="mr-2 h-4" />
//           <Breadcrumb>
//             <BreadcrumbList>
//               <BreadcrumbItem className="hidden md:block">
//                 <BreadcrumbLink href="#">AI Classroom</BreadcrumbLink>
//               </BreadcrumbItem>
//               <BreadcrumbSeparator className="hidden md:block" />
//               <BreadcrumbItem>
//                 <BreadcrumbPage>Dashboard</BreadcrumbPage>
//               </BreadcrumbItem>
//             </BreadcrumbList>
//           </Breadcrumb>

//           <div className="ml-auto flex items-center space-x-4">
//             <nav className="hidden md:flex items-center space-x-4">
//               <Button variant="ghost" className="text-blue-600 bg-blue-50">
//                 Launchpad
//               </Button>
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="ghost" className="text-slate-600">
//                     Spaces <ChevronDown className="h-4 w-4 ml-1" />
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent>
//                   <DropdownMenuItem>My Spaces</DropdownMenuItem>
//                   <DropdownMenuItem>Shared Spaces</DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//               <Button variant="ghost" className="text-slate-600">
//                 Tools
//               </Button>
//               <Button variant="ghost" className="text-slate-600">
//                 Assistants
//               </Button>
//             </nav>

//             <Button variant="outline" className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700">
//               <Rocket className="h-4 w-4 mr-2" />
//               Launch a Space
//             </Button>
//             <Button variant="ghost" size="sm">
//               <Bell className="h-4 w-4" />
//             </Button>
//           </div>
//         </header>

//         {/* Greeting Section */}
//         <div className="px-6 py-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
//           <h1 className="text-2xl font-bold text-slate-900 mb-2">Good morning, Alex! 👋</h1>
//           <p className="text-slate-600">
//             Ready to learn something new today? You have 3 assignments due this week and 2 AI study sessions scheduled.
//           </p>
//         </div>

//         {/* Main Content */}
//         <div className="flex-1 p-6 space-y-8 bg-slate-50/30">
//           {/* Classrooms Grid - Google Classroom Style */}
//           <section>
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-xl font-semibold text-slate-900">My Classrooms</h2>
//               <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
//                 <Plus className="h-4 w-4 mr-2" />
//                 Join Class
//               </Button>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {classrooms.map((classroom) => (
//                 <Card
//                   key={classroom.id}
//                   className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer border-0 shadow-md"
//                 >
//                   <div className={`h-28 ${classroom.color} relative`}>
//                     <div className="absolute inset-0 bg-black/10"></div>
//                     <div className="absolute bottom-4 left-4 text-white">
//                       <h3 className="font-semibold text-lg">{classroom.name}</h3>
//                       <p className="text-sm opacity-90">{classroom.teacher}</p>
//                     </div>
//                     {classroom.assignments > 0 && (
//                       <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600">
//                         {classroom.assignments} due
//                       </Badge>
//                     )}
//                   </div>
//                   <CardContent className="p-4">
//                     <div className="space-y-3">
//                       <div className="flex items-center justify-between text-sm text-slate-600">
//                         <span>{classroom.students} students</span>
//                         <span>{classroom.nextClass}</span>
//                       </div>
//                       <div className="space-y-1">
//                         <div className="flex items-center justify-between text-xs text-slate-500">
//                           <span>Progress</span>
//                           <span>{classroom.progress}%</span>
//                         </div>
//                         <Progress value={classroom.progress} className="h-2" />
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </section>

//           {/* Assignments Section */}
//           <section>
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-xl font-semibold text-slate-900">Upcoming Assignments</h2>
//               <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
//                 View All
//               </Button>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {assignments.map((assignment, index) => (
//                 <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
//                   <CardContent className="p-6">
//                     <div className="space-y-4">
//                       <div className="flex items-start justify-between">
//                         <div className="space-y-1">
//                           <h3 className="font-semibold text-slate-900">{assignment.title}</h3>
//                           <p className="text-sm text-slate-600">{assignment.subject}</p>
//                         </div>
//                         <Badge
//                           variant={
//                             assignment.priority === "high"
//                               ? "destructive"
//                               : assignment.priority === "medium"
//                                 ? "default"
//                                 : "secondary"
//                           }
//                         >
//                           {assignment.dueDate}
//                         </Badge>
//                       </div>
//                       <div className="space-y-2">
//                         <div className="flex items-center justify-between text-sm">
//                           <span className="text-slate-600">Progress</span>
//                           <span className="font-medium">{assignment.progress}%</span>
//                         </div>
//                         <Progress value={assignment.progress} className="h-2" />
//                       </div>
//                       <div className="flex items-center justify-between text-xs text-slate-500">
//                         <span>{assignment.timeLeft} left</span>
//                         <Clock className="h-3 w-3" />
//                       </div>
//                       <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
//                         <PenTool className="h-4 w-4 mr-2" />
//                         Continue Work
//                       </Button>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </section>

//           {/* Study Plan Section */}
//           <section>
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-xl font-semibold text-slate-900">Today's Study Plan</h2>
//               <Button variant="outline" size="sm" className="border-purple-200 text-purple-600 hover:bg-purple-50">
//                 <Brain className="h-4 w-4 mr-2" />
//                 AI Optimize
//               </Button>
//             </div>
//             <Card className="border-0 shadow-md">
//               <CardContent className="p-6">
//                 <div className="space-y-4">
//                   {studyPlan.map((item, index) => (
//                     <div
//                       key={index}
//                       className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all ${
//                         item.status === "current"
//                           ? "border-blue-200 bg-blue-50"
//                           : "border-slate-200 bg-white hover:border-slate-300"
//                       }`}
//                     >
//                       <div className="text-sm font-medium text-slate-600 min-w-[70px]">{item.time}</div>
//                       <div className="flex-1">
//                         <div className="flex items-center space-x-2 mb-1">
//                           <h4 className="font-semibold text-slate-900">{item.subject}</h4>
//                           <Badge
//                             variant="outline"
//                             className={
//                               item.type === "ai"
//                                 ? "bg-purple-100 text-purple-700 border-purple-200"
//                                 : item.type === "assignment"
//                                   ? "bg-red-100 text-red-700 border-red-200"
//                                   : "bg-blue-100 text-blue-700 border-blue-200"
//                             }
//                           >
//                             {item.type}
//                           </Badge>
//                         </div>
//                         <p className="text-sm text-slate-600">{item.topic}</p>
//                       </div>
//                       <div className="text-sm text-slate-500">{item.duration}</div>
//                       <Button
//                         size="sm"
//                         variant={item.status === "current" ? "default" : "outline"}
//                         className={item.status === "current" ? "bg-blue-600 hover:bg-blue-700" : ""}
//                       >
//                         {item.status === "current" ? (
//                           <>
//                             <Zap className="h-4 w-4 mr-1" />
//                             Start
//                           </>
//                         ) : (
//                           <CheckCircle className="h-4 w-4" />
//                         )}
//                       </Button>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </section>
//         </div>
//       </SidebarInset>
//     </SidebarProvider>
//   )
// }

"use client"
import React from 'react'

function page() {
  return (
    <div>page</div>
  )
}

export default page