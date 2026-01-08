import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ScrollToHash } from "@/components/ScrollToHash";
import { FloatingLanguageSwitcher } from "@/components/FloatingLanguageSwitcher";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminAuth from "./pages/auth/AdminAuth";
import TeacherAuth from "./pages/auth/TeacherAuth";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import LevelsPage from "./pages/admin/LevelsPage";
import SubjectsPage from "./pages/admin/SubjectsPage";
import ClassesPage from "./pages/admin/ClassesPage";
import UsersPage from "./pages/admin/UsersPage";
import SchoolYearsPage from "./pages/admin/SchoolYearsPage";
import TeacherRequestsPage from "./pages/admin/TeacherRequestsPage";
import TeachersPage from "./pages/admin/TeachersPage";
import ResourcesPage from "./pages/dashboard/ResourcesPage";
import HomeworkPage from "./pages/dashboard/HomeworkPage";
import GradesPage from "./pages/dashboard/GradesPage";
import AttendancePage from "./pages/dashboard/AttendancePage";
import MessagesPage from "./pages/dashboard/MessagesPage";
import SchedulePage from "./pages/dashboard/SchedulePage";
import SessionsPage from "./pages/dashboard/SessionsPage";
import SubscriptionsPage from "./pages/dashboard/SubscriptionsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import TrackingPage from "./pages/dashboard/TrackingPage";
import CalendarPage from "./pages/dashboard/CalendarPage";
import PrimairePage from "./pages/programs/PrimairePage";
import CollegePage from "./pages/programs/CollegePage";
import LyceePage from "./pages/programs/LyceePage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import TeachersTeamPage from "./pages/TeachersTeamPage";
import TeacherProfilePage from "./pages/TeacherProfilePage";
import PricingPage from "./pages/PricingPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import NotFound from "./pages/NotFound";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import AdminBlogPage from "./pages/admin/BlogPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToHash />
        <FloatingLanguageSwitcher />
        <FloatingWhatsApp />
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/admin" element={<AdminAuth />} />
            <Route path="/auth/teacher" element={<TeacherAuth />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/programmes/primaire" element={<PrimairePage />} />
            <Route path="/programmes/college" element={<CollegePage />} />
            <Route path="/programmes/lycee" element={<LyceePage />} />
            <Route path="/confidentialite" element={<PrivacyPolicy />} />
            <Route path="/cgu" element={<TermsOfService />} />
            <Route path="/tarifs" element={<PricingPage />} />
            <Route path="/comment-ca-marche" element={<HowItWorksPage />} />
            <Route path="/enseignants" element={<TeachersTeamPage />} />
            <Route path="/enseignants/:id" element={<TeacherProfilePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/dashboard/blog" element={<AdminBlogPage />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/levels" element={<LevelsPage />} />
            <Route path="/dashboard/subjects" element={<SubjectsPage />} />
            <Route path="/dashboard/classes" element={<ClassesPage />} />
            <Route path="/dashboard/users" element={<UsersPage />} />
            <Route path="/dashboard/school-years" element={<SchoolYearsPage />} />
            <Route path="/dashboard/teacher-requests" element={<TeacherRequestsPage />} />
            <Route path="/dashboard/teachers" element={<TeachersPage />} />
            <Route path="/dashboard/resources" element={<ResourcesPage />} />
            <Route path="/dashboard/homework" element={<HomeworkPage />} />
            <Route path="/dashboard/evaluations" element={<HomeworkPage />} />
            <Route path="/dashboard/grades" element={<GradesPage />} />
            <Route path="/dashboard/attendance" element={<AttendancePage />} />
            <Route path="/dashboard/messages" element={<MessagesPage />} />
            <Route path="/dashboard/schedule" element={<SchedulePage />} />
            <Route path="/dashboard/sessions" element={<SessionsPage />} />
            <Route path="/dashboard/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
            <Route path="/dashboard/tracking" element={<TrackingPage />} />
            <Route path="/dashboard/calendar" element={<CalendarPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
