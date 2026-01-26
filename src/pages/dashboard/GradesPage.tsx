import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Award, 
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  FileText,
  Download
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface Grade {
  id: string;
  score: number;
  max_score: number;
  coefficient: number;
  grade_type: string;
  comment: string | null;
  graded_at: string;
  subject: { name: string; color: string } | null;
}

interface SubjectAverage {
  name: string;
  color: string;
  average: number;
  grades: Grade[];
}

export default function GradesPage() {
  const { role, user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [children, setChildren] = useState<{ id: string; name: string }[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");

  useEffect(() => {
    fetchGrades(user?.id);
  }, [user, role]);

  const fetchGrades = async (studentId?: string) => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("grades")
        .select(`
          id,
          score,
          max_score,
          coefficient,
          grade_type,
          comment,
          graded_at,
          subject:subjects(name, color)
        `)
        .eq("student_id", studentId)
        .order("graded_at", { ascending: false });

      if (error) throw error;
      setGrades(data || []);
    } catch (error) {
      console.error("Error fetching grades:", error);
      toast.error("Erreur lors du chargement des notes");
    } finally {
      setLoading(false);
    }
  };

  const calculateSubjectAverages = (): SubjectAverage[] => {
    const subjectMap = new Map<string, { color: string; grades: Grade[]; totalWeighted: number; totalCoef: number }>();

    grades.forEach(grade => {
      if (!grade.subject) return;
      
      const key = grade.subject.name;
      const current = subjectMap.get(key) || { color: grade.subject.color, grades: [], totalWeighted: 0, totalCoef: 0 };
      
      const normalizedScore = (grade.score / grade.max_score) * 20;
      current.grades.push(grade);
      current.totalWeighted += normalizedScore * grade.coefficient;
      current.totalCoef += grade.coefficient;
      
      subjectMap.set(key, current);
    });

    return Array.from(subjectMap.entries()).map(([name, data]) => ({
      name,
      color: data.color,
      average: data.totalCoef > 0 ? data.totalWeighted / data.totalCoef : 0,
      grades: data.grades
    }));
  };

  const subjectAverages = calculateSubjectAverages();
  const overallAverage = subjectAverages.length > 0
    ? subjectAverages.reduce((sum, s) => sum + s.average, 0) / subjectAverages.length
    : 0;

  const getGradeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 50) return "text-orange-600";
    return "text-destructive";
  };

  const getTrendIcon = (average: number) => {
    if (average >= 14) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (average >= 10) return <Minus className="h-4 w-4 text-muted-foreground" />;
    return <TrendingDown className="h-4 w-4 text-destructive" />;
  };

  const filteredGrades = selectedSubject === "all" 
    ? grades 
    : grades.filter(g => g.subject?.name === selectedSubject);

  const subjects = [...new Set(grades.map(g => g.subject?.name).filter(Boolean))];

  if (!role) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <DashboardSidebar role={role} />
      
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Notes & Bulletins
            </h1>
            <p className="text-muted-foreground">
              Consultez les résultats et moyennes
            </p>
          </div>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Télécharger le bulletin
          </Button>
        </div>

        {/* Overall Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-1">
            <CardContent className="p-6 text-center">
              <div className="h-24 w-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-primary">
                  {overallAverage.toFixed(1)}
                </span>
              </div>
              <h3 className="font-semibold">Moyenne Générale</h3>
              <p className="text-sm text-muted-foreground">sur 20</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Moyennes par matière
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                      <div className="h-2 bg-muted rounded" />
                    </div>
                  ))}
                </div>
              ) : subjectAverages.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Aucune note enregistrée</p>
              ) : (
                subjectAverages.map((subject, index) => (
                  <motion.div
                    key={subject.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                        <span className="font-medium">{subject.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(subject.average)}
                        <span className="font-semibold">{subject.average.toFixed(1)}/20</span>
                      </div>
                    </div>
                    <Progress 
                      value={(subject.average / 20) * 100} 
                      className="h-2"
                      style={{ 
                        // @ts-ignore
                        "--progress-background": subject.color 
                      }}
                    />
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filter and Grades List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Détail des notes</CardTitle>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Matière" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les matières</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject!}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse flex gap-4 p-4 border rounded-lg">
                    <div className="h-10 w-10 bg-muted rounded" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredGrades.length === 0 ? (
              <div className="text-center py-8">
                <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">Aucune note pour cette matière</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredGrades.map((grade, index) => (
                  <motion.div
                    key={grade.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div 
                      className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: (grade.subject?.color || "#3B82F6") + "20" }}
                    >
                      <FileText className="h-5 w-5" style={{ color: grade.subject?.color || "#3B82F6" }} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{grade.subject?.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {grade.grade_type === "exam" ? "Examen" : 
                           grade.grade_type === "homework" ? "Devoir" : 
                           grade.grade_type === "quiz" ? "Contrôle" : grade.grade_type}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(grade.graded_at), "d MMMM yyyy", { locale: fr })}
                        {grade.comment && <span className="ml-2">• {grade.comment}</span>}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-xl font-bold ${getGradeColor(grade.score, grade.max_score)}`}>
                        {grade.score}/{grade.max_score}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Coef. {grade.coefficient}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}