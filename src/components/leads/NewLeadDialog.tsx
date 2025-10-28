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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { leadOriginOptions, leadOriginValues } from "@/lib/mapping";

type AppUser = Tables<'app_users'>;

interface NewLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  empresa: z.string().optional(),
  email: z.string().email("Email inválido").or(z.literal("")).optional(),
  telefone: z.string().optional(),
  valor: z.coerce.number().min(0, "Valor não pode ser negativo").default(0),
  origem: z.enum(leadOriginValues),
  status: z.enum(["Novo", "Atendimento", "Ganho", "Perdido"]).default("Novo"),
  responsavel_id: z.string({ required_error: "Responsável é obrigatório" }).uuid("Responsável é obrigatório"),
});

export const NewLeadDialog = ({ open, onOpenChange }: NewLeadDialogProps) => {
  const queryClient = useQueryClient();
  const { appUser } = useAuth();

  const { data: users, isLoading: isLoadingUsers } = useQuery<AppUser[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .in('papel', ['admin', 'vendedor']);
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  const { control, register, handleSubmit, formState: { errors }, reset } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      empresa: "",
      email: "",
      telefone: "",
      valor: 0,
      status: "Novo",
      origem: "outros",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!appUser) throw new Error("Usuário não autenticado");
      const { data, error } = await supabase
        .from("leads")
        .insert({
          ...values,
          email: values.email === "" ? null : values.email,
          created_by: appUser.id,
        } as any)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast.success("Lead criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Erro ao criar lead: ${error.message}`);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Novo Lead</DialogTitle>
          <DialogDescription>Preencha as informações do novo lead.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[75vh] overflow-y-auto pr-4">
          <form id="new-lead-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" {...register("nome")} />
                {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa</Label>
                <Input id="empresa" {...register("empresa")} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" {...register("telefone")} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input id="valor" type="number" step="0.01" {...register("valor")} />
                {errors.valor && <p className="text-sm text-destructive">{errors.valor.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsavel_id">Responsável</Label>
                <Controller
                  control={control}
                  name="responsavel_id"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger disabled={isLoadingUsers}>
                        <SelectValue placeholder="Selecione um responsável" />
                      </SelectTrigger>
                      <SelectContent>
                        {users?.map(user => (
                          <SelectItem key={user.id} value={user.id as any}>{user.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.responsavel_id && <p className="text-sm text-destructive">{errors.responsavel_id.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origem">Origem</Label>
                <Controller
                  control={control}
                  name="origem"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a origem" />
                      </SelectTrigger>
                      <SelectContent>
                        {leadOriginOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.origem && <p className="text-sm text-destructive">{errors.origem.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Novo", "Atendimento", "Ganho", "Perdido"].map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
              </div>
            </div>
          </form>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" form="new-lead-form" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};