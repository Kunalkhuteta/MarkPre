/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/apiClient";
import { Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

function Header() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Editor", path: "/editor" },
    { name: "Themes", path: "/themes" },
    { name: "Assets", path: "/assets" },
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

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity group">
          {/* SVG Icon */}
          <div className="w-9 h-9 shrink-0">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <rect width="64" height="64" rx="14" fill="#2563EB"/>
              <rect x="10" y="13" width="44" height="32" rx="4" fill="white" fillOpacity="0.15"/>
              <rect x="10" y="13" width="44" height="32" rx="4" stroke="white" strokeWidth="2" strokeOpacity="0.6"/>
              <path d="M18 36V22l7 9 7-9v14" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M38 29l8 3-8 3V29z" fill="white" fillOpacity="0.9"/>
              <circle cx="26" cy="52" r="2.5" fill="white" fillOpacity="0.4"/>
              <circle cx="32" cy="52" r="2.5" fill="white"/>
              <circle cx="38" cy="52" r="2.5" fill="white" fillOpacity="0.4"/>
            </svg>
          </div>

          {/* Wordmark */}
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              MarkPre
            </span>
            <span className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase">
              Presentations
            </span>
          </div>
        </Link>

        {/* Nav + Actions */}
        <div className="flex items-center gap-1">
          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-0.5 mr-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  location.pathname === item.path ||
                  (item.path !== "/editor" && location.pathname.startsWith(item.path))
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className="hidden md:block w-px h-5 bg-border mx-1" />

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-lg w-9 h-9"
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark"
              ? <Sun className="w-4 h-4" />
              : <Moon className="w-4 h-4" />}
          </Button>

          {/* Logout */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2 ml-1 font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;