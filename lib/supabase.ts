/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper types for easier use
export type Client = Database['public']['Tables']['clients']['Row']
export type ClientInsert = Database['public']['Tables']['clients']['Insert']
export type Pipeline = Database['public']['Tables']['pipeline']['Row']
export type PipelineInsert = Database['public']['Tables']['pipeline']['Insert']
export type Proposal = Database['public']['Tables']['proposals']['Row']
export type ProposalInsert = Database['public']['Tables']['proposals']['Insert']
export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type Note = Database['public']['Tables']['notes']['Row']
export type NoteInsert = Database['public']['Tables']['notes']['Insert']
export type Invoice = Database['public']['Tables']['invoices']['Row']
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert']
export type Credential = Database['public']['Tables']['credentials']['Row']
export type CredentialInsert = Database['public']['Tables']['credentials']['Insert']
export type CodeSnippet = Database['public']['Tables']['code_snippets']['Row']
export type CodeSnippetInsert = Database['public']['Tables']['code_snippets']['Insert']
export type InvoicePayment = Database['public']['Tables']['invoice_payments']['Row']
export type InvoicePaymentInsert = Database['public']['Tables']['invoice_payments']['Insert']
export type TimeEntry = Database['public']['Tables']['time_entries']['Row']
export type TimeEntryInsert = Database['public']['Tables']['time_entries']['Insert']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type BookingInsert = Database['public']['Tables']['bookings']['Insert']
export type AvailabilitySettings = Database['public']['Tables']['availability_settings']['Row']
export type AvailabilitySettingsInsert = Database['public']['Tables']['availability_settings']['Insert']
