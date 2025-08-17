"use client"
import { createContext, useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode"
import AppSidebar from './compontents/Appsidebar/AppSidebar'
import Header from './compontents/Appheaderbar/header'
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export const fetchdata = createContext();// create thhe fetchdata
export default  function RootLayout({ children }) {
  
 const [showstudentform, setshowstudentform] = useState(false);
  const [user, setUser] = useState("");
  const [dashboardResponse, setDashboardResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 
  useEffect(() => {
    const fetchdata = async () => {
      setIsLoading(true);
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (token) {
        try {
          const payload = jwtDecode(token);
          if (payload) setUser(payload);
        } catch (e) {
          console.error("Invalid token", e);
        }
      }
      
      console.log("Fetching classes...");
      try {
        const res = await fetch("http://localhost:8000/api/dashboard", {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (res.status === 440) {
          setshowstudentform(true);
        }
       
        const data = await res.json();
        setDashboardResponse(data);
        console.log("Response -->", data);
      } catch (e) {
        console.error("Dashboard fetch error:", e);
        setDashboardResponse({ error: "Failed to fetch dashboard data" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchdata();
  }, []);
  // Show loading screen while fetching dashboard data
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Dashboard</h2>
          <p className="text-gray-500">Fetching your classes and data...</p>
        </div>
      </div>
    );
  }

  return (
    <fetchdata.Provider value={{dashboardResponse,user,showstudentform,setshowstudentform,isLoading}}>
      <div>
      <SidebarProvider>
        <AppSidebar  />
        <SidebarInset>
          <Header />
          <main>{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
    </fetchdata.Provider>
    
  )
}
