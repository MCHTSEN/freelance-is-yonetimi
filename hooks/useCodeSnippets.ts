import { useCallback, useEffect, useState } from 'react'
import type { CodeSnippet, CodeSnippetInsert, Project } from '../lib/supabase'
import { supabase } from '../lib/supabase'

export interface CodeSnippetWithProject extends CodeSnippet {
  projects: Project | null
}

export function useCodeSnippets() {
  const [snippets, setSnippets] = useState<CodeSnippetWithProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSnippets = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('code_snippets')
        .select(`
          *,
          projects (*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSnippets((data as any) as CodeSnippetWithProject[] || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSnippets()
  }, [fetchSnippets])

  const addSnippet = async (snippet: Omit<CodeSnippetInsert, 'user_id'>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı')

    const { data, error } = await supabase
      .from('code_snippets')
      .insert({ ...snippet, user_id: user.id })
      .select(`*, projects (*)`)
      .single()

    if (error) throw error
    setSnippets(prev => [(data as any) as CodeSnippetWithProject, ...prev])
    return data
  }

  const updateSnippet = async (id: string, updates: Partial<CodeSnippet>) => {
    const { data, error } = await supabase
      .from('code_snippets')
      .update(updates)
      .eq('id', id)
      .select(`*, projects (*)`)
      .single()

    if (error) throw error
    setSnippets(prev => prev.map(s => s.id === id ? (data as any) as CodeSnippetWithProject : s))
    return data
  }

  const deleteSnippet = async (id: string) => {
    const { error } = await supabase
      .from('code_snippets')
      .delete()
      .eq('id', id)

    if (error) throw error
    setSnippets(prev => prev.filter(s => s.id !== id))
  }

  return {
    snippets,
    loading,
    error,
    addSnippet,
    updateSnippet,
    deleteSnippet,
    refetch: fetchSnippets,
  }
}
