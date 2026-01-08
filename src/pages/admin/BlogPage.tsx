import { useState } from "react";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2,
  Search,
  FileText,
  FolderOpen
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAdminBlogPosts, useDeleteBlogPost, useCategories, useCreateCategory, useDeleteCategory } from "@/hooks/useBlog";
import { BlogPostEditor } from "@/components/admin/BlogPostEditor";
import { BlogCategoryManager } from "@/components/admin/BlogCategoryManager";
import type { BlogPost } from "@/hooks/useBlog";

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);

  const { data: posts, isLoading } = useAdminBlogPosts();
  const { data: categories = [] } = useCategories();
  const deletePost = useDeleteBlogPost();

  const filteredPosts = posts?.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setIsEditorOpen(true);
  };

  const handleCreate = () => {
    setSelectedPost(null);
    setIsEditorOpen(true);
  };

  const handleDelete = async () => {
    if (deletePostId) {
      await deletePost.mutateAsync(deletePostId);
      setDeletePostId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Gestion du Blog</h1>
              <p className="text-muted-foreground">
                Créez et gérez vos articles de blog
              </p>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel article
            </Button>
          </div>

          <Tabs defaultValue="posts" className="space-y-6">
            <TabsList>
              <TabsTrigger value="posts" className="gap-2">
                <FileText className="h-4 w-4" />
                Articles
              </TabsTrigger>
              <TabsTrigger value="categories" className="gap-2">
                <FolderOpen className="h-4 w-4" />
                Catégories
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-4">
              {/* Search */}
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un article..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Posts Table */}
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredPosts?.length === 0 ? (
                <div className="text-center py-12 border rounded-lg">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium mb-2">Aucun article</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Commencez par créer votre premier article
                  </p>
                  <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un article
                  </Button>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Fichiers</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPosts?.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {post.featured_image_url && (
                                <img
                                  src={post.featured_image_url}
                                  alt=""
                                  className="h-10 w-14 rounded object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium line-clamp-1">{post.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  /{post.slug}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {post.category ? (
                              <Badge variant="secondary">{post.category.name}</Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {post.status === "published" ? (
                              <Badge className="bg-accent text-accent-foreground">
                                <Eye className="h-3 w-3 mr-1" />
                                Publié
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <EyeOff className="h-3 w-3 mr-1" />
                                Brouillon
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(post.created_at), "d MMM yyyy", {
                              locale: fr,
                            })}
                          </TableCell>
                          <TableCell>
                            {post.files && post.files.length > 0 ? (
                              <Badge variant="outline">
                                {post.files.length} fichier(s)
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(post)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletePostId(post.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="categories">
              <BlogCategoryManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPost ? "Modifier l'article" : "Nouvel article"}
            </DialogTitle>
          </DialogHeader>
          <BlogPostEditor
            post={selectedPost}
            categories={categories}
            onClose={() => setIsEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'article et tous ses fichiers seront supprimés définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
