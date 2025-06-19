"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, User, GraduationCap, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Loader2, X } from "lucide-react"
export default function StudentForm({ open, onOpenChange }) {
  const [currentPage, setCurrentPage] = useState(1)
    const [buttonState, setButtonState] = useState("idle")
  const [formData, setFormData] = useState({
    firstName: "",
    username:"",
    age: "",
    email: "",
    phone: "",
    university: "",
    academicStatus: "",
    fieldOfStudy: "",
    currentYear: "",
    gpa: "",
    previousEducation: "",
    careerGoals: "",
    additionalInfo: "",
  })

  const [errors, setErrors] = useState({})

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validatePage = (page) => {
    const newErrors = {}

    if (page === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
      if (!formData.age.trim()) newErrors.age = "Age is required"
      if (!formData.email.trim()) {
        newErrors.email = "Email is required"
      } else if (!validateEmail(formData.email)) {
        newErrors.email = "Please enter a valid email address"
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required"
      } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
        newErrors.phone = "Please enter a valid 10-digit phone number"
      }
    }

    if (page === 2) {
      if (!formData.university.trim()) newErrors.university = "University is required"
      if (!formData.academicStatus) newErrors.academicStatus = "Academic status is required"
      if (!formData.fieldOfStudy.trim()) newErrors.fieldOfStudy = "Field of study is required"
      if (!formData.currentYear) newErrors.currentYear = "Current year is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextPage = () => {
    if (validatePage(currentPage)) {
      setCurrentPage((prev) => Math.min(prev + 1, 3))
    }
  }

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const isFormComplete = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "age",
      "email",
      "phone",
      "university",
      "academicStatus",
      "fieldOfStudy",
      "currentYear",
    ]

    return (
      requiredFields.every((field) => formData[field].trim() !== "") &&
      validateEmail(formData.email) &&
      /^\d{10}$/.test(formData.phone.replace(/\D/g, ""))
    )
  }

  const handleSubmit = async () => {
    if (validatePage(currentPage) && isFormComplete()) {
      try {
        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setErrors((prev) => ({ ...prev, email: "Please enter a valid email address" }))
          return
        }

        // Validate phone number format
        if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
          setErrors((prev) => ({ ...prev, phone: "Please enter a valid 10-digit phone number" }))
          return
        }

        // Here you would typically send the data to your backend
        const response = await fetch("/api/students", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          throw new Error("Failed to submit form")
        }

        // Only close dialog after successful submission
        alert("Form submitted successfully! We'll get back to you soon.")

        // Reset form and close dialog
        setFormData({
          firstName: "",
          lastName: "",
          age: "",
          email: "",
          phone: "",
          university: "",
          academicStatus: "",
          fieldOfStudy: "",
          currentYear: "",
          gpa: "",
          previousEducation: "",
          careerGoals: "",
          additionalInfo: "",
        })

        setCurrentPage(1)
        onOpenChange(false) // Only close here after successful submission
      } catch (error) {
        console.error("Form submission error:", error)
        alert("Something went wrong. Please try again.")
        // Don't close dialog on error
      }
    }
  }

  const getPageIcon = (page) => {
    switch (page) {
      case 1:
        return <User className="w-5 h-5" />
      case 2:
        return <GraduationCap className="w-5 h-5" />
      case 3:
        return <FileText className="w-5 h-5" />
      default:
        return null
    }
  }

  const getPageTitle = (page) => {
    switch (page) {
      case 1:
        return "Personal Information"
      case 2:
        return "Academic Information"
      case 3:
        return "Additional Details"
      default:
        return ""
    }
  }

  const getPageDescription = (page) => {
    switch (page) {
      case 1:
        return "Tell us about yourself"
      case 2:
        return "Share your academic background"
      case 3:
        return "Any additional information you'd like to share"
      default:
        return ""
    }
  }
  const validateUsername = async () => {
    // Reset errors
    setErrors({})

    // Basic validation
    if (!formData.username.trim()) {
      setErrors({ username: "Username is required" })
      return
    }

    if (formData.username.length < 3) {
      setErrors({ username: "Username must be at least 3 characters" })
      return
    }

    // Start loading state
    setButtonState("loading")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate validation result (50% chance of being valid for demo)
    const isValid = Math.random() > 0.5

    if (isValid) {
      setButtonState("valid")
      // Reset to idle after 3 seconds
      setTimeout(() => setButtonState("idle"), 3000)
    } else {
      setButtonState("invalid")
      setErrors({ username: "Username is already taken or invalid" })
      // Reset to idle after 2 seconds
      setTimeout(() => setButtonState("idle"), 2000)
    }
  }
    const getButtonContent = () => {
    switch (buttonState) {
      case "loading":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "valid":
        return <Check className="h-5 w-5" />
      case "invalid":
        return <X className="h-4 w-4" />
      default:
        return "Check Valid"
    }
  }

  const getButtonClasses = () => {
    const baseClasses = "relative overflow-hidden transition-all duration-500 ease-out transform"

    switch (buttonState) {
      case "loading":
        return `${baseClasses} bg-green-500 hover:bg-green-600 text-white scale-105 shadow-lg shadow-green-500/25`
      case "valid":
        return `${baseClasses} bg-green-500 hover:bg-green-600 text-white w-12 h-12 rounded-full p-0 min-w-0 scale-110 shadow-lg shadow-green-500/50 animate-pulse-success`
      case "invalid":
        return `${baseClasses} bg-red-500 hover:bg-red-600 text-white scale-105 shadow-lg shadow-red-500/25 animate-shake`
      default:
        return `${baseClasses} hover:scale-105 hover:shadow-md`
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {getPageIcon(currentPage)}
            <DialogTitle className="text-2xl font-bold">
              Student Information Form
            </DialogTitle>
          </div>
          <DialogDescription className="text-lg">
            {getPageTitle(currentPage)} - {getPageDescription(currentPage)}
          </DialogDescription>

          <div className="space-y-2">
            <Progress value={(currentPage / 3) * 100} className="h-2" />
            <p className="text-sm text-muted-foreground">Step {currentPage} of 3</p>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {currentPage === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username*
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => updateFormData("username", e.target.value)}
                      placeholder="Enter your Username"
                      className={`transition-all duration-300 ${
                        errors.username
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : buttonState === "valid"
                          ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                          : "focus:ring-blue-500/20"
                      }`}
                    />
                    {buttonState === "valid" && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                  </div>
                  {errors.username && (
                    <p className="text-red-500 text-sm animate-in slide-in-from-left-2 duration-300">
                      {errors.username}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="invisible text-sm">Action</Label>
                  <div className="flex items-start">
                    <Button
                      onClick={validateUsername}
                      disabled={buttonState === "loading" || !formData.username.trim()}
                      className={getButtonClasses()}
                    >
                      <span className={buttonState === "loading" ? "ripple-effect" : ""}>
                        {getButtonContent()}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                  <Label htmlFor="fullname">Full Name *</Label>
                  <Input
                    id="fullname"
                    value={formData.firstName}
                    onChange={(e) => updateFormData("firstName", e.target.value)}
                    placeholder="Enter your first name"
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                </div>
               
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateFormData("age", e.target.value)}
                  placeholder="Enter your age"
                  min="16"
                  max="100"
                  className={errors.age ? "border-red-500" : ""}
                />
                {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder="Enter your email address"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  placeholder="Enter your phone number"
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>
            </div>
          )}

          {/* Page 2: Academic Information */}
          {currentPage === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="university">University/Educational Institution *</Label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) => updateFormData("university", e.target.value)}
                  placeholder="Enter your university or school name"
                  className={errors.university ? "border-red-500" : ""}
                />
                {errors.university && <p className="text-red-500 text-sm">{errors.university}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicStatus">Current Academic Status *</Label>
                <Select
                  value={formData.academicStatus}
                  onValueChange={(value) => updateFormData("academicStatus", value)}
                >
                  <SelectTrigger className={errors.academicStatus ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select your academic status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high-school">High School Student</SelectItem>
                    <SelectItem value="undergraduate">Undergraduate Student</SelectItem>
                    <SelectItem value="graduate">Graduate Student</SelectItem>
                    <SelectItem value="phd">PhD Student</SelectItem>
                    <SelectItem value="postdoc">Postdoctoral Researcher</SelectItem>
                  </SelectContent>
                </Select>
                {errors.academicStatus && <p className="text-red-500 text-sm">{errors.academicStatus}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fieldOfStudy">Field/Branch of Study *</Label>
                <Input
                  id="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={(e) => updateFormData("fieldOfStudy", e.target.value)}
                  placeholder="e.g., Computer Science, Biology, Business Administration"
                  className={errors.fieldOfStudy ? "border-red-500" : ""}
                />
                {errors.fieldOfStudy && <p className="text-red-500 text-sm">{errors.fieldOfStudy}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentYear">Current Year/Level *</Label>
                  <Select value={formData.currentYear} onValueChange={(value) => updateFormData("currentYear", value)}>
                    <SelectTrigger className={errors.currentYear ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st">1st Year</SelectItem>
                      <SelectItem value="2nd">2nd Year</SelectItem>
                      <SelectItem value="3rd">3rd Year</SelectItem>
                      <SelectItem value="4th">4th Year</SelectItem>
                      <SelectItem value="5th">5th Year</SelectItem>
                      <SelectItem value="final">Final Year</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.currentYear && <p className="text-red-500 text-sm">{errors.currentYear}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gpa">GPA/Grade (Optional)</Label>
                  <Input
                    id="gpa"
                    value={formData.gpa}
                    onChange={(e) => updateFormData("gpa", e.target.value)}
                    placeholder="e.g., 3.8, A-, 85%"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Page 3: Additional Information */}
          {currentPage === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="previousEducation">Previous Educational Background</Label>
                <Textarea
                  id="previousEducation"
                  value={formData.previousEducation}
                  onChange={(e) => updateFormData("previousEducation", e.target.value)}
                  placeholder="Tell us about your previous educational experiences, certifications, or relevant coursework"
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="careerGoals">Career Goals & Aspirations</Label>
                <Textarea
                  id="careerGoals"
                  value={formData.careerGoals}
                  onChange={(e) => updateFormData("careerGoals", e.target.value)}
                  placeholder="Share your career goals, aspirations, or what you hope to achieve in your field"
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) => updateFormData("additionalInfo", e.target.value)}
                  placeholder="Any other information you'd like to share (hobbies, interests, achievements, etc.)"
                  className="min-h-[80px]"
                />
              </div>

              {/* Summary Section */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-violet-50 rounded-lg border">
                <h3 className="font-semibold text-lg mb-3 text-violet-700">Form Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <p>
                    <strong>Name:</strong> {formData.firstName} {formData.lastName}
                  </p>
                  <p>
                    <strong>Age:</strong> {formData.age}
                  </p>
                  <p>
                    <strong>University:</strong> {formData.university}
                  </p>
                  <p>
                    <strong>Status:</strong> {formData.academicStatus}
                  </p>
                  <p>
                    <strong>Field:</strong> {formData.fieldOfStudy}
                  </p>
                  <p>
                    <strong>Year:</strong> {formData.currentYear}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={prevPage}
              disabled={currentPage === 1}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            {currentPage < 3 ? (
              <Button
                onClick={nextPage}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <span>Submit Form</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
