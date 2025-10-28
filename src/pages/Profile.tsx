import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";

const Profile = () => {
  const { appUser } = useAuth();
  const { ui, setUI } = useApp();

  if (!appUser) return null;

  const initials = appUser.nome
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <MainLayout>
      <PageHeader title="Meu Perfil" description="Informações e preferências da conta" />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-gradient border-border">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{appUser.nome}</h3>
                <p className="text-sm text-muted-foreground">{appUser.email}</p>
                <Badge variant="secondary" className="mt-2 capitalize">
                  {appUser.papel}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient border-border">
          <CardHeader>
            <CardTitle>Preferências</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="animations">Animações</Label>
                <p className="text-sm text-muted-foreground">Ativar/desativar animações na interface</p>
              </div>
              <Switch
                id="animations"
                checked={ui.animacoes}
                onCheckedChange={(checked) => setUI({ animacoes: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="density">Tabela Densa</Label>
                <p className="text-sm text-muted-foreground">Mostrar mais dados em menos espaço</p>
              </div>
              <Switch
                id="density"
                checked={ui.tabelaDensa}
                onCheckedChange={(checked) => setUI({ tabelaDensa: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient border-border md:col-span-2">
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">ID do Usuário</Label>
                <p className="mt-1 font-mono text-sm">{appUser.id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Data de Criação</Label>
                <p className="mt-1 text-sm">
                  {new Date(appUser.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Profile;