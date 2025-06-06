"use client"
import classrooms from './menu'
import {Plus} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"


function classes() {
  return (
    <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">My Classrooms</h2>
              <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                <Plus className="h-4 w-4 mr-2" />
                Join Class
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classrooms.map((classroom) => (
                <Card
                  key={classroom.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer border-0 shadow-md"
                >
                  <div className={`h-28 ${classroom.color} relative`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-semibold text-lg">{classroom.name}</h3>
                      <p className="text-sm opacity-90">{classroom.teacher}</p>
                    </div>
                    {classroom.assignments > 0 && (
                      <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600">
                        {classroom.assignments} due
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>{classroom.students} students</span>
                        <span>{classroom.nextClass}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Progress</span>
                          <span>{classroom.progress}%</span>
                        </div>
                        <Progress value={classroom.progress} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

  )
}

export default classes