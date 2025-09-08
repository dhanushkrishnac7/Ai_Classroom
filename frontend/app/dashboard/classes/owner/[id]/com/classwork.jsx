"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Activity as Assignment, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { CreateContentModal } from "./CreateContentModal";

function Classwork({ classroomData, classInfo, loading, classroomId, onRefresh }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

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

  const handleContentCreate = (contentData) => {
    console.log("Content created:", contentData);
    // Refresh the classroom data to show the new content
    if (onRefresh) {
      onRefresh();
    }
  };


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
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
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

      <CreateContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleContentCreate}
        classroomId={classroomId}
      />
    </div>
  );
}

export default Classwork;