import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as z from "zod";
import { Tables } from "@/integrations/supabase/types";

type Integration = Tables<'integrations'>;

export const whatsappSettingsSchema = z.object({
  webhookUrl: z.string().url("URL do Webhook inválida").min(1, "URL é obrigatória"),
  secretKey: z.string().min(10, "A chave secreta deve ter no mínimo 10 caracteres"),
  isEnabled: z.boolean(),
});

export type WhatsappSettings = z.infer<typeof whatsappSettingsSchema>;

const PROVIDER_NAME = 'whatsapp_n8n';

export const useWhatsappIntegration = () => {
  const queryClient = useQueryClient();

  const { data: integration, isLoading } = useQuery<Integration | null>({
    queryKey: ['integration', PROVIDER_NAME],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('provider', PROVIDER_NAME)
        .single();
      
      if (error && error.code !== 'PGRST116') { // Ignore 'no rows found'
        throw new Error(error.message);
      }
      return data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: WhatsappSettings) => {
      const { error } = await supabase
        .from('integrations')
        .upsert({
          provider: PROVIDER_NAME,
          settings: {
            webhookUrl: values.webhookUrl,
            secretKey: values.secretKey,
          },
          is_enabled: values.isEnabled,
        }, { onConflict: 'provider' });

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Configurações do WhatsApp salvas com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['integration', PROVIDER_NAME] });
    },
    onError: (error) => {
      toast.error(`Erro ao salvar configurações: ${error.message}`);
    }
  });

  const settings: WhatsappSettings = {
    webhookUrl: (integration?.settings as any)?.webhookUrl || "",
    secretKey: (integration?.settings as any)?.secretKey || "",
    isEnabled: integration?.is_enabled || false,
  };

  return {
    settings,
    integration,
    isLoading,
    saveSettings: mutation.mutate,
    isSaving: mutation.isPending,
  };
};