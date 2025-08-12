  'use client'
  import {
  MoreVertical,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useContext } from "react"
import { fetchdata } from "../../../../layout"
function stream() {
  const { dashboardResponse ,user} = useContext(fetchdata);
  console.log("this->",dashboardResponse);
     const streamPosts = [
    {
      type: "announcement",
      author: "Keerthana T",
      content: "Announce something to your class",
      date: "Today",
      
    },
    {
      type: "material",
      author: "Keerthana T",
      content: "posted a new material: Unit 1 Question Bank",
      date: "Jul 22",
    },
    {
      type: "material",
      author: "Keerthana T",
      content: "posted a new material: Assignment",
      date: "Jul 22",
      
    },
    {
      type: "material",
      author: "Keerthana T",
      content: "posted a new material: Unit 1 Notes",
      date: "Jun 26",
    },
    {
      type: "material",
      author: "Keerthana T",
      content: "posted a new material: References Book",
      date: "Jun 26",
    },
    {
      type: "material",
      author: "Keerthana T",
      content: "posted a new material: Text Book",
      date: "Jun 26",
      
    },
  ]
  return (
    <>
    <div className="space-y-6">
           
    <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
        <CardContent className="p-8">
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold mb-2">III CSE C Compiler Design</h1>
            <p className="text-teal-100">Ms. T. Keerthana</p>
            </div>
            <div className="hidden md:block">
            <div className="w-32 h-20 bg-teal-400 rounded-lg opacity-50"></div>
            </div>
        </div>
        </CardContent>
    </Card>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-4">
        {streamPosts.map((post, index) => (

            <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-teal-500 text-white"><BookOpen/></AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center space-x-2">
                    <span className="font-medium">{post.author}</span>
                    <span className="text-sm text-gray-500">{post.content}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{post.date}</p>
                </div>
                <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                </Button>
                </div>
            </CardContent>
            </Card>
        ))}
        </div>
        </div>
        </div>
    </>
  )
}

export default stream