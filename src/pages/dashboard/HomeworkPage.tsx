import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format, isPast, isToday, isTomorrow, differenceInDays } from "date-fns";
import { fr as frLocale } from "date-fns/locale";
import { 
  FileText, Search, Calendar, Clock, CheckCircle2, AlertCircle, Filter, Upload
} from "lucide-react";
import { AddHomeworkDialog } from "@/components/dashboard/AddHomeworkDialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Homework {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  max_score: number;
  created_at: string;
  subject: { name: string; color: string } | null;
  class: { name: string } | null;
  submission?: {
    id: string;
    submitted_at: string;
    score: number | null;
  } | null;
}

export default function HomeworkPage() {
  const { role, user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchHomework();
  }, [user]);

  const fetchHomework = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("homework")
        .select(`
          id, title, description, due_date, max_score, created_at,
          subject:subjects(name, color),
          class:classes(name)
        `)
        .order("due_date", { ascending: true });

      if (error) throw error;

      if (role === "student" && data) {
        const homeworkWithSubmissions = await Promise.all(
          data.map(async (hw) => {
            const { data: submission } = await supabase
              .from("homework_submissions")
              .select("id, submitted_at, score")
              .eq("homework_id", hw.id)
              .eq("student_id", user.id)
              .maybeSingle();
            return { ...hw, submission };
          })
        );
        setHomework(homeworkWithSubmissions);
      } else {
        setHomework(data || []);
      }
    } catch (error) {
      console.error("Error fetching homework:", error);
      toast.error(t("homework.errorLoad"));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (hw: Homework) => {
    if (hw.submission?.score !== null && hw.submission?.score !== undefined) {
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/30">{t("homework.graded")}</Badge>;
    }
    if (hw.submission) {
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">{t("homework.submitted")}</Badge>;
    }
    if (isPast(new Date(hw.due_date))) {
      return <Badge variant="destructive">{t("homework.late")}</Badge>;
    }
    if (isToday(new Date(hw.due_date))) {
      return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/30">{t("homework.today")}</Badge>;
    }
    return <Badge variant="secondary">{t("homework.todo")}</Badge>;
  };

  const getDueDateLabel = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isToday(date)) return t("homework.today");
    if (isTomorrow(date)) return t("homework.tomorrow");
    const days = differenceInDays(date, new Date());
    if (days < 0) return t("homework.daysAgo").replace("{n}", String(Math.abs(days)));
    if (days < 7) return t("homework.inDays").replace("{n}", String(days));
    return format(date, "d MMMM", { locale: language === 'ar' ? undefined : frLocale });
  };

  const filteredHomework = homework.filter((hw) => {
    const matchesSearch = hw.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "pending") return matchesSearch && !hw.submission && !isPast(new Date(hw.due_date));
    if (statusFilter === "submitted") return matchesSearch && hw.submission;
    if (statusFilter === "late") return matchesSearch && !hw.submission && isPast(new Date(hw.due_date));
    return matchesSearch;
  });

  const pendingCount = homework.filter(hw => !hw.submission && !isPast(new Date(hw.due_date))).length;
  const lateCount = homework.filter(hw => !hw.submission && isPast(new Date(hw.due_date))).length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">{t("homework.loading")}</p>
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
              <FileText className="h-6 w-6 text-primary" />
              {effectiveRole === "teacher" ? t("homework.title") : t("homework.titleStudent")}
            </h1>
            <p className="text-muted-foreground">
              {effectiveRole === "teacher" ? t("homework.subtitle") : t("homework.subtitleStudent")}
            </p>
          </div>
          
          {effectiveRole === "teacher" && (
            <AddHomeworkDialog onHomeworkAdded={fetchHomework} />
          )}
        </div>

        {/* Stats */}
        {effectiveRole === "student" && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{pendingCount}</div>
                  <div className="text-sm text-muted-foreground">{t("homework.pending")}</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{homework.filter(hw => hw.submission).length}</div>
                  <div className="text-sm text-muted-foreground">{t("homework.submitted")}</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{lateCount}</div>
                  <div className="text-sm text-muted-foreground">{t("homework.late")}</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("homework.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("homework.all")}</SelectItem>
              <SelectItem value="pending">{t("homework.pending")}</SelectItem>
              <SelectItem value="submitted">{t("homework.submitted")}</SelectItem>
              <SelectItem value="late">{t("homework.late")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Homework List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 bg-muted rounded-lg" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredHomework.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">{t("homework.noHomework")}</h3>
            <p className="text-muted-foreground">
              {searchQuery ? t("homework.noSearchResults") : t("homework.noHomeworkYet")}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredHomework.map((hw, index) => (
              <motion.div
                key={hw.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:border-primary/30 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div 
                        className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: (hw.subject?.color || "#3B82F6") + "20" }}
                      >
                        <FileText className="h-6 w-6" style={{ color: hw.subject?.color || "#3B82F6" }} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{hw.title}</h3>
                          {getStatusBadge(hw)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {hw.subject && (
                            <span style={{ color: hw.subject.color }}>{hw.subject.name}</span>
                          )}
                          <span>{hw.class?.name}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {getDueDateLabel(hw.due_date)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {hw.submission?.score !== null && hw.submission?.score !== undefined ? (
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              {hw.submission.score}/{hw.max_score}
                            </div>
                            <div className="text-xs text-muted-foreground">{t("homework.grade")}</div>
                          </div>
                        ) : effectiveRole === "student" && !hw.submission && !isPast(new Date(hw.due_date)) ? (
                          <Button size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            {t("homework.submit")}
                          </Button>
                        ) : null}
                      </div>
                    </div>
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
