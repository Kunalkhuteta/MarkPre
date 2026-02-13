import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import type { RootState } from "../app/store";
import { Loader2 } from "lucide-react";

export default function GuestRoute() {
  const { isLoggedIn, isEmailVerified, loading } = useSelector(
    (state: RootState) => state.auth
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Loading MarkPre...</p>
        </div>
      </div>
    );
  }

  if (isLoggedIn && !isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}