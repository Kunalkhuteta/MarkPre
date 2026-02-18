/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Theme {
  _id: string;
  name: string;
  description: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

const PresentationView = () => {
  const { id } = useParams();
  const [presentation, setPresentation] = useState<any>(null);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchPresentation = async () => {
      try {
        const res = await api.get(`/presentations/get-presentation/${id}`);
        const data = res.data.data;
        setPresentation(data);

        if (data.theme) {
          const themeRes = await api.get(`/themes/get-theme/${data.theme}`);
          setTheme(themeRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch presentation:", err);
      }
    };

    fetchPresentation();
  }, [id]);

  const slides = useMemo(() => {
    if (!presentation?.content) return [];
    return presentation.content.split("---").filter((s: string) => s.trim());
  }, [presentation]);

  // ✅ REPLACE the renderMarkdown function in PresentationView.tsx with this:

const renderMarkdown = (text: string) => {
  const lines = text.trim().split("\n");
  return lines.map((line, i) => {
    // ✅ Image: ![alt](url)
    const imageMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imageMatch) {
      const [, alt, url] = imageMatch;
      return (
        <div key={i} className="flex justify-center my-8">
          <img
            src={url}
            alt={alt}
            className="max-w-full max-h-[500px] rounded-xl shadow-2xl object-contain"
          />
        </div>
      );
    }

    if (line.startsWith("# "))
      return (
        <h1 key={i} className="text-6xl font-bold mb-8">
          {line.slice(2)}
        </h1>
      );
    if (line.startsWith("## "))
      return (
        <h2 key={i} className="text-4xl font-semibold mb-6">
          {line.slice(3)}
        </h2>
      );
    if (line.startsWith("- "))
      return (
        <li key={i} className="text-2xl mb-3 list-disc ml-10">
          {line.slice(2)}
        </li>
      );
    if (line.trim())
      return (
        <p key={i} className="text-2xl mb-6">
          {line}
        </p>
      );
    return null;
  });
};

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  if (!presentation)
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading presentation...
      </div>
    );

 return (
  <div
    className="w-screen h-screen overflow-hidden flex flex-col"
    style={{
      backgroundColor: theme?.backgroundColor || "#f9fafb",
      color: theme?.textColor || "#000",
      fontFamily: theme?.fontFamily || "sans-serif",
    }}
  >
    <div className="flex-1 flex items-center justify-center px-12 py-10">
      <div className="max-w-6xl w-full aspect-video flex flex-col justify-center items-center rounded-2xl shadow-2xl p-12">
        {slides[currentSlide] ? (
          <div className="w-full h-full text-center overflow-hidden">
            {renderMarkdown(slides[currentSlide])}
          </div>
        ) : (
          <p className="text-2xl opacity-50">No slides to display</p>
        )}
      </div>
    </div>

    {/* Navigation Arrows */}
    <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full bg-background/90 hover:bg-background border-2 shadow-xl pointer-events-auto"
        onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
        disabled={currentSlide === 0}
      >
        <ArrowLeft className="w-6 h-6 text-foreground" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="rounded-full bg-background/90 hover:bg-background border-2 shadow-xl pointer-events-auto"
        onClick={() =>
          setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))
        }
        disabled={currentSlide >= slides.length - 1}
      >
        <ArrowRight className="w-6 h-6 text-foreground" />
      </Button>
    </div>

    {/* Slide Counter */}
    <div className="absolute bottom-6 w-full text-center">
      <span className="inline-block bg-background/90 backdrop-blur px-4 py-2 rounded-full text-sm font-medium text-foreground border-2 shadow-lg">
        Slide {currentSlide + 1} of {slides.length || 1}
      </span>
    </div>
  </div>
);

};

export default PresentationView;
