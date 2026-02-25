/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { verifyEmail, checkAuthStatus } from "@/features/auth/authThunk";
import { api } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Mail, RefreshCw, CheckCircle, ArrowLeft, ShieldCheck } from "lucide-react";

function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }
    try {
      await dispatch(verifyEmail(otp)).unwrap();
      await dispatch(checkAuthStatus());
      setVerified(true);
      toast.success("Email verified successfully!");
    } catch (error: any) {
      toast.error(error || "Verification failed. Please check your code and try again.");
      setOtp("");
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    setIsResending(true);
    try {
      await api.post("/auth/generate-email-verification-token");
      toast.success("A new verification code has been sent to your email");
      setCountdown(60);
      setOtp("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
      fontFamily: "'DM Sans', sans-serif",
      padding: "1rem",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background orbs */}
      <div style={{
        position: "absolute", width: 400, height: 400, borderRadius: "50%",
        top: "-100px", right: "-100px",
        background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: 300, height: 300, borderRadius: "50%",
        bottom: "-80px", left: "-80px",
        background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        width: "100%", maxWidth: 420,
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24,
        padding: "2.5rem",
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        position: "relative",
      }}>

        {!verified ? (
          <>
            {/* Icon */}
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "1.25rem",
              boxShadow: "0 8px 24px rgba(99,102,241,0.3)",
            }}>
              <Mail size={26} color="white" />
            </div>

            <h1 style={{
              fontSize: "1.6rem", fontWeight: 700, color: "white",
              margin: "0 0 0.4rem", letterSpacing: "-0.02em",
            }}>
              Verify your email
            </h1>
            <p style={{
              fontSize: 14, color: "rgba(255,255,255,0.45)",
              margin: "0 0 0.25rem", lineHeight: 1.5,
            }}>
              We've sent a 6-digit code to
            </p>
            <p style={{
              fontSize: 14, fontWeight: 600,
              color: "rgba(255,255,255,0.8)",
              margin: "0 0 2rem",
            }}>
              {user?.email}
            </p>

            {/* OTP Input */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
              <InputOTP maxLength={6} value={otp} onChange={setOtp} onComplete={handleVerify}>
                <InputOTPGroup style={{ gap: 8 }}>
                  {[0,1,2,3,4,5].map(i => (
                    <InputOTPSlot key={i} index={i} style={{
                      width: 48, height: 52, borderRadius: 12, fontSize: 20,
                      fontWeight: 700, border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.06)", color: "white",
                    }} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", textAlign: "center", marginBottom: "1.5rem" }}>
              Enter the 6-digit code from your email
            </p>

            {/* Verify button */}
            <Button
              onClick={handleVerify}
              disabled={otp.length !== 6 || loading}
              style={{
                width: "100%", height: 48, borderRadius: 12, fontSize: 15,
                fontWeight: 600, letterSpacing: "-0.01em",
                background: otp.length !== 6 || loading
                  ? "rgba(99,102,241,0.4)"
                  : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none", cursor: otp.length !== 6 || loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                color: "white", marginBottom: "1rem",
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} />
                  Verifying...
                </span>
              ) : (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <CheckCircle size={16} />
                  Verify Email
                </span>
              )}
            </Button>

            {/* Divider */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              margin: "1.25rem 0", color: "rgba(255,255,255,0.2)", fontSize: 11,
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              Didn't receive it?
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            </div>

            {/* Resend button */}
            <button
              onClick={handleResendCode}
              disabled={isResending || countdown > 0}
              style={{
                width: "100%", height: 44, borderRadius: 12, fontSize: 14,
                fontWeight: 500, background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: countdown > 0 ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)",
                cursor: isResending || countdown > 0 ? "not-allowed" : "pointer",
                transition: "all 0.2s", marginBottom: "1.25rem",
              }}
              onMouseEnter={e => { if (!isResending && countdown === 0) e.currentTarget.style.background = "rgba(255,255,255,0.08)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
            >
              {isResending ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
            </button>

            {/* Tip */}
            <div style={{
              background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: 10, padding: "0.75rem 1rem",
            }}>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.6 }}>
                <span style={{ color: "rgba(99,102,241,0.9)", fontWeight: 600 }}>Tip: </span>
                The code expires in 10 minutes. Check your spam folder if you don't see it.
              </p>
            </div>
          </>
        ) : (
          /* ✅ Success state */
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.5rem",
              boxShadow: "0 8px 32px rgba(34,197,94,0.35)",
            }}>
              <ShieldCheck size={34} color="white" />
            </div>

            <h1 style={{
              fontSize: "1.6rem", fontWeight: 700, color: "white",
              margin: "0 0 0.5rem", letterSpacing: "-0.02em",
            }}>
              Email verified!
            </h1>
            <p style={{
              fontSize: 14, color: "rgba(255,255,255,0.45)",
              margin: "0 0 2rem", lineHeight: 1.6,
            }}>
              Your email has been verified successfully.<br />
              You can now access your account.
            </p>

            <button
              onClick={() => navigate("/dashboard")}
              style={{
                width: "100%", height: 48, borderRadius: 12, fontSize: 15,
                fontWeight: 600, background: "linear-gradient(135deg, #22c55e, #16a34a)",
                border: "none", cursor: "pointer", color: "white",
                boxShadow: "0 4px 16px rgba(34,197,94,0.3)",
                marginBottom: "0.75rem", letterSpacing: "-0.01em",
              }}
            >
              Go to Dashboard
            </button>

            <button
              onClick={() => navigate("/login")}
              style={{
                width: "100%", height: 44, borderRadius: 12, fontSize: 14,
                fontWeight: 500, background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.6)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <ArrowLeft size={14} /> Back to Login
            </button>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default VerifyEmail;