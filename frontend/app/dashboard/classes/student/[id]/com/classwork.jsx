"use client"; 

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { FileText, BookOpen, MoreVertical, Calendar as CalendarIcon, ActivityIcon as Assignment } from "lucide-react";

function Classwork() {
  
  const [date, setDate] = React.useState();

  const classworkItems = [
    {
      title: "Assignment 1 - Lexical Analyzer Implementation",
      description: "Create a lexical analyzer for a simple programming language with detailed documentation.",
      type: "Assignment",
      date: "Jul 22",
      dueDate: "Jul 29",
      status: "Due Soon",
      priority: "high",
      submissions: 45,
      totalStudents: 61,
      points: 100,
      isOverdue: false,
    },
    {
      title: "Unit 1 Question Bank",
      description: "Comprehensive question bank covering lexical analysis, regular expressions, and finite automata.",
      type: "Material",
      date: "Jul 22",
      status: "Available",
      priority: "medium",
      downloads: 58,
      points: null,
      attachments: ["QuestionBank.pdf", "Solutions.pdf"],
    },
    {
      title: "Mid-term Examination",
      description: "Comprehensive exam covering Units 1-3. Duration: 2 hours. Closed book examination.",
      type: "Test",
      date: "Aug 15",
      status: "Scheduled",
      priority: "high",
      duration: "2 hours",
      points: 50,
      isUpcoming: true,
    },
    {
      title: "Unit 1 Lecture Notes",
      description: "Detailed notes on compiler phases, lexical analysis techniques, and implementation strategies.",
      type: "Material",
      date: "Jun 26",
      status: "Available",
      priority: "medium",
      downloads: 61,
      points: null,
      attachments: ["LectureNotes.pdf", "CodeExamples.zip"],
    },
    // Add other items here...
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Classwork</h2>
        <div className="flex space-x-2">
          {/* Correct implementation using Popover */}
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
        {classworkItems.map((item, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    {item.type === "Assignment" && <Assignment className="w-5 h-5 text-teal-600" />}
                    {item.type === "Material" && <FileText className="w-5 h-5 text-teal-600" />}
                    {item.type === "Test" && <BookOpen className="w-5 h-5 text-teal-600" />}
                    {/* Add other types like "Lab" if needed */}
                  </div>
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {item.type}
                      </Badge>
                      <span className="text-sm text-gray-500">Posted {item.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={item.dueDate ? "destructive" : item.isUpcoming ? "default" : "outline"}
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