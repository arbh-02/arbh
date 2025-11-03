import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Loader2, FileSpreadsheet } from "lucide-react";

const Integrations = () => {
  const { data: googleSheets, isLoading } = useQuery({
    queryKey: ['integration', 'google_sheets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations')
        .select('is_enabled')
        .eq('provider', 'google_sheets')
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
                <FileSpreadsheet className="h-10 w-10 text-green-500" />
                <div>
                  <CardTitle>Google Sheets</CardTitle>
                  <CardDescription>Importação de leads</CardDescription>
                </div>
              </div>
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Badge variant={googleSheets?.is_enabled ? "success" : "outline"}>
                  {googleSheets?.is_enabled ? "Conectado" : "Desconectado"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Importe e sincronize leads diretamente de uma planilha do Google Sheets para abastecer seu pipeline de forma automática e organizada.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/integrations/google-sheets">
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