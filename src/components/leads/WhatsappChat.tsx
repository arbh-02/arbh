import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

type WhatsappMessage = Tables<'whatsapp_messages'>;

interface WhatsappChatProps {
  leadId: string;
}

export const WhatsappChat = ({ leadId }: WhatsappChatProps) => {
  const { data: messages, isLoading } = useQuery<WhatsappMessage[]>({
    queryKey: ['whatsapp_messages', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('lead_id', leadId)
        .order('timestamp', { ascending: true });
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="mx-auto h-12 w-12" />
        <p className="mt-4 text-sm">Nenhuma mensagem do WhatsApp encontrada para este lead.</p>
        <p className="text-xs mt-1">As mensagens aparecerão aqui assim que forem recebidas via n8n.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-1">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex flex-col w-fit max-w-[80%] rounded-lg px-3 py-2",
            message.direction === 'outgoing'
              ? "bg-primary/20 self-end"
              : "bg-muted self-start"
          )}
        >
          <p className="text-sm">{message.content}</p>
          <p className="text-xs text-muted-foreground self-end mt-1">
            {format(new Date(message.timestamp), "dd/MM HH:mm", { locale: ptBR })}
          </p>
        </div>
      ))}
    </div>
  );
};