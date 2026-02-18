/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Card, CardContent } from "@/components/ui/card";
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Edit2, 
  Check, 
  X,
  Loader2,
  Copy
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

interface AssetManagerProps {
  onSelectAsset?: (asset: Asset) => void;
  trigger?: React.ReactNode;
}

const AssetManager = ({ onSelectAsset, trigger }: AssetManagerProps) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/assets");
      setAssets(res.data.data || []);
    } catch (error) {
      toast.error("Failed to load assets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchAssets();
    }
  }, [open, fetchAssets]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
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

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Image URL copied to clipboard");
  };

  const handleInsertImage = (asset: Asset) => {
    if (onSelectAsset) {
      onSelectAsset(asset);
      setOpen(false);
    } else {
      handleCopyUrl(asset.url);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Assets
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Asset Manager</DialogTitle>
          </DialogHeader>

          {/* Upload Section */}
          <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/20">
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
              className={`cursor-pointer flex flex-col items-center gap-2 ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {uploading ? (
                <Loader2 className="w-12 h-12 text-muted-foreground animate-spin" />
              ) : (
                <Upload className="w-12 h-12 text-muted-foreground" />
              )}
              <p className="text-sm font-medium">
                {uploading ? "Uploading..." : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF, WebP, SVG up to 5MB
              </p>
            </label>
          </div>

          {/* Assets Grid */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : assets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No assets yet</p>
                <p className="text-sm text-muted-foreground">
                  Upload your first image to get started
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
                {assets.map((asset) => (
                  <Card
                    key={asset._id}
                    className="group relative overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => handleInsertImage(asset)}
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
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyUrl(asset.url);
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(asset._id);
                              setEditName(asset.name);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(asset._id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        {editingId === asset._id ? (
                          <div className="flex gap-1">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="h-8 text-sm"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === "Enter") handleRename(asset._id);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRename(asset._id);
                              }}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(null);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm font-medium truncate" title={asset.name}>
                              {asset.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatSize(asset.size)} • {asset.width}x{asset.height}
                            </p>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this asset? This action cannot be undone.
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
    </>
  );
};

export default AssetManager;