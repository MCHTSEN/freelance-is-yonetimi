import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { TimeEntry, TimeEntryInsert, Client, Project } from '../lib/supabase'

export interface TimeEntryWithDetails extends TimeEntry {
  clients: Client | null
  projects: Project | null
}

export function useTimeTracking() {
  const [entries, setEntries] = useState<TimeEntryWithDetails[]>([])
  const [activeEntry, setActiveEntry] = useState<TimeEntryWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Aktif timer için saniye sayacı
  useEffect(() => {
    if (activeEntry?.is_running) {
      const startTime = new Date(activeEntry.start_time).getTime()

      const updateElapsed = () => {
        const now = Date.now()
        setElapsedSeconds(Math.floor((now - startTime) / 1000))
      }

      updateElapsed()
      timerRef.current = setInterval(updateElapsed, 1000)

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    } else {
      setElapsedSeconds(0)
    }
  }, [activeEntry])

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          clients (*),
          projects (*)
        `)
        .order('start_time', { ascending: false })

      if (error) throw error

      const entriesData = data as TimeEntryWithDetails[] || []
      setEntries(entriesData)

      // Aktif entry'yi bul
      const running = entriesData.find(e => e.is_running)
      setActiveEntry(running || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const startTimer = async (description?: string, projectId?: string, clientId?: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı')

    // Önce aktif timer varsa durdur
    if (activeEntry) {
      await stopTimer()
    }

    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        user_id: user.id,
        description: description || null,
        project_id: projectId || null,
        client_id: clientId || null,
        start_time: new Date().toISOString(),
        is_running: true,
      })
      .select(`*, clients (*), projects (*)`)
      .single()

    if (error) throw error

    const newEntry = data as TimeEntryWithDetails
    setEntries(prev => [newEntry, ...prev])
    setActiveEntry(newEntry)

    return newEntry
  }

  const stopTimer = async () => {
    if (!activeEntry) return null

    const endTime = new Date()
    const startTime = new Date(activeEntry.start_time)
    const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)

    const { data, error } = await supabase
      .from('time_entries')
      .update({
        end_time: endTime.toISOString(),
        duration_seconds: durationSeconds,
        is_running: false,
      })
      .eq('id', activeEntry.id)
      .select(`*, clients (*), projects (*)`)
      .single()

    if (error) throw error

    const updatedEntry = data as TimeEntryWithDetails
    setEntries(prev => prev.map(e => e.id === activeEntry.id ? updatedEntry : e))
    setActiveEntry(null)
    setElapsedSeconds(0)

    return updatedEntry
  }

  const updateEntry = async (id: string, updates: Partial<TimeEntry>) => {
    const { data, error } = await supabase
      .from('time_entries')
      .update(updates)
      .eq('id', id)
      .select(`*, clients (*), projects (*)`)
      .single()

    if (error) throw error

    const updatedEntry = data as TimeEntryWithDetails
    setEntries(prev => prev.map(e => e.id === id ? updatedEntry : e))

    if (activeEntry?.id === id) {
      setActiveEntry(updatedEntry)
    }

    return updatedEntry
  }

  const deleteEntry = async (id: string) => {
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', id)

    if (error) throw error

    setEntries(prev => prev.filter(e => e.id !== id))

    if (activeEntry?.id === id) {
      setActiveEntry(null)
    }
  }

  // Bugünkü girişler
  const getTodayEntries = useCallback(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return entries.filter(e => {
      const entryDate = new Date(e.start_time)
      entryDate.setHours(0, 0, 0, 0)
      return entryDate.getTime() === today.getTime()
    })
  }, [entries])

  // Bu haftanın girişleri
  const getThisWeekEntries = useCallback(() => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    return entries.filter(e => {
      const entryDate = new Date(e.start_time)
      return entryDate >= startOfWeek
    })
  }, [entries])

  // Proje bazlı girişler
  const getEntriesByProject = useCallback((projectId: string) => {
    return entries.filter(e => e.project_id === projectId)
  }, [entries])

  // Müşteri bazlı girişler
  const getEntriesByClient = useCallback((clientId: string) => {
    return entries.filter(e => e.client_id === clientId)
  }, [entries])

  // İstatistikler
  const calculateStats = useCallback(() => {
    const todayEntries = getTodayEntries()
    const weekEntries = getThisWeekEntries()

    // Aktif timer'ın süresini de ekle
    const activeSeconds = activeEntry?.is_running ? elapsedSeconds : 0

    const todaySeconds = todayEntries.reduce((sum, e) => {
      if (e.is_running) return sum + activeSeconds
      return sum + (e.duration_seconds || 0)
    }, 0)

    const weekSeconds = weekEntries.reduce((sum, e) => {
      if (e.is_running) return sum + activeSeconds
      return sum + (e.duration_seconds || 0)
    }, 0)

    const totalSeconds = entries.reduce((sum, e) => {
      if (e.is_running) return sum + activeSeconds
      return sum + (e.duration_seconds || 0)
    }, 0)

    return {
      todaySeconds,
      weekSeconds,
      totalSeconds,
      todayFormatted: formatDuration(todaySeconds),
      weekFormatted: formatDuration(weekSeconds),
      totalFormatted: formatDuration(totalSeconds),
      todayCount: todayEntries.length,
      weekCount: weekEntries.length,
      totalCount: entries.length,
    }
  }, [entries, getTodayEntries, getThisWeekEntries, activeEntry, elapsedSeconds])

  return {
    entries,
    activeEntry,
    loading,
    error,
    elapsedSeconds,
    startTimer,
    stopTimer,
    updateEntry,
    deleteEntry,
    getTodayEntries,
    getThisWeekEntries,
    getEntriesByProject,
    getEntriesByClient,
    calculateStats,
    refetch: fetchEntries,
  }
}

// Süreyi formatla (saniye -> saat:dakika:saniye)
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}s ${minutes}dk`
  }
  if (minutes > 0) {
    return `${minutes}dk ${secs}sn`
  }
  return `${secs}sn`
}

// Detaylı format (HH:MM:SS)
export function formatDurationDetailed(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}
