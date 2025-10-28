import { useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";
import { getDateRangeForPeriod, isDateInRange } from "@/lib/date-utils";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Trophy, DollarSign } from "lucide-react";
import { Lead } from "@/lib/mock-data";

const Dashboard = () => {
  const { leads, users, ui, setUI } = useApp();

  const filteredLeads = useMemo(() => {
    const { start, end } = getDateRangeForPeriod(ui.periodo);
    return leads.filter(lead => isDateInRange(lead.criadoEm, start, end));
  }, [leads, ui.periodo]);

  const kpis = useMemo(() => {
    const totalLeads = filteredLeads.length;
    const negociosGanhos = filteredLeads.filter(l => l.status === "Ganho").length;
    const valorGanho = filteredLeads
      .filter(l => l.status === "Ganho")
      .reduce((sum, l) => sum + l.valor, 0);
    const taxaConversao = totalLeads > 0 ? (negociosGanhos / totalLeads) * 100 : 0;

    return { totalLeads, negociosGanhos, valorGanho, taxaConversao };
  }, [filteredLeads]);

  const chartDataByDay = useMemo(() => {
    const dataMap = new Map<string, { dia: string; leadsCount: number; valorGanho: number }>();
    
    filteredLeads.forEach(lead => {
      const date = new Date(lead.criadoEm);
      const dayKey = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!dataMap.has(dayKey)) {
        dataMap.set(dayKey, { dia: dayKey, leadsCount: 0, valorGanho: 0 });
      }
      
      const entry = dataMap.get(dayKey)!;
      entry.leadsCount++;
      if (lead.status === "Ganho") {
        entry.valorGanho += lead.valor;
      }
    });

    return Array.from(dataMap.values()).sort((a, b) => {
      const [dayA, monthA] = a.dia.split('/').map(Number);
      const [dayB, monthB] = b.dia.split('/').map(Number);
      return monthA === monthB ? dayA - dayB : monthA - monthB;
    });
  }, [filteredLeads]);

  const chartDataByOrigin = useMemo(() => {
    const dataMap = new Map<string, { origem: string; totalLeads: number; valorGanho: number }>();
    
    filteredLeads.forEach(lead => {
      if (!dataMap.has(lead.origem)) {
        dataMap.set(lead.origem, { origem: lead.origem, totalLeads: 0, valorGanho: 0 });
      }
      
      const entry = dataMap.get(lead.origem)!;
      entry.totalLeads++;
      if (lead.status === "Ganho") {
        entry.valorGanho += lead.valor;
      }
    });

    return Array.from(dataMap.values());
  }, [filteredLeads]);

  const performanceByVendedor = useMemo(() => {
    const vendedores = users.filter(u => u.papel === "vendedor");
    
    return vendedores.map(vendedor => {
      const vendedorLeads = filteredLeads.filter(l => l.responsavelId === vendedor.id);
      const ganhos = vendedorLeads.filter(l => l.status === "Ganho");
      const valorGanho = ganhos.reduce((sum, l) => sum + l.valor, 0);
      const conversao = vendedorLeads.length > 0 ? (ganhos.length / vendedorLeads.length) * 100 : 0;

      return {
        vendedor: vendedor.nome,
        leads: vendedorLeads.length,
        ganhos: ganhos.length,
        conversao: conversao.toFixed(1) + "%",
        valorGanho,
      };
    }).sort((a, b) => b.valorGanho - a.valorGanho);
  }, [filteredLeads, users]);

  return (
    <MainLayout>
      <PageHeader
        title="Dashboard"
        description="Visão geral do desempenho comercial"
        actions={
          <Select value={ui.periodo} onValueChange={(value: any) => setUI({ periodo: value })}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="total">Total</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="card-gradient border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis.totalLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">Total de leads no período</p>
          </CardContent>
        </Card>

        <Card className="card-gradient border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis.taxaConversao.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Negócios ganhos / total</p>
          </CardContent>
        </Card>

        <Card className="card-gradient border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Negócios Ganhos</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis.negociosGanhos}</div>
            <p className="text-xs text-muted-foreground mt-1">Leads com status Ganho</p>
          </CardContent>
        </Card>

        <Card className="card-gradient border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Ganho</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(kpis.valorGanho)}</div>
            <p className="text-xs text-muted-foreground mt-1">Soma dos valores ganhos</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card className="card-gradient border-border">
          <CardHeader>
            <CardTitle>Leads e Ganhos por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartDataByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="dia" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'valorGanho') return [formatCurrency(value), 'Valor Ganho'];
                    return [value, 'Leads Criados'];
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="leadsCount" name="Leads Criados" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="valorGanho" name="Valor Ganho" stroke="hsl(var(--accent))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-gradient border-border">
          <CardHeader>
            <CardTitle>Leads e Ganhos por Origem</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartDataByOrigin}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="origem" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'valorGanho') return [formatCurrency(value), 'Valor Ganho'];
                    return [value, 'Total Leads'];
                  }}
                />
                <Legend />
                <Bar dataKey="totalLeads" name="Total Leads" fill="hsl(var(--primary))" />
                <Bar dataKey="valorGanho" name="Valor Ganho" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card className="card-gradient border-border">
        <CardHeader>
          <CardTitle>Performance por Vendedor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Vendedor</th>
                  <th className="text-left py-3 px-4 font-medium">Leads</th>
                  <th className="text-left py-3 px-4 font-medium">Ganhos</th>
                  <th className="text-left py-3 px-4 font-medium">Conversão</th>
                  <th className="text-left py-3 px-4 font-medium">Valor Ganho</th>
                </tr>
              </thead>
              <tbody>
                {performanceByVendedor.map((perf, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">{perf.vendedor}</td>
                    <td className="py-3 px-4">{perf.leads}</td>
                    <td className="py-3 px-4">{perf.ganhos}</td>
                    <td className="py-3 px-4">{perf.conversao}</td>
                    <td className="py-3 px-4 font-semibold">{formatCurrency(perf.valorGanho)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default Dashboard;
