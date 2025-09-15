export interface Database {
  public: {
    Tables: {
      sites: {
        Row: {
          id: string
          domain: string
          plan: 'free' | 'starter' | 'pro' | 'agency'
          settings: Json
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          domain: string
          plan?: 'free' | 'starter' | 'pro' | 'agency'
          settings?: Json
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          domain?: string
          plan?: 'free' | 'starter' | 'pro' | 'agency'
          settings?: Json
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      urls: {
        Row: {
          id: string
          site_id: string
          url: string
          status: 'active' | 'noindex' | 'redirect' | 'deleted'
          last_updated_at: string
          backlinks: number
          conversions: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_id: string
          url: string
          status?: 'active' | 'noindex' | 'redirect' | 'deleted'
          last_updated_at?: string
          backlinks?: number
          conversions?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          url?: string
          status?: 'active' | 'noindex' | 'redirect' | 'deleted'
          last_updated_at?: string
          backlinks?: number
          conversions?: number
          created_at?: string
          updated_at?: string
        }
      }
      metrics: {
        Row: {
          id: string
          url_id: string
          day: string
          clicks: number
          impressions: number
          position: number
          ctr: number
          sessions: number
          created_at: string
        }
        Insert: {
          id?: string
          url_id: string
          day: string
          clicks: number
          impressions: number
          position: number
          ctr: number
          sessions?: number
          created_at?: string
        }
        Update: {
          id?: string
          url_id?: string
          day?: string
          clicks?: number
          impressions?: number
          position?: number
          ctr?: number
          sessions?: number
          created_at?: string
        }
      }
      clusters: {
        Row: {
          id: string
          site_id: string
          label: string
          centroid_vector: number[]
          created_at: string
        }
        Insert: {
          id?: string
          site_id: string
          label: string
          centroid_vector: number[]
          created_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          label?: string
          centroid_vector?: number[]
          created_at?: string
        }
      }
      url_clusters: {
        Row: {
          id: string
          url_id: string
          cluster_id: string
          similarity: number
          created_at: string
        }
        Insert: {
          id?: string
          url_id: string
          cluster_id: string
          similarity: number
          created_at?: string
        }
        Update: {
          id?: string
          url_id?: string
          cluster_id?: string
          similarity?: number
          created_at?: string
        }
      }
      actions: {
        Row: {
          id: string
          url_id: string
          type: 'keep' | 'refresh' | 'consolidate' | 'prune' | 'redirect'
          rationale: string
          risk: number
          guard_flags: Json
          status: 'pending' | 'approved' | 'applied' | 'rolled_back'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          url_id: string
          type: 'keep' | 'refresh' | 'consolidate' | 'prune' | 'redirect'
          rationale: string
          risk: number
          guard_flags?: Json
          status?: 'pending' | 'approved' | 'applied' | 'rolled_back'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          url_id?: string
          type?: 'keep' | 'refresh' | 'consolidate' | 'prune' | 'redirect'
          rationale?: string
          risk?: number
          guard_flags?: Json
          status?: 'pending' | 'approved' | 'applied' | 'rolled_back'
          created_at?: string
          updated_at?: string
        }
      }
      changes: {
        Row: {
          id: string
          url_id: string
          action_id: string
          applied_at: string
          rollback_token: string
          diff: Json
          created_at: string
        }
        Insert: {
          id?: string
          url_id: string
          action_id: string
          applied_at: string
          rollback_token: string
          diff: Json
          created_at?: string
        }
        Update: {
          id?: string
          url_id?: string
          action_id?: string
          applied_at?: string
          rollback_token?: string
          diff?: Json
          created_at?: string
        }
      }
    }
  }
}

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]
