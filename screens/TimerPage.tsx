import {
    BarChart2,
    Clock,
    History,
    Play,
    Square,
    X
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import {
    Card,
    CardContent
} from '../components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../components/ui/select'
import { useClients } from '../hooks/useClients'
import { formatDurationDetailed, useTimeTracking } from '../hooks/useTimeTracking'
import { cn } from '../lib/utils'

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
    <div className="flex flex-col h-full w-full bg-background overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-primary/5 blur-[120px] -z-10 rounded-full" />

      {/* Main Timer Display Section */}
      <section className="flex flex-col items-center justify-center pt-20 pb-12 px-8 shrink-0">
        <div className="space-y-2 mb-8 text-center">
          {activeEntry ? (
            <div className="flex items-center justify-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Badge variant="outline" className="text-xs font-bold uppercase tracking-widest text-emerald-600 border-emerald-200 bg-emerald-500/5">
                {activeEntry.clients?.company || activeEntry.clients?.first_name || 'Aktif Oturum'}
              </Badge>
            </div>
          ) : (
            <Badge variant="secondary" className="text-xs font-bold uppercase tracking-widest opacity-60">Beklemede</Badge>
          )}
        </div>

        <div className="relative mb-12">
           <h1 className={cn(
             "text-[120px] md:text-[160px] font-black font-mono tracking-tighter leading-none transition-all duration-700",
             activeEntry ? "text-foreground drop-shadow-2xl" : "text-muted-foreground/30"
           )}>
             {formatDurationDetailed(elapsedSeconds)}
           </h1>
        </div>

        <div className="w-full max-w-sm flex flex-col items-center gap-8">
           {!activeEntry && (
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger className="h-14 rounded-2xl bg-card/50 backdrop-blur-sm border-border/40 text-lg font-bold text-center">
                  <SelectValue placeholder="Müşteri Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id} className="text-base font-medium">
                      {client.company || `${client.first_name} ${client.last_name || ''}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
           )}

           <Button
             onClick={handleToggleTimer}
             disabled={!activeEntry && !selectedClientId}
             size="icon"
             className={cn(
               "size-24 rounded-full shadow-2xl transition-all duration-500 relative overflow-hidden group active:scale-90",
               activeEntry 
                 ? "bg-destructive hover:bg-destructive/90 shadow-destructive/20" 
                 : "bg-primary hover:primary/90 shadow-primary/20"
             )}
           >
             {activeEntry ? (
               <Square className="size-8 fill-current transition-transform group-hover:scale-90" />
             ) : (
               <Play className="size-10 fill-current ml-1 transition-transform group-hover:scale-110" />
             )}
              {activeEntry && (
                <div className="absolute inset-0 rounded-full border-[6px] border-white/20 animate-ping" />
              )}
           </Button>

           <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
             {activeEntry ? 'DURDURMAK İÇİN TIKLAYIN' : 'BAŞLATMAK İÇİN SEÇİM YAPIN'}
           </p>
        </div>
      </section>

      {/* Navigation Sub-Header */}
      <div className="px-8 shrink-0">
        <div className="max-w-2xl mx-auto flex p-1 bg-muted/50 rounded-2xl border border-border/40">
           <Button
             variant={viewMode === 'entries' ? "default" : "ghost"}
             onClick={() => setViewMode('entries')}
             className="flex-1 rounded-xl gap-2 font-bold text-xs uppercase"
           >
             <History className="size-4" />
             Kayıtlar
           </Button>
           <Button
             variant={viewMode === 'stats' ? "default" : "ghost"}
             onClick={() => setViewMode('stats')}
             className="flex-1 rounded-xl gap-2 font-bold text-xs uppercase"
           >
             <BarChart2 className="size-4" />
             İstatistikler
           </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-8 py-8 mt-2">
         <div className="max-w-2xl mx-auto pb-20">
            {viewMode === 'entries' ? (
              <div className="space-y-8">
                 {sortedDates.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/40 text-center">
                      <Clock className="size-16 mb-4 opacity-20" />
                      <p className="text-sm font-bold uppercase tracking-widest">Henüz kayıt yok</p>
                   </div>
                 ) : (
                   sortedDates.map(dateKey => (
                     <div key={dateKey} className="space-y-4">
                        <div className="flex items-center justify-between">
                           <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{formatDate(groupedEntries[dateKey][0].start_time)}</h3>
                           <Badge variant="outline" className="text-xs font-bold">
                             {formatDuration(groupedEntries[dateKey].reduce((sum, e) => sum + (e.duration_seconds || 0), 0))}
                           </Badge>
                        </div>
                        <div className="space-y-2">
                           {groupedEntries[dateKey].map(entry => (
                             <Card key={entry.id} className="group border-border/40 bg-card/50 transition-all hover:border-primary/30">
                                <CardContent className="p-4 flex items-center gap-4">
                                   <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-black shrink-0">
                                      {entry.clients?.company?.[0] || entry.clients?.first_name?.[0] || '?'}
                                   </div>
                                   <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold truncate leading-tight">
                                        {entry.clients?.company || entry.clients?.first_name || 'Bilinmeyen'}
                                      </p>
                                      <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                        {formatTime(entry.start_time)} {entry.end_time && ` - ${formatTime(entry.end_time)}`}
                                      </p>
                                   </div>
                                   <div className="text-right flex items-center gap-4">
                                      <p className="text-sm font-mono font-bold">
                                        {entry.duration_seconds ? formatDuration(entry.duration_seconds) : '--'}
                                      </p>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                                        onClick={() => {
                                          if (confirm('Kayıt silinsin mi?')) deleteEntry(entry.id)
                                        }}
                                      >
                                        <X className="size-4" />
                                      </Button>
                                   </div>
                                </CardContent>
                             </Card>
                           ))}
                        </div>
                     </div>
                   ))
                 )}
              </div>
            ) : (
              <div className="space-y-8">
                 {/* Stats Period Toggle */}
                 <div className="flex justify-center gap-2">
                    {(['week', 'month', 'year'] as const).map(p => (
                      <Button
                        key={p}
                        variant={statsPeriod === p ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setStatsPeriod(p)}
                        className="text-xs font-bold uppercase rounded-lg px-4"
                      >
                        {p === 'week' ? 'Haftalık' : p === 'month' ? 'Aylık' : 'Yıllık'}
                      </Button>
                    ))}
                 </div>

                 {/* Top Summary */}
                 <div className="text-center py-8">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">TOPLAM SÜRE</p>
                    <p className="text-4xl font-bold tracking-tight">{formatDurationLong(totalPeriodSeconds)}</p>
                 </div>

                 {/* Breakdown */}
                 <div className="space-y-3">
                    {clientStats.length === 0 ? (
                      <div className="text-center py-10 opacity-30">
                        <BarChart2 className="size-12 mx-auto mb-4" />
                        <p className="text-xs font-bold uppercase tracking-widest">Veri bulunamadı</p>
                      </div>
                    ) : (
                      clientStats.map((stat, idx) => {
                         const percentage = totalPeriodSeconds > 0 ? (stat.totalSeconds / totalPeriodSeconds) * 100 : 0
                         return (
                           <Card key={stat.clientId} className="relative overflow-hidden border-border/40 bg-card/30">
                              <CardContent className="p-5 flex items-center justify-between relative z-10">
                                 <div className="flex items-center gap-4">
                                    <div className={cn(
                                       "size-8 rounded-lg flex items-center justify-center text-xs font-black",
                                       idx === 0 ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground"
                                    )}>
                                       {idx + 1}
                                    </div>
                                    <div>
                                       <p className="text-sm font-bold">{stat.name}</p>
                                       <p className="text-xs text-muted-foreground font-medium">{stat.entryCount} kayıt</p>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-sm font-mono font-bold leading-none mb-1">{formatDuration(stat.totalSeconds)}</p>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">%{percentage.toFixed(0)} Pay</p>
                                 </div>
                              </CardContent>
                              {/* Background Progress Fill */}
                              <div 
                                className="absolute inset-0 bg-primary/5 -z-0 transition-all duration-1000" 
                                style={{ width: `${percentage}%` }}
                              />
                           </Card>
                         )
                      })
                    )}
                 </div>
              </div>
            )}
         </div>
      </div>
    </div>
  )
}
