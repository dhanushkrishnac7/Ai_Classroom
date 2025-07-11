"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from '../libs/supabaseclient'
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

export default function CallbackPage() {
  const router = useRouter()
  const threeHoursLater = new Date(Date.now() + 3 * 60 * 60 * 1000);

  useEffect(() => {
    const setSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Session fetch error:", error.message)
        return router.push("/")
      }

      if (session) {
        const threeHoursLater = new Date(Date.now() + 3 * 60 * 60 * 1000)
        document.cookie = `token=${session.access_token}; expires=${threeHoursLater.toUTCString()}; path=/; secure; samesite=strict`
        console.log("Initial session set. Redirecting to dashboard")
        router.push("/dashboard")
      } else {
        router.push("/")
      }
    }

    setSession()

    // Subscribe to auth state changes (includes token refreshes)
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
        if (session?.access_token) {
          const threeHoursLater = new Date(Date.now() + 3 * 60 * 60 * 1000)
          document.cookie = `token=${session.access_token}; expires=${threeHoursLater.toUTCString()}; path=/; secure; samesite=strict`
          console.log("Access token refreshed and updated in cookies.")
        }
      }

      if (event === "SIGNED_OUT") {
        document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        router.push("/")
      }
    })

    // Cleanup on component unmount
    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </header>
      <main className="container py-6">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>

         
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <div className="p-6 pt-0">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </Card>
            ))}
          </div>

          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <div className="p-6 pt-0">
                <Skeleton className="h-64 w-full" />
              </div>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <div className="p-6 pt-0 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>


      <div className="fixed bottom-4 right-4">
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading dashboard...</span>
        </div>
      </div>
    </div>
  )
}

