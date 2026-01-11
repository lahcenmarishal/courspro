import { Link } from "react-router-dom";
import { Clock, Calendar, ArrowRight, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { BlogPost } from "@/hooks/useBlog";
import { getBlogImage } from "@/lib/blogImages";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const publishDate = post.published_at || post.created_at;
  const imageUrl = getBlogImage(post.slug, post.featured_image_url);

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
      <Link to={`/blog/${post.slug}`}>
        {imageUrl && (
          <div className="aspect-video overflow-hidden">
            <img
              src={imageUrl}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {post.category && (
              <Badge variant="secondary" className="text-xs">
                {post.category.name}
              </Badge>
            )}
            {post.tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(publishDate), "d MMM yyyy", { locale: fr })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.reading_time_minutes} min
              </span>
            </div>
            <span className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Lire <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
