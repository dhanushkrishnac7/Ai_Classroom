"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { FileText, BookOpen, MoreVertical, Calendar as CalendarIcon, Activity as Assignment } from "lucide-react";

function Classwork({ classroomData, classInfo, loading }) {
  const [date, setDate] = React.useState();

  // Transform the classroomData prop into the format needed by the UI
  const classworkItems = (classroomData?.upcoming_deadlines || []).map(work => {
    const dueDate = new Date(work.due_date);
    const today = new Date();
    
    // Remove the time part for accurate date comparison
    today.setHours(0, 0, 0, 0); 
    
    const isOverdue = dueDate < today;

    return {
      id: work.work_id,
      title: work.work_title,
      // Defaulting type to "Assignment" as the data is from "upcoming_deadlines"
      type: "Assignment", 
      // Format the date for display, e.g., "Aug 20"
      displayDueDate: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      status: isOverdue ? "Overdue" : "Upcoming",
      isOverdue: isOverdue,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Classwork</h2>
        <div className="flex space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Filter by date
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="sm">
            All topics
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {classworkItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    {/* This logic can be expanded if your API provides a work_type */}
                    {item.type === "Assignment" && <Assignment className="w-5 h-5 text-teal-600" />}
                    {item.type === "Material" && <FileText className="w-5 h-5 text-teal-600" />}
                    {item.type === "Test" && <BookOpen className="w-5 h-5 text-teal-600" />}
                  </div>
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {item.type}
                      </Badge>
                      {/* Updated to show the due date, which is more relevant */}
                      <span className="text-sm text-gray-500">Due {item.displayDueDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    // Updated logic to show destructive for overdue, default for upcoming
                    variant={item.isOverdue ? "destructive" : "default"}
                    className="text-xs"
                  >
                    {item.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Classwork;