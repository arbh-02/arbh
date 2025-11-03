import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Conversation {
  lead_id: string;
  lead_name: string;
  last_message_content: string;
  last_message_timestamp: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedLeadId: string | null;
  onSelect: (leadId: string) => void;
  isLoading: boolean;
}

export const ConversationList = ({ conversations, selectedLeadId, onSelect, isLoading }: ConversationListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return <p className="p-4 text-sm text-center text-muted-foreground">Nenhuma conversa encontrada.</p>;
  }

  return (
    <div className="flex flex-col">
      {conversations.map((convo) => (
        <button
          key={convo.lead_id}
          onClick={() => onSelect(convo.lead_id)}
          className={cn(
            "w-full text-left p-4 border-b border-border transition-colors",
            "hover:bg-muted/50",
            selectedLeadId === convo.lead_id && "bg-muted"
          )}
        >
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-semibold truncate">{convo.lead_name}</h4>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {formatDistanceToNow(new Date(convo.last_message_timestamp), { addSuffix: true, locale: ptBR })}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {convo.last_message_content}
          </p>
        </button>
      ))}
    </div>
  );
};