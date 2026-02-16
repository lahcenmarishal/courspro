import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  BookMarked, 
  Search, 
  Download, 
  FileText, 
  Video, 
  Image, 
  File,
  Filter
} from "lucide-react";
import { AddResourceDialog } from "@/components/dashboard/AddResourceDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_type: string | null;
  created_at: string;
  subject: { name: string; color: string } | null;
  class: { name: string } | null;
}

export default function ResourcesPage() {
  const { role, user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchResources();
    fetchSubjects();
  }, [user]);

  const fetchResources = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("resources")
        .select(`
          id, title, description, file_url, file_type, created_at,
          subject:subjects(name, color),
          class:classes(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast.error(t("resources.errorLoad"));
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    const { data } = await supabase.from("subjects").select("id, name");
    setSubjects(data || []);
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <File className="h-6 w-6" />;
    if (fileType.includes("pdf") || fileType.includes("doc")) return <FileText className="h-6 w-6" />;
    if (fileType.includes("video")) return <Video className="h-6 w-6" />;
    if (fileType.includes("image")) return <Image className="h-6 w-6" />;
    return <File className="h-6 w-6" />;
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === "all" || resource.subject?.name === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">{t("resources.loading")}</p>
        </div>
      </div>
    );
  }

  const effectiveRole = role || "student";

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <DashboardSidebar role={effectiveRole} />
      
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookMarked className="h-6 w-6 text-primary" />
              {effectiveRole === "teacher" ? t("resources.title") : t("resources.titleStudent")}
            </h1>
            <p className="text-muted-foreground">
              {effectiveRole === "teacher" ? t("resources.subtitle") : t("resources.subtitleStudent")}
            </p>
          </div>
          
          {effectiveRole === "teacher" && (
            <AddResourceDialog onResourceAdded={fetchResources} />
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("resources.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t("resources.subject")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("resources.allSubjects")}</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.name}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-muted rounded-lg mb-4" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredResources.length === 0 ? (
          <Card className="p-12 text-center">
            <BookMarked className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">{t("resources.noResources")}</h3>
            <p className="text-muted-foreground">
              {searchQuery ? t("resources.noSearchResults") : t("resources.noResourcesYet")}
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:border-primary/30 transition-all hover:shadow-lg cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div 
                        className="h-12 w-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: (resource.subject?.color || "#3B82F6") + "20" }}
                      >
                        {getFileIcon(resource.file_type)}
                      </div>
                      {resource.subject && (
                        <Badge 
                          variant="secondary"
                          style={{ backgroundColor: resource.subject.color + "20", color: resource.subject.color }}
                        >
                          {resource.subject.name}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-base mb-2 group-hover:text-primary transition-colors">
                      {resource.title}
                    </CardTitle>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {resource.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{resource.class?.name}</span>
                      <span>{new Date(resource.created_at).toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR')}</span>
                    </div>
                    {resource.file_url && (
                      <Button variant="outline" size="sm" className="w-full mt-4">
                        <Download className="h-4 w-4 mr-2" />
                        {t("resources.download")}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
