import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Integrations = () => {
  const { data: googleDrive, isLoading } = useQuery({
    queryKey: ['integration', 'google_drive'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations')
        .select('is_enabled')
        .eq('provider', 'google_drive')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }
      return data;
    }
  });

  return (
    <MainLayout>
      <PageHeader
        title="Integrações"
        description="Conecte o Dr.lead com suas ferramentas favoritas para potencializar sua produtividade."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="card-gradient border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src="https://www.google.com/images/branding/product/2x/drive_48dp.png" alt="Google Drive logo" className="h-10 w-10" />
                <div>
                  <CardTitle>Google Drive</CardTitle>
                  <CardDescription>Sincronização de arquivos</CardDescription>
                </div>
              </div>
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Badge variant={googleDrive?.is_enabled ? "success" : "outline"}>
                  {googleDrive?.is_enabled ? "Conectado" : "Desconectado"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use o Google Drive como armazenamento para todos os arquivos enviados, crie novos documentos e vincule arquivos existentes aos seus leads e negócios.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/integrations/google-drive">
                Gerenciar
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Integrations;