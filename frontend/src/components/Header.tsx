/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/apiClient";
import { Moon, Sun, Sparkles, LogOut } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { ImageIcon } from "lucide-react";

function Header() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Editor", path: "/editor" },
    { name: "Themes", path: "/themes" },
    { name: "Docs", path: "/docs" },
    { name: "CLI", path: "/cli" },
  ];

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      window.location.href = "/login";
    } catch (error: any) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Left: Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            MarkPre
          </span>
        </Link>

        {/* Right: Nav Links + Actions - ALL IN ONE LINE */}
        <div className="flex items-center gap-2">
          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <Link 
  to="/assets" 
  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent"
>
  <ImageIcon className="w-5 h-5" />
  <span>Assets</span>
</Link>

          {/* Divider */}
          <div className="hidden md:block w-px h-6 bg-border mx-2" />

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-lg"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* Logout */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;