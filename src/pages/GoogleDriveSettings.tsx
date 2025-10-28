import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  clientId: z.string().min(1, "Client ID é obrigatório"),
  apiKey: z.string().min(1, "API Key é obrigatória"),
  isEnabled: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const GoogleDriveSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['integration', 'google_drive'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('provider', 'google_drive')
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
      clientId: settings?.settings?.clientId || "",
      apiKey: settings?.settings?.apiKey || "",
      isEnabled: settings?.is_enabled || false,
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { error } = await supabase
        .from('integrations')
        .upsert({
          provider: 'google_drive',
          settings: {
            clientId: values.clientId,
            apiKey: values.apiKey,
          },
          is_enabled: values.isEnabled,
        }, { onConflict: 'provider' });

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Configurações salvas com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['integration', 'google_drive'] });
    },
    onError: (error) => {
      toast.error(`Erro ao salvar: ${error.message}`);
    }
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return <MainLayout><Loader2 className="h-8 w-8 animate-spin" /></MainLayout>;
  }

  return (
    <MainLayout>
      <PageHeader
        title="Configurações do Google Drive"
        description="Insira suas chaves de API para ativar a integração."
        actions={
          <Button asChild variant="outline">
            <Link to="/integrations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        }
      />
      <Card className="max-w-2xl card-gradient border-border">
        <CardHeader>
          <CardTitle>Credenciais da API</CardTitle>
          <CardDescription>
            Você pode encontrar essas chaves no seu painel do Google Cloud Console.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Ativar Integração</Label>
                <p className="text-sm text-muted-foreground">
                  Habilite para começar a sincronizar arquivos.
                </p>
              </div>
              <Switch
                checked={watch('isEnabled')}
                onCheckedChange={(checked) => setValue('isEnabled', checked)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                type="password"
                placeholder="Seu Client ID do Google"
                {...register("clientId")}
              />
              {errors.clientId && <p className="text-sm text-destructive">{errors.clientId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Sua API Key do Google"
                {...register("apiKey")}
              />
              {errors.apiKey && <p className="text-sm text-destructive">{errors.apiKey.message}</p>}
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
    </MainLayout>
  );
};

export default GoogleDriveSettings;