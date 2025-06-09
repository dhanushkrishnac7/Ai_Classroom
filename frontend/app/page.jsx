"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthModal } from './auth-modal'
import { User, Shield, Zap, Globe } from 'lucide-react'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState('signin')

  const openModal = (type) => {
    setModalType(type)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200  via-white to-indigo-50">
      
      <header className="w-full px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">AI ClassRoom</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => openModal('signin')}
              variant="ghost"
              className="font-medium"
            >
              Sign In
            </Button>
            <Button
              onClick={() => openModal('signup')}
              className="font-medium shadow-lg hover:bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-200 transform hover:scale-105"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      
      <main className="flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Welcome to the
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 to-purple-600 bg-clip-text text-transparent"> Future</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Experience seamless authentication with our modern, secure platform. 
            Join thousands of users who trust us with their digital identity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              onClick={() => openModal('signup')}
              size="lg"
              className="w-full  sm:w-auto text-lg font-semibold h-14 px-8 shadow-lg hover:bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-200 transform hover:scale-105"
            >
              Create Account
            </Button>
            <Button
              onClick={() => openModal('signin')}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-lg font-semibold h-14 px-8 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Sign In
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Secure</CardTitle>
                <CardDescription>
                  Enterprise-grade security with end-to-end encryption
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Fast</CardTitle>
                <CardDescription>
                  Lightning-fast authentication in milliseconds
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Global</CardTitle>
                <CardDescription>
                  Available worldwide with 99.9% uptime guarantee
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-8 mt-20">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 AuthFlow. All rights reserved.</p>
        </div>
      </footer>

      <AuthModal
        isOpen={isModalOpen}
        onClose={closeModal}
        type={modalType}
        onSwitchType={setModalType}
      />
    </div>
  )
}
