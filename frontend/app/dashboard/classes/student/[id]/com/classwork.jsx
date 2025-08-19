"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { MoreVertical, Calendar as CalendarIcon, Activity as Assignment } from "lucide-react";
import { useRouter } from "next/navigation";

function Classwork({ classroomData, classInfo, loading }) {
  const router = useRouter();
  const [date, setDate] = React.useState();

  if (loading || !classroomData || !classroomData.all_content) {
    return <div>Loading classwork...</div>;
  }

  const { instructor } = classInfo;

  const handleCardClick = (post) => {
    const searchParams = new URLSearchParams({
      type: post.type,
      title: post.title,
      documents: JSON.stringify(post.documents),
      instructor: instructor || 'Instructor'
    });

    router.push(`/dashboard/classes/student/chat/${post.id}?${searchParams.toString()}`);
  };

  // ✅ MODIFIED: Added .filter() to only include items where type is 'work'
  const classworkItems = classroomData.all_content
    .filter(item => item.type === 'work')
    .map(work => {
      const dueDate = new Date(work.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isOverdue = dueDate < today;

      return {
        id: work.work_id,
        title: work.work_title,
        type: "Assignment", // Since we only show 'work', we can hardcode this
        displayDueDate: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        status: isOverdue ? "Overdue" : "Upcoming",
        isOverdue: isOverdue,
        documents: work.documents || []
      };
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Classwork</h2>
        {/* Filter UI can be kept or removed depending on your needs */}
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
          <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleCardClick(item)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <Assignment className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {item.type}
                      </Badge>
                      <span className="text-sm text-gray-500">Due {item.displayDueDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
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