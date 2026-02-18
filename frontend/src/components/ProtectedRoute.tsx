import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import type { RootState } from "../app/store";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute() {
  const { isLoggedIn, isEmailVerified, requiresVerification, loading } = useSelector(
    (state: RootState) => state.auth
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // ✅ In verification flow - let them through to /verify-email
  if (requiresVerification) {
    return <Navigate to="/verify-email" replace />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <Outlet />;
}