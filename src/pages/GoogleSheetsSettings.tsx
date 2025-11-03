import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  spreadsheetId: z.string().min(1, "O ID da Planilha é obrigatório"),
  sheetName: z.string().min(1, "O Nome da Aba é obrigatório"),
  isEnabled: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const GoogleSheetsSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['integration', 'google_sheets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('provider', 'google_sheets')
        .single();
      
      if (error && error.code !== 'PGRST116') { // Ignore 'no rows found'
        throw new Error(error.message);
      }
      return data;
    }
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: {
      spreadsheetId: settings?.settings?.spreadsheetId || "",
      sheetName: settings?.settings?.sheetName || "",
      isEnabled: settings?.is_enabled || false,
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { error } = await supabase
        .from('integrations')
        .upsert({
          provider: 'google_sheets',
          settings: {
            spreadsheetId: values.spreadsheetId,
            sheetName: values.sheetName,
          },
          is_enabled: values.isEnabled,
        }, { onConflict: 'provider' });

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Configurações salvas com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['integration', 'google_sheets'] });
    },
    onError: (error) => {
      toast.error(`Erro ao salvar: ${error.message}`);
    }
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return <MainLayout><div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div></MainLayout>;
  }

  return (
    <MainLayout>
      <PageHeader
        title="Configurações do Google Sheets"
        description="Conecte uma planilha para importar leads automaticamente."
        actions={
          <Button asChild variant="outline">
            <Link to="/integrations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        }
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-gradient border-border">
          <CardHeader>
            <CardTitle>Configuração da Planilha</CardTitle>
            <CardDescription>
              Especifique qual planilha e aba devem ser usadas para a importação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Ativar Integração</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilite para permitir a sincronização de leads.
                  </p>
                </div>
                <Switch
                  checked={watch('isEnabled')}
                  onCheckedChange={(checked) => setValue('isEnabled', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spreadsheetId">ID da Planilha</Label>
                <Input
                  id="spreadsheetId"
                  placeholder="Ex: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvW2upms"
                  {...register("spreadsheetId")}
                />
                {errors.spreadsheetId && <p className="text-sm text-destructive">{errors.spreadsheetId.message}</p>}
                <p className="text-xs text-muted-foreground">
                  Você encontra o ID na URL da sua planilha.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sheetName">Nome da Aba</Label>
                <Input
                  id="sheetName"
                  placeholder="Ex: Leads_Novos"
                  {...register("sheetName")}
                />
                {errors.sheetName && <p className="text-sm text-destructive">{errors.sheetName.message}</p>}
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Configurações
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="card-gradient border-border">
          <CardHeader>
            <CardTitle>Sincronização</CardTitle>
            <CardDescription>
              Inicie a importação dos leads da planilha configurada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                A sincronização buscará por novas linhas na sua planilha e as criará como leads no sistema. Certifique-se de que as colunas correspondem ao formato esperado.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button className="w-full" disabled={!watch('isEnabled')}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronizar Agora
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default GoogleSheetsSettings;