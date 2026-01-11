import { useCallback, useEffect, useState } from 'react'
import type { Client, Credential, CredentialInsert } from '../lib/supabase'
import { supabase } from '../lib/supabase'

export type CredentialType = 'web' | 'ssh' | 'db' | 'api'

export interface CredentialWithClient extends Credential {
  clients: Client | null
}

export function useCredentials() {
  const [credentials, setCredentials] = useState<CredentialWithClient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCredentials = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('credentials')
        .select(`
          *,
          clients (*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCredentials(data as CredentialWithClient[] || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCredentials()
  }, [fetchCredentials])

  const addCredential = async (credential: Omit<CredentialInsert, 'user_id'>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı')

    const { data, error } = await supabase
      .from('credentials')
      .insert({ ...credential, user_id: user.id })
      .select(`*, clients (*)`)
      .single()

    if (error) throw error
    setCredentials(prev => [data as CredentialWithClient, ...prev])
    return data
  }

  const updateCredential = async (id: string, updates: Partial<Credential>) => {
    const { data, error } = await supabase
      .from('credentials')
      .update(updates)
      .eq('id', id)
      .select(`*, clients (*)`)
      .single()

    if (error) throw error
    setCredentials(prev => prev.map(c => c.id === id ? data as CredentialWithClient : c))
    return data
  }

  const deleteCredential = async (id: string) => {
    const { error } = await supabase
      .from('credentials')
      .delete()
      .eq('id', id)

    if (error) throw error
    setCredentials(prev => prev.filter(c => c.id !== id))
  }

  const getCredentialsByClient = useCallback((clientId: string) => {
    return credentials.filter(c => c.client_id === clientId)
  }, [credentials])

  const getCredentialsByType = useCallback((type: CredentialType) => {
    return credentials.filter(c => c.category === type)
  }, [credentials])

  return {
    credentials,
    loading,
    error,
    addCredential,
    updateCredential,
    deleteCredential,
    getCredentialsByClient,
    getCredentialsByType,
    refetch: fetchCredentials,
  }
}
