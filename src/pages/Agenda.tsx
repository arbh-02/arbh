import { useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Loader2, Check, Calendar as CalendarIcon, Phone, Mail, Users as MeetingIcon, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isPast, isToday, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

type ActivityWithLead = Tables<'activities'> & {
  leads: { id: string; nome: string } | null;
};

const iconMap = {
  ligação: Phone,
  email: Mail,
  reunião: MeetingIcon,
  outro: Plus,
};

const ActivityCard = ({ activity, onComplete }: { activity: ActivityWithLead, onComplete: () => void }) => {
  const Icon = iconMap[activity.type as keyof typeof iconMap];
  const isOverdue = isPast(new Date(activity.due_date)) && !isToday(new Date(activity.due_date));

  return (
    <Card className="card-gradient border-border">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="flex-shrink-0">
          <span className="flex items-center justify-center w-10 h-10 bg-muted rounded-full">
            <Icon className="w-5 h-5 text-muted-foreground" />
          </span>
        </div>
        <div className="flex-1">
          <p className="font-medium">{activity.notes}</p>
          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <CalendarIcon className="w-4 h-4" />
            <span className={cn(isOverdue && "text-destructive font-semibold")}>
              {format(new Date(activity.due_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </span>
            {activity.leads && (
              <>
                <span>•</span>
                <Link to={`/leads`} className="hover:underline font-medium text-primary">
                  {activity.leads.nome}
                </Link>
              </>
            )}
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={onComplete}>
          <Check className="mr-2 h-4 w-4" />
          Concluir
        </Button>
      </CardContent>
    </Card>
  );
};

const Agenda = () => {
  const { appUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: activities, isLoading } = useQuery<ActivityWithLead[]>({
    queryKey: ['agenda_activities', appUser?.id],
    queryFn: async () => {
      if (!appUser) return [];
      const { data, error } = await supabase
        .from('activities')
        .select('*, leads(id, nome)')
        .eq('assigned_to_id', appUser.id)
        .eq('is_completed', false)
        .order('due_date', { ascending: true });
      if (error) throw new Error(error.message);
      return (data as any) || [];
    },
    enabled: !!appUser,
  });

  const completeMutation = useMutation({
    mutationFn: async (activityId: string) => {
      const { error } = await supabase
        .from('activities')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('id', activityId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Atividade concluída!");
      queryClient.invalidateQueries({ queryKey: ['agenda_activities', appUser?.id] });
    },
    onError: (error) => {
      toast.error(`Erro ao concluir atividade: ${error.message}`);
    }
  });

  const categorizedActivities = useMemo(() => {
    if (!activities) return { overdue: [], today: [], upcoming: [] };
    const now = new Date();
    return {
      overdue: activities.filter(a => isPast(new Date(a.due_date)) && !isToday(new Date(a.due_date))),
      today: activities.filter(a => isToday(new Date(a.due_date))),
      upcoming: activities.filter(a => isFuture(new Date(a.due_date)) && !isToday(new Date(a.due_date))),
    };
  }, [activities]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Minha Agenda"
        description="Todas as suas atividades pendentes em um só lugar."
      />
      <Tabs defaultValue="today">
        <TabsList className="mb-4">
          <TabsTrigger value="overdue">
            Atrasadas <Badge variant="destructive" className="ml-2">{categorizedActivities.overdue.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="today">
            Hoje <Badge variant="secondary" className="ml-2">{categorizedActivities.today.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Próximas <Badge variant="secondary" className="ml-2">{categorizedActivities.upcoming.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overdue">
          <div className="space-y-4">
            {categorizedActivities.overdue.length > 0 ? (
              categorizedActivities.overdue.map(activity => (
                <ActivityCard key={activity.id} activity={activity} onComplete={() => completeMutation.mutate(activity.id)} />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhuma atividade atrasada. Bom trabalho!</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="today">
          <div className="space-y-4">
            {categorizedActivities.today.length > 0 ? (
              categorizedActivities.today.map(activity => (
                <ActivityCard key={activity.id} activity={activity} onComplete={() => completeMutation.mutate(activity.id)} />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhuma atividade para hoje. Que tal planejar algumas?</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="upcoming">
          <div className="space-y-4">
            {categorizedActivities.upcoming.length > 0 ? (
              categorizedActivities.upcoming.map(activity => (
                <ActivityCard key={activity.id} activity={activity} onComplete={() => completeMutation.mutate(activity.id)} />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhuma atividade futura agendada.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default Agenda;