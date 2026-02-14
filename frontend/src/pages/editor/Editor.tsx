/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import MarkdownEditor from "@/components/MarkdownEditor";
import SlidePreview from "@/components/SlidePreview";
import { Save, Download, ArrowLeft, Maximize2, Eye, EyeOff, Sparkles, Presentation, Wand2, FileText, Moon, Sun } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "@/components/theme-provider";

function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [title, setTitle] = useState("Untitled Presentation");
  const [markdown, setMarkdown] = useState("# Your Presentation\n\n---\n\n## Slide 2\n\nStart writing...");
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [themes, setThemes] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // AI States
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiSlideCount, setAiSlideCount] = useState(5);
  const [aiStyle, setAiStyle] = useState("professional");

  useEffect(() => {
    loadThemes();

    if (id) {
      loadPresentation();
    }

    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges && title && markdown) {
        handleSave(true);
      }
    }, 30000);

    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        setShowPreview(!showPreview);
      }
      if (e.key === "F11") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener("keydown", handleKeyboard);

    return () => {
      clearInterval(autoSaveInterval);
      document.removeEventListener("keydown", handleKeyboard);
    };
  }, [id, hasUnsavedChanges, showPreview]);

  const loadThemes = async () => {
    try {
      const res = await api.get("/themes/get-all-themes-for-user");
      console.log("Loaded themes:", res.data.data);
      setThemes(res.data.data || []);
    } catch (error) {
      console.error("Failed to load themes:", error);
      toast.error("Failed to load themes");
    }
  };

  const loadPresentation = async () => {
    try {
      const res = await api.get(`/presentations/get-presentation/${id}`);
      const data = res.data.data;
      
      console.log("Loaded presentation:", data);
      console.log("Theme from presentation:", data.theme);
      
      setTitle(data.title);
      setMarkdown(data.content);
      
      // CRITICAL: Properly extract theme ID
      if (data.theme) {
        if (typeof data.theme === 'string') {
          setSelectedTheme(data.theme);
          console.log("Theme ID (string):", data.theme);
        } else if (data.theme._id) {
          setSelectedTheme(data.theme._id);
          console.log("Theme ID (object):", data.theme._id);
        }
      } else {
        setSelectedTheme(null);
        console.log("No theme set");
      }
      
      setLastSaved(new Date(data.updatedAt));
      setHasUnsavedChanges(false);
    } catch (error: unknown) {
      console.error("Failed to load presentation:", error);
      toast.error("Failed to load presentation");
      navigate("/dashboard");
    }
  };

  const handleSave = async (isAutoSave = false) => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    console.log("Saving presentation with theme:", selectedTheme);

    setIsSaving(true);
    try {
      const payload = {
        title,
        content: markdown,
        theme: selectedTheme || null, // CRITICAL: Send theme ID
      };

      console.log("Save payload:", payload);

      if (id) {
        // Update existing
        const res = await api.put(`/presentations/update-presentation/${id}`, payload);
        console.log("Update response:", res.data);
      } else {
        // Create new
        const res = await api.post("/presentations/create-new-presentation", payload);
        console.log("Create response:", res.data);
        navigate(`/editor/${res.data.data._id}`, { replace: true });
      }

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      if (!isAutoSave) {
        toast.success("Presentation saved successfully");
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error("Failed to save presentation");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async (format: "pdf" | "html") => {
    if (!id) {
      toast.error("Please save the presentation first");
      return;
    }

    try {
      const toastId = toast.loading(`Exporting as ${format.toUpperCase()}...`);
      
      const response = await api.get(`/presentations/export/${id}?format=${format}`, {
        responseType: format === "pdf" ? "blob" : "text",
      });

      console.log("Export response received");

      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: format === "pdf" ? "application/pdf" : "text/html",
        })
      );
      
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${title}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      window.URL.revokeObjectURL(url);

      toast.dismiss(toastId);
      toast.success(`Exported successfully as ${format.toUpperCase()}`);
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(`Failed to export as ${format.toUpperCase()}`);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setAiGenerating(true);
    try {
      const response = await api.post("/ai/generate-slides", {
        topic: aiTopic,
        slideCount: aiSlideCount,
        style: aiStyle,
      });

      const generatedContent = response.data.data.content;
      setMarkdown(generatedContent);
      setTitle(aiTopic);
      setHasUnsavedChanges(true);
      setShowAIDialog(false);
      toast.success("Slides generated successfully!");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to generate slides";
      toast.error(errorMessage);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAIImprove = async () => {
    if (!markdown.trim()) {
      toast.error("No content to improve");
      return;
    }

    const toastId = toast.loading("Improving slides with AI...");
    try {
      const response = await api.post("/ai/improve-slides", {
        content: markdown,
      });

      setMarkdown(response.data.data.content);
      setHasUnsavedChanges(true);
      toast.dismiss(toastId);
      toast.success("Slides improved!");
    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error("Failed to improve slides");
    }
  };

  const handlePresentationMode = () => {
    if (!id) {
      toast.error("Please save the presentation first");
      return;
    }
    navigate(`/present/${id}`);
  };

  const handleContentChange = useCallback((newContent: string) => {
    setMarkdown(newContent);
    setHasUnsavedChanges(true);
  }, []);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setHasUnsavedChanges(true);
  }, []);

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const themeId = e.target.value || null;
    console.log("Theme selected:", themeId);
    setSelectedTheme(themeId);
    setHasUnsavedChanges(true);
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

  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Toolbar */}
      <div className="bg-card border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <Input
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled Presentation"
            className="max-w-md font-semibold text-lg border-0 focus-visible:ring-0"
          />

          {hasUnsavedChanges && (
            <span className="text-sm text-muted-foreground">● Unsaved changes</span>
          )}
          {lastSaved && !hasUnsavedChanges && (
            <span className="text-sm text-muted-foreground">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            title="Toggle dark mode"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* Theme Selector */}
          <select
            value={selectedTheme || ""}
            onChange={handleThemeChange}
            className="px-3 py-2 border rounded-md text-sm bg-background text-foreground"
          >
            <option value="">Default Theme</option>
            {themes.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>

          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>

          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            <Maximize2 className="w-4 h-4" />
          </Button>

          <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Sparkles className="w-4 h-4" />
                AI Generate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Slides with AI</DialogTitle>
                <DialogDescription>
                  Let AI create a complete presentation for you
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Introduction to Machine Learning"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slideCount">Number of Slides</Label>
                  <Input
                    id="slideCount"
                    type="number"
                    min="3"
                    max="20"
                    value={aiSlideCount}
                    onChange={(e) => setAiSlideCount(parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Style</Label>
                  <RadioGroup value={aiStyle} onValueChange={setAiStyle}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="professional" id="professional" />
                      <Label htmlFor="professional">Professional</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="casual" id="casual" />
                      <Label htmlFor="casual">Casual</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="academic" id="academic" />
                      <Label htmlFor="academic">Academic</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="creative" id="creative" />
                      <Label htmlFor="creative">Creative</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  onClick={handleAIGenerate}
                  disabled={aiGenerating || !aiTopic.trim()}
                  className="w-full"
                >
                  {aiGenerating ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Presentation
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={handleAIImprove} className="gap-2">
            <Wand2 className="w-4 h-4" />
            AI Improve
          </Button>

          {id && (
            <Button variant="outline" size="sm" onClick={handlePresentationMode} className="gap-2">
              <Presentation className="w-4 h-4" />
              Present
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={() => handleSave(false)} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>

          {id && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Export Presentation</AlertDialogTitle>
                  <AlertDialogDescription>
                    Choose your export format
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-4 py-4">
                  <Button onClick={() => handleExport("pdf")} className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Export as PDF
                  </Button>
                  <Button onClick={() => handleExport("html")} variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Export as HTML
                  </Button>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Editor & Preview */}
      <div className="flex-1 flex overflow-hidden">
        <div className={showPreview ? "w-1/2 border-r" : "w-full"}>
          <MarkdownEditor value={markdown} onChange={handleContentChange} />
        </div>

        {showPreview && (
          <div className="w-1/2">
            <SlidePreview markdown={markdown} />
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="bg-muted px-4 py-2 text-xs text-muted-foreground flex gap-4">
        <span><kbd className="px-2 py-1 bg-background rounded">Ctrl+S</kbd> Save</span>
        <span><kbd className="px-2 py-1 bg-background rounded">Ctrl+P</kbd> Toggle Preview</span>
        <span><kbd className="px-2 py-1 bg-background rounded">F11</kbd> Fullscreen</span>
      </div>
    </div>
  );
}

export default Editor;