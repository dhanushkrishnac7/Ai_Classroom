import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, UserPlus, Trash2, Loader2, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react"
import { AddUserModal } from "./AddUserModal"

function people({ classroomData, classInfo, loading, classroomId, onRefresh }) {
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false)
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false)
  const [removingStudents, setRemovingStudents] = useState(new Set())
  const [confirmRemoval, setConfirmRemoval] = useState(null)
  const [notification, setNotification] = useState(null)

  console.log("People component - classroomId:", classroomData)

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading people...</div>;
  }


  const enrolledStudents = classroomData?.members?.students || [];
  const enrolledAdmins = classroomData?.members?.admins || [];
  const classOwnerName = classroomData?.class_owner || classInfo?.instructor || '';

  console.log("Enrolled Students-->", enrolledStudents);
  console.log("Enrolled Admins-->", enrolledAdmins);
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


  // Prepare teachers array with class owner and admins
  const teachers = [];

  // Add class owner as primary instructor
  if (classOwnerName) {
    teachers.push({
      name: classOwnerName,
      avatar: classOwnerName.charAt(0).toUpperCase(),
      color: "bg-teal-500",
      role: "Instructor",
      isOwner: true
    });
  }

  // Add admins as additional teachers
  enrolledAdmins.forEach((admin, index) => {
    const adminName = admin.full_name || admin.user_name || `Admin ${index + 1}`;
    teachers.push({
      name: adminName,
      username: admin.user_name || '',
      avatar: adminName.charAt(0).toUpperCase(),
      color: generateAvatarColor(adminName),
      role: "Admin",
      userId: admin.id,
      isOwner: false
    });
  });


  const students = enrolledStudents.map((student, index) => ({
    name: student.full_name || student.user_name || `Student ${index + 1}`,
    username: student.user_name || '',
    avatar: (student.full_name || student.user_name || `S${index + 1}`).charAt(0).toUpperCase(),
    color: generateAvatarColor(student.full_name || student.user_name || `Student ${index + 1}`),
    userId: student.id
  }));

  const handleAddAdmin = (result) => {
    console.log("Admin added successfully:", result)
    if (onRefresh) {
      onRefresh()
    }
  }

  const handleAddStudent = (result) => {
    console.log("Students added successfully:", result)
    if (onRefresh) {
      onRefresh()
    }
  }

  const handleRemoveStudent = (studentId, studentName) => {
    setConfirmRemoval({ studentId, studentName })
  }

  const confirmRemoveStudent = async () => {
    if (!confirmRemoval) return

    const { studentId, studentName } = confirmRemoval

    // Close confirmation modal and add student to removing set
    setConfirmRemoval(null)
    setRemovingStudents(prev => new Set([...prev, studentId]))

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        setNotification({
          type: 'error',
          message: 'Authentication Error',
          details: 'Please log in again to continue.'
        })
        return
      }

      console.log(`Removing student ${studentId} from classroom ${classroomId}`)

      const response = await fetch(`http://localhost:8000/api/classroom/${classroomId}/delete-student/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        console.log(`Student ${studentName} removed successfully`)

        // Show success notification
        setNotification({
          type: 'success',
          message: 'Student Removed Successfully',
          details: `${studentName} has been removed from the classroom. The list will update automatically.`
        })

        // Refresh the people data instead of full page reload
        if (onRefresh) {
          onRefresh()
        }

        // Auto-close notification after 2 seconds
        setTimeout(() => {
          setNotification(null)
        }, 2000)

      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to remove student:', response.status, errorData)

        let errorMessage = 'Failed to remove student'
        let errorDetails = 'Please try again.'

        if (errorData.detail) {
          errorDetails = errorData.detail
        } else if (errorData.message) {
          errorDetails = errorData.message
        }

        setNotification({
          type: 'error',
          message: errorMessage,
          details: errorDetails
        })
      }
    } catch (error) {
      console.error('Error removing student:', error)

      setNotification({
        type: 'error',
        message: 'Network Error',
        details: 'Could not connect to server. Please check your connection and try again.'
      })
    } finally {
      // Remove student from removing set
      setRemovingStudents(prev => {
        const newSet = new Set(prev)
        newSet.delete(studentId)
        return newSet
      })
    }
  }

  const cancelRemoveStudent = () => {
    setConfirmRemoval(null)
  }

  return (
    <div className="space-y-8">

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Teachers</h2>
          <div className="flex items-center gap-4">
            <span className="text-gray-500">{teachers.length} teacher{teachers.length !== 1 ? 's' : ''}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddAdminModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Admin
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          {teachers.length > 0 ? (
            teachers.map((teacher, index) => (
              <Card key={teacher.userId || index} className="border-0 shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className={teacher.color + " text-white text-lg"}>
                        {teacher.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{teacher.name}</h3>
                      {teacher.username && (
                        <p className="text-sm text-gray-500">@{teacher.username}</p>
                      )}
                      <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${teacher.isOwner
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                        }`}>
                        {teacher.role}
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
          <h2 className="text-2xl font-bold">Students</h2>
          <div className="flex items-center gap-4">
            <span className="text-gray-500">{students.length} students</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddStudentModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Students
            </Button>
          </div>
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
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveStudent(student.userId, student.name)}
                        disabled={removingStudents.has(student.userId)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        {removingStudents.has(student.userId) ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Removing...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </>
                        )}
                      </Button>
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

      {/* Add Admin Modal */}
      <AddUserModal
        isOpen={isAddAdminModalOpen}
        onClose={() => setIsAddAdminModalOpen(false)}
        onSubmit={handleAddAdmin}
        userType="admin"
        classroomId={classroomId}
        onRefresh={onRefresh}
      />

      {/* Add Student Modal */}
      <AddUserModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        onSubmit={handleAddStudent}
        userType="student"
        classroomId={classroomId}
        onRefresh={onRefresh}
      />

      {/* Confirmation Modal */}
      <Dialog open={!!confirmRemoval} onOpenChange={() => setConfirmRemoval(null)}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-normal text-gray-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Remove Student
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-gray-600 mb-2">
              Are you sure you want to remove <span className="font-semibold text-gray-800">{confirmRemoval?.studentName}</span> from this classroom?
            </p>
            <p className="text-sm text-red-600">
              This action cannot be undone. The student will lose access to all classroom materials and assignments.
            </p>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={cancelRemoveStudent}
              className="text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRemoveStudent}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Modal */}
      {notification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className={`flex items-start gap-3 ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
              {notification.type === 'success' ? (
                <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{notification.message}</h3>
                <p className="text-sm opacity-90 mb-4">{notification.details}</p>
                <div className="flex justify-end">
                  <Button
                    onClick={() => setNotification(null)}
                    className={`${notification.type === 'success'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                      } text-white`}
                  >
                    OK
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default people