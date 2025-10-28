import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Download, Search, Loader2 } from "lucide-react";
import { formatCurrency, formatDate, exportToCSV } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { NewLeadDialog } from "@/components/leads/NewLeadDialog";
import { LeadDetailSheet } from "@/components/leads/LeadDetailSheet";

type Lead = Tables<'leads'>;
type AppUser = Tables<'app_users'>;

const Leads = () => {
  const { ui, setUI } = useApp();
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

  const { data: leads, isLoading: isLoadingLeads } = useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase.from('leads').select('*').order('criado_em', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const { data: users } = useQuery<AppUser[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('app_users').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const usersMap = useMemo(() => {
    if (!users) return new Map<number, string>();
    return new Map(users.map(user => [user.id, user.nome]));
  }, [users]);

  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    if (!ui.buscaLeads) return leads;
    
    const search = ui.buscaLeads.toLowerCase();
    return leads.filter(l => 
      l.nome.toLowerCase().includes(search) ||
      (l.empresa && l.empresa.toLowerCase().includes(search)) ||
      (l.email && l.email.toLowerCase().includes(search)) ||
      (l.telefone && l.telefone.includes(search))
    );
  }, [leads, ui.buscaLeads]);

  const handleExportCSV = () => {
    if (!filteredLeads || filteredLeads.length === 0) {
      toast.warning("Não há dados para exportar.");
      return;
    }
    const exportData = filteredLeads.map(lead => ({
      Nome: lead.nome,
      Empresa: lead.empresa,
      Email: lead.email,
      Telefone: lead.telefone,
      Origem: lead.origem,
      Status: lead.status,
      Responsavel: usersMap.get(lead.responsavel_id) || '',
      Valor: lead.valor,
      'Criado Em': formatDate(lead.criado_em),
    }));

    exportToCSV(exportData, 'leads_export');
    toast.success("Dados exportados com sucesso!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Novo": return "bg-blue-500/20 text-blue-300 border-blue-500/50";
      case "Atendimento": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
      case "Ganho": return "bg-green-500/20 text-green-300 border-green-500/50";
      case "Perdido": return "bg-red-500/20 text-red-300 border-red-500/50";
      default: return "";
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Leads"
        description="Gestão completa de leads"
        actions={
          <>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
            <Button onClick={() => setIsNewLeadOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Lead
            </Button>
          </>
        }
      />

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome, empresa, email ou telefone"
            className="pl-10"
            value={ui.buscaLeads}
            onChange={(e) => setUI({ buscaLeads: e.target.value })}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium">Nome</th>
                <th className="text-left py-3 px-4 font-medium">Empresa</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Responsável</th>
                <th className="text-left py-3 px-4 font-medium">Valor</th>
                <th className="text-left py-3 px-4 font-medium">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingLeads ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    Nenhum lead encontrado
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedLeadId(lead.id)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium">{lead.nome}</div>
                      <div className="text-sm text-muted-foreground">{lead.email}</div>
                    </td>
                    <td className="py-3 px-4">{lead.empresa}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                    </td>
                    <td className="py-3 px-4">{usersMap.get(lead.responsavel_id)}</td>
                    <td className="py-3 px-4 font-semibold">{formatCurrency(lead.valor)}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(lead.criado_em)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <NewLeadDialog open={isNewLeadOpen} onOpenChange={setIsNewLeadOpen} />
      <LeadDetailSheet
        leadId={selectedLeadId}
        open={!!selectedLeadId}
        onOpenChange={(open) => !open && setSelectedLeadId(null)}
      />
    </MainLayout>
  );
};

export default Leads;