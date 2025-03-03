export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          date: string
          category: string | null
          description: string | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          date: string
          category?: string | null
          description?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          date?: string
          category?: string | null
          description?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      receipts: {
        Row: {
          id: string
          user_id: string
          transaction_id: string | null
          name: string
          vendor: string | null
          amount: number
          date: string
          image_url: string | null
          status: string | null
          extracted_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transaction_id?: string | null
          name: string
          vendor?: string | null
          amount: number
          date: string
          image_url?: string | null
          status?: string | null
          extracted_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          transaction_id?: string | null
          name?: string
          vendor?: string | null
          amount?: number
          date?: string
          image_url?: string | null
          status?: string | null
          extracted_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      tax_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          deduction_percentage: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          deduction_percentage?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          deduction_percentage?: number | null
          created_at?: string
        }
      }
      chat_history: {
        Row: {
          id: string
          user_id: string
          message: string
          sender: string
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          sender: string
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          sender?: string
          timestamp?: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']