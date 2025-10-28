import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Loader2, CheckCircle2, Circle, Phone, Mail, Users as MeetingIcon, Plus } from "lucide-react";
import { NewActivityForm } from "./NewActivityForm";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { format, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Activity = Tables<'activities'> & { app_users: { nome: string } };

interface ActivityTimelineProps {
  leadId: string;
}

const iconMap = {
  ligação: Phone,
  email: Mail,
  reunião: MeetingIcon,
  outro: Plus,
};

export const ActivityTimeline = ({ leadId }: ActivityTimelineProps) => {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ['activities', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*, app_users ( nome )')
        .eq('lead_id', leadId)
        .order('due_date', { ascending: false });
      if (error) throw new Error(error.message);
      return (data as any) || [];
    },
  });

  const toggleCompleteMutation = useMutation({
    mutationFn: async (activity: Activity) => {
      const { error } = await supabase
        .from('activities')
        .update({ 
          is_completed: !activity.is_completed,
          completed_at: !activity.is_completed ? new Date().toISOString() : null,
        })
        .eq('id', activity.id as any);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', leadId] });
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar atividade: ${error.message}`);
    }
  });

  if (isLoading) {
    return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
  }

  return (
    <div className="space-y-4">
      {activities?.map(activity => {
        const Icon = iconMap[activity.type as keyof typeof iconMap];
        const isOverdue = !activity.is_completed && isPast(new Date(activity.due_date));
        return (
          <div key={activity.id} className="flex gap-4 items-center">
            <div>
              <span className="flex items-center justify-center w-8 h-8 bg-muted rounded-full">
                <Icon className="w-4 h-4 text-muted-foreground" />
              </span>
            </div>
            <div className="flex-1">
              <p className={cn("font-medium", activity.is_completed && "line-through text-muted-foreground")}>
                {activity.notes}
              </p>
              <p className={cn("text-sm", isOverdue ? "text-destructive" : "text-muted-foreground")}>
                {format(new Date(activity.due_date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                {' - '}{activity.app_users.nome}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => toggleCompleteMutation.mutate(activity)}
              disabled={toggleCompleteMutation.isPending}
            >
              {activity.is_completed ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
            </Button>
          </div>
        );
      })}

      {showForm ? (
        <NewActivityForm leadId={leadId} onCancel={() => setShowForm(false)} onSuccess={() => setShowForm(false)} />
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Atividade
        </Button>
      )}
    </div>
  );
};