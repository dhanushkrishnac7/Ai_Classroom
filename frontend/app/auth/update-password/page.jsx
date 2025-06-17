"use client"

import { useState } from "react"
import { supabase } from "../../libs/supabaseclient"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import GradientButtonWrapper from "@/components/ui/GradientButtonWrapper"
export default function UpdatePassword() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const validatePassword = (pwd) => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long"
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd)) {
      return "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }
    return null
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()

    // Validation
    if (!password || !confirmPassword) {
      setMessage("Please fill in all fields")
      setMessageType("error")
      return
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match")
      setMessageType("error")
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setMessage(passwordError)
      setMessageType("error")
      return
    }

    setIsLoading(true)
    setMessage("")
    setMessageType(null)

    try {
      const { data, error } = await supabase.auth.updateUser({ password })

      if (error) {
        setMessage("Error: " + error.message)
        setMessageType("error")
      } else {
        setMessage("Password updated successfully! Redirecting...")
        setMessageType("success")
        setTimeout(() => router.push("/"), 2000)
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.")
      setMessageType("error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-white to-indigo-50 px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <ArrowLeft className="h-4 w-4" />
              <button onClick={() => router.back()} className="hover:underline transition-all duration-200 hover:text-primary/80 transform hover:scale-105">
                Back
              </button>
            </div>
            <CardTitle className="text-2xl font-bold">Update Password</CardTitle>
            <CardDescription>Enter your new password below. Make sure it's strong and secure.</CardDescription>
          </CardHeader>

          <form onSubmit={handleUpdatePassword}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                   
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    
                  </button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Password requirements:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>At least 8 characters long</li>
                  <li>Contains uppercase and lowercase letters</li>
                  <li>Contains at least one number</li>
                </ul>
              </div>

              {message && (
                <Alert
                  className={messageType === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}
                >
                  {messageType === "error" ? (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  <AlertDescription className={messageType === "error" ? "text-red-800" : "text-green-800"}>
                    {message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <GradientButtonWrapper>
              <Button type="submit" className="relative w-full" >
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
              </GradientButtonWrapper>
              <div className="text-center text-sm text-muted-foreground">
                <p>Make sure to use a password you haven't used before</p>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>
            Having trouble? <button className="text-primary hover:underline">Contact support</button>
          </p>
        </div>
      </div>
    </div>
  )
}
