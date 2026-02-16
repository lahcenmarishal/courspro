import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Upload, X, FileText, Image, Video, File } from "lucide-react";
import { toast } from "sonner";

interface AddResourceDialogProps {
  onResourceAdded: () => void;
}

const FILE_TYPE_MAP: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "doc",
  "application/vnd.ms-powerpoint": "doc",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "doc",
  "application/vnd.ms-excel": "doc",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "doc",
};

function getFileTypeFromMime(mime: string): string {
  if (FILE_TYPE_MAP[mime]) return FILE_TYPE_MAP[mime];
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return "other";
}

function getFileIcon(type: string) {
  switch (type) {
    case "pdf":
    case "doc":
      return <FileText className="h-5 w-5 text-red-500" />;
    case "image":
      return <Image className="h-5 w-5 text-blue-500" />;
    case "video":
      return <Video className="h-5 w-5 text-purple-500" />;
    default:
      return <File className="h-5 w-5 text-muted-foreground" />;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AddResourceDialog({ onResourceAdded }: AddResourceDialogProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [classId, setClassId] = useState("");
  const [fileType, setFileType] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null);

  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (open && user) fetchTeacherOptions();
  }, [open, user]);

  const fetchTeacherOptions = async () => {
    if (!user) return;
    const { data: assignments } = await supabase
      .from("teacher_assignments")
      .select("subject_id, class_id, subject:subjects(id, name), class:classes(id, name)")
      .eq("teacher_id", user.id);

    if (assignments) {
      const uniqueSubjects = new Map<string, { id: string; name: string }>();
      const uniqueClasses = new Map<string, { id: string; name: string }>();
      assignments.forEach((a: any) => {
        if (a.subject && !uniqueSubjects.has(a.subject.id)) uniqueSubjects.set(a.subject.id, a.subject);
        if (a.class && !uniqueClasses.has(a.class.id)) uniqueClasses.set(a.class.id, a.class);
      });
      setSubjects(Array.from(uniqueSubjects.values()));
      setClasses(Array.from(uniqueClasses.values()));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error(t("resources.fileTooLarge"));
      return;
    }
    setSelectedFile(file);
    setFileType(getFileTypeFromMime(file.type));
    if (!title.trim()) setTitle(file.name.replace(/\.[^/.]+$/, ""));
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadFile = async (): Promise<string | null> => {
    if (!selectedFile || !user) return null;
    setUploading(true);
    setUploadProgress(10);
    try {
      const ext = selectedFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      setUploadProgress(30);
      const { error: uploadError } = await supabase.storage.from("resources").upload(path, selectedFile);
      if (uploadError) throw uploadError;
      setUploadProgress(80);
      const { data: urlData } = supabase.storage.from("resources").getPublicUrl(path);
      setUploadProgress(100);
      return urlData.publicUrl;
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(t("resources.errorUpload"));
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !title.trim()) {
      toast.error(t("resources.titleRequired"));
      return;
    }
    setLoading(true);
    try {
      let finalUrl = fileUrl.trim() || null;
      if (selectedFile) {
        const uploadedUrl = await uploadFile();
        if (!uploadedUrl) { setLoading(false); return; }
        finalUrl = uploadedUrl;
      }
      const { error } = await supabase.from("resources").insert({
        title: title.trim(),
        description: description.trim() || null,
        subject_id: subjectId || null,
        class_id: classId || null,
        teacher_id: user.id,
        file_type: fileType || null,
        file_url: finalUrl,
      });
      if (error) throw error;
      toast.success(t("resources.success"));
      resetForm();
      setOpen(false);
      onResourceAdded();
    } catch (error: any) {
      console.error("Error adding resource:", error);
      toast.error(t("resources.errorAdd"));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle(""); setDescription(""); setSubjectId(""); setClassId("");
    setFileType(""); setFileUrl(""); setSelectedFile(null); setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isSubmitting = loading || uploading;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t("resources.addResource")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("resources.newResource")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="res-title">{t("resources.titleLabel")}</Label>
            <Input id="res-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("resources.titlePlaceholder")} />
          </div>
          <div>
            <Label htmlFor="res-desc">{t("resources.descLabel")}</Label>
            <Textarea id="res-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("resources.descPlaceholder")} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t("resources.subject")}</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger><SelectValue placeholder={t("resources.choose")} /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("resources.class")}</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger><SelectValue placeholder={t("resources.choose")} /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <Label>{t("resources.file")}</Label>
            <input ref={fileInputRef} type="file" className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mp3,.wav,.zip,.rar"
              onChange={handleFileSelect} />
            {selectedFile ? (
              <div className="flex items-center gap-3 p-3 rounded-md border bg-muted/50">
                {getFileIcon(fileType)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={removeSelectedFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button type="button" variant="outline" className="w-full mt-1" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                {t("resources.chooseFile")}
              </Button>
            )}
            {uploading && <Progress value={uploadProgress} className="mt-2 h-2" />}
          </div>

          {!selectedFile && (
            <div>
              <Label htmlFor="res-url">{t("resources.orPasteLink")}</Label>
              <Input id="res-url" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." />
            </div>
          )}

          {!selectedFile && (
            <div>
              <Label>{t("resources.fileType")}</Label>
              <Select value={fileType} onValueChange={setFileType}>
                <SelectTrigger><SelectValue placeholder={t("resources.fileTypePlaceholder")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="doc">Document</SelectItem>
                  <SelectItem value="video">Vidéo</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {uploading ? t("resources.uploading") : t("resources.add")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
