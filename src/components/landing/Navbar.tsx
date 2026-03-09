import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, GraduationCap, LayoutDashboard, BookOpen } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, role, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const navLinks = [
    { label: t("nav.primary"), href: "/programmes/primaire", isAnchor: false },
    { label: t("nav.college"), href: "/programmes/college", isAnchor: false },
    { label: t("nav.lycee"), href: "/programmes/lycee", isAnchor: false },
    { label: t("nav.teachers"), href: "/enseignants", isAnchor: false },
    { label: "Blog", href: "/blog", isAnchor: false },
    { label: language === 'ar' ? 'آراء العملاء' : 'Témoignages', href: "/temoignages", isAnchor: false },
    { label: t("nav.about"), href: "/about", isAnchor: false },
    { label: t("nav.contact"), href: "/contact", isAnchor: false },
  ];

  const accessLinks = [
    { label: t("nav.teacher"), href: "/auth/teacher", icon: BookOpen, color: "text-secondary" },
  ];

  const getDashboardInfo = () => {
    switch (role) {
      case 'admin': return { label: t('nav.adminDashboard'), path: '/dashboard' };
      case 'teacher': return { label: t('nav.teacherDashboard'), path: '/dashboard' };
      case 'student': return { label: t('nav.studentDashboard'), path: '/dashboard' };
      default: return { label: t('nav.dashboard'), path: '/dashboard' };
    }
  };

  const dashboardInfo = getDashboardInfo();

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const [path, hash] = href.split('#');
    if (location.pathname === '/' || location.pathname === path) {
      const element = document.getElementById(hash);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(href);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass-strong">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">CoursPro</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.isAnchor ? (
                <a key={link.href} href={link.href} onClick={(e) => handleAnchorClick(e, link.href)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} to={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              )
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            {loading ? (
              <div className="h-10 w-32 bg-muted animate-pulse rounded-lg" />
            ) : user ? (
              <Link to={dashboardInfo.path}>
                <Button variant="hero">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  {dashboardInfo.label}
                </Button>
              </Link>
            ) : (
              <>
                {accessLinks.map((link) => (
                  <Link key={link.href} to={link.href}>
                    <Button variant="ghost" size="sm" className={link.color}>
                      <link.icon className="h-4 w-4 mr-1" />
                      {link.label}
                    </Button>
                  </Link>
                ))}
                <Link to="/auth"><Button variant="ghost">{t("nav.login")}</Button></Link>
                <Link to="/auth"><Button variant="hero">{t("nav.signup")}</Button></Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </nav>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border">
              <div className="container mx-auto px-4 py-4 space-y-4">
                {navLinks.map((link) => (
                  link.isAnchor ? (
                    <a key={link.href} href={link.href} className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2 cursor-pointer"
                      onClick={(e) => { handleAnchorClick(e, link.href); setMobileMenuOpen(false); }}>
                      {link.label}
                    </a>
                  ) : (
                    <Link key={link.href} to={link.href} className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2"
                      onClick={() => setMobileMenuOpen(false)}>
                      {link.label}
                    </Link>
                  )
                ))}
                <div className="pt-4 border-t border-border space-y-2">
                  <LanguageSwitcher />
                  {loading ? (
                    <div className="h-10 w-full bg-muted animate-pulse rounded-lg" />
                  ) : user ? (
                    <Link to={dashboardInfo.path} className="block" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="hero" className="w-full">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        {dashboardInfo.label}
                      </Button>
                    </Link>
                  ) : (
                    <>
                      {accessLinks.map((link) => (
                        <Link key={link.href} to={link.href} className="block" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" className={`w-full ${link.color}`}>
                            <link.icon className="h-4 w-4 mr-2" />
                            {link.label}
                          </Button>
                        </Link>
                      ))}
                      <Link to="/auth" className="block" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full">{t("nav.login")}</Button>
                      </Link>
                      <Link to="/auth" className="block" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="hero" className="w-full">{t("nav.signup")}</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
