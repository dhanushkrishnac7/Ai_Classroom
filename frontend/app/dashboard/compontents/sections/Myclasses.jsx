"use client"
import { useContext } from "react"
import { Badge } from "@/components/ui/badge"
import ClassCard from "./ClassCard"
import {fetchdata} from "../../layout"

function Ownedclasses() {
  const { dashboardResponse } = useContext(fetchdata);
  
  const colors = [
"rgba(25, 118, 210)",  
  "rgba(66, 66, 66)",    
  "rgba(0, 121, 107)",   
  "rgba(255, 112, 67)",   
  "rgba(21, 101, 192)",   
  "rgba(56, 142, 60)",    
  "rgba(0, 105, 92)",     
  "rgba(93, 64, 55)",     
  "rgba(0, 137, 123)",    
  "rgba(69, 90, 100)",    
  "rgba(46, 125, 50)",   
  "rgba(63, 81, 181)", 
];

  return (
    <div className="bg-gray-50 p-6">
      <div className="max-w-xl  space-y-8">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Learning</h2>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {dashboardResponse?.
enrolledClassroomsAsStudents?.length || 0} Classes
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardResponse?.
enrolledClassroomsAsStudents?.map((classItem,idx) => (
      
              <ClassCard
               
                key={classItem.classroomId}
                classItem={{
                  title: classItem.classroomName,
                  instructor: classItem.ownerName,
                  avatar: classItem.classroomName[0]?.toUpperCase(),
                  color: colors[idx % colors.length],
                  id: classItem.classroomId,
                  role:classItem.role,
                }}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Ownedclasses
