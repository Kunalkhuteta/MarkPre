/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();
    async function handleResetPassword() {
        try {
            const res = await api.post("/auth/forgot-password", { email });
            toast.success(res.data.message)
            navigate("/reset-password-email-sent")
        } catch (error) {
            toast.error("Failed to send reset link")
        }
    }
  return (  
    <div className="grid justify-center h-[100vh] items-center">
        <div className="grid gap-5">
            <h1 className="text-2xl font-bold">Forgot Password</h1>
            <div className="flex flex-col gap-4 w-[30rem]">
                <Input onChange={(e:any)=> setEmail(e.target.value)} type="email" placeholder="Enter your email" />
                <Button onClick={handleResetPassword}>Send Reset Link</Button>
            </div>
        </div>
    </div>
  )
}

export default ForgotPassword