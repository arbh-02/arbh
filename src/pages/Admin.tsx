import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Navigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { EditUserDialog } from "@/components/admin/EditUserDialog";
import { NewUserDialog } from "@/components/admin/NewUserDialog";

type AppUser = Tables<'app_users'>;

const Admin = () => {
  const { appUser } = useAuth();
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);

  const { data: users, isLoading } = useQuery<AppUser[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('app_users').select('*').order('nome', { ascending: true });
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: appUser?.papel === 'admin',
  });

  if (appUser && appUser.papel !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <MainLayout>
      <PageHeader
        title="Administração"
        description="Gestão de usuários e configurações"
        actions={
          <Button onClick={() => setIsNewUserOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        }
      />

      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium">Nome</th>
                <th className="text-left py-3 px-4 font-medium">Email</th>
                <th className="text-left py-3 px-4 font-medium">Papel</th>
                <th className="text-right py-3 px-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  </td>
                </tr>
              ) : (
                users?.map((user) => (
                  <tr 
                    key={user.id} 
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium">{user.nome}</td>
                    <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={user.papel === "admin" ? "default" : user.papel === "vendedor" ? "secondary" : "outline"} 
                        className="capitalize"
                      >
                        {user.papel}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingUser(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" disabled={user.id === appUser?.id}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
        />
      )}

      <NewUserDialog open={isNewUserOpen} onOpenChange={setIsNewUserOpen} />
    </MainLayout>
  );
};

export default Admin;