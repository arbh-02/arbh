import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateShort } from "@/lib/format";
import { Tables } from "@/integrations/supabase/types";
import { getLeadOriginLabel } from "@/lib/mapping";

type Lead = Tables<'leads'>;

interface DraggableLeadCardProps {
  lead: Lead;
  onClick: () => void;
}

export const DraggableLeadCard = ({ lead, onClick }: DraggableLeadCardProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: String(lead.id),
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card
        className="cursor-move hover:shadow-lg transition-shadow card-gradient border-border"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="space-y-2">
            <p className="font-medium">{lead.nome}</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(lead.valor)}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{formatDateShort(lead.created_at)}</span>
              <Badge variant="outline">{getLeadOriginLabel(lead.origem)}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};