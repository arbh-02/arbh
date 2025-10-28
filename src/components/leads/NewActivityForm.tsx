import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tables } from "@/integrations/supabase/types";

type AppUser = Tables<'app_users'>;

const formSchema = z.object({
  notes: z.string().min(1, "A descrição é obrigatória"),
  type: z.enum(['ligação', 'email', 'reunião', 'outro']),
  due_date: z.date({ required_error: "Data é obrigatória" }),
  due_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:mm)"),
  assigned_to_id: z.string().uuid("Responsável é obrigatório"),
});

interface NewActivityFormProps {
  leadId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const NewActivityForm = ({ leadId, onSuccess, onCancel }: NewActivityFormProps) => {
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

  const { control, register, handleSubmit, formState: { errors }, watch } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: "",
      type: "ligação",
      due_date: new Date(),
      due_time: "09:00",
      assigned_to_id: appUser?.id,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!appUser) throw new Error("Usuário não autenticado");

      const [hours, minutes] = values.due_time.split(':').map(Number);
      const dueDate = new Date(values.due_date);
      dueDate.setHours(hours, minutes);

      const { error } = await supabase.from('activities').insert({
        lead_id: leadId,
        notes: values.notes,
        type: values.type,
        due_date: dueDate.toISOString(),
        assigned_to_id: values.assigned_to_id,
        created_by_id: appUser.id,
        is_completed: false,
      } as any);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Atividade criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['activities', leadId] });
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Erro ao criar atividade: ${error.message}`);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  const dateValue = watch("due_date");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg bg-card">
      <Textarea
        placeholder="Descreva a atividade..."
        {...register("notes")}
        className="min-h-[80px]"
      />
      {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}

      <div className="grid grid-cols-2 gap-4">
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ligação">Ligação</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="reunião">Reunião</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <Controller
          control={control}
          name="assigned_to_id"
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger disabled={isLoadingUsers}><SelectValue placeholder="Responsável" /></SelectTrigger>
              <SelectContent>
                {users?.map(user => (
                  <SelectItem key={user.id} value={user.id as any}>{user.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Controller
          control={control}
          name="due_date"
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateValue ? format(dateValue, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        />
        <Input type="time" {...register("due_time")} />
      </div>
      {errors.due_date && <p className="text-sm text-destructive">{errors.due_date.message}</p>}
      {errors.due_time && <p className="text-sm text-destructive">{errors.due_time.message}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={mutation.isPending}>Cancelar</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar
        </Button>
      </div>
    </form>
  );
};