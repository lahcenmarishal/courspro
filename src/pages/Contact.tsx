import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Send, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { toast } from 'sonner';
import { z } from 'zod';
import { useLanguage } from '@/hooks/useLanguage';

export default function Contact() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const contactSchema = z.object({
    name: z.string().min(2, language === 'ar' ? 'الاسم يجب أن يحتوي على حرفين على الأقل' : 'Le nom doit contenir au moins 2 caractères').max(100),
    email: z.string().email(language === 'ar' ? 'البريد الإلكتروني غير صالح' : 'Email invalide').max(255),
    phone: z.string().optional(),
    subject: z.string().min(5, language === 'ar' ? 'الموضوع يجب أن يحتوي على 5 أحرف على الأقل' : 'Le sujet doit contenir au moins 5 caractères').max(200),
    message: z.string().min(20, language === 'ar' ? 'الرسالة يجب أن تحتوي على 20 حرفاً على الأقل' : 'Le message doit contenir au moins 20 caractères').max(2000),
  });

  const contactInfo = [
    {
      icon: Mail,
      title: t("contact.info.email"),
      value: t("contact.info.email.value"),
      description: t("contact.info.email.desc")
    },
    {
      icon: Phone,
      title: t("contact.info.phone"),
      value: t("contact.info.phone.value"),
      description: t("contact.info.phone.desc")
    },
    {
      icon: MapPin,
      title: t("contact.info.address"),
      value: t("contact.info.address.value"),
      description: t("contact.info.address.desc")
    },
    {
      icon: Clock,
      title: t("contact.info.hours"),
      value: t("contact.info.hours.value"),
      description: t("contact.info.hours.desc")
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = contactSchema.safeParse(formData);
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setLoading(false);
        return;
      }

      // Simulate sending message
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(t("contact.form.success"));
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      toast.error(t("contact.form.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              {t("contact.back")}
            </Link>
            
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="gradient-text">{t("contact.title")}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("contact.description")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-xl p-6 border border-border text-center hover:shadow-lg transition-shadow"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <info.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{info.title}</h3>
                <p className="text-primary font-medium mb-1">{info.value}</p>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-6">{t("contact.form.title")}</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("contact.form.name")}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t("contact.form.name.placeholder")}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("contact.form.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={t("contact.form.email.placeholder")}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t("contact.form.phone")}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={t("contact.form.phone.placeholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">{t("contact.form.subject")}</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={t("contact.form.subject.placeholder")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">{t("contact.form.message")}</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={t("contact.form.message.placeholder")}
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {t("contact.form.submit")}
                </Button>
              </form>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col justify-center"
            >
              <div className="bg-muted/30 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-4">{t("contact.faq.title")}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">{t("contact.faq.q1")}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t("contact.faq.a1")}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">{t("contact.faq.q2")}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t("contact.faq.a2")}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">{t("contact.faq.q3")}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t("contact.faq.a3")}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">{t("contact.faq.q4")}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t("contact.faq.a4")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-primary/5 rounded-xl border border-primary/10">
                <h4 className="font-semibold mb-2">{t("contact.urgent.title")}</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("contact.urgent.description")}
                </p>
                <a href="tel:+212779842809" className="inline-flex items-center gap-2 text-primary font-medium">
                  <Phone className="h-4 w-4" />
                  +212 779-842809
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
