import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const Integrations = () => {
  return (
    <MainLayout>
      <PageHeader
        title="Integrações"
        description="Conecte o Dr.lead com suas ferramentas favoritas para potencializar sua produtividade."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="card-gradient border-border">
          <CardHeader>
            <div className="flex items-center gap-4">
              <img src="https://www.google.com/images/branding/product/2x/drive_48dp.png" alt="Google Drive logo" className="h-10 w-10" />
              <div>
                <CardTitle>Google Drive</CardTitle>
                <CardDescription>Sincronização de arquivos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Use o Google Drive como armazenamento para todos os arquivos enviados, crie novos documentos e vincule arquivos existentes aos seus leads e negócios.
            </p>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Em Breve!</AlertTitle>
              <AlertDescription>
                Esta funcionalidade requer configuração de chaves de API no Google Cloud Console.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button className="w-full" disabled>
              Conectar
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Integrations;