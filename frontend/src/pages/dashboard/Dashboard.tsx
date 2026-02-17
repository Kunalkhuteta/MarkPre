/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {  useNavigate } from "react-router-dom";
import { api } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import {
  FileText,
  Plus,
  Download,
  Trash2,
  Eye,
  Calendar,
  TrendingUp,
  Presentation,
} from "lucide-react";
import { toast } from "sonner";
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
  const [stats, setStats] = useState({
    totalPresentations: 0,
    totalSlides: 0,
    totalWords: 0,
    totalViews: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchPresentations();
  }, []);

  const fetchPresentations = async () => {
    try {
      const res = await api.get("/presentations/get-all-presentations-for-user");
      const data = res.data.data || [];
      setPresentations(data);

      // Calculate stats
      const stats = data.reduce(
        (acc: any, p: PresentationType) => ({
          totalPresentations: acc.totalPresentations + 1,
          totalSlides: acc.totalSlides + (p.slideCount || 0),
          totalWords: acc.totalWords + (p.wordCount || 0),
          totalViews: acc.totalViews + (p.viewCount || 0),
        }),
        { totalPresentations: 0, totalSlides: 0, totalWords: 0, totalViews: 0 }
      );
      setStats(stats);
    } catch (error: any) {
      toast.error("Failed to load presentations");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/presentations/delete-presentation/${id}`);
      toast.success("Presentation deleted successfully");
      fetchPresentations();
    } catch (error: any) {
      toast.error("Failed to delete presentation");
    }
  };

  const handleExport = async (id: string, title: string, format: "pdf" | "html") => {
    try {
      toast.loading(`Exporting ${title} as ${format.toUpperCase()}...`);
      
      const response = await api.get(`/presentations/export/${id}?format=${format}`, {
        responseType: format === "pdf" ? "blob" : "text",
      });

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

      toast.dismiss();
      toast.success(`Exported successfully as ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.dismiss();
      toast.error(`Failed to export as ${format.toUpperCase()}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your presentations
            </p>
          </div>
          <Button onClick={() => navigate("/editor")} size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            New Presentation
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Presentations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Presentation className="w-8 h-8 text-blue-600" />
                <span className="text-3xl font-bold">{stats.totalPresentations}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Slides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="w-8 h-8 text-green-600" />
                <span className="text-3xl font-bold">{stats.totalSlides}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Words
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <span className="text-3xl font-bold">{stats.totalWords.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Eye className="w-8 h-8 text-orange-600" />
                <span className="text-3xl font-bold">{stats.totalViews}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Presentations List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Presentations</h2>
          {presentations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Presentation className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No presentations yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create your first presentation to get started
                </p>
                <Button onClick={() => navigate("/editor")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Presentation
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {presentations.map((presentation) => (
                <Card
                  key={presentation._id}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{presentation.title}</CardTitle>
                    <CardAction>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Presentation</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{presentation.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(presentation._id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardAction>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div
                      className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3"
                      onClick={() => navigate(`/editor/${presentation._id}`)}
                    >
                      {presentation.content.substring(0, 100)}...
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {presentation.slideCount || 0} slides
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(presentation.updatedAt)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/editor/${presentation._id}`)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Open
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport(presentation._id, presentation.title, "pdf")}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport(presentation._id, presentation.title, "html")}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        HTML
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