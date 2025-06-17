"use client"
import Classes from "./compontents/Classes/classes"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../libs/supabaseclient"
import {
  Brain,
  Clock,
  CheckCircle,
  PenTool,
  Zap,

} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SidebarInset,SidebarProvider} from "@/components/ui/sidebar"

const assignments = [
  {
    title: "Physics Lab Report",
    subject: "Physics",
    dueDate: "Tomorrow",
    priority: "high",
    progress: 60,
    timeLeft: "18 hours",
  },
  {
    title: "Math Problem Set",
    subject: "Mathematics",
    dueDate: "Friday",
    priority: "medium",
    progress: 30,
    timeLeft: "3 days",
  },
  {
    title: "History Essay",
    subject: "History",
    dueDate: "Next Week",
    priority: "low",
    progress: 10,
    timeLeft: "7 days",
  },
]
const studyPlan = [
  {
    time: "9:00 AM",
    subject: "Mathematics",
    topic: "Calculus Review",
    duration: "45 min",
    type: "study",
    status: "current",
  },
  {
    time: "11:00 AM",
    subject: "Physics",
    topic: "Lab Preparation",
    duration: "30 min",
    type: "prep",
    status: "upcoming",
  },
  {
    time: "2:00 PM",
    subject: "English",
    topic: "Essay Writing",
    duration: "60 min",
    type: "assignment",
    status: "upcomin<classes/>g",
  },
  {
    time: "4:00 PM",
    subject: "AI Tutor",
    topic: "Q&A Session",
    duration: "20 min",
    type: "ai",
    status: "upcoming",
  },
]



export default function HomePage() {
const [showstudentform , setshowstudentform] = useState(false);
useEffect(()=>{
  const fetch = async ()=>{
    console.log("get token.....")
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1]
    console.log("now fetching")
    const res = await fetch("https://localhost:8000/dasboard",{
      method:'GET',
      headers:{
        'Authorization':`Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })
    console.log("got it")
    if(res.status === 440){
      setshowstudentform(true);
    }
    
  } 
fetch()},[])
  return (
    <SidebarProvider>
      
      <SidebarInset>
        
        <div className="px-6 py-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Good morning, Alex! 👋</h1>
          <p className="text-slate-600">
            Ready to learn something new today? You have 3 assignments due this week and 2 AI study sessions scheduled.
          </p>
        </div>

   
        <div className="flex-1 p-6 space-y-8 bg-slate-50/30">
  
          <Classes/>
          {/* Assignments Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Upcoming Assignments</h2>
              <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {assignments.map((assignment, index) => (
                <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-slate-900">{assignment.title}</h3>
                          <p className="text-sm text-slate-600">{assignment.subject}</p>
                        </div>
                        <Badge
                          variant={
                            assignment.priority === "high"
                              ? "destructive"
                              : assignment.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {assignment.dueDate}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Progress</span>
                          <span className="font-medium">{assignment.progress}%</span>
                        </div>
                        <Progress value={assignment.progress} className="h-2" />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{assignment.timeLeft} left</span>
                        <Clock className="h-3 w-3" />
                      </div>
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                        <PenTool className="h-4 w-4 mr-2" />
                        Continue Work
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Study Plan Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Today's Study Plan</h2>
              <Button variant="outline" size="sm" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                <Brain className="h-4 w-4 mr-2" />
                AI Optimize
              </Button>
            </div>
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {studyPlan.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all ${
                        item.status === "current"
                          ? "border-blue-200 bg-blue-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="text-sm font-medium text-slate-600 min-w-[70px]">{item.time}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-slate-900">{item.subject}</h4>
                          <Badge
                            variant="outline"
                            className={
                              item.type === "ai"
                                ? "bg-purple-100 text-purple-700 border-purple-200"
                                : item.type === "assignment"
                                  ? "bg-red-100 text-red-700 border-red-200"
                                  : "bg-blue-100 text-blue-700 border-blue-200"
                            }
                          >
                            {item.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{item.topic}</p>
                      </div>
                      <div className="text-sm text-slate-500">{item.duration}</div>
                      <Button
                        size="sm"
                        variant={item.status === "current" ? "default" : "outline"}
                        className={item.status === "current" ? "bg-blue-600 hover:bg-blue-700" : ""}
                      >
                        {item.status === "current" ? (
                          <>
                            <Zap className="h-4 w-4 mr-1" />
                            Start
                          </>
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
