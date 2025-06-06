import AppSidebar from './compontents/Appsidebar/AppSidebar'
import Header from './compontents/Appheaderbar/header'
import { SidebarProvider, SidebarTrigger , SidebarInset} from "@/components/ui/sidebar"

export default function RootLayout({ children }) {
    return (
        <div >
            <SidebarProvider>   
                <AppSidebar />
                <SidebarInset>
                <Header/>
                <main>
                    {children}
                </main>
                </SidebarInset>
            </SidebarProvider> 
        </div>
    )
}
