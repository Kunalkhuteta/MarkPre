/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, type JSX } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Maximize, Grid3x3, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

interface Theme {
  _id: string;
  name: string;
  description: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

const PresentationMode = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme: appTheme, setTheme: setAppTheme } = useTheme();
  
  const [presentation, setPresentation] = useState<any>(null);
  const [presentationTheme, setPresentationTheme] = useState<Theme | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showOverview, setShowOverview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const slides = useMemo(() => {
    if (!presentation?.content) return [];
    return presentation.content.split("---").filter((s: string) => s.trim());
  }, [presentation]);

  useEffect(() => {
    fetchPresentation();

    // Hide controls after 3 seconds of inactivity
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
    };
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          nextSlide();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prevSlide();
          break;
        case "Escape":
          if (showOverview) {
            setShowOverview(false);
          } else if (isFullscreen) {
            exitFullscreen();
          } else {
            navigate(`/editor/${id}`);
          }
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "g":
        case "G":
          e.preventDefault();
          setShowOverview(!showOverview);
          break;
        case "Home":
          e.preventDefault();
          setCurrentSlide(0);
          break;
        case "End":
          e.preventDefault();
          setCurrentSlide(slides.length - 1);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, slides.length, showOverview, isFullscreen]);

  const fetchPresentation = async () => {
    try {
      const res = await api.get(`/presentations/get-presentation/${id}`);
      const data = res.data.data;
      setPresentation(data);

      // Fetch theme if presentation has one
      if (data.theme && typeof data.theme === 'string') {
        try {
          const themeRes = await api.get(`/themes/get-theme/${data.theme}`);
          setPresentationTheme(themeRes.data.data);
        } catch (err) {
          console.error("Failed to fetch theme:", err);
        }
      } else if (data.theme && typeof data.theme === 'object') {
        // Theme already populated
        setPresentationTheme(data.theme);
      }
    } catch (err) {
      console.error("Failed to fetch presentation:", err);
      navigate("/dashboard");
    }
  };

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setShowOverview(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleDarkMode = () => {
    setAppTheme(appTheme === "dark" ? "light" : "dark");
  };

  // ✅ REPLACE the renderMarkdown function in PresentationMode.tsx with this:

const renderMarkdown = (text: string) => {
  const lines = text.trim().split("\n");
  const elements: JSX.Element[] = [];

  lines.forEach((line, i) => {
    // ✅ Image: ![alt](url)
    const imageMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imageMatch) {
      const [, alt, url] = imageMatch;
      elements.push(
        <div key={i} className="flex justify-center my-8">
          <img
            src={url}
            alt={alt}
            className="max-w-full max-h-[600px] rounded-xl shadow-2xl object-contain"
          />
        </div>
      );
      return;
    }

    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="text-6xl font-bold mb-8">
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-5xl font-semibold mb-6">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-4xl font-semibold mb-4">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("- ")) {
      elements.push(
        <li key={i} className="text-2xl mb-3 list-disc ml-10">
          {line.slice(2)}
        </li>
      );
    } else if (line.trim()) {
      elements.push(
        <p key={i} className="text-2xl mb-6">
          {line}
        </p>
      );
    }
  });

  return <>{elements}</>;
};

  const progress = ((currentSlide + 1) / slides.length) * 100;

  // Get theme colors with fallbacks
  const getThemeStyles = () => {
    if (presentationTheme) {
      return {
        backgroundColor: presentationTheme.backgroundColor,
        color: presentationTheme.textColor,
        fontFamily: presentationTheme.fontFamily,
      };
    }
    // Default theme based on app theme
    return appTheme === "dark"
      ? { backgroundColor: "#1e293b", color: "#f1f5f9", fontFamily: "Inter, sans-serif" }
      : { backgroundColor: "#ffffff", color: "#1e293b", fontFamily: "Inter, sans-serif" };
  };

  

  if (!presentation) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-lg">Loading presentation...</div>
      </div>
    );
  }

  if (showOverview) {
    const themeStyles = getThemeStyles();
    
    return (
      <div className="fixed inset-0 bg-background overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Slide Overview</h2>
            <Button variant="outline" onClick={() => setShowOverview(false)}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {slides.map((slide: string, index: number) => (
              <div
                key={index}
                onClick={() => goToSlide(index)}
                className={`
                  cursor-pointer rounded-lg border-2 p-6 transition-all hover:shadow-xl
                  ${currentSlide === index ? "border-primary ring-4 ring-primary/20" : "border-border hover:border-primary/50"}
                `}
                style={{
                  backgroundColor: themeStyles.backgroundColor,
                  color: themeStyles.color,
                  fontFamily: themeStyles.fontFamily,
                }}
              >
                <div className="aspect-video flex items-center justify-center text-xs overflow-hidden">
<div>{renderMarkdown(slide.substring(0, 100) + "...")}</div>                </div>
                <div className="text-center mt-2 text-sm font-medium">
                  Slide {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const themeStyles = getThemeStyles();

 return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ backgroundColor: appTheme === "dark" ? "#0f172a" : "#f1f5f9" }}
    >
      {/* Main Slide Area */}
      <div className="flex-1 flex items-center justify-center p-12">
        <div
          className="max-w-6xl w-full aspect-video flex items-center justify-center rounded-2xl shadow-2xl p-16 transition-all duration-300"
          style={themeStyles}
        >
          <div
  className="prose prose-lg max-w-none overflow-auto w-full h-full"
  style={{ color: themeStyles.color }}
>
  {renderMarkdown(slides[currentSlide] || "")}
</div>
      </div>
      </div>

      {/* Controls Overlay */}
      <div
        className={`
          fixed inset-x-0 bottom-0 p-6 transition-opacity duration-300
          ${showControls ? "opacity-100" : "opacity-0"}
        `}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="rounded-full bg-background/95 backdrop-blur border-2 hover:bg-background"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </Button>

            <div className="bg-background/95 backdrop-blur border-2 px-4 py-2 rounded-full text-sm font-medium text-foreground">
              {currentSlide + 1} / {slides.length}
            </div>

            <Button
              variant="secondary"
              size="icon"
              onClick={nextSlide}
              disabled={currentSlide >= slides.length - 1}
              className="rounded-full bg-background/95 backdrop-blur border-2 hover:bg-background"
            >
              <ChevronRight className="w-6 h-6 text-foreground" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setShowOverview(true)}
              className="rounded-full bg-background/95 backdrop-blur border-2 hover:bg-background"
              title="Grid overview (G)"
            >
              <Grid3x3 className="w-4 h-4 text-foreground" />
            </Button>

            <Button
              variant="secondary"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-full bg-background/95 backdrop-blur border-2 hover:bg-background"
              title="Toggle dark mode"
            >
              {appTheme === "dark" ? (
                <Sun className="w-4 h-4 text-foreground" />
              ) : (
                <Moon className="w-4 h-4 text-foreground" />
              )}
            </Button>

            <Button
              variant="secondary"
              size="icon"
              onClick={toggleFullscreen}
              className="rounded-full bg-background/95 backdrop-blur border-2 hover:bg-background"
              title="Fullscreen (F)"
            >
              <Maximize className="w-4 h-4 text-foreground" />
            </Button>

            <Button
              variant="secondary"
              size="icon"
              onClick={() => navigate(`/editor/${id}`)}
              className="rounded-full bg-background/95 backdrop-blur border-2 hover:bg-background"
              title="Exit (Esc)"
            >
              <X className="w-4 h-4 text-foreground" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mt-4">
          <div className="h-1.5 bg-background/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div
        className={`
          fixed top-20 right-4 bg-background/95 backdrop-blur border-2 px-4 py-3 rounded-lg text-xs
          transition-opacity duration-300
          ${showControls ? "opacity-100" : "opacity-0"}
        `}
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <span className="text-muted-foreground font-medium">→ / Space</span>
          <span className="text-foreground">Next</span>
          <span className="text-muted-foreground font-medium">←</span>
          <span className="text-foreground">Previous</span>
          <span className="text-muted-foreground font-medium">F</span>
          <span className="text-foreground">Fullscreen</span>
          <span className="text-muted-foreground font-medium">G</span>
          <span className="text-foreground">Overview</span>
          <span className="text-muted-foreground font-medium">Esc</span>
          <span className="text-foreground">Exit</span>
        </div>
      </div>
    </div>
  );
};

export default PresentationMode;