import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Pipeline, PipelineInsert, Client } from '../lib/supabase'

export type PipelineStage = 'lead' | 'contacted' | 'meeting' | 'proposal_sent' | 'won' | 'completed'

export interface InvoicePayment {
  id: string
  amount: number
  payment_date: string
}

export interface PipelineInvoice {
  id: string
  amount: number
  is_paid: boolean
  invoice_payments: InvoicePayment[]
}

export interface PipelineWithClient extends Pipeline {
  clients: Client | null
  invoices: PipelineInvoice[]
  total_paid?: number
  remaining?: number
}

export const STAGE_CONFIG: Record<PipelineStage, { title: string; order: number }> = {
  lead: { title: 'Lead', order: 1 },
  contacted: { title: 'Görüşüldü', order: 2 },
  meeting: { title: 'Toplantı Yapılacak', order: 3 },
  proposal_sent: { title: 'Teklif Gönderildi', order: 4 },
  won: { title: 'Kazanıldı', order: 5 },
  completed: { title: 'Bitti', order: 6 },
}

export function usePipeline() {
  const [items, setItems] = useState<PipelineWithClient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPipeline = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('pipeline')
        .select(`
          *,
          clients (*),
          invoices (
            id,
            amount,
            is_paid,
            invoice_payments (
              id,
              amount,
              payment_date
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Calculate total_paid and remaining for each item
      const itemsWithPayments = (data || []).map(item => {
        const invoices = item.invoices || []
        const totalPaid = invoices.reduce((sum: number, inv: PipelineInvoice) => {
          const invoicePayments = inv.invoice_payments || []
          return sum + invoicePayments.reduce((s: number, p: InvoicePayment) => s + Number(p.amount), 0)
        }, 0)
        const estimatedValue = Number(item.estimated_value) || 0
        return {
          ...item,
          total_paid: totalPaid,
          remaining: estimatedValue - totalPaid,
        }
      })

      setItems(itemsWithPayments as PipelineWithClient[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPipeline()
  }, [fetchPipeline])

  const addItem = async (item: PipelineInsert) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı')

    const { data, error } = await supabase
      .from('pipeline')
      .insert({ ...item, user_id: user.id })
      .select(`*, clients (*)`)
      .single()

    if (error) throw error

    // Sadece "won" aşamasında ekleniyorsa finansal takibe ekle
    if (item.stage === 'won' && item.estimated_value && item.estimated_value > 0) {
      try {
        await supabase.from('invoices').insert({
          user_id: user.id,
          client_id: item.client_id || null,
          pipeline_id: data.id,
          amount: item.estimated_value,
          invoice_number: `TKL-${Date.now().toString().slice(-6)}`,
          notes: `Pipeline: ${data.id}`,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        })
      } catch (err) {
        console.error('Failed to create invoice:', err)
      }
    }

    setItems(prev => [data as PipelineWithClient, ...prev])
    return data
  }

  const updateItem = async (id: string, updates: Partial<Pipeline>) => {
    const { data, error } = await supabase
      .from('pipeline')
      .update(updates)
      .eq('id', id)
      .select(`*, clients (*)`)
      .single()

    if (error) throw error
    setItems(prev => prev.map(item => item.id === id ? data as PipelineWithClient : item))
    return data
  }

  const updateStage = async (id: string, newStage: PipelineStage) => {
    const item = items.find(i => i.id === id)
    const previousStage = item?.stage

    // Aşamayı güncelle
    const result = await updateItem(id, { stage: newStage })

    // "won" aşamasına geçildiyse ve daha önce "won" değilse fatura oluştur
    if (newStage === 'won' && previousStage !== 'won' && item?.estimated_value && item.estimated_value > 0) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('invoices').insert({
            user_id: user.id,
            client_id: item.client_id || null,
            pipeline_id: id,
            amount: item.estimated_value,
            invoice_number: `TKL-${Date.now().toString().slice(-6)}`,
            notes: `Pipeline: ${id}`,
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          })
        }
      } catch (err) {
        console.error('Failed to create invoice on stage change:', err)
      }
    }

    return result
  }

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from('pipeline')
      .delete()
      .eq('id', id)

    if (error) throw error
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const getItemsByStage = useCallback((stage: PipelineStage) => {
    return items.filter(item => item.stage === stage)
  }, [items])

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    updateStage,
    deleteItem,
    getItemsByStage,
    refetch: fetchPipeline,
  }
}
