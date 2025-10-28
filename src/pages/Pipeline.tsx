import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { formatCurrency, formatDateShort } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, Constants } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { NewLeadDialog } from "@/components/leads/NewLeadDialog";
import { LeadDetailSheet } from "@/components/leads/LeadDetailSheet";
import { DroppableColumn } from "@/components/pipeline/DroppableColumn";
import { DraggableLeadCard } from "@/components/pipeline/DraggableLeadCard";

type Lead = Tables<'leads'>;
type LeadStatus = Tables<'leads'>['status'];

const Pipeline = () => {
  const { appUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const { data: leads, isLoading } = useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase.from('leads').select('*').order('criado_em', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const updateLeadStatusMutation = useMutation({
    mutationFn: async ({ leadId, newStatus }: { leadId: string, newStatus: LeadStatus }) => {
      const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', leadId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (error) => {
      toast.error(`Erro ao mover lead: ${error.message}`);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });

  const getLeadsByStatus = (status: LeadStatus) => {
    if (!leads) return [];
    return leads.filter(lead => lead.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setSelectedLeadId(null);
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;
    const lead = leads?.find(l => (l.id as any) === leadId);

    if (!lead || lead.status === newStatus) return;

    if (appUser?.papel === "vendedor" && (lead.responsavel_id as any) !== appUser.id) {
      toast.error("Você só pode mover seus próprios leads");
      return;
    }

    updateLeadStatusMutation.mutate({ leadId, newStatus });

    if (newStatus === "Ganho") {
      toast.success(`Lead ${lead.nome} marcado como ganho!`, {
        description: `Valor: ${formatCurrency(lead.valor)}`,
      });
    } else if (newStatus === "Perdido") {
      toast.error(`Lead ${lead.nome} marcado como perdido`);
    } else {
      toast.info(`Lead ${lead.nome} movido para ${newStatus}`);
    }
  };

  const activeLead = activeId ? leads?.find(l => (l.id as any) === activeId) : null;

  return (
    <MainLayout>
      <PageHeader
        title="Pipeline"
        description="Gestão visual do funil de vendas"
        actions={
          <Button onClick={() => setIsNewLeadOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Lead
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-[500px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Constants.public.Enums.lead_status.map(status => {
              const statusLeads = getLeadsByStatus(status);
              return (
                <DroppableColumn key={status} id={status} title={status} count={statusLeads.length}>
                  {statusLeads.map(lead => (
                    <DraggableLeadCard
                      key={lead.id}
                      lead={lead}
                      onClick={() => setSelectedLeadId(lead.id as any)}
                    />
                  ))}
                </DroppableColumn>
              );
            })}
          </div>
          <DragOverlay>
            {activeLead && (
              <Card className="cursor-move shadow-2xl card-gradient border-border w-[300px]">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p className="font-medium">{activeLead.nome}</p>
                    <p className="text-lg font-bold text-primary">{formatCurrency(activeLead.valor)}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{formatDateShort(activeLead.criado_em)}</span>
                      <Badge variant="outline">{activeLead.origem}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </DragOverlay>
        </DndContext>
      )}
      <NewLeadDialog open={isNewLeadOpen} onOpenChange={setIsNewLeadOpen} />
      <LeadDetailSheet
        leadId={selectedLeadId}
        open={!!selectedLeadId}
        onOpenChange={(open) => !open && setSelectedLeadId(null)}
      />
    </MainLayout>
  );
};

export default Pipeline;