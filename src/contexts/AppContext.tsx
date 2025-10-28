import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Lead, UserRole, initialUsers, initialLeads } from "@/lib/mock-data";

type Period = "hoje" | "7d" | "30d" | "total";

interface UIState {
  periodo: Period;
  tabelaDensa: boolean;
  animacoes: boolean;
  buscaLeads: string;
}

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  setUsers: (users: User[]) => void;
  leads: Lead[];
  setLeads: (leads: Lead[]) => void;
  ui: UIState;
  setUI: (ui: Partial<UIState>) => void;
  
  // Helper functions
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  
  getFilteredLeads: () => Lead[];
  getUserById: (id: string) => User | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]); // Default to admin
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [ui, setUIState] = useState<UIState>({
    periodo: "7d",
    tabelaDensa: false,
    animacoes: true,
    buscaLeads: "",
  });

  const setUI = (updates: Partial<UIState>) => {
    setUIState(prev => ({ ...prev, ...updates }));
  };

  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const addLead = (lead: Lead) => {
    setLeads(prev => [...prev, lead]);
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const getFilteredLeads = (): Lead[] => {
    let filtered = leads;
    
    // Filter by user role
    if (currentUser.papel === "vendedor") {
      filtered = filtered.filter(l => l.responsavelId === currentUser.id);
    }
    
    // Filter by search
    if (ui.buscaLeads) {
      const search = ui.buscaLeads.toLowerCase();
      filtered = filtered.filter(l => 
        l.nome.toLowerCase().includes(search) ||
        l.empresa.toLowerCase().includes(search) ||
        l.email.toLowerCase().includes(search) ||
        l.telefone.includes(search)
      );
    }
    
    return filtered;
  };

  const getUserById = (id: string): User | undefined => {
    return users.find(u => u.id === id);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for 'g' key combinations
      if (e.key === 'g') {
        const nextKey = new Promise<string>(resolve => {
          const handler = (e: KeyboardEvent) => {
            document.removeEventListener('keydown', handler);
            resolve(e.key);
          };
          document.addEventListener('keydown', handler);
          setTimeout(() => {
            document.removeEventListener('keydown', handler);
            resolve('');
          }, 1000);
        });

        nextKey.then(key => {
          if (key === 'd') window.location.href = '/dashboard';
          else if (key === 'p') window.location.href = '/pipeline';
          else if (key === 'l') window.location.href = '/leads';
          else if (key === 'a' && currentUser.papel === 'admin') window.location.href = '/admin';
        });
      }
      
      // ESC to close modals (handled by individual modals)
      // / to focus search
      if (e.key === '/' && window.location.pathname === '/leads') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentUser]);

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      users,
      setUsers,
      leads,
      setLeads,
      ui,
      setUI,
      addUser,
      updateUser,
      deleteUser,
      addLead,
      updateLead,
      deleteLead,
      getFilteredLeads,
      getUserById,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
