import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";

interface Theme {
  _id: string;
  name: string;
  description: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

const Themes: React.FC = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);

  // Theme form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    primaryColor: "#3b82f6",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    fontFamily: "Inter, sans-serif",
  });

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/themes/get-all-themes-for-user");
      setThemes(res.data.data);
    } catch (err) {
      console.error("Error fetching user themes:", err);
      toast.error("Failed to load your themes");
    } finally {
      setLoading(false);
    }
  };

  // Handle create or update theme
  const handleSaveTheme = async () => {
    if (!formData.name.trim()) {
      toast.error("Theme name is required");
      return;
    }

    setCreating(true);
    try {
      if (editMode && selectedThemeId) {
        // Update existing theme
        await api.put(`/themes/update-theme/${selectedThemeId}`, formData);
        toast.success("Theme updated successfully!");
      } else {
        // Create new theme
        await api.post("/themes/add-theme", formData);
        toast.success("Theme created successfully!");
      }

      setOpenDialog(false);
      resetForm();
      fetchThemes();
    } catch (err) {
      console.error("Error saving theme:", err);
      toast.error("Failed to save theme");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTheme = async (id: string) => {
    if (!confirm("Are you sure you want to delete this theme?")) return;
    try {
      await api.delete(`/themes/delete-theme/${id}`);
      toast.success("Theme deleted successfully!");
      fetchThemes();
    } catch (err) {
      console.error("Error deleting theme:", err);
      toast.error("Failed to delete theme");
    }
  };

  const openEditDialog = (theme: Theme) => {
    setFormData({
      name: theme.name,
      description: theme.description,
      primaryColor: theme.primaryColor,
      backgroundColor: theme.backgroundColor,
      textColor: theme.textColor,
      fontFamily: theme.fontFamily,
    });
    setSelectedThemeId(theme._id);
    setEditMode(true);
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      primaryColor: "#3b82f6",
      backgroundColor: "#ffffff",
      textColor: "#000000",
      fontFamily: "Inter, sans-serif",
    });
    setEditMode(false);
    setSelectedThemeId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
      </div>
    );
  }

 return (
  <div className="p-6 min-h-screen bg-background">
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold text-foreground">My Themes</h1>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
          <Button
            className="gap-2"
            onClick={() => {
              resetForm();
              setOpenDialog(true);
            }}
          >
            <Plus className="w-4 h-4" /> Add New Theme
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editMode ? "Edit Theme" : "Create New Theme"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <Input
              placeholder="Theme Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Textarea
              placeholder="Theme Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Primary Color</label>
                <Input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Background Color</label>
                <Input
                  type="color"
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Text Color</label>
                <Input
                  type="color"
                  value={formData.textColor}
                  onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                />
              </div>
            </div>

            <Input
              placeholder="Font Family (e.g. Inter, sans-serif)"
              value={formData.fontFamily}
              onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}
            />

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveTheme} disabled={creating} className="gap-2">
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {editMode ? "Saving..." : "Creating..."}
                  </>
                ) : editMode ? (
                  "Save Changes"
                ) : (
                  "Create Theme"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>

    {/* Themes Grid */}
    {themes.length === 0 ? (
      <Card className="border-2 border-dashed">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">You haven't created any themes yet.</p>
        </CardContent>
      </Card>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <Card key={theme._id} className="hover:shadow-lg transition-all duration-200 bg-card">
            <CardHeader>
              <CardTitle className="text-foreground" style={{ fontFamily: theme.fontFamily }}>
                {theme.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {theme.description}
              </p>
              <div className="flex gap-2">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-border shadow-sm"
                  style={{ backgroundColor: theme.primaryColor }}
                  title={`Primary: ${theme.primaryColor}`}
                />
                <div
                  className="w-10 h-10 rounded-lg border-2 border-border shadow-sm"
                  style={{ backgroundColor: theme.backgroundColor }}
                  title={`Background: ${theme.backgroundColor}`}
                />
                <div
                  className="w-10 h-10 rounded-lg border-2 border-border shadow-sm"
                  style={{ backgroundColor: theme.textColor }}
                  title={`Text: ${theme.textColor}`}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => openEditDialog(theme)}>
                <Pencil className="w-4 h-4 mr-1" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDeleteTheme(theme._id)}>
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    )}
  </div>
);
};

export default Themes;
