'use client'
import {
  MoreVertical,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import React from "react"

const gradientStyles = `
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;
function stream({ classroomData, classInfo, loading }) {
  const router = useRouter();

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading classroom data...</div>;
  }

  const streamPosts = classroomData?.all_content || [];
  const { name: className, title: classTitle, instructor, color: classColor } = classInfo;


  const handleCardClick = (post) => {
    const postId = post.id || post.work_id;
    const postType = post.type;
    const postTitle = post.title || post.work_title;
    const documents = post.documents || [];

    console.log('Stream - Instructor being passed:', instructor);
    console.log('Stream - ClassInfo:', classInfo);


    const searchParams = new URLSearchParams({
      type: postType,
      title: postTitle,
      documents: JSON.stringify(documents),
      instructor: instructor || 'Instructor'
    });


    router.push(`/dashboard/classes/student/chat/${postId}?${searchParams.toString()}`);
  };

  const safeColor = classColor && classColor !== 'null' && classColor !== '' ? classColor : '#14b8a6';

  const finalColor = safeColor === '#14b8a6' ? '#6366f1' : safeColor;


  const createGradient = (baseColor) => {

    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);


    const lighterColor = `rgb(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)})`;
    const darkerColor = `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`;

    return `linear-gradient(135deg, ${lighterColor} 0%, ${baseColor} 50%, ${darkerColor} 100%)`;
  };
  console.log("&&&&", streamPosts);
  return (
    <>
      <style>{gradientStyles}</style>
      <div className="space-y-6">

        <Card
          className="text-white shadow-xl"
          style={{
            background: createGradient(finalColor),
            backgroundSize: '200% 200%',
            animation: 'gradientShift 6s ease infinite'
          }}
        >
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{classTitle}</h1>
                <p className="text-white/90">{instructor}</p>
                {className && className !== classTitle && (
                  <p className="text-white/75 text-lg mt-1">{className}</p>
                )}
              </div>
              <div className="hidden md:block">
                <div
                  className="w-32 h-20 rounded-lg opacity-60"
                  style={{
                    background: `linear-gradient(45deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)`,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {streamPosts.length > 0 ? (
              streamPosts.map((post, index) => (
                <Card
                  key={post.id || index}
                  className="hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
                  onClick={() => handleCardClick(post)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-teal-500 text-white">
                          <BookOpen />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <span className="font-medium">{instructor}</span>
                            <span className="text-sm text-gray-500">
                              posted: {post.title || post.work_title}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {post.type}
                            </span>
                            {post.type === 'work' && post.due_date && (
                              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded font-medium">
                                Due: {new Date(post.due_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            )}
                          </div>
                          {(post.context || post.work_description) && (
                            <p className="text-sm text-gray-600 mt-1">{post.context || post.work_description}</p>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(post.uploaded_at || post.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click when clicking menu
                          // Add menu functionality here if needed
                        }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {classroomData ? 'No posts available' : 'Loading posts...'}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default stream