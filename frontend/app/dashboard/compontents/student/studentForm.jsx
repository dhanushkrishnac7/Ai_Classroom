"use client"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Loader2, X, User, ChevronRight, Sparkles, Mail, Phone, Calendar } from "lucide-react"

 

export default function StudentForm({ open, onOpenChange, email }) {
  const [buttonState, setButtonState] = useState("idle")
  const [successMessage, setSuccessMessage] = useState("")
  const [loading,setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    age: "",
    email: email || "",
    phone: "",
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (email) {
      setFormData((prev) => ({ ...prev, email }))
    } else {
      setErrors((prev) => ({ ...prev, email: "Email is required" }))
    }
  }, [email])

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }


  const handleSubmit = async () => {
    const validationErrors = {}
    setLoading(true)
    if (!formData.fullName.trim()) {
      validationErrors.fullName = "Full Name is required"
    }

    if (!formData.userName.trim()) {
      validationErrors.userName = "Username is required"
    }

    if (!formData.age.trim() || isNaN(Number(formData.age))) {
      validationErrors.age = "Valid Age is required"
    }

    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      validationErrors.phone = "Phone number must be 10 digits"
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1]

      if (!token) {
        alert("User not authenticated. Please log in again.")
        return
      }

      const response = await fetch("http://localhost:8000/dashboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
         
        let errorMsg = "Something went wrong. Please try again."
        try {
          const errorData = await response.json()
          if (errorData && errorData.detail) {
            errorMsg = errorData.detail
          }
        } catch (e) {
          
        }
        setErrors((prev) => ({
          ...prev,
          form: errorMsg,
        }))
        return
      }

      setSuccessMessage("Profile created successfully! Welcome to AI Classroom.")

      setTimeout(() => {
        setFormData({
          fullName: "",
          userName: "",
          age: "",
          email: email || "",
          phone: "",
        })
        setButtonState("idle")
        setSuccessMessage("")
        onOpenChange(false)
      }, 2000)
    } catch (error) {
      console.error("Form submission error:", error)
      setErrors((prev) => ({
        ...prev,
        form: "Something went wrong. Please try again.",
      }))
    }
  }

   const validateUsername = async () => {
    setErrors((prev) => ({ ...prev, userName: "" }))
    const usernameFormat = /^[a-zA-Z0-9_]{3,20}$/
    const userName = formData.userName.trim()

    if (!userName) {
      setErrors((prev) => ({ ...prev, userName: "Username is required" }))
      return
    }
    if (userName.length < 3) {
      setErrors((prev) => ({ ...prev, userName: "Username must be at least 3 characters" }))
      return
    }
    if (!usernameFormat.test(userName)) {
      setErrors((prev) => ({
        ...prev,
        userName: "Invalid username. Use 3–20 letters, numbers, or underscores only.",
      }))
      return
    }

    setButtonState("loading")

    try {
      const response = await fetch(`http://localhost:8000/username/${userName}`)
      const result = await response.json()

      if (result.isValid) {
        setButtonState("valid")
      } else {
        setButtonState("invalid")
        setErrors((prev) => ({ ...prev, userName: result.message || "Username is already taken" }))
      }
    } catch (error) {
      console.error("Username validation failed:", error)
      setButtonState("invalid")
      setErrors((prev) => ({
        ...prev,
        userName: "Something went wrong. Please try again later.",
      }))
    } 
  }


  const isUsernameValid = buttonState === "valid"

  const getButtonContent = () => {
    switch (buttonState) {
      case "loading":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "valid":
        return <Check className="h-5 w-5" />
      case "invalid":
        return <X className="h-4 w-4" />
      default:
        return "Validate"
    }
  }

  const getButtonClasses = () => {
    const baseClasses = "relative overflow-hidden transition-all duration-500 ease-out transform font-medium"
    switch (buttonState) {
      case "loading":
        return `${baseClasses} bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white scale-105 shadow-lg shadow-purple-500/25`
      case "valid":
        return `${baseClasses} bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white w-12 h-12 rounded-full p-0 min-w-0 scale-110 shadow-lg shadow-emerald-500/50`
      case "invalid":
        return `${baseClasses} bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white scale-105 shadow-lg shadow-red-500/25 animate-pulse`
      default:
        return `${baseClasses} bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white hover:scale-105 hover:shadow-md shadow-purple-500/25`
    }
  }

  if (successMessage || errors.form) {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <DialogContent className="max-w-md" onEscapeKeyDown={e => e.preventDefault()} onInteractOutside={e => e.preventDefault()}>
          <div className="text-center py-8">
            {successMessage ? (
              <>
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mx-auto mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
                <p className="text-gray-600">{successMessage}</p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mx-auto mb-4">
                  <X className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
                <p className="text-red-600">{errors.form}</p>
                <Button className="mt-6" onClick={() => setErrors((prev) => ({ ...prev, form: undefined }))}>
                  Back to Form
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={()=>{}} modal={true}>
      <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      <DialogContent onEscapeKeyDown={(e) => e.preventDefault()}  onInteractOutside={(e) => e.preventDefault()} className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-purple-50/30 border-0 shadow-2xl">
        <DialogHeader className="text-center space-y-6 pb-2">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-4xl mx-auto">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Create Your Profile
            </DialogTitle>
            <DialogDescription className="text-lg text-gray-600">
              Tell us about yourself to get started with AI Classroom
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-8">
          {/* Username Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 shadow-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <Label className="text-lg font-semibold text-gray-900">Choose Your Username</Label>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Input
                  value={formData.userName}
                  onChange={(e) => updateFormData("userName", e.target.value)}
                  placeholder="Enter your unique username"
                  className={`h-12 text-lg transition-all duration-300 border-2 ${
                    errors.userName
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50"
                      : buttonState === "valid"
                        ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20 bg-emerald-50/50"
                        : buttonState === "invalid"
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50"
                          : "border-purple-200 focus:border-purple-400 focus:ring-purple-500/20 bg-white/80"
                  }`}
                />
                <div className="h-5">
                  {errors.userName && (
                    <p className="text-red-500 text-sm animate-in slide-in-from-left-2 duration-300 flex items-center space-x-1">
                      <X className="w-4 h-4" />
                      <span>{errors.userName}</span>
                    </p>
                  )}
                  {buttonState === "valid" && (
                    <p className="text-emerald-600 text-sm animate-in slide-in-from-left-2 duration-300 flex items-center space-x-1">
                      <Check className="w-4 h-4" />
                      <span>Username is available!</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-start">
                <Button onClick={validateUsername} className={getButtonClasses()}>
                  {getButtonContent()}
                  {buttonState === "idle"}
                </Button>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 shadow-lg">
            <div className="flex items-center space-x-2 mb-6">
              <User className="w-5 h-5 text-purple-600" />
              <Label className="text-lg font-semibold text-gray-900">Personal Information</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullname" className="text-sm font-medium text-gray-700">Full Name *</Label>
                <Input
                  id="fullname"
                  value={formData.fullName}
                  onChange={(e) => updateFormData("fullName", e.target.value)}
                  placeholder="Enter your full name"
                  className={`h-12 transition-all duration-300 border-2 ${
                    errors.fullName 
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50" 
                      : "border-purple-200 focus:border-purple-400 focus:ring-purple-500/20 bg-white/80"
                  }`}
                  disabled={!isUsernameValid}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm flex items-center space-x-1">
                    <X className="w-4 h-4" />
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Age *</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateFormData("age", e.target.value)}
                  placeholder="Enter your age"
                  min="16"
                  max="100"
                  className={`h-12 transition-all duration-300 border-2 ${
                    errors.age 
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50" 
                      : "border-purple-200 focus:border-purple-400 focus:ring-purple-500/20 bg-white/80"
                  }`}
                  disabled={!isUsernameValid}
                />
                {errors.age && (
                  <p className="text-red-500 text-sm flex items-center space-x-1">
                    <X className="w-4 h-4" />
                    <span>{errors.age}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>Email Address</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  placeholder="Enter your email address"
                  className="h-12 bg-gray-100/80 cursor-not-allowed border-gray-200 text-gray-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                  <Phone className="w-4 h-4" />
                  <span>Phone Number *</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  placeholder="Enter your phone number"
                  className={`h-12 transition-all duration-300 border-2 ${
                    errors.phone 
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50" 
                      : "border-purple-200 focus:border-purple-400 focus:ring-purple-500/20 bg-white/80"
                  }`}
                  disabled={!isUsernameValid}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm flex items-center space-x-1">
                    <X className="w-4 h-4" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
 
          <div className="flex justify-end pt-4">
            <Button
              onClick={async () => {
                setLoading(true)
                await handleSubmit()
                setLoading(false)
              }}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center"
              disabled={!isUsernameValid || loading}
            >
              {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
              <span>Create Profile</span>
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
          
          {errors.form && (
            <div className="text-center">
              <p className="text-red-500 text-sm flex items-center justify-center space-x-1">
                <X className="w-4 h-4" />
                <span>{errors.form}</span>
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}