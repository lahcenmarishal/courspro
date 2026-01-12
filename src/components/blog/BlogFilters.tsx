import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { BlogCategory } from "@/hooks/useBlog";
import { useLanguage } from "@/hooks/useLanguage";

interface BlogFiltersProps {
  categories: BlogCategory[];
  selectedCategory: string | null;
  selectedTag: string | null;
  allTags: string[];
  onCategoryChange: (slug: string | null) => void;
  onTagChange: (tag: string | null) => void;
}

export function BlogFilters({
  categories,
  selectedCategory,
  selectedTag,
  allTags,
  onCategoryChange,
  onTagChange,
}: BlogFiltersProps) {
  const { t } = useLanguage();
  const hasFilters = selectedCategory || selectedTag;

  return (
    <div className="space-y-4">
      {/* Categories */}
      <div>
        <h4 className="text-sm font-medium mb-2 text-muted-foreground">{t("blog.categories")}</h4>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!selectedCategory ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(null)}
          >
            {t("blog.all")}
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.slug ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(cat.slug)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">{t("blog.popularTags")}</h4>
          <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 10).map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => onTagChange(selectedTag === tag ? null : tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Clear filters */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onCategoryChange(null);
            onTagChange(null);
          }}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          {t("blog.clearFilters")}
        </Button>
      )}
    </div>
  );
}
