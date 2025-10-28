export type UserRole = "admin" | "vendedor";
export type LeadStatus = "Novo" | "Atendimento" | "Ganho" | "Perdido";
export type LeadOrigin = "Formulário" | "WhatsApp" | "Redes Sociais" | "Indicação" | "Outros";

export interface User {
  id: string;
  nome: string;
  email: string;
  papel: UserRole;
}

export interface Lead {
  id: string;
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  origem: LeadOrigin;
  valor: number;
  criadoEm: string;
  responsavelId: string;
  status: LeadStatus;
  observacoes: string;
}

export const LEAD_ORIGINS: LeadOrigin[] = ["Formulário", "WhatsApp", "Redes Sociais", "Indicação", "Outros"];
export const LEAD_STATUSES: LeadStatus[] = ["Novo", "Atendimento", "Ganho", "Perdido"];

export const initialUsers: User[] = [
  { id: "u0", nome: "Gestor Demo", email: "gestor@empresa.com", papel: "admin" },
  { id: "u1", nome: "Ana Souza", email: "ana@empresa.com", papel: "vendedor" },
  { id: "u2", nome: "Bruno Lima", email: "bruno@empresa.com", papel: "vendedor" },
];

export const initialLeads: Lead[] = [
  { 
    id: "l1", 
    nome: "Carlos Pereira", 
    empresa: "Alpha Tech", 
    email: "carlos@alphatech.com", 
    telefone: "5511999990001", 
    origem: "Formulário", 
    valor: 3500, 
    criadoEm: "2025-09-29", 
    responsavelId: "u1", 
    status: "Novo", 
    observacoes: "Interessado no plano anual" 
  },
  { 
    id: "l2", 
    nome: "Marina Costa", 
    empresa: "Bee Labs", 
    email: "marina@beelabs.io", 
    telefone: "5511988880002", 
    origem: "WhatsApp", 
    valor: 1200, 
    criadoEm: "2025-09-28", 
    responsavelId: "u2", 
    status: "Atendimento", 
    observacoes: "Pediu proposta por e-mail" 
  },
  { 
    id: "l3", 
    nome: "Renato Alves", 
    empresa: "Casa Verde", 
    email: "renato@casaverde.com", 
    telefone: "5511977770003", 
    origem: "Redes Sociais", 
    valor: 900, 
    criadoEm: "2025-09-25", 
    responsavelId: "u1", 
    status: "Ganho", 
    observacoes: "Fechou via link de checkout" 
  },
  { 
    id: "l4", 
    nome: "Luana Dias", 
    empresa: "Delta School", 
    email: "luana@deltaschool.com", 
    telefone: "5511966660004", 
    origem: "Indicação", 
    valor: 2200, 
    criadoEm: "2025-09-23", 
    responsavelId: "u2", 
    status: "Atendimento", 
    observacoes: "Agendou call" 
  },
  { 
    id: "l5", 
    nome: "Pedro Gomes", 
    empresa: "Everest", 
    email: "pedro@everest.co", 
    telefone: "5511955550005", 
    origem: "Formulário", 
    valor: 1800, 
    criadoEm: "2025-09-21", 
    responsavelId: "u1", 
    status: "Novo", 
    observacoes: "" 
  },
  { 
    id: "l6", 
    nome: "Sofia Nunes", 
    empresa: "Foodie", 
    email: "sofia@foodie.com", 
    telefone: "5511944440006", 
    origem: "Redes Sociais", 
    valor: 1400, 
    criadoEm: "2025-09-18", 
    responsavelId: "u2", 
    status: "Perdido", 
    observacoes: "Sem budget no momento" 
  },
  { 
    id: "l7", 
    nome: "Diego Ramos", 
    empresa: "Gama Fit", 
    email: "diego@gamafit.com", 
    telefone: "5511933330007", 
    origem: "Indicação", 
    valor: 2600, 
    criadoEm: "2025-09-15", 
    responsavelId: "u1", 
    status: "Ganho", 
    observacoes: "Fechou com desconto de 10%" 
  },
  { 
    id: "l8", 
    nome: "Tatiane Melo", 
    empresa: "Helios", 
    email: "tatiane@helios.ai", 
    telefone: "5511922220008", 
    origem: "WhatsApp", 
    valor: 3200, 
    criadoEm: "2025-09-10", 
    responsavelId: "u2", 
    status: "Atendimento", 
    observacoes: "Quer integração futura" 
  },
  { 
    id: "l9", 
    nome: "João Victor", 
    empresa: "Inova", 
    email: "joao@inova.com", 
    telefone: "5511911110009", 
    origem: "Outros", 
    valor: 700, 
    criadoEm: "2025-09-05", 
    responsavelId: "u1", 
    status: "Perdido", 
    observacoes: "Concorrência mais barata" 
  },
  { 
    id: "l10", 
    nome: "Bruna Rocha", 
    empresa: "Jupiter", 
    email: "bruna@jupiter.dev", 
    telefone: "5511900000010", 
    origem: "Formulário", 
    valor: 4100, 
    criadoEm: "2025-09-01", 
    responsavelId: "u2", 
    status: "Novo", 
    observacoes: "Interessada em onboarding rápido" 
  },
];
