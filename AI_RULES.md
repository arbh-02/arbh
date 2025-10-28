# Regras de IA e Diretrizes do Projeto

Este documento descreve as principais tecnologias, padrões arquitetônicos e regras obrigatórias de uso de bibliotecas para a aplicação CRM NoCode.

## 1. Visão Geral da Pilha de Tecnologia (Tech Stack)

O projeto é construído usando uma arquitetura moderna, baseada em componentes, focada em desempenho e manutenibilidade.

*   **Framework Frontend:** React (utilizando Vite para tooling).
*   **Linguagem:** TypeScript (obrigatório para toda a lógica da aplicação e componentes).
*   **Estilização:** Tailwind CSS (abordagem utility-first, utilizando um tema escuro customizado).
*   **Biblioteca de Componentes:** shadcn/ui (construída sobre primitivos Radix UI para acessibilidade e qualidade).
*   **Roteamento:** React Router DOM (para navegação no lado do cliente).
*   **Gerenciamento de Estado:** React Query (para gerenciamento de estado do servidor/dados) e React Context (para estado global da aplicação).
*   **Backend & Banco de Dados:** Supabase (usado para Autenticação, banco de dados PostgreSQL e Edge Functions serverless).
*   **Ícones:** Lucide React.
*   **Gráficos:** Recharts.
*   **Notificações:** Sonner (para toasts modernos e não-bloqueantes).

## 2. Regras Obrigatórias de Uso de Bibliotecas

Para garantir consistência e manutenibilidade, siga rigorosamente as seguintes regras ao implementar funcionalidades:

| Área de Funcionalidade | Biblioteca/Ferramenta Obrigatória | Regra |
| :--- | :--- | :--- |
| **Componentes UI** | `shadcn/ui` (e componentes Radix subjacentes) | Sempre use os componentes pré-construídos do shadcn/ui (`src/components/ui/`) para elementos de interface padrão (Button, Card, Input, etc.). Não crie componentes customizados para elementos que já existem no shadcn/ui. |
| **Estilização** | Tailwind CSS | Use classes de utilidade do Tailwind CSS exclusivamente para estilização. Evite arquivos CSS customizados ou estilos inline. Garanta que os designs sejam responsivos por padrão. |
| **Ícones** | `lucide-react` | Todos os ícones devem ser provenientes do Lucide React. |
| **Busca de Dados** | `@tanstack/react-query` | Use React Query para todas as operações assíncronas de dados envolvendo o Supabase (busca, mutações, cache). |
| **Banco de Dados/Auth** | `@/integrations/supabase/client` | Todas as interações com o banco de dados ou sistema de autenticação devem usar o cliente Supabase configurado. |
| **Notificações** | `sonner` | Use o componente `<Sonner />` e a função `toast` do `sonner` para todas as notificações de feedback do usuário. |
| **Roteamento** | `react-router-dom` | Use `Link`, `useNavigate`, e `Routes`/`Route` para navegação. |
| **Gráficos** | `recharts` | Use Recharts para todas as visualizações de dados e gráficos. |

## 3. Arquitetura e Estrutura de Arquivos

*   **Componentes:** Todos os componentes reutilizáveis devem residir em `src/components/`.
*   **Páginas:** Todos os componentes de nível de rota devem residir em `src/pages/`.
*   **Contextos:** A lógica de gerenciamento de estado global deve residir em `src/contexts/`.
*   **Utilitários:** Funções auxiliares e lógica de formatação devem residir em `src/lib/`.