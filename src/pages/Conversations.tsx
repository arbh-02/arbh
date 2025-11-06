import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ConversationList } from "@/components/whatsapp/ConversationList";
import { ChatPanel } from "@/components/whatsapp/ChatPanel";
import { useWhatsappIntegration } from "@/hooks/use-whatsapp-integration";
import { WhatsappSettingsComponent } from "@/components/whatsapp/WhatsappSettings";
import { Loader2 } from "lucide-react";

interface Conversation {
  lead_id: string;
  lead_name: string;
  last_message_content: string;
  last_message_timestamp: string;
}

const Conversations = () => {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const { settings, isLoading: isLoadingSettings } = useWhatsappIntegration();

  const { data: conversations, isLoading: isLoadingConversations } = useQuery<Conversation[]>({
    queryKey: ['whatsapp_conversations'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_latest_whatsapp_conversations');
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: settings.isEnabled, // Só busca conversas se a integração estiver ativa
  });

  const selectedLead = conversations?.find(c => c.lead_id === selectedLeadId);

  if (isLoadingSettings) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!settings.isEnabled) {
    return (
      <MainLayout>
        <PageHeader
          title="Conversas"
          description="Visualize e gerencie suas conversas do WhatsApp."
        />
        <WhatsappSettingsComponent />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Conversas"
        description="Visualize e gerencie suas conversas do WhatsApp."
      />
      <div className="h-[calc(100vh-200px)] rounded-lg border border-border bg-card flex overflow-hidden">
        <div className="w-full md:w-1/3 border-r border-border overflow-y-auto">
          <ConversationList
            conversations={conversations || []}
            selectedLeadId={selectedLeadId}
            onSelect={setSelectedLeadId}
            isLoading={isLoadingConversations}
          />
        </div>
        <div className="hidden md:flex md:w-2/3">
          <ChatPanel leadId={selectedLeadId} leadName={selectedLead?.lead_name || null} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Conversations;