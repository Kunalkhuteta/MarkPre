/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { api } from '@/lib/apiClient';
import { Eye, EyeOff, Lock, ShieldCheck, ArrowLeft } from 'lucide-react';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const getStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];

  async function resetPassword() {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      toast.success("Password reset successful");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

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
        position: "absolute", width: 400, height: 400,
        borderRadius: "50%", top: "-100px", right: "-100px",
        background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: 300, height: 300,
        borderRadius: "50%", bottom: "-80px", left: "-80px",
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

        {/* Back to login */}
        <button
          onClick={() => navigate("/login")}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            color: "rgba(255,255,255,0.4)", background: "none",
            border: "none", cursor: "pointer", fontSize: 13,
            marginBottom: "1.5rem", padding: 0,
            transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
        >
          <ArrowLeft size={14} /> Back to login
        </button>

        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: success
            ? "linear-gradient(135deg, #22c55e, #16a34a)"
            : "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "1.25rem",
          boxShadow: success
            ? "0 8px 24px rgba(34,197,94,0.3)"
            : "0 8px 24px rgba(99,102,241,0.3)",
          transition: "all 0.4s ease",
        }}>
          {success
            ? <ShieldCheck size={26} color="white" />
            : <Lock size={26} color="white" />
          }
        </div>

        <h1 style={{
          fontSize: "1.6rem", fontWeight: 700,
          color: "white", margin: "0 0 0.4rem",
          letterSpacing: "-0.02em",
        }}>
          {success ? "All done!" : "Set new password"}
        </h1>
        <p style={{
          fontSize: 14, color: "rgba(255,255,255,0.45)",
          margin: "0 0 2rem", lineHeight: 1.5,
        }}>
          {success
            ? "Your password has been reset. Redirecting you to login..."
            : "Choose a strong password you haven't used before."}
        </p>

        {!success && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Password field */}
            <div>
              <label style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", display: "block", marginBottom: 6 }}>
                New Password
              </label>
              <div style={{ position: "relative" }}>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12, color: "white",
                    paddingRight: "2.5rem", height: 46,
                    fontSize: 14,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(255,255,255,0.4)", padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength bar */}
              {password.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 4,
                        background: i <= strength ? strengthColors[strength] : "rgba(255,255,255,0.1)",
                        transition: "background 0.3s",
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: strengthColors[strength] }}>
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm field */}
            <div>
              <label style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", display: "block", marginBottom: 6 }}>
                Confirm Password
              </label>
              <div style={{ position: "relative" }}>
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e: any) => setConfirmPassword(e.target.value)}
                  style={{
                    background: confirmPassword && confirmPassword !== password
                      ? "rgba(239,68,68,0.08)"
                      : "rgba(255,255,255,0.06)",
                    border: confirmPassword && confirmPassword !== password
                      ? "1px solid rgba(239,68,68,0.4)"
                      : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12, color: "white",
                    paddingRight: "2.5rem", height: 46,
                    fontSize: 14, transition: "all 0.2s",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(255,255,255,0.4)", padding: 0,
                  }}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>Passwords don't match</p>
              )}
            </div>

            <Button
              onClick={resetPassword}
              disabled={loading || !password || !confirmPassword}
              style={{
                marginTop: 8, height: 48, borderRadius: 12, fontSize: 15,
                fontWeight: 600, letterSpacing: "-0.01em",
                background: loading
                  ? "rgba(99,102,241,0.5)"
                  : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                transition: "all 0.2s", color: "white",
              }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        )}

        {success && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, color: "#22c55e", fontSize: 14, fontWeight: 500,
          }}>
            <ShieldCheck size={16} />
            Redirecting to login...
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        input::placeholder { color: rgba(255,255,255,0.25) !important; }
        input:focus { outline: none !important; border-color: rgba(99,102,241,0.5) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important; }
      `}</style>
    </div>
  )
}

export default ResetPassword