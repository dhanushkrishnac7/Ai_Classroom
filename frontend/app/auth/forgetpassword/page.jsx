"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react"
import { supabase } from '.././../libs/supabaseclient'
import GradientButtonWrapper from "@/components/ui/GradientButtonWrapper"
export default function Component() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState(null) 

  const handleSubmit = async (e) => { 
    e.preventDefault()

    if (!email) {
      setMessage("Please enter your email address")
      setMessageType("error")
      return
    }

    if (!email.includes("@")) {
      setMessage("Please enter a valid email address")
      setMessageType("error")
      return
    }

    setIsLoading(true)
    setMessage("")
    setMessageType(null)

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/auth/update-password' 
    })

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Password reset email sent!')
    }
    setIsLoading(false)
  }

return (
    <div className="min-h-screen flex items-center justify-center  bg-gradient-to-br from-purple-200 via-white to-indigo-50 px-4">
        <div className="w-full max-w-md">
            <Card>
                <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <ArrowLeft className="h-4 w-4" />
                        <a href="/" className="hover:underline transition-all duration-200 hover:text-primary/80 transform hover:scale-105">Back to login</a>
                    </div>
                    <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
                    <CardDescription>
                        No worries! Enter your email address and we'll send you a link to reset your password.
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    disabled={isLoading}
                                />
                            </div>
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

                    <CardFooter className="m-4 flex flex-col space-y-4">
                        <GradientButtonWrapper >
                        <Button type="submit" className="relative w-full" >
                            {isLoading ? "Sending..." : "Send reset link"}
                        </Button>
                        </GradientButtonWrapper>

                        <div className="text-center text-sm text-muted-foreground">
                            Remember your password? <a href="/" className="text-primary hover:underline transition-all duration-200 hover:text-primary/80 transform hover:scale-105">Sign in</a>
                        </div>
                    </CardFooter>
                </form>
            </Card>

            <div className="mt-6 text-center text-xs text-muted-foreground">
                <p>
                    Didn't receive the email? Check your spam folder or{" "}
                    <button
                        className="text-primary hover:underline transition-all duration-200 hover:text-primary/80 transform hover:scale-105"
                        type="button"
                        onClick={() => window.location.reload()}
                    >
                        try again
                    </button>
                </p>
            </div>
        </div>
    </div>
)
}
