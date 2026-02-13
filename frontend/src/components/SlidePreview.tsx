import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

interface SlidePreviewProps {
  markdown: string;
}

const SlidePreview = ({ markdown }: SlidePreviewProps) => {
  const slides = useMemo(() => {
    return markdown.split("---").filter(slide => slide.trim());
  }, [markdown]);

  const [currentSlide, setCurrentSlide] = useState(0);

  const renderMarkdown = (text: string) => {
    const lines = text.trim().split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("# ")) {
        return <h1 key={i} className="text-5xl font-bold mb-8">{line.slice(2)}</h1>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={i} className="text-4xl font-bold mb-6">{line.slice(3)}</h2>;
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

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center p-8 bg-blue-300">
        <div className="w-full max-w-4xl aspect-video bg-card rounded-xl shadow-card p-12 flex flex-col justify-center animate-fade-in">
          {slides[currentSlide] ? renderMarkdown(slides[currentSlide]) : (
            <div className="text-center text-muted-foreground">
              <p className="text-2xl">Start writing to see your slides...</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t flex items-center justify-center gap-2">
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