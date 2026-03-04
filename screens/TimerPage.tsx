import { useMemo, useState } from 'react'
import { useClients } from '../hooks/useClients'
import { formatDurationDetailed, useTimeTracking } from '../hooks/useTimeTracking'

type ViewMode = 'entries' | 'stats'
type StatsPeriod = 'week' | 'month' | 'year'

export default function TimerPage() {
  const { clients } = useClients()
  const {
    entries,
    activeEntry,
    elapsedSeconds,
    startTimer,
    stopTimer,
    deleteEntry,
  } = useTimeTracking()

  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [viewMode, setViewMode] = useState<ViewMode>('entries')
  const [statsPeriod, setStatsPeriod] = useState<StatsPeriod>('week')

  const handleToggleTimer = async () => {
    if (activeEntry) {
      await stopTimer()
    } else if (selectedClientId) {
      await startTimer(undefined, undefined, selectedClientId)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Bugün'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Dün'
    }
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}s ${minutes}dk`
    if (minutes > 0) return `${minutes}dk`
    return '0dk'
  }

  const formatDurationLong = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours} saat ${minutes} dakika`
    return `${minutes} dakika`
  }

  // Group entries by date
  const groupedEntries = entries.reduce((groups, entry) => {
    const date = new Date(entry.start_time).toDateString()
    if (!groups[date]) groups[date] = []
    groups[date].push(entry)
    return groups
  }, {} as Record<string, typeof entries>)

  const sortedDates = Object.keys(groupedEntries).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  )

  // Calculate client stats based on period
  const clientStats = useMemo(() => {
    const now = new Date()
    let startDate: Date

    switch (statsPeriod) {
      case 'week':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate = new Date(now)
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    // Filter entries by period
    const periodEntries = entries.filter(entry => {
      const entryDate = new Date(entry.start_time)
      return entryDate >= startDate
    })

    // Group by client
    const clientMap = new Map<string, {
      clientId: string
      name: string
      totalSeconds: number
      entryCount: number
    }>()

    periodEntries.forEach(entry => {
      const clientId = entry.client_id || 'unknown'
      const name = entry.clients?.company || entry.clients?.first_name || 'Bilinmeyen'
      const existing = clientMap.get(clientId)

      if (existing) {
        existing.totalSeconds += entry.duration_seconds || 0
        existing.entryCount += 1
      } else {
        clientMap.set(clientId, {
          clientId,
          name,
          totalSeconds: entry.duration_seconds || 0,
          entryCount: 1
        })
      }
    })

    // Sort by total time descending
    return Array.from(clientMap.values()).sort((a, b) => b.totalSeconds - a.totalSeconds)
  }, [entries, statsPeriod])

  const totalPeriodSeconds = clientStats.reduce((sum, c) => sum + c.totalSeconds, 0)

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-transparent">
      {/* Timer Section - Hero */}
      <div className="flex flex-col items-center justify-center py-16 px-8">
        {/* Status Indicator */}
        {activeEntry && (
          <div className="flex items-center gap-2 mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
            </span>
            <span className="text-green-400 text-sm font-medium tracking-wide">
              {activeEntry.clients?.company || activeEntry.clients?.first_name || 'Aktif Oturum'}
            </span>
          </div>
        )}

        {/* Timer Display */}
        <div className="relative mb-10">
          <div className={`text-8xl md:text-9xl font-black font-mono tracking-tight transition-colors duration-500 ${
            activeEntry ? 'text-white' : 'text-slate-700'
          }`}>
            {formatDurationDetailed(elapsedSeconds)}
          </div>

          {/* Subtle glow effect when active */}
          {activeEntry && (
            <div className="absolute inset-0 blur-3xl bg-primary/20 -z-10" />
          )}
        </div>

        {/* Client Selection - Only show when not running */}
        {!activeEntry && (
          <div className="w-full max-w-xs mb-8">
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-center text-lg font-medium focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer hover:bg-white/10"
            >
              <option value="" className="bg-slate-900">Müşteri seç...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id} className="bg-slate-900">
                  {client.company || `${client.first_name} ${client.last_name || ''}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Single Action Button */}
        <button
          onClick={handleToggleTimer}
          disabled={!activeEntry && !selectedClientId}
          className={`group relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
            activeEntry
              ? 'bg-rose-500 hover:bg-rose-600 shadow-xl shadow-rose-500/30'
              : selectedClientId
                ? 'bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30'
                : 'bg-slate-800 cursor-not-allowed opacity-50'
          }`}
        >
          <span className="material-symbols-rounded text-4xl text-white">
            {activeEntry ? 'stop' : 'play_arrow'}
          </span>

          {/* Pulse ring when active */}
          {activeEntry && (
            <span className="absolute inset-0 rounded-full border-4 border-rose-500 animate-ping opacity-20" />
          )}
        </button>

        {/* Helper text */}
        <p className="text-slate-600 text-sm mt-6">
          {activeEntry
            ? 'Durdurmak için tıkla'
            : selectedClientId
              ? 'Başlatmak için tıkla'
              : 'Önce müşteri seç'
          }
        </p>
      </div>

      {/* View Toggle */}
      <div className="px-8 mb-4">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-2">
          <button
            onClick={() => setViewMode('entries')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              viewMode === 'entries'
                ? 'bg-white text-slate-900'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="material-symbols-rounded text-lg">history</span>
            Kayıtlar
          </button>
          <button
            onClick={() => setViewMode('stats')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              viewMode === 'stats'
                ? 'bg-white text-slate-900'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="material-symbols-rounded text-lg">bar_chart</span>
            İstatistikler
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-2xl mx-auto">

          {/* Stats View */}
          {viewMode === 'stats' && (
            <div className="space-y-6">
              {/* Period Selector */}
              <div className="flex items-center justify-center gap-2">
                {[
                  { value: 'week', label: 'Haftalık' },
                  { value: 'month', label: 'Aylık' },
                  { value: 'year', label: 'Yıllık' },
                ].map(period => (
                  <button
                    key={period.value}
                    onClick={() => setStatsPeriod(period.value as StatsPeriod)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      statsPeriod === period.value
                        ? 'bg-primary text-white'
                        : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>

              {/* Total Summary */}
              <div className="text-center py-6">
                <p className="text-slate-500 text-sm mb-2">
                  {statsPeriod === 'week' && 'Son 7 gün'}
                  {statsPeriod === 'month' && 'Son 30 gün'}
                  {statsPeriod === 'year' && 'Son 1 yıl'}
                </p>
                <p className="text-4xl font-black text-white">
                  {formatDurationLong(totalPeriodSeconds)}
                </p>
              </div>

              {/* Client Breakdown */}
              {clientStats.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-rounded text-5xl text-slate-800 mb-3 block">analytics</span>
                  <p className="text-slate-600">Bu dönemde kayıt yok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientStats.map((stat, index) => {
                    const percentage = totalPeriodSeconds > 0
                      ? (stat.totalSeconds / totalPeriodSeconds) * 100
                      : 0

                    return (
                      <div
                        key={stat.clientId}
                        className="relative bg-white/[0.02] rounded-2xl p-5 overflow-hidden"
                      >
                        {/* Progress bar background */}
                        <div
                          className="absolute inset-0 bg-primary/10 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />

                        <div className="relative flex items-center gap-4">
                          {/* Rank */}
                          <div className={`size-8 rounded-lg flex items-center justify-center text-sm font-black ${
                            index === 0 ? 'bg-amber-500/20 text-amber-400' :
                            index === 1 ? 'bg-slate-400/20 text-slate-300' :
                            index === 2 ? 'bg-orange-600/20 text-orange-400' :
                            'bg-white/5 text-slate-500'
                          }`}>
                            {index + 1}
                          </div>

                          {/* Client Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold truncate">{stat.name}</p>
                            <p className="text-slate-500 text-sm">{stat.entryCount} kayıt</p>
                          </div>

                          {/* Time & Percentage */}
                          <div className="text-right">
                            <p className="text-white font-mono font-bold">
                              {formatDuration(stat.totalSeconds)}
                            </p>
                            <p className="text-slate-500 text-sm">
                              %{percentage.toFixed(0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Entries View */}
          {viewMode === 'entries' && (
            <>
              {sortedDates.length === 0 ? (
                <div className="text-center py-16">
                  <span className="material-symbols-rounded text-6xl text-slate-800 mb-4 block">history</span>
                  <p className="text-slate-600">Henüz kayıt yok</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {sortedDates.map(dateKey => (
                    <div key={dateKey}>
                      {/* Date Header */}
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                          {formatDate(groupedEntries[dateKey][0].start_time)}
                        </span>
                        <div className="flex-1 h-px bg-white/5" />
                        <span className="text-xs text-slate-600">
                          {formatDuration(
                            groupedEntries[dateKey].reduce((sum, e) => sum + (e.duration_seconds || 0), 0)
                          )}
                        </span>
                      </div>

                      {/* Entries */}
                      <div className="space-y-2">
                        {groupedEntries[dateKey].map(entry => (
                          <div
                            key={entry.id}
                            className="group flex items-center gap-4 p-4 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl transition-all"
                          >
                            {/* Client Avatar */}
                            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                              {entry.clients?.company?.[0] || entry.clients?.first_name?.[0] || '?'}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate">
                                {entry.clients?.company || entry.clients?.first_name || 'Bilinmeyen'}
                              </p>
                              <p className="text-slate-500 text-sm">
                                {formatTime(entry.start_time)}
                                {entry.end_time && ` – ${formatTime(entry.end_time)}`}
                              </p>
                            </div>

                            {/* Duration */}
                            <div className="text-right">
                              <p className="text-white font-mono font-bold">
                                {entry.duration_seconds ? formatDuration(entry.duration_seconds) : '—'}
                              </p>
                            </div>

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                if (confirm('Bu kaydı silmek istiyor musun?')) {
                                  deleteEntry(entry.id)
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 size-8 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 flex items-center justify-center transition-all"
                            >
                              <span className="material-symbols-rounded text-lg">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
