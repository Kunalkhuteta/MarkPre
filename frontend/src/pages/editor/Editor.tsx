/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams, useBlocker } from "react-router-dom";
import { api } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import MarkdownEditor from "@/components/MarkdownEditor";
import SlidePreview from "@/components/SlidePreview";
import {
  Save, Download, ArrowLeft, Maximize2, Eye, EyeOff,
  Sparkles, Presentation, Wand2, FileText, Moon, Sun,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "@/components/theme-provider";
import AssetManager from "@/components/AssetManager";

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
  const [_isFullscreen, setIsFullscreen] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiSlideCount, setAiSlideCount] = useState(5);
  const [aiStyle, setAiStyle] = useState("professional");

  // ✅ Refs to always have latest values in callbacks (fixes stale closure)
  const markdownRef = useRef(markdown);
  const titleRef = useRef(title);
  const selectedThemeRef = useRef(selectedTheme);
  const idRef = useRef(id);

  useEffect(() => { markdownRef.current = markdown; }, [markdown]);
  useEffect(() => { titleRef.current = title; }, [title]);
  useEffect(() => { selectedThemeRef.current = selectedTheme; }, [selectedTheme]);
  useEffect(() => { idRef.current = id; }, [id]);

  // ✅ useBlocker intercepts ALL navigation including browser back button
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

  // ✅ Browser tab close / refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // ✅ FIXED: Only depends on [id] — never re-runs when typing
  useEffect(() => {
    loadThemes();
    if (id) loadPresentation();
  }, [id]);

  // Auto-save — separate effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasUnsavedChanges) handleSave(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [hasUnsavedChanges]);

  // Keyboard shortcuts — separate effect, no deps needed since we use refs
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); handleSave(false); }
      if ((e.ctrlKey || e.metaKey) && e.key === "p") { e.preventDefault(); setShowPreview((p) => !p); }
      if (e.key === "F11") { e.preventDefault(); toggleFullscreen(); }
    };
    document.addEventListener("keydown", handleKeyboard);
    return () => document.removeEventListener("keydown", handleKeyboard);
  }, []);

  const loadThemes = async () => {
    try {
      const res = await api.get("/themes/get-all-themes-for-user");
      setThemes(res.data.data || []);
    } catch { console.error("Failed to load themes"); }
  };

  const loadPresentation = async () => {
    try {
      const res = await api.get(`/presentations/get-presentation/${id}`);
      const data = res.data.data;
      setTitle(data.title);
      setMarkdown(data.content);
      setSelectedTheme(data.theme?._id || null);
      setLastSaved(new Date(data.updatedAt));
      setHasUnsavedChanges(false);
    } catch {
      toast.error("Failed to load presentation");
      navigate("/dashboard");
    }
  };

  // ✅ FIXED: Reads from refs so it always has latest values even in stale closures
  const handleSave = useCallback(async (isAutoSave = false) => {
    const currentTitle = titleRef.current;
    const currentMarkdown = markdownRef.current;
    const currentTheme = selectedThemeRef.current;
    const currentId = idRef.current;

    if (!currentTitle.trim()) { toast.error("Please enter a title"); return; }
    setIsSaving(true);
    try {
      if (currentId) {
        await api.put(`/presentations/update-presentation/${currentId}`, {
          title: currentTitle,
          content: currentMarkdown,
          theme: currentTheme,
        });
      } else {
        const res = await api.post("/presentations/create-new-presentation", {
          title: currentTitle,
          content: currentMarkdown,
          theme: currentTheme,
        });
        navigate(`/editor/${res.data.data._id}`, { replace: true });
      }
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      if (!isAutoSave) toast.success("Presentation saved successfully");
    } catch {
      toast.error("Failed to save presentation");
    } finally {
      setIsSaving(false);
    }
  }, []); // ✅ empty deps — always uses latest via refs

  const handleSaveAndProceed = async () => {
    await handleSave(false);
    blocker.proceed?.();
  };

  const handleExport = async (format: "pdf" | "html") => {
    if (!id) { toast.error("Please save first"); return; }
    try {
      toast.loading(`Exporting as ${format.toUpperCase()}...`);
      const response = await api.get(`/presentations/export/${id}?format=${format}`, {
        responseType: format === "pdf" ? "blob" : "text",
      });
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: format === "pdf" ? "application/pdf" : "text/html" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${title}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.dismiss();
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch { toast.dismiss(); toast.error("Failed to export"); }
  };

  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) { toast.error("Please enter a topic"); return; }
    setAiGenerating(true);
    try {
      const response = await api.post("/ai/generate-slides", {
        topic: aiTopic, slideCount: aiSlideCount, style: aiStyle,
      });
      setMarkdown(response.data.data.content);
      setTitle(aiTopic);
      setHasUnsavedChanges(true);
      setShowAIDialog(false);
      toast.success("Slides generated!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate slides");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAIImprove = async () => {
    if (!markdown.trim()) { toast.error("No content to improve"); return; }
    toast.loading("Improving slides...");
    try {
      const response = await api.post("/ai/improve-slides", { content: markdown });
      setMarkdown(response.data.data.content);
      setHasUnsavedChanges(true);
      toast.dismiss();
      toast.success("Slides improved!");
    } catch { toast.dismiss(); toast.error("Failed to improve slides"); }
  };

  // ✅ useCallback with empty deps — stable reference, no re-render loops
  const handleContentChange = useCallback((newContent: string) => {
    setMarkdown(newContent);
    setHasUnsavedChanges(true);
  }, []);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setHasUnsavedChanges(true);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">

      {/* ✅ Unsaved Changes Dialog — driven by useBlocker */}
      <AlertDialog open={blocker.state === "blocked"}>
        <AlertDialogContent className="bg-card border border-border shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              You have unsaved changes. What would you like to do before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 sm:flex-row flex-col">
            <AlertDialogCancel className="sm:mr-auto" onClick={() => blocker.reset?.()}>
              Stay on Page
            </AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => { setHasUnsavedChanges(false); blocker.proceed?.(); }}
              className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
            >
              Discard Changes
            </Button>
            <AlertDialogAction onClick={handleSaveAndProceed}>
              Save & Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toolbar */}
      <div className="bg-card border-b px-6 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Input
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled Presentation"
            className="max-w-xs font-semibold text-base border-0 focus-visible:ring-0 bg-transparent"
          />
          {hasUnsavedChanges && (
            <span className="text-xs text-amber-500 font-medium flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Unsaved
            </span>
          )}
          {lastSaved && !hasUnsavedChanges && (
            <span className="text-xs text-muted-foreground shrink-0">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          <AssetManager
            onSelectAsset={(asset) => {
              setMarkdown((prev) => prev + `\n![${asset.name}](${asset.url})\n`);
              setHasUnsavedChanges(true);
              toast.success("Image inserted");
            }}
          />

          <select
            value={selectedTheme || ""}
            onChange={(e) => { setSelectedTheme(e.target.value || null); setHasUnsavedChanges(true); }}
            className="px-2 py-1.5 border border-border rounded-md text-sm bg-background text-foreground"
          >
            <option value="">Default Theme</option>
            {themes.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>

          <Button variant="outline" size="sm" onClick={() => setShowPreview((p) => !p)}>
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>

          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            <Maximize2 className="w-4 h-4" />
          </Button>

          {/* AI Generate */}
          <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Sparkles className="w-4 h-4" /> AI
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border border-border">
              <DialogHeader>
                <DialogTitle>Generate Slides with AI</DialogTitle>
                <DialogDescription>Let AI create a presentation for you</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Topic</Label>
                  <Input placeholder="e.g., Machine Learning Basics" value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Number of Slides</Label>
                  <Input type="number" min="3" max="20" value={aiSlideCount} onChange={(e) => setAiSlideCount(parseInt(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Style</Label>
                  <RadioGroup value={aiStyle} onValueChange={setAiStyle} className="grid grid-cols-2 gap-2">
                    {["professional", "casual", "academic", "creative"].map((s) => (
                      <div key={s} className="flex items-center space-x-2 border border-border rounded-md p-2">
                        <RadioGroupItem value={s} id={s} />
                        <Label htmlFor={s} className="capitalize cursor-pointer">{s}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <Button onClick={handleAIGenerate} disabled={aiGenerating || !aiTopic.trim()} className="w-full">
                  {aiGenerating ? "Generating..." : <><Sparkles className="w-4 h-4 mr-2" />Generate</>}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={handleAIImprove} className="gap-1.5">
            <Wand2 className="w-4 h-4" /> Improve
          </Button>

          {id && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/present/${id}`)} className="gap-1.5">
              <Presentation className="w-4 h-4" /> Present
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={() => handleSave(false)} disabled={isSaving}>
            <Save className="w-4 h-4 mr-1.5" />
            {isSaving ? "Saving..." : "Save"}
          </Button>

          {id && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm"><Download className="w-4 h-4 mr-1.5" />Export</Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle>Export Presentation</AlertDialogTitle>
                  <AlertDialogDescription>Choose your export format</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-3 py-4">
                  <Button onClick={() => handleExport("pdf")} className="w-full">
                    <FileText className="w-4 h-4 mr-2" />Export as PDF
                  </Button>
                  <Button onClick={() => handleExport("html")} variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />Export as HTML
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
            <SlidePreview markdown={markdown} themeId={selectedTheme} />
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts */}
      <div className="bg-muted px-4 py-1.5 text-xs text-muted-foreground flex gap-4 border-t">
        <span><kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs">Ctrl+S</kbd> Save</span>
        <span><kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs">Ctrl+P</kbd> Preview</span>
        <span><kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs">F11</kbd> Fullscreen</span>
      </div>
    </div>
  );
}

export default Editor;