import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWhatsappIntegration, whatsappSettingsSchema, WhatsappSettings } from "@/hooks/use-whatsapp-integration";
import { Loader2, MessageSquare, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const WhatsappSettingsComponent = () => {
  const { settings, isLoading, saveSettings, isSaving } = useWhatsappIntegration();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<WhatsappSettings>({
    resolver: zodResolver(whatsappSettingsSchema),
    values: settings,
  });

  const onSubmit = (data: WhatsappSettings) => {
    saveSettings(data);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="card-gradient border-border max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          <MessageSquare className="h-8 w-8 text-green-500" />
          <div>
            <CardTitle>Configuração da API do WhatsApp</CardTitle>
            <CardDescription>
              Conecte sua API não oficial (via n8n ou similar) para receber e enviar mensagens.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Alert variant="warning" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atenção: API Não Oficial</AlertTitle>
          <AlertDescription>
            O Dr.lead usa um webhook para integração. Certifique-se de que sua plataforma de automação (ex: n8n) está configurada para enviar dados para o webhook do Supabase.
          </AlertDescription>
        </Alert>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Ativar Integração</Label>
              <p className="text-sm text-muted-foreground">
                Habilite para começar a receber e processar mensagens.
              </p>
            </div>
            <Switch
              checked={watch('isEnabled')}
              onCheckedChange={(checked) => setValue('isEnabled', checked)}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">URL do Webhook de Envio (Opcional)</Label>
            <Input
              id="webhookUrl"
              placeholder="Ex: https://api.whatsapp.com/send-message"
              {...register("webhookUrl")}
              disabled={isSaving}
            />
            {errors.webhookUrl && <p className="text-sm text-destructive">{errors.webhookUrl.message}</p>}
            <p className="text-xs text-muted-foreground">
              URL da sua API para enviar mensagens (usada no botão de chat).
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="secretKey">Chave Secreta do Webhook (n8n)</Label>
            <Input
              id="secretKey"
              type="password"
              placeholder="Sua chave secreta para autenticação do webhook"
              {...register("secretKey")}
              disabled={isSaving}
            />
            {errors.secretKey && <p className="text-sm text-destructive">{errors.secretKey.message}</p>}
            <p className="text-xs text-muted-foreground">
              Esta chave deve corresponder ao `N8N_WEBHOOK_SECRET` configurado na sua Edge Function do Supabase.
            </p>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Configurações
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};