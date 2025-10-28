import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AppUser {
  id: number;
  auth_uid: string;
  nome: string;
  email: string;
  papel: "admin" | "vendedor" | "nenhum";
  criado_em: string;
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
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch app user profile
          await fetchAppUser(session.user.id);
        } else {
          setAppUser(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchAppUser(session.user.id);
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
        .eq('auth_uid', authUid)
        .single();

      if (error) {
        console.error("Error fetching app user:", error);
        return;
      }

      if (data) {
        setAppUser(data as AppUser);
        
        // Check if user has "nenhum" role
        if (data.papel === 'nenhum') {
          setShowPendingModal(true);
        } else {
          setShowPendingModal(false);
        }
      }
    } catch (error) {
      console.error("Error in fetchAppUser:", error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setAppUser(null);
    setShowPendingModal(false);
    navigate("/auth");
  };

  // Show pending approval modal
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
