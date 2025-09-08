import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

function people({ classroomData, classInfo, loading }) {
  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading people...</div>;
  }


  const enrolledStudents = classroomData?.members?.students || [];
  const classOwnerName = classroomData?.class_owner || classInfo?.instructor || '';

  console.log("Enrolled Students-->", enrolledStudents);
  console.log("Class Owner-->", classOwnerName);

  const generateAvatarColor = (name) => {
    const colors = [
      "bg-gradient-to-br from-blue-500 to-blue-600",
      "bg-gradient-to-br from-teal-500 to-teal-600",
      "bg-gradient-to-br from-green-500 to-green-600",
      "bg-gradient-to-br from-purple-500 to-purple-600",
      "bg-gradient-to-br from-pink-500 to-pink-600",
      "bg-gradient-to-br from-orange-500 to-orange-600",
      "bg-gradient-to-br from-gray-500 to-gray-600",
      "bg-gradient-to-br from-amber-500 to-amber-600",
      "bg-gradient-to-br from-indigo-500 to-indigo-600",
      "bg-gradient-to-br from-red-500 to-red-600"
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };


  // Prepare teachers array with class owner
  const teachers = [];
  if (classOwnerName) {
    teachers.push({
      name: classOwnerName,
      avatar: classOwnerName.charAt(0).toUpperCase(),
      color: "bg-teal-500"
    });
  }


  const students = enrolledStudents.map((student, index) => ({
    name: student.full_name || student.user_name || `Student ${index + 1}`,
    username: student.user_name || '',
    avatar: (student.full_name || student.user_name || `S${index + 1}`).charAt(0).toUpperCase(),
    color: generateAvatarColor(student.full_name || student.user_name || `Student ${index + 1}`),
    userId: student.id
  }));

  return (
    <div className="space-y-8">

      <div>
        <h2 className="text-2xl font-bold mb-6">Teachers</h2>
        <div className="space-y-4">
          {teachers.length > 0 ? (
            teachers.map((teacher, index) => (
              <Card key={index} className="border-0 shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className={teacher.color + " text-white text-lg"}>
                        {teacher.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{teacher.name}</h3>
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                        Instructor
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              No teacher information available
            </div>
          )}
        </div>
      </div>

      <Separator />


      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Classmates</h2>
          <span className="text-gray-500">{students.length} students</span>
        </div>
        <div className="space-y-4">
          {students.length > 0 ? (
            students.map((student, index) => (
              <Card key={student.userId || index} className="border-0 shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className={student.color + " text-white text-lg"}>
                        {student.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{student.name}</h3>

                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                        Student
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {classroomData ? 'No students enrolled yet' : 'Loading students...'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default people