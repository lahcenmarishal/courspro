import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  Loader2, 
  Search, 
  GraduationCap,
  Award,
  Clock,
  MapPin,
  BookOpen
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

export default function TeachersTeamPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { t, dir } = useLanguage();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      // Get all approved teachers
      const { data: teacherRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "teacher")
        .eq("status", "approved");

      if (rolesError) throw rolesError;

      if (!teacherRoles || teacherRoles.length === 0) {
        setTeachers([]);
        setLoading(false);
        return;
      }

      const userIds = teacherRoles.map((r) => r.user_id);

      // Get profiles for approved teachers
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, first_name, last_name, email, phone, avatar_url, bio, specialization, city, diploma, years_experience")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      setTeachers(profiles || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      teacher.first_name.toLowerCase().includes(searchLower) ||
      teacher.last_name.toLowerCase().includes(searchLower) ||
      (teacher.specialization?.toLowerCase().includes(searchLower) ?? false) ||
      (teacher.city?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 lg:pt-32 lg:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="secondary" className="mb-4">
              <GraduationCap className="h-3 w-3 mr-1" />
              {t("teachers.badge")}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
              {t("teachers.title")}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("teachers.description")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary">{teachers.length}</div>
              <div className="text-sm text-muted-foreground">{t("teachers.stats.teachers")}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary">
                {teachers.filter(t => t.diploma).length}
              </div>
              <div className="text-sm text-muted-foreground">{t("teachers.stats.graduates")}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary">
                20+
              </div>
              <div className="text-sm text-muted-foreground">{t("teachers.stats.experience")}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary">
                {new Set(teachers.map(t => t.specialization).filter(Boolean)).size}
              </div>
              <div className="text-sm text-muted-foreground">{t("teachers.stats.specialties")}</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Search & Teachers Grid */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-md mx-auto mb-8 lg:mb-12"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("teachers.search.placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : filteredTeachers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                {searchQuery ? t("teachers.noResults") : t("teachers.noTeachers")}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? t("teachers.noResults.desc")
                  : t("teachers.noTeachers.desc")}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTeachers.map((teacher, index) => (
                <motion.div
                  key={teacher.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Link to={`/enseignants/${teacher.id}`} className="block h-full">
                    <Card className="group h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-border/50 cursor-pointer">
                      {/* Gradient Background */}
                    <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 relative">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(var(--primary)/0.3),transparent)]" />
                    </div>
                    
                    <CardContent className="pt-0 pb-6 px-6 -mt-12 relative">
                      {/* Avatar */}
                      <div className="flex justify-center mb-4">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                          <AvatarImage src={teacher.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                            {getInitials(teacher.first_name, teacher.last_name)}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      {/* Info */}
                      <div className="text-center space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {teacher.first_name} {teacher.last_name}
                          </h3>
                          {teacher.specialization && (
                            <Badge variant="secondary" className="mt-2">
                              <BookOpen className="h-3 w-3 mr-1" />
                              {teacher.specialization}
                            </Badge>
                          )}
                        </div>

                        {teacher.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {teacher.bio}
                          </p>
                        )}

                        {/* Details */}
                        <div className="flex flex-wrap justify-center gap-3 pt-2">
                          {teacher.diploma && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Award className="h-3 w-3 text-primary" />
                              <span>{teacher.diploma}</span>
                            </div>
                          )}
                          {teacher.years_experience && teacher.years_experience > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 text-primary" />
                              <span>{teacher.years_experience} {t("teachers.years")}</span>
                            </div>
                          )}
                          {teacher.city && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 text-primary" />
                              <span>{teacher.city}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
              {t("teachers.cta.title")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t("teachers.cta.description")}
            </p>
            <a
              href="/auth/teacher"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              {t("teachers.cta.button")}
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}