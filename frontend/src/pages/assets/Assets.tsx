/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  Copy,
  Download,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface Asset {
  _id: string;
  name: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  createdAt: string;
}

const Assets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await api.get("/assets");
      setAssets(res.data.data || []);
    } catch (error) {
      toast.error("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only image files are allowed (JPEG, PNG, GIF, WebP, SVG)");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("name", file.name);

    try {
      await api.post("/assets/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Asset uploaded successfully");
      fetchAssets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload asset");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      await api.put(`/assets/${id}`, { name: editName });
      toast.success("Asset renamed successfully");
      setEditingId(null);
      fetchAssets();
    } catch (error) {
      toast.error("Failed to rename asset");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await api.delete(`/assets/${deleteId}`);
      toast.success("Asset deleted successfully");
      setDeleteId(null);
      fetchAssets();
    } catch (error) {
      toast.error("Failed to delete asset");
    }
  };

  const handleCopyMarkdown = (asset: Asset) => {
    const markdown = `![${asset.name}](${asset.url})`;
    navigator.clipboard.writeText(markdown);
    toast.success("Markdown copied to clipboard");
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Assets</h1>
          <p className="text-muted-foreground">
            Manage your images and media files
          </p>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <Card className="border-2 border-dashed bg-muted/20 hover:bg-muted/30 transition-colors">
            <CardContent className="p-8">
              <input
                type="file"
                id="asset-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <label
                htmlFor="asset-upload"
                className={`cursor-pointer flex flex-col items-center gap-3 ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {uploading ? (
                  <Loader2 className="w-16 h-16 text-primary animate-spin" />
                ) : (
                  <Upload className="w-16 h-16 text-primary" />
                )}
                <div className="text-center">
                  <p className="text-lg font-semibold text-foreground mb-1">
                    {uploading ? "Uploading..." : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG, GIF, WebP, SVG up to 5MB
                  </p>
                </div>
              </label>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <ImageIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{assets.length}</p>
                  <p className="text-sm text-muted-foreground">Total Assets</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Upload className="w-6 h-6 text-green-600 dark:text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatSize(assets.reduce((acc, a) => acc + a.size, 0))}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Size</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Download className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {assets.filter(a => a.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()).length}
                  </p>
                  <p className="text-sm text-muted-foreground">This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assets Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
          </div>
        ) : assets.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-20 text-center">
              <ImageIcon className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No assets yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Upload your first image to get started
              </p>
              <Button onClick={() => document.getElementById("asset-upload")?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Asset
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">
                Your Assets ({assets.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {assets.map((asset) => (
                <Card
                  key={asset._id}
                  className="group relative overflow-hidden hover:shadow-xl transition-all duration-200 bg-card"
                >
                  <CardContent className="p-0">
                    {/* Image */}
                    <div className="aspect-square bg-muted relative overflow-hidden">
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />

                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="rounded-full"
                            onClick={() => handleCopyMarkdown(asset)}
                            title="Copy Markdown"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="rounded-full"
                            onClick={() => window.open(asset.url, "_blank")}
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="rounded-full"
                            onClick={() => {
                              setEditingId(asset._id);
                              setEditName(asset.name);
                            }}
                            title="Rename"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="rounded-full"
                            onClick={() => setDeleteId(asset._id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      {editingId === asset._id ? (
                        <div className="flex gap-1 mb-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRename(asset._id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleRename(asset._id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p
                            className="text-sm font-medium truncate mb-1 text-foreground"
                            title={asset.name}
                          >
                            {asset.name}
                          </p>
                          <p className="text-xs text-muted-foreground mb-1">
                            {asset.width}×{asset.height} • {formatSize(asset.size)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(asset.createdAt)}
                          </p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this asset? This action cannot be
              undone and will remove the image from Cloudinary.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Assets;