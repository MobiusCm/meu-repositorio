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
      groups: {
        Row: {
          id: string
          created_at: string
          name: string
          icon_url: string | null
          description: string | null
          member_count: number | null
          last_updated_at: string | null
          user_id: string
          platform: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          icon_url?: string | null
          description?: string | null
          member_count?: number | null
          last_updated_at?: string | null
          user_id: string
          platform?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          icon_url?: string | null
          description?: string | null
          member_count?: number | null
          last_updated_at?: string | null
          user_id?: string
          platform?: string | null
        }
      }
      messages_status: {
        Row: {
          id: string
          group_id: string
          last_processed_date: string
          last_message_timestamp: string | null
          total_messages_count: number | null
          created_at: string | null
          updated_at: string | null
          storage_bucket_id: string | null
        }
        Insert: {
          id?: string
          group_id: string
          last_processed_date: string
          last_message_timestamp?: string | null
          total_messages_count?: number | null
          created_at?: string | null
          updated_at?: string | null
          storage_bucket_id?: string | null
        }
        Update: {
          id?: string
          group_id?: string
          last_processed_date?: string
          last_message_timestamp?: string | null
          total_messages_count?: number | null
          created_at?: string | null
          updated_at?: string | null
          storage_bucket_id?: string | null
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          name: string
          phone: string | null
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          name: string
          phone?: string | null
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          name?: string
          phone?: string | null
          is_admin?: boolean
          created_at?: string
        }
      }
      daily_stats: {
        Row: {
          id: string
          group_id: string
          date: string
          message_count: number
          active_members: number
        }
        Insert: {
          id?: string
          group_id: string
          date: string
          message_count: number
          active_members: number
        }
        Update: {
          id?: string
          group_id?: string
          date?: string
          message_count?: number
          active_members?: number
        }
      }
      member_daily_stats: {
        Row: {
          id: string
          group_id: string
          member_id: string
          date: string
          message_count: number
        }
        Insert: {
          id?: string
          group_id: string
          member_id: string
          date: string
          message_count: number
        }
        Update: {
          id?: string
          group_id?: string
          member_id?: string
          date?: string
          message_count?: number
        }
      },
      group_message_files: {
        Row: {
          id: string
          group_id: string
          storage_path: string
          file_date: string
          file_size: number | null
          message_count: number | null
          bucket_id: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          group_id: string
          storage_path: string
          file_date: string
          file_size?: number | null
          message_count?: number | null
          bucket_id: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          group_id?: string
          storage_path?: string
          file_date?: string
          file_size?: number | null
          message_count?: number | null
          bucket_id?: string
          created_at?: string | null
          updated_at?: string | null
        }
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