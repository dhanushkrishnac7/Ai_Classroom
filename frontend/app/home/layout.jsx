import AppSidebar from './components/appsidebar/AppSidebar'
import { SidebarProvider, SidebarTrigger , SidebarInset} from "@/components/ui/sidebar"

export default function RootLayout({ children }) {
    return (
        <div >
            <SidebarProvider>
                
                <AppSidebar />
                <main>
                    <SidebarTrigger/>
                    {children}
                </main>
           
            </SidebarProvider> 
        </div>
    )
}
