import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AppUser {
  id: string; // UUID from Supabase auth
  nome: string;
  email: string;
  papel: "admin" | "vendedor" | "nenhum";
  created_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchAppUser(currentUser.id);
        } else {
          setAppUser(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await fetchAppUser(currentUser.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAppUser = async (authUid: string) => {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', authUid) // Corrected to query by 'id'
        .single();

      if (error) {
        console.error("Error fetching app user:", error.message);
        setAppUser(null); // Clear app user on error
        return;
      }

      if (data) {
        setAppUser(data as AppUser);
        if (data.papel === 'nenhum') {
          setShowPendingModal(true);
        } else {
          setShowPendingModal(false);
        }
      } else {
        setAppUser(null);
      }
    } catch (error) {
      console.error("Exception in fetchAppUser:", error);
      setAppUser(null);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setAppUser(null);
    setShowPendingModal(false);
    navigate("/auth");
  };

  if (showPendingModal && appUser?.papel === 'nenhum') {
    return (
      <Dialog open={showPendingModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conta Pendente de Aprovação</DialogTitle>
            <DialogDescription>
              Sua conta foi criada com sucesso, mas ainda está pendente de aprovação por um administrador.
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Entre em contato com o administrador do sistema para liberar seu acesso. Enquanto isso, você não poderá acessar o CRM.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <button
              onClick={signOut}
              className="text-sm text-primary hover:underline"
            >
              Sair
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <AuthContext.Provider value={{ session, user, appUser, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};