"use client"

import { useContext } from "react"
import StudentForm from "./student/studentForm"
import { SidebarInset,SidebarProvider} from "@/components/ui/sidebar"
import { fetchdata } from "./layout"


export default function HomePage() {
 
  const {user,showstudentform,dashboardResponse,setshowstudentform} = useContext(fetchdata);
  return (
    <>
      <StudentForm open={showstudentform} onOpenChange={setshowstudentform} email={user.email} />
      
      {dashboardResponse && (
        <div className="p-4 m-4 bg-gray-100 border rounded text-sm text-gray-700">
          <strong>Dashboard Response:</strong>
          <pre className="whitespace-pre-wrap">{JSON.stringify(dashboardResponse, null, 2)}</pre>
        </div>
      )}
      <SidebarProvider>
      
      <SidebarInset>
      </SidebarInset>
    </SidebarProvider>
    </>
  )
}
