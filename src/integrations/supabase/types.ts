export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      app_users: {
        Row: {
          auth_uid: string | null
          criado_em: string
          email: string | null
          id: number
          nome: string
          papel: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          auth_uid?: string | null
          criado_em?: string
          email?: string | null
          id?: number
          nome: string
          papel?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          auth_uid?: string | null
          criado_em?: string
          email?: string | null
          id?: number
          nome?: string
          papel?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      leads: {
        Row: {
          criado_em: string
          email: string | null
          empresa: string | null
          id: number
          nome: string
          observacoes: string | null
          origem: Database["public"]["Enums"]["lead_origin"]
          responsavel_id: number
          status: Database["public"]["Enums"]["lead_status"]
          telefone: string | null
          valor: number
        }
        Insert: {
          criado_em?: string
          email?: string | null
          empresa?: string | null
          id?: number
          nome: string
          observacoes?: string | null
          origem: Database["public"]["Enums"]["lead_origin"]
          responsavel_id: number
          status?: Database["public"]["Enums"]["lead_status"]
          telefone?: string | null
          valor?: number
        }
        Update: {
          criado_em?: string
          email?: string | null
          empresa?: string | null
          id?: number
          nome?: string
          observacoes?: string | null
          origem?: Database["public"]["Enums"]["lead_origin"]
          responsavel_id?: number
          status?: Database["public"]["Enums"]["lead_status"]
          telefone?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "leads_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vw_dashboard_por_dia: {
        Row: {
          dia: string | null
          leads_criados: number | null
          valor_ganho: number | null
        }
        Relationships: []
      }
      vw_dashboard_por_origem: {
        Row: {
          origem: Database["public"]["Enums"]["lead_origin"] | null
          total_leads: number | null
          valor_ganho: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      current_identity: {
        Args: never
        Returns: {
          role: Database["public"]["Enums"]["user_role"]
          user_id: number
        }[]
      }
      current_user_id: { Args: never; Returns: number }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      init_current_user: {
        Args: { p_email: string; p_nome: string }
        Returns: {
          auth_uid: string | null
          criado_em: string
          email: string | null
          id: number
          nome: string
          papel: Database["public"]["Enums"]["user_role"]
        }
        SetofOptions: {
          from: "*"
          to: "app_users"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      lead_origin:
        | "Formulário"
        | "WhatsApp"
        | "Redes Sociais"
        | "Indicação"
        | "Outros"
      lead_status: "Novo" | "Atendimento" | "Ganho" | "Perdido"
      user_role: "admin" | "vendedor" | "nenhum"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      lead_origin: [
        "Formulário",
        "WhatsApp",
        "Redes Sociais",
        "Indicação",
        "Outros",
      ],
      lead_status: ["Novo", "Atendimento", "Ganho", "Perdido"],
      user_role: ["admin", "vendedor", "nenhum"],
    },
  },
} as const
