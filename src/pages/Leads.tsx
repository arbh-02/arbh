import { useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Download, Search } from "lucide-react";
import { formatCurrency, formatDate, exportToCSV } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const Leads = () => {
  const { leads, ui, setUI, getFilteredLeads, getUserById } = useApp();

  const filteredLeads = getFilteredLeads();

  const handleExportCSV = () => {
    const exportData = filteredLeads.map(lead => ({
      Nome: lead.nome,
      Empresa: lead.empresa,
      Email: lead.email,
      Telefone: lead.telefone,
      Origem: lead.origem,
      Status: lead.status,
      Responsavel: getUserById(lead.responsavelId)?.nome || '',
      Valor: lead.valor,
      'Criado Em': formatDate(lead.criadoEm),
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
            <Button>
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
                <th className="text-left py-3 px-4 font-medium">Email</th>
                <th className="text-left py-3 px-4 font-medium">Telefone</th>
                <th className="text-left py-3 px-4 font-medium">Origem</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Responsável</th>
                <th className="text-left py-3 px-4 font-medium">Valor</th>
                <th className="text-left py-3 px-4 font-medium">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    Nenhum lead corresponde à sua busca
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-medium">{lead.nome}</td>
                    <td className="py-3 px-4">{lead.empresa}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{lead.email}</td>
                    <td className="py-3 px-4 text-sm">{lead.telefone}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{lead.origem}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                    </td>
                    <td className="py-3 px-4">{getUserById(lead.responsavelId)?.nome}</td>
                    <td className="py-3 px-4 font-semibold">{formatCurrency(lead.valor)}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(lead.criadoEm)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
};

export default Leads;
