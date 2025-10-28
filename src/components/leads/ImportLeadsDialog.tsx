import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { TablesInsert } from "@/integrations/supabase/types";

interface ImportLeadsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type LeadInsert = TablesInsert<'leads'>;

export const ImportLeadsDialog = ({ open, onOpenChange }: ImportLeadsDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const queryClient = useQueryClient();
  const { appUser } = useAuth();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = "nome,empresa,email,telefone,valor,origem";
    const sampleRow = "Exemplo Lead,Empresa Exemplo,exemplo@email.com,5511999999999,1500.50,formulario";
    const csvContent = `${headers}\n${sampleRow}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_leads.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importMutation = useMutation({
    mutationFn: async (leads: LeadInsert[]) => {
      const { error } = await supabase.from("leads").insert(leads);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Leads importados com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Erro ao importar: ${error.message}`);
    },
    onSettled: () => {
      setIsImporting(false);
      setFile(null);
    }
  });

  const handleImport = async () => {
    if (!file || !appUser) return;

    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
      
      if (lines.length < 2) {
        toast.error("Arquivo CSV vazio ou inválido.");
        setIsImporting(false);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const requiredHeaders = ['nome', 'empresa', 'email', 'telefone', 'valor', 'origem'];
      
      // Simple header check
      if (!requiredHeaders.every(h => headers.includes(h))) {
        toast.error("Cabeçalho do CSV inválido. Baixe o modelo para ver o formato correto.");
        setIsImporting(false);
        return;
      }

      const leadsToInsert: LeadInsert[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const row = headers.reduce((obj, header, index) => {
          (obj as any)[header] = values[index] ? values[index].trim() : null;
          return obj;
        }, {} as any);

        if (!row.nome) {
          toast.warning(`Linha ${i + 1} ignorada: o nome é obrigatório.`);
          continue;
        }

        leadsToInsert.push({
          nome: row.nome,
          empresa: row.empresa,
          email: row.email,
          telefone: row.telefone,
          valor: parseFloat(row.valor) || 0,
          origem: row.origem || 'outros',
          status: 'novo',
          created_by: appUser.id,
          responsavel_id: appUser.id, // Atribui ao usuário que está importando
        });
      }

      if (leadsToInsert.length > 0) {
        importMutation.mutate(leadsToInsert);
      } else {
        toast.warning("Nenhum lead válido encontrado para importar.");
        setIsImporting(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Leads</DialogTitle>
          <DialogDescription>
            Importe múltiplos leads de uma vez usando um arquivo CSV.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">Instruções</h4>
            <p className="text-sm text-muted-foreground">
              Seu arquivo CSV deve conter as seguintes colunas:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              <li><span className="font-mono">nome</span> (obrigatório)</li>
              <li><span className="font-mono">empresa</span></li>
              <li><span className="font-mono">email</span></li>
              <li><span className="font-mono">telefone</span></li>
              <li><span className="font-mono">valor</span> (use ponto como separador decimal, ex: 1500.50)</li>
              <li><span className="font-mono">origem</span> (ex: formulario, whatsapp, indicacao)</li>
            </ul>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Baixar Modelo CSV
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="csv-file">Selecione o arquivo CSV</Label>
            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} disabled={isImporting} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={!file || isImporting}>
            {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};