import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
function people() {
    const teachers = [{ name: "Keerthana T", avatar: "K", color: "bg-teal-500" }]
    const students = [
    {
      name: "Arunkumar K",
      avatar: "A",
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      rollNo: "19CSE001",
      email: "arunkumar.k@student.edu",
      attendance: 95,
      grade: "A",
      isActive: true,
    },
    {
      name: "Champath Krishnaa K",
      avatar: "C",
      color: "bg-gradient-to-br from-teal-500 to-teal-600",
      rollNo: "19CSE002",
      email: "champath.k@student.edu",
      attendance: 88,
      grade: "B+",
      isActive: true,
    },
    {
      name: "Chandhuru M",
      avatar: "C",
      color: "bg-gradient-to-br from-green-500 to-green-600",
      rollNo: "19CSE003",
      email: "chandhuru.m@student.edu",
      attendance: 92,
      grade: "A-",
      isActive: false,
    },
    {
      name: "Karuniya A S",
      avatar: "K",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      rollNo: "19CSE004",
      email: "karuniya.as@student.edu",
      attendance: 90,
      grade: "A",
      isActive: true,
    },
    {
      name: "Monikasree R",
      avatar: "M",
      color: "bg-gradient-to-br from-pink-500 to-pink-600",
      rollNo: "19CSE005",
      email: "monikasree.r@student.edu",
      attendance: 85,
      grade: "B+",
      isActive: true,
    },
    {
      name: "Azim Mohideen Niwas CSE",
      avatar: "A",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      rollNo: "19CSE006",
      email: "azim.mn@student.edu",
      attendance: 78,
      grade: "B",
      isActive: false,
    },
    {
      name: "Bhrahmesh A CSE",
      avatar: "B",
      color: "bg-gradient-to-br from-gray-500 to-gray-600",
      rollNo: "19CSE007",
      email: "bhrahmesh.a@student.edu",
      attendance: 93,
      grade: "A",
      isActive: true,
    },
    {
      name: "Chorko C CSE",
      avatar: "C",
      color: "bg-gradient-to-br from-amber-500 to-amber-600",
      rollNo: "19CSE008",
      email: "chorko.c@student.edu",
      attendance: 87,
      grade: "B+",
      isActive: true,
    },
    {
      name: "D K Sri Ashwin CSE",
      avatar: "D",
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      rollNo: "19CSE009",
      email: "dk.ashwin@student.edu",
      attendance: 96,
      grade: "A+",
      isActive: true,
    },
  ]
  return (
    <div className="space-y-8">
           
            <div>
              <h2 className="text-2xl font-bold mb-6">Teachers</h2>
              <div className="space-y-4">
                {teachers.map((teacher, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className={teacher.color + " text-white text-lg"}>
                            {teacher.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-lg">{teacher.name}</h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

             
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Classmates</h2>
                <span className="text-gray-500">{students.length} students</span>
              </div>
              <div className="space-y-4">
                {students.map((student, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className={student.color + " text-white text-lg"}>
                            {student.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-lg">{student.name}</h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
  )
}

export default people