import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Note, NoteInsert, Client, Project } from '../lib/supabase'

export type NoteType = 'meeting' | 'technical' | 'general'

export interface NoteWithRelations extends Note {
  clients: Client | null
  projects: Project | null
}

export function useNotes() {
  const [notes, setNotes] = useState<NoteWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          clients (*),
          projects (*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotes(data as NoteWithRelations[] || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const addNote = async (note: Omit<NoteInsert, 'user_id'>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı')

    const { data, error } = await supabase
      .from('notes')
      .insert({ ...note, user_id: user.id })
      .select(`*, clients (*), projects (*)`)
      .single()

    if (error) throw error
    setNotes(prev => [data as NoteWithRelations, ...prev])
    return data
  }

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .select(`*, clients (*), projects (*)`)
      .single()

    if (error) throw error
    setNotes(prev => prev.map(n => n.id === id ? data as NoteWithRelations : n))
    return data
  }

  const deleteNote = async (id: string) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)

    if (error) throw error
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  const getNotesByType = useCallback((type: NoteType) => {
    return notes.filter(n => n.type === type)
  }, [notes])

  return {
    notes,
    loading,
    error,
    addNote,
    updateNote,
    deleteNote,
    getNotesByType,
    refetch: fetchNotes,
  }
}
