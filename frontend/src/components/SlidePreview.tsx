import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/apiClient";

interface SlidePreviewProps {
  markdown: string;
  themeId?: string | null;
}

interface Theme {
  _id: string;
  name: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

const SlidePreview = ({ markdown, themeId }: SlidePreviewProps) => {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = useMemo(() => {
    return markdown.split("---").filter(slide => slide.trim());
  }, [markdown]);

  useEffect(() => {
    if (themeId) {
      api.get(`/themes/get-theme/${themeId}`)
        .then(res => setTheme(res.data.data))
        .catch(() => setTheme(null));
    } else {
      setTheme(null);
    }
  }, [themeId]);

  const renderMarkdown = (text: string) => {
    const lines = text.trim().split("\n");
    return lines.map((line, i) => {
      // ✅ Image: ![alt](url)
      const imageMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imageMatch) {
        const [, alt, url] = imageMatch;
        return (
          <div key={i} className="flex justify-center my-6">
            <img
              src={url}
              alt={alt}
              className="max-w-full max-h-96 rounded-lg shadow-lg object-contain"
            />
          </div>
        );
      }

      if (line.startsWith("# ")) {
        return (
          <h1
            key={i}
            className="text-5xl font-bold mb-8"
            style={{ color: theme?.primaryColor || 'inherit' }}
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
            style={{ color: theme?.primaryColor || 'inherit' }}
          >
            {line.slice(3)}
          </h2>
        );
      }
      if (line.startsWith("### ")) {
        return <h3 key={i} className="text-3xl font-semibold mb-4">{line.slice(4)}</h3>;
      }
      if (line.startsWith("- ")) {
        return <li key={i} className="text-xl mb-2 ml-6">{line.slice(2)}</li>;
      }
      if (line.trim()) {
        return <p key={i} className="text-xl mb-4">{line}</p>;
      }
      return null;
    });
  };

  const slideStyles = theme
    ? {
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: theme.fontFamily,
      }
    : {};

  return (
    <div className="h-full flex flex-col bg-muted/30">
      <div className="flex-1 flex items-center justify-center p-8">
        <div
          className="w-full max-w-4xl aspect-video rounded-xl shadow-2xl p-12 flex flex-col justify-center transition-all overflow-auto"
          style={slideStyles}
        >
          {slides[currentSlide] ? (
            renderMarkdown(slides[currentSlide])
          ) : (
            <div className="text-center" style={{ color: theme?.textColor || 'inherit' }}>
              <p className="text-2xl opacity-60">Start writing to see your slides...</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t bg-card flex items-center justify-center gap-2">
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
      </div>
    </div>
  );
};

export default SlidePreview;