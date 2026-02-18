/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import {
  FileText, Plus, Download, Trash2, Eye, Calendar,
  TrendingUp, Presentation, Pencil, X, Check, Edit,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PresentationType {
  _id: string;
  title: string;
  content: string;
  slideCount?: number;
  wordCount?: number;
  viewCount?: number;
  exportCount?: number;
  theme?: any;
  updatedAt: string;
  createdAt: string;
}

function Dashboard() {
  const [presentations, setPresentations] = useState<PresentationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [stats, setStats] = useState({
    totalPresentations: 0, totalSlides: 0, totalWords: 0, totalViews: 0,
  });
  const navigate = useNavigate();

  useEffect(() => { fetchPresentations(); }, []);

  const fetchPresentations = async () => {
    try {
      const res = await api.get("/presentations/get-all-presentations-for-user");
      const data = res.data.data || [];
      setPresentations(data);
      const s = data.reduce(
        (acc: any, p: PresentationType) => ({
          totalPresentations: acc.totalPresentations + 1,
          totalSlides: acc.totalSlides + (p.slideCount || 0),
          totalWords: acc.totalWords + (p.wordCount || 0),
          totalViews: acc.totalViews + (p.viewCount || 0),
        }),
        { totalPresentations: 0, totalSlides: 0, totalWords: 0, totalViews: 0 }
      );
      setStats(s);
    } catch {
      toast.error("Failed to load presentations");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/presentations/delete-presentation/${id}`);
      toast.success("Presentation deleted");
      fetchPresentations();
    } catch {
      toast.error("Failed to delete presentation");
    }
  };

  const startEditing = (p: PresentationType, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(p._id);
    setEditingTitle(p.title);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditingTitle("");
  };

  const saveTitle = async (id: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (!editingTitle.trim()) { toast.error("Title cannot be empty"); return; }
    try {
      await api.put(`/presentations/update-presentation/${id}`, { title: editingTitle });
      toast.success("Title updated");
      setEditingId(null);
      fetchPresentations();
    } catch {
      toast.error("Failed to update title");
    }
  };

  const handleExport = async (id: string, title: string, format: "pdf" | "html") => {
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
    } catch {
      toast.dismiss();
      toast.error("Failed to export");
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage your presentations</p>
          </div>
          <Button onClick={() => navigate("/editor")} size="lg" className="gap-2">
            <Plus className="w-5 h-5" /> New Presentation
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Presentations", value: stats.totalPresentations, icon: <Presentation className="w-8 h-8 text-blue-600" /> },
            { label: "Total Slides", value: stats.totalSlides, icon: <FileText className="w-8 h-8 text-green-600" /> },
            { label: "Total Words", value: stats.totalWords.toLocaleString(), icon: <TrendingUp className="w-8 h-8 text-purple-600" /> },
            { label: "Total Views", value: stats.totalViews, icon: <Eye className="w-8 h-8 text-orange-600" /> },
          ].map((s) => (
            <Card key={s.label}>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {s.icon}
                  <span className="text-3xl font-bold text-foreground">{s.value}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Presentations */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Your Presentations</h2>
          {presentations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Presentation className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No presentations yet</h3>
                <p className="text-muted-foreground mb-6">Create your first presentation to get started</p>
                <Button onClick={() => navigate("/editor")}>
                  <Plus className="w-4 h-4 mr-2" /> Create Presentation
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {presentations.map((p) => (
                <Card key={p._id} className="hover:shadow-lg transition-shadow group flex flex-col">
                  <CardHeader>
                    {editingId === p._id ? (
                      <div className="flex items-center gap-2 col-span-2" onClick={(e) => e.stopPropagation()}>
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveTitle(p._id, e);
                            if (e.key === "Escape") cancelEditing(e as any);
                          }}
                          className="h-8 text-sm font-semibold"
                          autoFocus
                        />
                        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-green-600" onClick={(e) => saveTitle(p._id, e)}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={cancelEditing}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <CardTitle className="line-clamp-2 text-foreground">{p.title}</CardTitle>
                        <CardAction className="flex gap-1">
                          <Button
                            variant="ghost" size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                            title="Rename title"
                            onClick={(e) => startEditing(p, e)}
                          >
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7">
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Presentation</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{p.title}"? This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(p._id)} className="bg-red-600 hover:bg-red-700">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </CardAction>
                      </>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4 flex-1">
                    <div className="text-sm text-muted-foreground line-clamp-3">
                      {p.content.substring(0, 100)}...
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />{p.slideCount || 0} slides
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{formatDate(p.updatedAt)}
                      </span>
                    </div>

                    {/* ✅ 4 action buttons: Open (view), Edit (editor), PDF, HTML */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline" size="sm"
                        className="gap-1"
                        onClick={() => navigate(`/presentation/${p._id}`)}
                      >
                        <Eye className="w-3 h-3" /> View
                      </Button>
                      <Button
                        variant="default" size="sm"
                        className="gap-1"
                        onClick={() => navigate(`/editor/${p._id}`)}
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </Button>
                      <Button
                        variant="outline" size="sm"
                        className="gap-1"
                        onClick={() => handleExport(p._id, p.title, "pdf")}
                      >
                        <Download className="w-3 h-3" /> PDF
                      </Button>
                      <Button
                        variant="outline" size="sm"
                        className="gap-1"
                        onClick={() => handleExport(p._id, p.title, "html")}
                      >
                        <Download className="w-3 h-3" /> HTML
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;