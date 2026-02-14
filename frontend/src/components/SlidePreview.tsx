import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/apiClient";
import { useParams } from "react-router-dom";

interface SlidePreviewProps {
  markdown: string;
}

interface Theme {
  _id: string;
  name: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

const SlidePreview = ({ markdown }: SlidePreviewProps) => {
  const { id } = useParams();
  const [theme, setTheme] = useState<Theme | null>(null);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);

  const slides = useMemo(() => {
    return markdown.split("---").filter(slide => slide.trim());
  }, [markdown]);

  const [currentSlide, setCurrentSlide] = useState(0);

  // Load presentation theme
  useEffect(() => {
    const loadPresentationTheme = async () => {
      if (!id) return;
      
      try {
        const res = await api.get(`/presentations/get-presentation/${id}`);
        const presentation = res.data.data;
        
        if (presentation.theme) {
          if (typeof presentation.theme === 'string') {
            // Theme is just an ID, fetch it
            setSelectedThemeId(presentation.theme);
            const themeRes = await api.get(`/themes/get-theme/${presentation.theme}`);
            setTheme(themeRes.data.data);
          } else {
            // Theme is populated
            setTheme(presentation.theme);
            setSelectedThemeId(presentation.theme._id);
          }
        }
      } catch (error) {
        console.error("Failed to load theme:", error);
      }
    };

    loadPresentationTheme();
  }, [id]);

  const getThemeStyles = () => {
    if (theme) {
      return {
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: theme.fontFamily,
      };
    }
    return {
      backgroundColor: "#ffffff",
      color: "#1e293b",
      fontFamily: "Inter, sans-serif",
    };
  };

  const getHeadingColor = () => {
    return theme?.primaryColor || "#3b82f6";
  };

  const renderMarkdown = (text: string) => {
    const themeStyles = getThemeStyles();
    const headingColor = getHeadingColor();
    
    const lines = text.trim().split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("# ")) {
        return (
          <h1
            key={i}
            className="text-5xl font-bold mb-8"
            style={{ color: headingColor, fontFamily: themeStyles.fontFamily }}
          >
            {line.slice(2)}
          </h1>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2
            key={i}
            className="text-4xl font-bold mb-6"
            style={{ color: headingColor, fontFamily: themeStyles.fontFamily }}
          >
            {line.slice(3)}
          </h2>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h3
            key={i}
            className="text-3xl font-semibold mb-4"
            style={{ color: themeStyles.color, fontFamily: themeStyles.fontFamily }}
          >
            {line.slice(4)}
          </h3>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <li
            key={i}
            className="text-xl mb-2 ml-6"
            style={{ color: themeStyles.color, fontFamily: themeStyles.fontFamily }}
          >
            {line.slice(2)}
          </li>
        );
      }
      if (line.trim()) {
        return (
          <p
            key={i}
            className="text-xl mb-4"
            style={{ color: themeStyles.color, fontFamily: themeStyles.fontFamily }}
          >
            {line}
          </p>
        );
      }
      return null;
    });
  };

  const themeStyles = getThemeStyles();

  return (
    <div className="h-full flex flex-col">
      <div
        className="flex-1 flex items-center justify-center p-8"
        style={{
          background: theme
            ? `linear-gradient(135deg, ${theme.primaryColor}20 0%, ${theme.primaryColor}10 100%)`
            : "linear-gradient(135deg, #bfdbfe 0%, #dbeafe 100%)",
        }}
      >
        <div
          className="w-full max-w-4xl aspect-video rounded-xl shadow-2xl p-12 flex flex-col justify-center animate-fade-in overflow-auto"
          style={themeStyles}
        >
          {slides[currentSlide] ? (
            renderMarkdown(slides[currentSlide])
          ) : (
            <div className="text-center" style={{ color: themeStyles.color }}>
              <p className="text-2xl opacity-50">Start writing to see your slides...</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t flex items-center justify-center gap-2 bg-background">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground px-4">
          Slide {currentSlide + 1} of {slides.length || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
          disabled={currentSlide >= slides.length - 1}
        >
          Next
        </Button>
        {theme && (
          <span className="text-xs text-muted-foreground ml-4">
            Theme: {theme.name}
          </span>
        )}
      </div>
    </div>
  );
};

export default SlidePreview;