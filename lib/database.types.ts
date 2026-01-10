export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      availability_settings: {
        Row: {
          blocked_dates: string[] | null
          buffer_minutes: number | null
          created_at: string | null
          default_duration: number | null
          id: string
          timezone: string | null
          updated_at: string | null
          user_id: string
          working_hours: Json | null
        }
        Insert: {
          blocked_dates?: string[] | null
          buffer_minutes?: number | null
          created_at?: string | null
          default_duration?: number | null
          id?: string
          timezone?: string | null
          updated_at?: string | null
          user_id: string
          working_hours?: Json | null
        }
        Update: {
          blocked_dates?: string[] | null
          buffer_minutes?: number | null
          created_at?: string | null
          default_duration?: number | null
          id?: string
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
          working_hours?: Json | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          client_email: string
          client_name: string
          client_phone: string | null
          created_at: string | null
          duration_minutes: number | null
          google_event_id: string | null
          id: string
          meeting_type: string | null
          notes: string | null
          scheduled_at: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_email: string
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          google_event_id?: string | null
          id?: string
          meeting_type?: string | null
          notes?: string | null
          scheduled_at: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_email?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          google_event_id?: string | null
          id?: string
          meeting_type?: string | null
          notes?: string | null
          scheduled_at?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      code_snippets: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_favorite: boolean | null
          language: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          language?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          language?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      credentials: {
        Row: {
          category: string | null
          client_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          password_encrypted: string | null
          project_id: string | null
          service_name: string
          updated_at: string | null
          url: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          category?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          password_encrypted?: string | null
          project_id?: string | null
          service_name: string
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          category?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          password_encrypted?: string | null
          project_id?: string | null
          service_name?: string
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credentials_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credentials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string | null
          currency: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          is_paid: boolean | null
          notes: string | null
          paid_at: string | null
          project_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          is_paid?: boolean | null
          notes?: string | null
          paid_at?: string | null
          project_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          is_paid?: boolean | null
          notes?: string | null
          paid_at?: string | null
          project_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          }
        ]
      }
      notes: {
        Row: {
          client_id: string | null
          content: string | null
          created_at: string | null
          id: string
          meeting_date: string | null
          project_id: string | null
          tags: string[] | null
          title: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          meeting_date?: string | null
          project_id?: string | null
          tags?: string[] | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          meeting_date?: string | null
          project_id?: string | null
          tags?: string[] | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline: {
        Row: {
          client_id: string | null
          created_at: string | null
          estimated_value: number | null
          follow_up_date: string | null
          id: string
          notes: string | null
          priority: string | null
          stage: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          estimated_value?: number | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          stage?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          estimated_value?: number | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          stage?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          client_id: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          proposal_id: string | null
          start_date: string | null
          status: string | null
          technical_details: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          budget?: number | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          proposal_id?: string | null
          start_date?: string | null
          status?: string | null
          technical_details?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          budget?: number | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          proposal_id?: string | null
          start_date?: string | null
          status?: string | null
          technical_details?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          amount: number | null
          client_id: string | null
          content: string | null
          created_at: string | null
          currency: string | null
          id: string
          pdf_url: string | null
          sent_at: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          valid_until: string | null
        }
        Insert: {
          amount?: number | null
          client_id?: string | null
          content?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          pdf_url?: string | null
          sent_at?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          valid_until?: string | null
        }
        Update: {
          amount?: number | null
          client_id?: string | null
          content?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          pdf_url?: string | null
          sent_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          client_id: string | null
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          end_time: string | null
          id: string
          is_running: boolean | null
          project_id: string | null
          start_time: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          is_running?: boolean | null
          project_id?: string | null
          start_time: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          is_running?: boolean | null
          project_id?: string | null
          start_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  TableName extends keyof Database['public']['Tables']
> = Database['public']['Tables'][TableName]['Row']

export type TablesInsert<
  TableName extends keyof Database['public']['Tables']
> = Database['public']['Tables'][TableName]['Insert']

export type TablesUpdate<
  TableName extends keyof Database['public']['Tables']
> = Database['public']['Tables'][TableName]['Update']
