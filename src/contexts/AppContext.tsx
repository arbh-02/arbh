import React, { createContext, useContext, useState, ReactNode } from "react";

type Period = "hoje" | "7d" | "30d" | "total";

interface UIState {
  periodo: Period;
  tabelaDensa: boolean;
  animacoes: boolean;
  buscaLeads: string;
}

interface AppContextType {
  ui: UIState;
  setUI: (ui: Partial<UIState>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [ui, setUIState] = useState<UIState>({
    periodo: "7d",
    tabelaDensa: false,
    animacoes: true,
    buscaLeads: "",
  });

  const setUI = (updates: Partial<UIState>) => {
    setUIState(prev => ({ ...prev, ...updates }));
  };

  return (
    <AppContext.Provider value={{ ui, setUI }}>
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