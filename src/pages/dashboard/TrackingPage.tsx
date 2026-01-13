import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TrendingUp, TrendingDown, Minus, BookOpen, Award, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { format, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Child {
  id: string;
  name: string;
  className: string;
  levelName: string;
}

interface SubjectProgress {
  subject: string;
  color: string;
  average: number;
  previousAverage: number;
  trend: 'up' | 'down' | 'stable';
  grades: number[];
}

interface MonthlyProgress {
  month: string;
  average: number;
}

export default function TrackingPage() {
  const { user, role } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [monthlyProgress, setMonthlyProgress] = useState<MonthlyProgress[]>([]);
  const [stats, setStats] = useState({
    overallAverage: 0,
    totalGrades: 0,
    bestSubject: '',
    attendanceRate: 0,
  });

  useEffect(() => {
    if (user) {
      fetchStudentData(user.id);
    }
  }, [user]);

  const fetchStudentData = async (studentId: string) => {
    setLoading(true);
    try {
      // Fetch grades
      const { data: grades } = await supabase
        .from('grades')
        .select('*, subjects(name, color)')
        .eq('student_id', studentId)
        .order('graded_at', { ascending: true });

      if (grades && grades.length > 0) {
        // Calculate subject progress
        const subjectMap = new Map<string, { grades: number[], color: string }>();
        
        grades.forEach(grade => {
          const subject = (grade.subjects as any)?.name || 'Inconnu';
          const color = (grade.subjects as any)?.color || '#3B82F6';
          const score = (grade.score / grade.max_score) * 20;
          
          if (!subjectMap.has(subject)) {
            subjectMap.set(subject, { grades: [], color });
          }
          subjectMap.get(subject)?.grades.push(score);
        });

        const subjectProgressData: SubjectProgress[] = [];
        subjectMap.forEach((data, subject) => {
          const grades = data.grades;
          const average = grades.reduce((a, b) => a + b, 0) / grades.length;
          const midPoint = Math.floor(grades.length / 2);
          const firstHalf = grades.slice(0, midPoint);
          const secondHalf = grades.slice(midPoint);
          const firstAvg = firstHalf.length ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
          const secondAvg = secondHalf.length ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;

          let trend: 'up' | 'down' | 'stable' = 'stable';
          if (secondAvg > firstAvg + 0.5) trend = 'up';
          else if (secondAvg < firstAvg - 0.5) trend = 'down';

          subjectProgressData.push({
            subject,
            color: data.color,
            average: Math.round(average * 10) / 10,
            previousAverage: Math.round(firstAvg * 10) / 10,
            trend,
            grades,
          });
        });

        setSubjectProgress(subjectProgressData);

        // Calculate monthly progress
        const monthlyMap = new Map<string, number[]>();
        grades.forEach(grade => {
          const month = format(new Date(grade.graded_at), 'MMM yyyy', { locale: fr });
          const score = (grade.score / grade.max_score) * 20;
          if (!monthlyMap.has(month)) {
            monthlyMap.set(month, []);
          }
          monthlyMap.get(month)?.push(score);
        });

        const monthlyData: MonthlyProgress[] = [];
        monthlyMap.forEach((scores, month) => {
          monthlyData.push({
            month,
            average: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
          });
        });
        setMonthlyProgress(monthlyData);

        // Calculate overall stats
        const overallAverage = grades.reduce((sum, g) => sum + (g.score / g.max_score) * 20, 0) / grades.length;
        const bestSubjectData = subjectProgressData.reduce((best, curr) => 
          curr.average > best.average ? curr : best, subjectProgressData[0]);

        setStats({
          overallAverage: Math.round(overallAverage * 10) / 10,
          totalGrades: grades.length,
          bestSubject: bestSubjectData?.subject || '',
          attendanceRate: 95, // This would come from attendance table
        });
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar role="student" />
      
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Suivi scolaire</h1>
              <p className="text-muted-foreground">Progression et performances académiques</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Moyenne générale</p>
                    <p className="text-2xl font-bold">{stats.overallAverage}/20</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Meilleure matière</p>
                    <p className="text-lg font-bold truncate">{stats.bestSubject || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Notes obtenues</p>
                    <p className="text-2xl font-bold">{stats.totalGrades}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Taux de présence</p>
                    <p className="text-2xl font-bold">{stats.attendanceRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution des moyennes</CardTitle>
                <CardDescription>Progression mensuelle</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyProgress.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 20]} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="average" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Pas de données disponibles
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subject Averages Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Moyennes par matière</CardTitle>
                <CardDescription>Comparaison des performances</CardDescription>
              </CardHeader>
              <CardContent>
                {subjectProgress.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={subjectProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis domain={[0, 20]} />
                      <Tooltip />
                      <Bar 
                        dataKey="average" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Pas de données disponibles
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Subject Details */}
          <Card>
            <CardHeader>
              <CardTitle>Détail par matière</CardTitle>
              <CardDescription>Performances et tendances</CardDescription>
            </CardHeader>
            <CardContent>
              {subjectProgress.length > 0 ? (
                <div className="space-y-4">
                  {subjectProgress.map((subject, index) => (
                    <motion.div
                      key={subject.subject}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-lg border"
                    >
                      <div 
                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${subject.color}20` }}
                      >
                        <BookOpen className="h-5 w-5" style={{ color: subject.color }} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{subject.subject}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{subject.grades.length} notes</span>
                          <span>•</span>
                          <span>Précédent: {subject.previousAverage}/20</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getTrendIcon(subject.trend)}
                        <div className="text-right">
                          <p className="text-xl font-bold">{subject.average}</p>
                          <p className="text-xs text-muted-foreground">/20</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  Aucune note enregistrée
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
