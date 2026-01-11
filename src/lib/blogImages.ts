// Blog images mapping - imports for local assets
import reussirEcoleMaroc from "@/assets/blog/reussir-ecole-maroc.jpg";
import methodesApprendre from "@/assets/blog/methodes-apprendre.jpg";
import organisationMotivation from "@/assets/blog/organisation-motivation.jpg";
import techniquesRevision from "@/assets/blog/techniques-revision.jpg";
import apprendreIntelligemment from "@/assets/blog/apprendre-intelligemment.jpg";

// Map of slug to image import
export const blogImageMap: Record<string, string> = {
  "comment-reussir-ecole-maroc": reussirEcoleMaroc,
  "methodes-efficaces-mieux-apprendre": methodesApprendre,
  "organisation-motivation-scolaire": organisationMotivation,
  "techniques-revision-eleves-marocains": techniquesRevision,
  "apprendre-intelligemment-conseils-pratiques": apprendreIntelligemment,
};

// Helper function to get blog image by slug
// Priority: database URL (if it's a full URL) > local image map > undefined
export function getBlogImage(slug: string, databaseUrl?: string | null): string | undefined {
  // If database has a full URL (http/https), use it - this allows admins to override
  if (databaseUrl && (databaseUrl.startsWith('http://') || databaseUrl.startsWith('https://'))) {
    return databaseUrl;
  }
  // Otherwise fallback to local image map
  return blogImageMap[slug] || undefined;
}
