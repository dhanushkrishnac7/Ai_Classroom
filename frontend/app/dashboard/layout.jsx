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
  useEffect(() => {
    const fetchdata = async () => {
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
    console.log("fecteching clasess...")
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
     
      try {
        const data = await res.json();
        setDashboardResponse(data);
        console.log("Response -->", data);
      } catch (e) {
        setDashboardResponse({ error: "Failed to parse response" });
      }
    };
    fetchdata();
  }, []);
  return (
    <fetchdata.Provider value={{dashboardResponse,user,showstudentform,setshowstudentform}}>
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
