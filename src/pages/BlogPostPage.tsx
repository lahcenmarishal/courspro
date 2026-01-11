import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { 
  Loader2, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  Download, 
  Tag as TagIcon,
  FileText,
  Share2
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useBlogPost } from "@/hooks/useBlog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getBlogImage } from "@/lib/blogImages";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPost(slug || "");

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      // Create a temporary link to download
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Téléchargement démarré");
    } catch {
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: post?.title,
        text: post?.excerpt || "",
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papiers");
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word") || fileType.includes("doc")) return "📝";
    return "📎";
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
          <Link to="/blog">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au blog
            </Button>
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const publishDate = post.published_at || post.created_at;
  const imageUrl = getBlogImage(post.slug, post.featured_image_url);

  return (
    <>
      <Helmet>
        <title>{post.meta_title || post.title} | EduVirtual Blog</title>
        <meta name="description" content={post.meta_description || post.excerpt || ""} />
        {post.og_image_url && <meta property="og:image" content={post.og_image_url} />}
        <meta property="og:title" content={post.meta_title || post.title} />
        <meta property="og:description" content={post.meta_description || post.excerpt || ""} />
        <link rel="canonical" href={`${window.location.origin}/blog/${post.slug}`} />
      </Helmet>

      <Navbar />

      <main className="min-h-screen pt-20">
        {/* Header */}
        <article>
          {/* Featured Image */}
          {imageUrl && (
            <div className="relative h-[40vh] lg:h-[50vh] overflow-hidden">
              <img
                src={imageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            </div>
          )}

          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Back link */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="pt-8"
              >
                <Link
                  to="/blog"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Retour au blog
                </Link>
              </motion.div>

              {/* Title & Meta */}
              <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`py-8 ${imageUrl ? "-mt-32 relative z-10" : ""}`}
              >
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {post.category && (
                    <Badge variant="secondary">{post.category.name}</Badge>
                  )}
                  {post.tags?.map((tag) => (
                    <Badge key={tag} variant="outline">
                      <TagIcon className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>

                <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-6">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  {post.author && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={post.author.avatar_url || undefined} />
                        <AvatarFallback>
                          {post.author.first_name?.[0]}
                          {post.author.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {post.author.first_name} {post.author.last_name}
                      </span>
                    </div>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(publishDate), "d MMMM yyyy", { locale: fr })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.reading_time_minutes} min de lecture
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-1" />
                    Partager
                  </Button>
                </div>
              </motion.header>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="pb-12"
              >
                <MarkdownRenderer content={post.content} />
              </motion.div>

              {/* Gallery */}
              {post.gallery_images && post.gallery_images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="py-8 border-t border-border"
                >
                  <h3 className="text-xl font-semibold mb-4">Galerie</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {post.gallery_images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Image ${index + 1}`}
                        className="rounded-lg object-cover aspect-video"
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Downloadable Files */}
              {post.files && post.files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="py-8 border-t border-border"
                >
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Fichiers téléchargeables
                  </h3>
                  <div className="grid gap-3">
                    {post.files.map((file) => (
                      <Card key={file.id} className="hover:border-primary/30 transition-colors">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getFileIcon(file.file_type)}</span>
                            <div>
                              <p className="font-medium">{file.file_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {file.file_type.toUpperCase()} • {formatFileSize(file.file_size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleDownload(file.file_url, file.file_name)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
