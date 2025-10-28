import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LeadStatus, LEAD_STATUSES } from "@/lib/mock-data";
import { formatCurrency, formatDateShort } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

const Pipeline = () => {
  const { leads, updateLead, getFilteredLeads, currentUser } = useApp();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const filteredLeads = getFilteredLeads();

  const getLeadsByStatus = (status: LeadStatus) => {
    return filteredLeads.filter(lead => lead.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;
    const lead = leads.find(l => l.id === leadId);

    if (!lead) {
      setActiveId(null);
      return;
    }

    // Check permissions for vendedor
    if (currentUser.papel === "vendedor" && lead.responsavelId !== currentUser.id) {
      toast.error("Você só pode mover seus próprios leads");
      setActiveId(null);
      return;
    }

    if (lead.status !== newStatus) {
      updateLead(leadId, { status: newStatus });
      
      if (newStatus === "Ganho") {
        toast.success(`Lead ${lead.nome} marcado como ganho!`, {
          description: `Valor: ${formatCurrency(lead.valor)}`,
        });
      } else if (newStatus === "Perdido") {
        toast.error(`Lead ${lead.nome} marcado como perdido`);
      } else {
        toast.info(`Lead ${lead.nome} movido para ${newStatus}`);
      }
    }

    setActiveId(null);
  };

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

  return (
    <MainLayout>
      <PageHeader
        title="Pipeline"
        description="Gestão visual do funil de vendas"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Lead
          </Button>
        }
      />

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {LEAD_STATUSES.map(status => {
            const statusLeads = getLeadsByStatus(status);
            
            return (
              <div
                key={status}
                id={status}
                className="flex flex-col rounded-lg border border-border bg-card p-4 min-h-[500px]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">{status}</h3>
                  <Badge variant="secondary">{statusLeads.length}</Badge>
                </div>

                <div className="space-y-3 flex-1">
                  {statusLeads.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nenhum lead aqui ainda
                    </p>
                  )}
                  
                  {statusLeads.map(lead => (
                    <Card
                      key={lead.id}
                      id={lead.id}
                      className="cursor-move hover:shadow-lg transition-shadow card-gradient border-border"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/html", e.currentTarget.outerHTML);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <p className="font-medium">{lead.nome}</p>
                          <p className="text-lg font-bold text-primary">
                            {formatCurrency(lead.valor)}
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {formatDateShort(lead.criadoEm)}
                            </span>
                            <Badge variant="outline">{lead.origem}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeLead && (
            <Card className="cursor-move shadow-2xl card-gradient border-border w-[300px]">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="font-medium">{activeLead.nome}</p>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(activeLead.valor)}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatDateShort(activeLead.criadoEm)}
                    </span>
                    <Badge variant="outline">{activeLead.origem}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </DragOverlay>
      </DndContext>
    </MainLayout>
  );
};

export default Pipeline;
