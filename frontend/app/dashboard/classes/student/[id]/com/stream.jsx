'use client'
import {
  MoreVertical,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useContext, useEffect, useState } from "react"
import { fetchdata } from "../../../../layout"
import { useParams } from "next/navigation"
function stream() {
  const { dashboardResponse } = useContext(fetchdata);
  const params = useParams();
  const id = params.id;
  const [blogData, setBlogData] = useState(null);
  const [loading, setLoading] = useState(false);



  useEffect(() => {
    const fetchBlogData = async () => {
      if (!id) return;
      setLoading(true);
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      try {
        console.log("Fetching data for classroom ID:", id);
        const response = await fetch(`http://localhost:8000/api/classroom/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setBlogData(data);

      } catch (error) {
        console.error("Error fetching blog data:", error);
        setBlogData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogData();
  }, [id])
  console.log("id", id);
  console.log("Fetched Blog Data:", blogData);

  // Show loading state if dashboardResponse is not available yet
  if (!dashboardResponse) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  // Show loading state while fetching blog data
  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading blog data...</div>;
  }

  // Get posts from fetched data or use empty array
  const streamPosts = blogData?.all_content || [];
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
            {streamPosts.length > 0 ? (
              streamPosts.map((post, index) => (
                <Card key={post.id || index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-teal-500 text-white">
                          <BookOpen />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Teacher</span>
                            <span className="text-sm text-gray-500">
                              posted: {post.title}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {post.type}
                            </span>
                          </div>
                          {post.context && (
                            <p className="text-sm text-gray-600 mt-1">{post.context}</p>
                          )}

                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(post.uploaded_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {blogData ? 'No posts available' : 'Loading posts...'}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default stream