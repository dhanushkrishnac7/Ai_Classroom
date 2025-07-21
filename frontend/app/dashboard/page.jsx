"use client"

import { useContext } from "react"
import StudentForm from "./compontents/student/studentForm"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { fetchdata } from "./layout"
import Myclasses from "./compontents/sections/Myclasses"
import Ownedclasses from "./compontents/sections/Ownedclasses"
import Adminclasses from "./compontents/sections/Adminclasses"
export default function HomePage() {
  const { user, showstudentform, setshowstudentform } = useContext(fetchdata);
  return (
    <>
      <StudentForm open={showstudentform} onOpenChange={setshowstudentform} email={user.email} />
      <SidebarProvider>
        <SidebarInset >
          
          <div className="bg-[#f5f5f5]">
            <Myclasses /> 
             <Ownedclasses />   
             <Adminclasses/>
          </div>
          
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}