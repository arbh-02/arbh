import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Loader2, Edit, Trash2, User, Building, Mail, Phone, DollarSign, Tag, BarChart, Calendar } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { EditLeadDialog } from "./EditLeadDialog";
import { DeleteLeadDialog } from "./DeleteLeadDialog";
import { Separator } from "@/components/ui/separator";
import { ActivityTimeline } from "./ActivityTimeline";

type Lead = Tables<'leads'>;
type AppUser = Tables<'app_users'>;

interface LeadDetailSheetProps {
  leadId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DetailRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <Icon className="h-5 w-5 text-muted-foreground mt-1" />
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "Não informado"}</p>
    </div>
  </div>
);

export const LeadDetailSheet = ({ leadId, open, onOpenChange }: LeadDetailSheetProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: lead, isLoading, isError } = useQuery<Lead>({
    queryKey: ['lead', leadId],
    queryFn: async () => {
      if (!leadId) throw new Error("No lead ID provided");
      const { data, error } = await supabase.from('leads').select('*').eq('id', leadId).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!leadId,
  });

  const { data: user } = useQuery<AppUser>({
    queryKey: ['user', lead?.responsavel_id],
    queryFn: async () => {
      if (!lead?.responsavel_id) return null;
      const { data, error } = await supabase.from('app_users').select('nome').eq('id', lead.responsavel_id as any).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!lead?.responsavel_id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Novo": return "bg-blue-500/20 text-blue-300 border-blue-500/50";
      case "Atendimento": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
      case "Ganho": return "bg-green-500/20 text-green-300 border-green-500/50";
      case "Perdido": return "bg-red-500/20 text-red-300 border-red-500/50";
      default: return "";
    }
  };

  const handleCloseSheet = () => {
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-lg w-[90vw] flex flex-col">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {isError && (
            <div className="flex items-center justify-center h-full">
              <p className="text-destructive">Erro ao carregar o lead.</p>
            </div>
          )}
          {lead && (
            <>
              <SheetHeader className="text-left">
                <SheetTitle className="text-2xl">{lead.nome}</SheetTitle>
                <SheetDescription>
                  Detalhes completos do lead.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto pr-6 space-y-6 py-4">
                <DetailRow icon={Building} label="Empresa" value={lead.empresa} />
                <DetailRow icon={Mail} label="Email" value={lead.email} />
                <DetailRow icon={Phone} label="Telefone" value={lead.telefone} />
                <DetailRow icon={DollarSign} label="Valor" value={formatCurrency(lead.valor)} />
                <DetailRow icon={Tag} label="Origem" value={<Badge variant="outline">{lead.origem}</Badge>} />
                <DetailRow icon={BarChart} label="Status" value={<Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>} />
                <DetailRow icon={User} label="Responsável" value={user?.nome} />
                <DetailRow icon={Calendar} label="Criado em" value={formatDate(lead.created_at)} />
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4">Atividades</h3>
                  <ActivityTimeline leadId={lead.id as any} />
                </div>
              </div>
              <SheetFooter className="mt-auto">
                <Button variant="destructive" onClick={() => setIsDeleting(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
      {lead && isEditing && (
        <EditLeadDialog
          lead={lead}
          open={isEditing}
          onOpenChange={setIsEditing}
        />
      )}
      {lead && isDeleting && (
        <DeleteLeadDialog
          leadId={lead.id as any}
          open={isDeleting}
          onOpenChange={setIsDeleting}
          onSuccess={handleCloseSheet}
        />
      )}
    </>
  );
};