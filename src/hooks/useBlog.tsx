import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface BlogFile {
  id: string;
  post_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  title_ar: string | null;
  slug: string;
  excerpt: string | null;
  excerpt_ar: string | null;
  content: string;
  content_ar: string | null;
  featured_image_url: string | null;
  gallery_images: string[];
  author_id: string;
  category_id: string | null;
  tags: string[];
  status: "draft" | "published";
  published_at: string | null;
  scheduled_at: string | null;
  meta_title: string | null;
  meta_title_ar: string | null;
  meta_description: string | null;
  meta_description_ar: string | null;
  og_image_url: string | null;
  reading_time_minutes: number;
  created_at: string;
  updated_at: string;
  category?: BlogCategory | null;
  files?: BlogFile[];
  author?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

export interface CreateBlogPostData {
  title: string;
  title_ar?: string | null;
  slug: string;
  excerpt?: string | null;
  excerpt_ar?: string | null;
  content: string;
  content_ar?: string | null;
  featured_image_url?: string | null;
  gallery_images?: string[];
  category_id?: string | null;
  tags?: string[];
  status: "draft" | "published";
  published_at?: string | null;
  scheduled_at?: string | null;
  meta_title?: string | null;
  meta_title_ar?: string | null;
  meta_description?: string | null;
  meta_description_ar?: string | null;
  og_image_url?: string | null;
}

// Categories
export function useCategories() {
  return useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as BlogCategory[];
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; slug: string; description?: string }) => {
      const { data: result, error } = await supabase
        .from("blog_categories")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      toast.success("Catégorie créée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la création de la catégorie");
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      toast.success("Catégorie supprimée");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });
}

// Blog Posts (Admin)
export function useAdminBlogPosts() {
  return useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          *,
          category:blog_categories(*),
          files:blog_files(*)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
  });
}

// Blog Posts (Public)
export function usePublicBlogPosts(categorySlug?: string, tag?: string) {
  return useQuery({
    queryKey: ["public-blog-posts", categorySlug, tag],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select(`
          *,
          category:blog_categories(*)
        `)
        .eq("status", "published")
        .or("published_at.is.null,published_at.lte.now()")
        .order("created_at", { ascending: false });

      if (categorySlug) {
        const { data: category } = await supabase
          .from("blog_categories")
          .select("id")
          .eq("slug", categorySlug)
          .single();
        if (category) {
          query = query.eq("category_id", category.id);
        }
      }

      if (tag) {
        query = query.contains("tags", [tag]);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch author profiles separately
      const authorIds = [...new Set(data.map((p: any) => p.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, avatar_url")
        .in("user_id", authorIds);

      const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);

      return data.map((post: any) => ({
        ...post,
        author: profileMap.get(post.author_id) || null,
      })) as BlogPost[];
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          *,
          category:blog_categories(*),
          files:blog_files(*)
        `)
        .eq("slug", slug)
        .single();
      if (error) throw error;

      // Fetch author profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, avatar_url")
        .eq("user_id", data.author_id)
        .single();

      return {
        ...data,
        author: profile || null,
      } as BlogPost;
    },
    enabled: !!slug,
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBlogPostData & { author_id: string }) => {
      const { data: result, error } = await supabase
        .from("blog_posts")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success("Article créé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la création de l'article");
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CreateBlogPostData> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("blog_posts")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["public-blog-posts"] });
      toast.success("Article mis à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success("Article supprimé");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });
}

// Blog Files
export function useAddBlogFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { post_id: string; file_name: string; file_url: string; file_type: string; file_size?: number }) => {
      const { data: result, error } = await supabase
        .from("blog_files")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success("Fichier ajouté");
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout du fichier");
    },
  });
}

export function useDeleteBlogFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_files").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success("Fichier supprimé");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });
}

// Utility function to generate slug
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Upload functions
export async function uploadBlogImage(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  const filePath = `images/${fileName}`;

  const { error } = await supabase.storage
    .from("blog-images")
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage.from("blog-images").getPublicUrl(filePath);
  return data.publicUrl;
}

export async function uploadBlogFile(file: File): Promise<{ url: string; size: number }> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  const filePath = `files/${fileName}`;

  const { error } = await supabase.storage
    .from("blog-files")
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage.from("blog-files").getPublicUrl(filePath);
  return { url: data.publicUrl, size: file.size };
}
