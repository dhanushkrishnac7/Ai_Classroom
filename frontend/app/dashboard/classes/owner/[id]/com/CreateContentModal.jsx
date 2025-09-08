"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Upload, X } from "lucide-react"

export function CreateContentModal({ isOpen, onClose, onSubmit, classroomId }) {
  const [contentType, setContentType] = useState("work")
  const [formData, setFormData] = useState({
    title: "",
    context: "",
    dueDate: "",
    files: []
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...selectedFiles]
    }))
  }

  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.context.trim()) {
      newErrors.context = "Content is required"
    }

    if (contentType === "work" && !formData.dueDate) {
      newErrors.dueDate = "Due date is required for work assignments"
    }

    return newErrors
  }

  const handleSubmit = async () => {
    const newErrors = validateForm()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)

    try {
      // Check if classroomId is available
      if (!classroomId) {
        console.error("No classroom ID provided")
        setErrors({ submit: "Classroom ID is missing. Please refresh the page." })
        return
      }

      const formDataToSend = new FormData()

      if (contentType === "work") {
        // Work API expects these field names
        formDataToSend.append("work_title", formData.title)
        formDataToSend.append("work_description", formData.context)

        
        const dateObj = new Date(formData.dueDate)
        const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getFullYear()}`
        formDataToSend.append("due_date", formattedDate)

        console.log("Original date:", formData.dueDate)
        console.log("Formatted date:", formattedDate)
      } else {
       
        formDataToSend.append("title", formData.title)
        formDataToSend.append("context", formData.context)
      }

      formData.files.forEach((file) => {
        formDataToSend.append(`files`, file)
      })

      const endpoint = contentType === "blog"
        ? `http://localhost:8000/api/classroom/${classroomId}/blog`
        : `http://localhost:8000/api/classroom/${classroomId}/work`

      console.log(`Making ${contentType} API request to:`, endpoint)
      console.log("Classroom ID:", classroomId)
      console.log("Form data being sent:", {
        title: formData.title,
        context: formData.context,
        dueDate: contentType === "work" ? formData.dueDate : "N/A",
        filesCount: formData.files.length
      })

      // Get authentication token from cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        console.error("No authentication token found")
        setErrors({ submit: "Authentication required. Please log in again." })
        return
      }

      // Add timeout and better error handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch(endpoint, {
        method: "POST",
        body: formDataToSend,
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData, let browser set it with boundary
        }
      })

      clearTimeout(timeoutId)

      console.log("API Response status:", response.status)
      console.log("API Response ok:", response.ok)

      if (!response.ok) {
        let errorText
        try {
          errorText = await response.text()
          console.error("API Error response:", errorText)
        } catch (e) {
          errorText = `HTTP ${response.status} ${response.statusText}`
          console.error("Could not read error response:", e)
        }
        throw new Error(`Failed to create ${contentType}: ${errorText}`)
      }

      const result = await response.json()
      console.log("API Success response:", result)
      onSubmit?.(result)

      // Reset form and close modal
      setFormData({
        title: "",
        context: "",
        dueDate: "",
        files: []
      })
      setErrors({})
      setContentType("work")
      onClose()
    } catch (error) {
      console.error("Error creating content:", error)

      let errorMessage = "Failed to create content. Please try again."

      if (error.name === 'AbortError') {
        errorMessage = "Request timed out. Please check your connection and try again."
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = "Cannot connect to server. Please check if the backend server is running on port 8080."
      } else if (error.message) {
        errorMessage = error.message
      }

      setErrors({ submit: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      title: "",
      context: "",
      dueDate: "",
      files: []
    })
    setErrors({})
    setContentType("work")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-normal text-gray-800">
            Create Content
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Content Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Content Type</Label>
            <div className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="work"
                  name="contentType"
                  value="work"
                  checked={contentType === "work"}
                  onChange={(e) => setContentType(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <Label htmlFor="work" className="text-sm text-gray-700 cursor-pointer">Work</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="blog"
                  name="contentType"
                  value="blog"
                  checked={contentType === "blog"}
                  onChange={(e) => setContentType(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <Label htmlFor="blog" className="text-sm text-gray-700 cursor-pointer">Blog</Label>
              </div>
            </div>
          </div>



          {/* Title */}
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="title"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={`border-0 border-b-2 rounded-none px-0 pb-2 pt-4 text-base placeholder:text-blue-600 focus-visible:ring-0 ${errors.title
                  ? "border-red-500 focus-visible:border-red-500"
                  : "border-blue-600 focus-visible:border-blue-700"
                  }`}
              />
              <Label
                htmlFor="title"
                className="absolute left-0 top-0 text-xs text-blue-600 font-medium"
              >
                Title*
              </Label>
            </div>
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">*Required</p>
            )}
          </div>

          {/* Due Date (only for work) */}
          {contentType === "work" && (
            <div className="space-y-2">
              <div className="relative">
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange("dueDate", e.target.value)}
                  className={`border-0 border-b-2 rounded-none px-0 pb-2 pt-4 text-base focus-visible:ring-0 ${errors.dueDate
                    ? "border-red-500 focus-visible:border-red-500"
                    : "border-blue-600 focus-visible:border-blue-700"
                    }`}
                />
                <Label
                  htmlFor="dueDate"
                  className="absolute left-0 top-0 text-xs text-blue-600 font-medium"
                >
                  Due Date*
                </Label>
              </div>
              {errors.dueDate && (
                <p className="text-xs text-red-500 mt-1">*Required</p>
              )}
            </div>
          )}

          {/* Content (for both work and blog) */}
          <div className="space-y-2">
            <div className="relative">
              <textarea
                id="context"
                placeholder={contentType === "work" ? "Write assignment instructions here..." : "Write your blog content here..."}
                value={formData.context}
                onChange={(e) => handleInputChange("context", e.target.value)}
                rows={4}
                className={`w-full border-0 border-b-2 rounded-none px-0 pb-2 pt-4 text-base placeholder:text-gray-600 focus:outline-none resize-none ${errors.context
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-600"
                  }`}
              />
              <Label
                htmlFor="context"
                className="absolute left-0 top-0 text-xs text-gray-600"
              >
                {contentType === "work" ? "Instructions*" : "Content*"}
              </Label>
            </div>
            {errors.context && (
              <p className="text-xs text-red-500 mt-1">*Required</p>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Files</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Click to upload files or drag and drop
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  Images, PDFs, Documents
                </span>
              </label>
            </div>

            {/* File List */}
            {formData.files.length > 0 && (
              <div className="space-y-2">
                {formData.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <p className="text-sm text-red-500">{errors.submit}</p>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="text-blue-600 hover:bg-blue-50"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}