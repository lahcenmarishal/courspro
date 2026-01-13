import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { formatExperience } from "@/lib/formatExperience";
import { 
  Loader2, 
  GraduationCap,
  Award,
  Clock,
  MapPin,
  BookOpen,
  ArrowLeft,
  Mail,
  Phone
} from "lucide-react";

type Teacher = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  specialization: string | null;
  city: string | null;
  diploma: string | null;
  years_experience: number | null;
};

export default function TeacherProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { t, dir } = useLanguage();

  useEffect(() => {
    if (id) {
      fetchTeacher();
    }
  }, [id]);

  const fetchTeacher = async () => {
    setLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, user_id, first_name, last_name, email, phone, avatar_url, bio, specialization, city, diploma, years_experience")
        .eq("id", id)
        .single();

      if (profileError || !profile) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("status")
        .eq("user_id", profile.user_id)
        .eq("role", "teacher")
        .eq("status", "approved")
        .single();

      if (roleError || !roleData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setTeacher(profile);
    } catch (error) {
      console.error("Error fetching teacher:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !teacher) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-foreground">{t("teacherProfile.notFound")}</h1>
          <p className="text-muted-foreground mb-6">
            {t("teacherProfile.notFound.desc")}
          </p>
          <Button asChild>
            <Link to="/enseignants">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("teacherProfile.back")}
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Navbar />
      
      <section className="pt-24 pb-12 lg:pt-32 lg:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <Button variant="ghost" asChild>
              <Link to="/enseignants">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("teacherProfile.back")}
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="overflow-hidden border-border/50 shadow-xl">
              <div className="h-32 md:h-48 bg-gradient-to-br from-primary/30 via-primary/20 to-secondary/30 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(var(--primary)/0.4),transparent)]" />
              </div>
              
              <CardContent className="relative px-6 md:px-10 pb-8 -mt-16 md:-mt-20">
                <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
                  <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-xl mx-auto md:mx-0">
                    <AvatarImage src={teacher.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-4xl md:text-5xl font-bold">
                      {getInitials(teacher.first_name, teacher.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="text-center md:text-left md:pb-2">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                      {teacher.first_name} {teacher.last_name}
                    </h1>
                    {teacher.specialization && (
                      <Badge variant="secondary" className="text-sm">
                        <BookOpen className="h-3.5 w-3.5 mr-1" />
                        {teacher.specialization}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {teacher.diploma && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center gap-3 p-4 rounded-lg bg-muted/50"
                    >
                      <div className="p-2 rounded-full bg-primary/10">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("teacherProfile.diploma")}</p>
                        <p className="font-medium text-foreground">{teacher.diploma}</p>
                      </div>
                    </motion.div>
                  )}
                  
                  {teacher.years_experience && teacher.years_experience > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-3 p-4 rounded-lg bg-muted/50"
                    >
                      <div className="p-2 rounded-full bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("teacherProfile.experience")}</p>
                        <p className="font-medium text-foreground">{formatExperience(teacher.years_experience, t("teachers.years"))}</p>
                      </div>
                    </motion.div>
                  )}
                  
                  {teacher.city && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-3 p-4 rounded-lg bg-muted/50"
                    >
                      <div className="p-2 rounded-full bg-primary/10">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("teacherProfile.city")}</p>
                        <p className="font-medium text-foreground">{teacher.city}</p>
                      </div>
                    </motion.div>
                  )}
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-3 p-4 rounded-lg bg-muted/50"
                  >
                    <div className="p-2 rounded-full bg-primary/10">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("teacherProfile.status")}</p>
                      <p className="font-medium text-foreground">{t("teacherProfile.certified")}</p>
                    </div>
                  </motion.div>
                </div>

                {teacher.bio && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-8"
                  >
                    <h2 className="text-lg font-semibold mb-3 text-foreground">{t("teacherProfile.about")}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {teacher.bio}
                    </p>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="pt-6 border-t border-border"
                >
                  <h2 className="text-lg font-semibold mb-4 text-foreground">{t("teacherProfile.contact")}</h2>
                  <div className="flex flex-wrap gap-4">
                    {teacher.email && (
                      <a
                        href={`mailto:${teacher.email}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                        {teacher.email}
                      </a>
                    )}
                    {teacher.phone && (
                      <a
                        href={`tel:${teacher.phone}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        {teacher.phone}
                      </a>
                    )}
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}