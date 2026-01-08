import { useState, useMemo } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Loader2, BookOpen, Search } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogFilters } from "@/components/blog/BlogFilters";
import { Input } from "@/components/ui/input";
import { usePublicBlogPosts, useCategories } from "@/hooks/useBlog";

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: posts, isLoading } = usePublicBlogPosts(
    selectedCategory || undefined,
    selectedTag || undefined
  );
  const { data: categories = [] } = useCategories();

  // Extract all unique tags from posts
  const allTags = useMemo(() => {
    if (!posts) return [];
    const tagSet = new Set<string>();
    posts.forEach((post) => {
      post.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [posts]);

  // Filter posts by search query
  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    if (!searchQuery) return posts;
    const query = searchQuery.toLowerCase();
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt?.toLowerCase().includes(query) ||
        post.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [posts, searchQuery]);

  return (
    <>
      <Helmet>
        <title>Blog | EduVirtual - Articles et Ressources Éducatives</title>
        <meta
          name="description"
          content="Découvrez nos articles éducatifs, conseils et ressources pour réussir vos études. Cours téléchargeables et contenus exclusifs."
        />
      </Helmet>

      <Navbar />

      <main className="min-h-screen pt-20">
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <BookOpen className="h-4 w-4" />
                Blog & Ressources
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                Articles & <span className="gradient-text">Cours</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Explorez nos articles éducatifs et téléchargez des cours gratuits pour améliorer votre apprentissage.
              </p>
            </motion.div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-xl mx-auto mt-8"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher un article..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filters & Posts */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <BlogFilters
              categories={categories}
              selectedCategory={selectedCategory}
              selectedTag={selectedTag}
              allTags={allTags}
              onCategoryChange={setSelectedCategory}
              onTagChange={setSelectedTag}
            />

            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun article trouvé</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Essayez avec d'autres mots-clés"
                    : "De nouveaux articles arrivent bientôt !"}
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8"
              >
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <BlogCard post={post} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
