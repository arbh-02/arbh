import { WhatsappChat } from "@/components/leads/WhatsappChat";
import { MessageSquare } from "lucide-react";

interface ChatPanelProps {
  leadId: string | null;
  leadName: string | null;
}

export const ChatPanel = ({ leadId, leadName }: ChatPanelProps) => {
  if (!leadId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <MessageSquare className="h-16 w-16" />
        <p className="mt-4 text-lg">Selecione uma conversa</p>
        <p className="text-sm">Escolha uma conversa na lista à esquerda para ver as mensagens.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b border-border">
        <h3 className="font-semibold">{leadName}</h3>
      </header>
      <div className="flex-1 overflow-y-auto p-4">
        <WhatsappChat leadId={leadId} />
      </div>
    </div>
  );
};