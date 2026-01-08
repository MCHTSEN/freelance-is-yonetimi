import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Pipeline, PipelineInsert, Client } from '../lib/supabase'

export type PipelineStage = 'lead' | 'contacted' | 'proposal_sent' | 'negotiation' | 'won' | 'lost'

export interface PipelineWithClient extends Pipeline {
  clients: Client | null
}

export const STAGE_CONFIG: Record<PipelineStage, { title: string; order: number }> = {
  lead: { title: 'Lead', order: 1 },
  contacted: { title: 'Görüşüldü', order: 2 },
  proposal_sent: { title: 'Teklif Gönderildi', order: 3 },
  negotiation: { title: 'Sözleşme', order: 4 },
  won: { title: 'Kazanıldı', order: 5 },
  lost: { title: 'Kaybedildi', order: 6 },
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
          clients (*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setItems(data as PipelineWithClient[] || [])
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
    return updateItem(id, { stage: newStage })
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
