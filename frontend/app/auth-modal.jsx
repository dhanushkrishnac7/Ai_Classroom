"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, User, Eye, EyeOff, Loader2, Router } from "lucide-react"
import { supabase } from "./libs/supabaseclient"
import GradientButtonWrapper from "@/components/ui/GradientButtonWrapper"
import Google from "../public/googleLogo";
import GitHub from "../public/githubLogo"
export function AuthModal({ isOpen, onClose, type, onSwitchType }) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      alert(`${type === "signin" ? "Sign in" : "Sign up"} successful!`)
      onClose()
      setFormData({ name: "", email: "", password: "" })
    }, 1500)
  }

  const handleAuth = async (p) => {
    console.log("Google Auth clicked");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: p,
      options: {
        redirectTo: 'http://localhost:3000/auth', 
      },
    })
    if (error) console.error('Error logging in:', error.message)
  }

 

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">
            {type === "signin" ? "Welcome Back" : "Create Account"}
          </DialogTitle>
          <DialogDescription>
            {type === "signin" ? "Sign in to your account to continue" : "Join us and start your journey today"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <GradientButtonWrapper>
            <Button
              onClick={()=>handleAuth("google")}
              disabled={isLoading}
              variant="outline"
              className="relative w-full h-12 text-base font-medium hover:bg-gray-50 transition-all duration-200"
            >
              {isLoading ? (
                <Loader2 className="relative w-4 h-4 mr-2 animate-spin" />
              ) : (
                <div className="w-5 h-5 mr-3">
                  <Google/>
                </div>
              )}
              {isLoading ? "Connecting..." : "Continue with Google"}
            </Button>
          </GradientButtonWrapper>

     
         <GradientButtonWrapper>
            <Button
              onClick={()=>handleAuth('github')}
              disabled={isLoading}
              variant="outline"
              className="relative w-full h-12 text-base font-medium hover:bg-gray-50 transition-all duration-200"
            >
              {isLoading ? (
                <Loader2 className="relative w-4 h-4 mr-2 animate-spin" />
              ) : (
                <div className="w-5 h-5 mr-3">
                  <GitHub/>
                </div>
              )}
              {isLoading ? "Connecting..." : "Continue with GitHub"}
            </Button>
          </GradientButtonWrapper>

        
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {type === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10 h-12"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 h-12"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 h-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <GradientButtonWrapper>             <Button type="submit" disabled={isLoading} className="relative w-full h-12 text-base font-semibold">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : type === "signin" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </GradientButtonWrapper>
 
          </form>

          {/* Switch Type */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {type === "signin" ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={() => onSwitchType(type === "signin" ? "signup" : "signin")}
              className="text-primary font-medium hover:underline transition-all duration-200 hover:text-primary/80 transform hover:scale-105"
            >
              {type === "signin" ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
