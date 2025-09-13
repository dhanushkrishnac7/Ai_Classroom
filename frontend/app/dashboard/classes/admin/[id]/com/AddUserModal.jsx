"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Mail, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export function AddUserModal({ isOpen, onClose, userType, classroomId, onRefresh }) {
  const [emails, setEmails] = useState([''])
  const [errors, setErrors] = useState({})
  const [notification, setNotification] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const addEmailField = () => {
    setEmails([...emails, ''])
  }

  const removeEmailField = (index) => {
    if (emails.length > 1) {
      const newEmails = emails.filter((_, i) => i !== index)
      setEmails(newEmails)
    }
  }

  const handleEmailChange = (index, value) => {
    const newEmails = [...emails]
    newEmails[index] = value
    setEmails(newEmails)

    // Clear errors when user starts typing
    if (errors[`email_${index}`]) {
      setErrors(prev => ({ ...prev, [`email_${index}`]: undefined }))
    }
  }

  const handleSubmit = async () => {
    const validEmails = emails.filter(email => email.trim())
    console.log("=== ADD USER BUTTON CLICKED ===")
    console.log("Email(s):", validEmails)
    console.log("Classroom ID:", classroomId)
    console.log("User Type:", userType === 'admin' ? 'Adding Admin' : 'Adding Student')
    console.log("================================")

    // Clear previous notifications and show loading
    setNotification(null)
    setIsLoading(true)

    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    try {
      let response;

      if (userType === "admin") {
        response = await fetch(`http://localhost:8000/api/classroom/${classroomId}/add-admin`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: validEmails[0]
          })
        })
      } else {
        response = await fetch(`http://localhost:8000/api/classroom/${classroomId}/add-student`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: validEmails[0],
          })
        })
      }

      if (response.ok) {
        const result = await response.json()
        console.log(`${userType} added successfully:`, result)

        // Show success notification
        setNotification({
          type: 'success',
          message: `${userType === 'admin' ? 'Admin' : 'Student'} added successfully!`,
          details: `${validEmails[0]} has been invited to the classroom. The list will update automatically.`
        })

        // Refresh the people data instead of full page reload
        if (onRefresh) {
          onRefresh()
        }

        // Auto-close modal after 2 seconds
        setTimeout(() => {
          setEmails([''])
          setErrors({})
          setNotification(null)
          onClose()
        }, 2000)

      } else {
        const errorData = await response.json().catch(() => ({}))
        console.log(`Failed to add ${userType}:`, response.status, errorData)

        // Extract the actual error message from server response
        let errorMessage = `Failed to add ${userType}`
        let errorDetails = `Server responded with status ${response.status}.`

        if (errorData.detail) {
          errorDetails = errorData.detail
        } else if (errorData.message) {
          errorDetails = errorData.message
        } else if (errorData.error) {
          errorDetails = errorData.error
        }

        setNotification({
          type: 'error',
          message: errorMessage,
          details: errorDetails
        })
      }
    } catch (err) {
      console.log("Error:", err)

      setNotification({
        type: 'error',
        message: 'Network error occurred',
        details: `Could not connect to server while adding ${userType}. Please check your connection.`
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEmails([''])
    setErrors({})
    setNotification(null)
    onClose()
  }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-normal text-gray-800 flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Add {userType === 'admin' ? 'Admin' : 'Students'}
                    </DialogTitle>
                </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">
            Enter email addresses to invite {userType === 'admin' ? 'admins' : 'students'} to this classroom.
          </p>

          {/* Notification Component */}
          {notification && (
            <div className={`p-4 rounded-lg border-l-4 ${notification.type === 'success'
              ? 'bg-green-50 border-green-400 text-green-800'
              : 'bg-red-50 border-red-400 text-red-800'
              } animate-in slide-in-from-top-2 duration-300`}>
              <div className="flex items-start gap-3">
                {notification.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{notification.message}</h4>
                  <p className="text-xs mt-1 opacity-90">{notification.details}</p>
                </div>
              </div>
            </div>
          )}

          {emails.map((email, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    className={`${errors[`email_${index}`]
                      ? "border-red-500 focus-visible:border-red-500"
                      : "border-gray-300 focus-visible:border-blue-600"
                      }`}
                  />
                  <Label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-600">
                    Email {index + 1}
                  </Label>
                </div>
                {emails.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEmailField(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {errors[`email_${index}`] && (
                <p className="text-xs text-red-500">{errors[`email_${index}`]}</p>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEmailField}
            className="w-full border-dashed"
          >
            + Add another email
          </Button>

          {errors.submit && (
            <p className="text-sm text-red-500">{errors.submit}</p>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || notification?.type === 'success'}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : notification?.type === 'success' ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Added Successfully
              </>
            ) : (
              `Add ${userType === 'admin' ? 'Admin' : 'Students'}`
            )}
          </Button>
        </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}