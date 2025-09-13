'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useParams, useSearchParams } from "next/navigation"
import { useContext, useEffect, useState } from "react"
import { fetchdata } from "../../../layout"
import Stream from "./com/stream"
import People from "./com/people"
import Classwork from "./com/classwork"

function Page() {
  const { dashboardResponse } = useContext(fetchdata);
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id;
  const [classroomData, setClassroomData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateClassColor = (className, classId) => {
    const colors = [
      '#6366f1',
      '#8b5cf6',
      '#ec4899',
      '#f59e0b',
      '#10b981',
      '#3b82f6',
      '#ef4444',
      '#f97316',
      '#84cc16',
      '#06b6d4',
    ];


    const seed = className || classId || '';
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };


  const getClassInfoFromDashboard = () => {
    if (!dashboardResponse || !id) return null;

    console.log("---------->yes", id);
    const studentClass = dashboardResponse.enrolledAsStudents?.find(
      cls => cls.classroomId.toString() === id.toString()
    );

    if (studentClass) {
      return {
        name: studentClass.classroomName || 'Class',
        title: studentClass.classroomName || 'Untitled Class',
        instructor: studentClass.ownerName || 'Instructor',
        color: studentClass.color || generateClassColor(studentClass.classroomName, studentClass.classroomId)
      };
    }


    const ownedClass = dashboardResponse.ownedClassrooms?.find(
      cls => cls.id.toString() === id.toString()
    );
    if (ownedClass) {
      return {
        name: ownedClass.classname || 'Class',
        title: ownedClass.classroomName || 'Untitled Class',
        instructor: ownedClass.ownerName || 'Instructor',
        color: ownedClass.color || generateClassColor(ownedClass.classroomName, ownedClass.classroomId)
      };
    }


    const adminClass = dashboardResponse.enrolledAsAdmins?.find(
      cls => cls.classroomId.toString() === id.toString()
    );

    if (adminClass) {
      return {
        name: adminClass.classroomName || 'Class',
        title: adminClass.classroomName || 'Untitled Class',
        instructor: adminClass.ownerName || 'Instructor',
        color: adminClass.color || generateClassColor(adminClass.classroomName, adminClass.classroomId)
      };
    }

    return null;
  };


  const dashboardClassInfo = getClassInfoFromDashboard();


  const validateColor = (color) => {
    if (!color) return '#6366f1';
    if (color.startsWith('#') && /^#[0-9A-F]{6}$/i.test(color)) return color;
    if (color.startsWith('rgb')) return '#6366f1'; // Convert RGB to fallback for now
    return '#6366f1';
  };

  const classInfo = {
    name: searchParams.get('name') || dashboardClassInfo?.name || 'Class',
    title: searchParams.get('title') || dashboardClassInfo?.title || 'Untitled Class',
    instructor: searchParams.get('instructor') || dashboardClassInfo?.instructor || 'Instructor',
    color: validateColor(searchParams.get('color') || dashboardClassInfo?.color)
  };



  const fetchClassroomData = async () => {
    if (!id) return;
    setLoading(true);
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    try {
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
      setClassroomData(data);
      console.log("all responce:-->", data);

      if (!searchParams.get('title') && !dashboardClassInfo && data.classroom_info) {
        console.log("Using class info from API:", data.classroom_info);
      }
    } catch (error) {
      console.error("Error fetching classroom data:", error);
      setClassroomData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClassroomData();
  }, [id]);
  if (!dashboardResponse) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }
  return (
    <div className="p-6">
      <Tabs defaultValue="stream" className="flex flex-col items-center space-y-4">
        <TabsList className="flex space-x-1 bg-white rounded-lg p-1">
          <TabsTrigger
            value="stream"
            className="px-8 py-4 text-sm font-medium rounded-md data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 data-[state=inactive]:text-gray-600 hover:bg-purple-100 transition"
          >
            Stream
          </TabsTrigger>
          <TabsTrigger
            value="classwork"
            className="px-8 py-4 text-sm font-medium rounded-md data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 data-[state=inactive]:text-gray-600 hover:bg-purple-100 transition"
          >
            Classwork
          </TabsTrigger>
          <TabsTrigger
            value="people"
            className="px-8 py-4 text-sm font-medium rounded-md data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 data-[state=inactive]:text-gray-600 hover:bg-purple-100 transition"
          >
            People
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stream" className="w-full max-w-4xl">
          <Stream
            classroomData={classroomData}
            classInfo={classInfo}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="classwork" className="w-full max-w-4xl">
          <Classwork
            classroomData={classroomData}
            classInfo={classInfo}
            loading={loading}
            classroomId={id}
            onRefresh={fetchClassroomData}
          />
        </TabsContent>

        <TabsContent value="people" className="w-full max-w-4xl">
          <People
            classroomData={classroomData}
            classInfo={classInfo}
            loading={loading}
            classroomId={id}
            onRefresh={fetchClassroomData}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Page
