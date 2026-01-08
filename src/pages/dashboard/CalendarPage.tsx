import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronLeft, ChevronRight, Video, FileText, Clock, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CalendarEvent {
  id: string;
  type: 'session' | 'homework' | 'exam';
  title: string;
  date: Date;
  time?: string;
  subject?: string;
  color?: string;
}

export default function CalendarPage() {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user, currentMonth]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      const allEvents: CalendarEvent[] = [];

      // Fetch sessions
      const { data: sessions } = await supabase
        .from('sessions')
        .select(`
          id,
          session_date,
          status,
          schedule_slots(
            start_time,
            end_time,
            teacher_assignments(
              subjects(name, color)
            )
          )
        `)
        .gte('session_date', monthStart.toISOString().split('T')[0])
        .lte('session_date', monthEnd.toISOString().split('T')[0]);

      if (sessions) {
        sessions.forEach(session => {
          const slot = session.schedule_slots as any;
          const subject = slot?.teacher_assignments?.subjects;
          allEvents.push({
            id: session.id,
            type: 'session',
            title: subject?.name || 'Séance',
            date: new Date(session.session_date),
            time: slot?.start_time?.slice(0, 5),
            subject: subject?.name,
            color: subject?.color || '#3B82F6',
          });
        });
      }

      // Fetch homework
      let homeworkQuery = supabase
        .from('homework')
        .select('id, title, due_date, subjects(name, color)')
        .gte('due_date', monthStart.toISOString())
        .lte('due_date', monthEnd.toISOString());

      if (role === 'student') {
        // Get student's class
        const { data: enrollment } = await supabase
          .from('student_enrollments')
          .select('class_id')
          .eq('student_id', user?.id)
          .single();

        if (enrollment) {
          homeworkQuery = homeworkQuery.eq('class_id', enrollment.class_id);
        }
      }

      const { data: homework } = await homeworkQuery;

      if (homework) {
        homework.forEach(hw => {
          const subject = hw.subjects as any;
          allEvents.push({
            id: hw.id,
            type: 'homework',
            title: hw.title,
            date: new Date(hw.due_date),
            subject: subject?.name,
            color: subject?.color || '#F59E0B',
          });
        });
      }

      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day));
  };

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  // Get the first day of the month to calculate offset
  const firstDayOfMonth = getDay(startOfMonth(currentMonth));
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Adjust for Monday start

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar role={role || 'student'} />
      
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Calendrier</h1>
            <p className="text-muted-foreground">Séances, devoirs et événements</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="capitalize">
                    {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Days header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for offset */}
                  {Array.from({ length: offset }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-24 p-1" />
                  ))}
                  
                  {days.map((day, index) => {
                    const dayEvents = getEventsForDay(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    
                    return (
                      <motion.button
                        key={day.toISOString()}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.01 }}
                        onClick={() => setSelectedDate(day)}
                        className={`h-24 p-1 border rounded-lg text-left transition-colors ${
                          !isSameMonth(day, currentMonth) ? 'opacity-30' : ''
                        } ${isToday(day) ? 'border-primary bg-primary/5' : ''} ${
                          isSelected ? 'ring-2 ring-primary' : ''
                        } hover:bg-muted`}
                      >
                        <div className={`text-sm font-medium mb-1 ${
                          isToday(day) ? 'text-primary' : ''
                        }`}>
                          {format(day, 'd')}
                        </div>
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 3).map(event => (
                            <div
                              key={event.id}
                              className="text-xs px-1 py-0.5 rounded truncate"
                              style={{ 
                                backgroundColor: `${event.color}20`,
                                color: event.color,
                              }}
                            >
                              {event.time && `${event.time} `}{event.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-muted-foreground px-1">
                              +{dayEvents.length - 3} autres
                            </div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate 
                    ? format(selectedDate, 'EEEE d MMMM', { locale: fr })
                    : 'Sélectionnez une date'
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  selectedDayEvents.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDayEvents.map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-3 rounded-lg border"
                        >
                          <div className="flex items-start gap-3">
                            <div 
                              className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${event.color}20` }}
                            >
                              {event.type === 'session' && <Video className="h-5 w-5" style={{ color: event.color }} />}
                              {event.type === 'homework' && <FileText className="h-5 w-5" style={{ color: event.color }} />}
                              {event.type === 'exam' && <BookOpen className="h-5 w-5" style={{ color: event.color }} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{event.title}</h4>
                              {event.subject && (
                                <p className="text-sm text-muted-foreground">{event.subject}</p>
                              )}
                              {event.time && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{event.time}</span>
                                </div>
                              )}
                            </div>
                            <Badge 
                              variant="outline"
                              style={{ borderColor: event.color, color: event.color }}
                            >
                              {event.type === 'session' && 'Séance'}
                              {event.type === 'homework' && 'Devoir'}
                              {event.type === 'exam' && 'Examen'}
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucun événement ce jour
                    </div>
                  )
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Cliquez sur une date pour voir les événements
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Legend */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-blue-500/20 border border-blue-500"></div>
                  <span className="text-sm">Séances</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-orange-500/20 border border-orange-500"></div>
                  <span className="text-sm">Devoirs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-purple-500/20 border border-purple-500"></div>
                  <span className="text-sm">Examens</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
