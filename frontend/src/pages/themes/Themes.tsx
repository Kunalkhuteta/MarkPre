import React, { useEffect, useState } from "react";
import {
  Card, CardHeader, CardTitle, CardContent, CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
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

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    primaryColor: "#3b82f6",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    fontFamily: "Inter, sans-serif",
  });

  useEffect(() => { fetchThemes(); }, []);

  const fetchThemes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/themes/get-all-themes-for-user");
      setThemes(res.data.data);
    } catch {
      toast.error("Failed to load your themes");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTheme = async () => {
    if (!formData.name.trim()) { toast.error("Theme name is required"); return; }
    setCreating(true);
    try {
      if (editMode && selectedThemeId) {
        await api.put(`/themes/update-theme/${selectedThemeId}`, formData);
        toast.success("Theme updated successfully!");
      } else {
        await api.post("/themes/add-theme", formData);
        toast.success("Theme created successfully!");
      }
      setOpenDialog(false);
      resetForm();
      fetchThemes();
    } catch {
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
    } catch {
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">My Themes</h1>

        <Dialog open={openDialog} onOpenChange={(open) => { setOpenDialog(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => { resetForm(); setOpenDialog(true); }}>
              <Plus className="w-4 h-4" /> Add New Theme
            </Button>
          </DialogTrigger>

          {/* ✅ Fixed: solid white background, proper border and shadow */}
          <DialogContent className="max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {editMode ? "Edit Theme" : "Create New Theme"}
              </DialogTitle>
              <DialogDescription className="text-zinc-500 dark:text-zinc-400">
                {editMode ? "Update your theme settings below." : "Customize colors and fonts for your presentation theme."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">Theme Name *</label>
                <Input
                  placeholder="e.g. Corporate Blue"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">Description</label>
                <Textarea
                  placeholder="Describe this theme..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 resize-none"
                  rows={2}
                />
              </div>

              {/* Color pickers */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Primary Color", key: "primaryColor" },
                  { label: "Background Color", key: "backgroundColor" },
                  { label: "Text Color", key: "textColor" },
                ].map(({ label, key }) => (
                  <div key={key} className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
                    <div className="flex items-center gap-2 p-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800">
                      <input
                        type="color"
                        value={formData[key as keyof typeof formData]}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                        {formData[key as keyof typeof formData]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">Font Family</label>
                <Input
                  placeholder="e.g. Inter, sans-serif"
                  value={formData.fontFamily}
                  onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}
                  className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                />
              </div>

              {/* Live preview */}
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 mt-2"
                style={{ backgroundColor: formData.backgroundColor, fontFamily: formData.fontFamily }}>
                <p className="text-xs font-medium mb-2" style={{ color: formData.primaryColor }}>Preview</p>
                <p className="text-sm font-semibold" style={{ color: formData.textColor }}>
                  {formData.name || "Theme Name"}
                </p>
                <p className="text-xs mt-1" style={{ color: formData.textColor, opacity: 0.7 }}>
                  Sample presentation text
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => { setOpenDialog(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTheme} disabled={creating} className="gap-2">
                  {creating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />{editMode ? "Saving..." : "Creating..."}</>
                  ) : editMode ? "Save Changes" : "Create Theme"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {themes.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">You haven't created any themes yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <Card key={theme._id} className="hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-foreground" style={{ fontFamily: theme.fontFamily }}>
                  {theme.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{theme.description}</p>
                {/* Color swatches */}
                <div className="flex gap-2 items-center">
                  {[
                    { color: theme.primaryColor, label: "Primary" },
                    { color: theme.backgroundColor, label: "Background" },
                    { color: theme.textColor, label: "Text" },
                  ].map(({ color, label }) => (
                    <div key={label} className="group relative">
                      <div
                        className="w-10 h-10 rounded-lg border-2 border-border shadow-sm cursor-default"
                        style={{ backgroundColor: color }}
                        title={`${label}: ${color}`}
                      />
                      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        {label}
                      </span>
                    </div>
                  ))}
                  <span className="ml-2 text-xs text-muted-foreground truncate max-w-[100px]" style={{ fontFamily: theme.fontFamily }}>
                    {theme.fontFamily.split(",")[0]}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 mt-4">
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