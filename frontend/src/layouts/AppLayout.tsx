import Header from "@/components/Header"
import { Outlet } from "react-router-dom"
import { Toaster } from "sonner"

function AppLayout() {
  
  return (
    <>
        <Header />
        <Outlet />
        <Toaster />
    </>
)
}

export default AppLayout