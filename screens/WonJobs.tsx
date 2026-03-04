import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useMemo, useState } from 'react'
import Modal from '../components/Modal'
import { supabase } from '../lib/supabase'

type JobStatus = 'planlama' | 'yapiliyor' | 'bitti'

interface JobComment {
  id: string
  content: string
  created_at: string
}

interface WonJob {
  id: string
  client_id: string | null
  stage: string
  priority: string | null
  notes: string | null
  job_status: JobStatus
  job_progress: number
  last_status_note: string | null
  created_at: string | null
  clients: {
    first_name: string
    last_name: string | null
    company: string | null
  } | null
}

const STATUS_CONFIG: Record<JobStatus, { label: string; icon: string; color: string; dot: string }> = {
  planlama: { label: 'Planlama', icon: 'draft', color: 'text-amber-400', dot: 'bg-amber-500' },
  yapiliyor: { label: 'Yapılıyor', icon: 'pending', color: 'text-blue-400', dot: 'bg-blue-500' },
  bitti: { label: 'Bitti', icon: 'check_circle', color: 'text-emerald-400', dot: 'bg-emerald-500' },
}

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }

const getClientName = (job: WonJob) => {
  if (!job.clients) return 'İsimsiz'
  return job.clients.company
    ? `${job.clients.first_name} (${job.clients.company})`
    : `${job.clients.first_name} ${job.clients.last_name || ''}`
}

const getInitials = (job: WonJob) => {
  if (!job.clients) return '??'
  return job.clients.company
    ? `${job.clients.first_name[0]}${job.clients.company[0]}`
    : `${job.clients.first_name[0]}${job.clients.last_name?.[0] || ''}`.toUpperCase()
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

// ── Kanban Card ──
function JobCard({ job, onClick, isDragging }: { job: WonJob; onClick: () => void; isDragging?: boolean }) {
  const priorityConfig: Record<string, { color: string; label: string; dot: string }> = {
    high: { color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', label: 'Yüksek', dot: 'bg-rose-500' },
    medium: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Orta', dot: 'bg-amber-500' },
    low: { color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: 'Düşük', dot: 'bg-slate-400' },
  }
  const priority = priorityConfig[job.priority || 'medium'] || priorityConfig.medium

  return (
    <div
      onClick={onClick}
      className={`group relative bg-surface-lighter border border-white/10 p-5 rounded-2xl shadow-premium transition-all duration-300 cursor-pointer ${
        isDragging ? 'opacity-40 scale-95' : 'hover:scale-[1.02] hover:bg-surface-lighter/80 hover:border-primary/50'
      }`}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Priority */}
      <div className="mb-3 relative z-10">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${priority.color}`}>
          <span className={`size-1.5 rounded-full ${priority.dot}`} />
          {priority.label}
        </div>
      </div>

      {/* Client */}
      <div className="flex items-center gap-3 mb-3 relative z-10">
        <div className="size-10 rounded-xl bg-gradient-to-br from-primary/20 to-indigo-500/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-inner text-sm">
          {getInitials(job)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-[15px] truncate tracking-tight">{getClientName(job)}</h4>
        </div>
      </div>

      {/* Son Durum */}
      {job.last_status_note && (
        <p className="text-slate-400 text-sm mb-3 line-clamp-2 italic font-light relative z-10">
          "{job.last_status_note}"
        </p>
      )}

      {/* Progress bar for yapiliyor */}
      {job.job_status === 'yapiliyor' && (
        <div className="flex items-center gap-2 border-t border-glass-border pt-3 relative z-10">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${job.job_progress}%` }} />
          </div>
          <span className="text-[11px] text-slate-400 font-mono">%{job.job_progress}</span>
        </div>
      )}
    </div>
  )
}

// ── Sortable Card Wrapper ──
function SortableJobCard({ job, onClick }: { job: WonJob; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: job.id })
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 100 : 1 }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
      <JobCard job={job} onClick={onClick} isDragging={isDragging} />
    </div>
  )
}

// ── Droppable Column ──
function JobColumn({
  status,
  jobs,
  onCardClick,
  isOver,
}: {
  status: JobStatus
  jobs: WonJob[]
  onCardClick: (job: WonJob) => void
  isOver: boolean
}) {
  const config = STATUS_CONFIG[status]
  const { setNodeRef } = useDroppable({ id: status })

  return (
    <div className="flex flex-col w-[340px] shrink-0 h-full">
      <div className="flex items-center gap-3 mb-6 px-1">
        <div className={`size-2 rounded-full ${config.dot} shadow-[0_0_8px_rgba(99,102,241,0.6)]`} />
        <h3 className="font-bold text-sm text-slate-300 uppercase tracking-[0.1em]">{config.label}</h3>
        <span className="text-[10px] text-slate-500 font-mono bg-white/5 px-2 py-0.5 rounded-full">{jobs.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar rounded-3xl p-3 transition-all duration-300 border-2 border-transparent ${
          isOver ? 'bg-primary/5 border-primary/20 scale-[0.99] border-dashed shadow-inner' : 'bg-transparent'
        }`}
      >
        <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
          {jobs.map(job => (
            <SortableJobCard key={job.id} job={job} onClick={() => onCardClick(job)} />
          ))}
        </SortableContext>

        {jobs.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-10 opacity-20">
            <div className="size-16 rounded-3xl border-2 border-dashed border-slate-500 flex items-center justify-center mb-4">
              <span className="material-symbols-rounded text-3xl">{config.icon}</span>
            </div>
            <p className="text-xs font-medium uppercase tracking-widest text-center">Boş</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Component ──
export default function WonJobs() {
  const [jobs, setJobs] = useState<WonJob[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  // Detail modal state
  const [selectedJob, setSelectedJob] = useState<WonJob | null>(null)
  const [comments, setComments] = useState<JobComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [editingNote, setEditingNote] = useState(false)
  const [noteValue, setNoteValue] = useState('')
  const [progressValue, setProgressValue] = useState(0)
  const [editingProgress, setEditingProgress] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('pipeline')
      .select('id, client_id, stage, priority, notes, job_status, job_progress, last_status_note, created_at, clients(first_name, last_name, company)')
      .in('stage', ['won', 'completed'])
      .order('created_at', { ascending: false })

    if (!error && data) {
      setJobs(data as unknown as WonJob[])
    }
    setLoading(false)
  }

  useEffect(() => { fetchJobs() }, [])

  // Sort jobs by priority within each column
  const getJobsByStatus = (status: JobStatus) =>
    jobs
      .filter(j => (j.job_status || 'planlama') === status)
      .sort((a, b) => (PRIORITY_ORDER[a.priority || 'medium'] ?? 1) - (PRIORITY_ORDER[b.priority || 'medium'] ?? 1))

  const activeItem = useMemo(() => jobs.find(j => j.id === activeId), [activeId, jobs])

  // ── Drag handlers ──
  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string)

  const handleDragOver = (e: DragOverEvent) => {
    const { over } = e
    if (!over) { setOverId(null); return }
    const statuses = Object.keys(STATUS_CONFIG) as JobStatus[]
    if (statuses.includes(over.id as JobStatus)) {
      setOverId(over.id as string)
    } else {
      const overJob = jobs.find(j => j.id === over.id)
      if (overJob) setOverId(overJob.job_status || 'planlama')
    }
  }

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e
    setActiveId(null)
    setOverId(null)
    if (!over) return

    const draggedJob = jobs.find(j => j.id === active.id)
    if (!draggedJob) return

    let targetStatus: JobStatus | null = null
    const statuses = Object.keys(STATUS_CONFIG) as JobStatus[]

    if (statuses.includes(over.id as JobStatus)) {
      targetStatus = over.id as JobStatus
    } else {
      const overJob = jobs.find(j => j.id === over.id)
      if (overJob) targetStatus = (overJob.job_status || 'planlama') as JobStatus
    }

    if (targetStatus && (draggedJob.job_status || 'planlama') !== targetStatus) {
      const progress = targetStatus === 'bitti' ? 100 : targetStatus === 'planlama' ? 0 : draggedJob.job_progress
      await supabase.from('pipeline').update({ job_status: targetStatus, job_progress: progress }).eq('id', draggedJob.id)
      setJobs(prev => prev.map(j => j.id === draggedJob.id ? { ...j, job_status: targetStatus!, job_progress: progress } : j))
    }
  }

  // ── Detail modal actions ──
  const openDetail = async (job: WonJob) => {
    setSelectedJob(job)
    setNoteValue(job.last_status_note || '')
    setProgressValue(job.job_progress)
    setEditingNote(false)
    setEditingProgress(false)
    setNewComment('')

    const { data } = await supabase
      .from('job_comments')
      .select('id, content, created_at')
      .eq('pipeline_id', job.id)
      .order('created_at', { ascending: false })

    setComments(data || [])
  }

  const closeDetail = () => {
    setSelectedJob(null)
    setComments([])
    setEditingNote(false)
    setEditingProgress(false)
  }

  const addComment = async () => {
    if (!newComment.trim() || !selectedJob) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('job_comments')
      .insert({ pipeline_id: selectedJob.id, user_id: user.id, content: newComment.trim() })
      .select('id, content, created_at')
      .single()

    if (!error && data) {
      setComments(prev => [data, ...prev])
      setNewComment('')
    }
  }

  const deleteComment = async (commentId: string) => {
    await supabase.from('job_comments').delete().eq('id', commentId)
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  const saveLastNote = async () => {
    if (!selectedJob) return
    await supabase.from('pipeline').update({ last_status_note: noteValue }).eq('id', selectedJob.id)
    setJobs(prev => prev.map(j => j.id === selectedJob.id ? { ...j, last_status_note: noteValue } : j))
    setSelectedJob(prev => prev ? { ...prev, last_status_note: noteValue } : null)
    setEditingNote(false)
  }

  const saveProgress = async () => {
    if (!selectedJob) return
    await supabase.from('pipeline').update({ job_progress: progressValue }).eq('id', selectedJob.id)
    setJobs(prev => prev.map(j => j.id === selectedJob.id ? { ...j, job_progress: progressValue } : j))
    setSelectedJob(prev => prev ? { ...prev, job_progress: progressValue } : null)
    setEditingProgress(false)
  }

  const changeStatusInModal = async (status: JobStatus) => {
    if (!selectedJob) return
    const progress = status === 'bitti' ? 100 : status === 'planlama' ? 0 : selectedJob.job_progress
    await supabase.from('pipeline').update({ job_status: status, job_progress: progress }).eq('id', selectedJob.id)
    setJobs(prev => prev.map(j => j.id === selectedJob.id ? { ...j, job_status: status, job_progress: progress } : j))
    setSelectedJob(prev => prev ? { ...prev, job_status: status, job_progress: progress } : null)
    setProgressValue(progress)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-6">
          <div className="size-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-slate-400 font-medium tracking-widest uppercase text-xs">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full h-full bg-transparent overflow-hidden px-8 py-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-12 shrink-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="material-symbols-rounded text-primary">task_alt</span>
            <span className="text-primary text-[10px] uppercase font-black tracking-[0.2em]">Proje Takibi</span>
          </div>
          <h1 className="text-white text-5xl font-black leading-none tracking-[-0.05em]">Kazanılan İşler</h1>
          <p className="text-slate-500 text-base font-light max-w-lg mt-2">
            Kazanılan projelerin durumunu takip edin ve yönetin.
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* Stats */}
          {(Object.keys(STATUS_CONFIG) as JobStatus[]).map(s => {
            const count = getJobsByStatus(s).length
            const cfg = STATUS_CONFIG[s]
            return (
              <div key={s} className="h-24 w-32 bg-white/5 border border-white/10 rounded-[1.5rem] p-4 flex flex-col justify-between relative group hover:border-white/20 transition-all shadow-xl overflow-hidden">
                <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
                <p className="text-white text-2xl font-black leading-none">{count}</p>
              </div>
            )
          })}
        </div>
      </header>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-8 custom-scrollbar">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-8 min-w-full h-full pb-4">
            {(Object.keys(STATUS_CONFIG) as JobStatus[]).map(status => (
              <JobColumn
                key={status}
                status={status}
                jobs={getJobsByStatus(status)}
                onCardClick={openDetail}
                isOver={overId === status}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeItem ? (
              <div className="rotate-3 scale-105 pointer-events-none drop-shadow-2xl">
                <JobCard job={activeItem} onClick={() => {}} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedJob}
        onClose={closeDetail}
        title={selectedJob ? getClientName(selectedJob) : ''}
      >
        {selectedJob && (
          <div className="space-y-5">
            {/* Status selector */}
            <div>
              <span className="text-xs text-text-secondary block mb-2">Durum</span>
              <div className="flex gap-2">
                {(Object.keys(STATUS_CONFIG) as JobStatus[]).map(s => {
                  const cfg = STATUS_CONFIG[s]
                  const active = selectedJob.job_status === s
                  return (
                    <button
                      key={s}
                      onClick={() => changeStatusInModal(s)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        active
                          ? `${cfg.color} bg-white/10 border-white/20`
                          : 'text-slate-500 border-white/5 hover:border-white/15 hover:text-slate-300'
                      }`}
                    >
                      <span className={`size-2 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Progress (only for yapiliyor) */}
            {selectedJob.job_status === 'yapiliyor' && (
              <div>
                <span className="text-xs text-text-secondary block mb-2">İlerleme</span>
                {editingProgress ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0} max={100} step={5}
                      value={progressValue}
                      onChange={e => setProgressValue(Number(e.target.value))}
                      className="flex-1 accent-blue-500"
                    />
                    <span className="text-sm text-white font-mono w-10">%{progressValue}</span>
                    <button onClick={saveProgress} className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-xs font-medium hover:bg-primary/30">Kaydet</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setEditingProgress(true); setProgressValue(selectedJob.job_progress) }}>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${selectedJob.job_progress}%` }} />
                    </div>
                    <span className="text-sm text-blue-400 font-mono">%{selectedJob.job_progress}</span>
                    <span className="material-symbols-rounded text-slate-500 text-sm">edit</span>
                  </div>
                )}
              </div>
            )}

            {/* Son Durum */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-secondary">Son Durum</span>
                {!editingNote && (
                  <button onClick={() => { setEditingNote(true); setNoteValue(selectedJob.last_status_note || '') }} className="text-slate-500 hover:text-white transition-colors">
                    <span className="material-symbols-rounded text-sm">edit</span>
                  </button>
                )}
              </div>
              {editingNote ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={noteValue}
                    onChange={e => setNoteValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveLastNote()}
                    placeholder="Son durum notu..."
                    className="flex-1 bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary"
                    autoFocus
                  />
                  <button onClick={saveLastNote} className="px-3 py-2 bg-primary/20 text-primary rounded-xl text-xs font-medium hover:bg-primary/30">Kaydet</button>
                  <button onClick={() => setEditingNote(false)} className="px-3 py-2 text-slate-500 rounded-xl text-xs hover:text-white">İptal</button>
                </div>
              ) : (
                <p className="text-sm text-white/70 bg-background-dark/50 rounded-xl px-4 py-3 border border-white/5">
                  {selectedJob.last_status_note || <span className="text-slate-600 italic">Henüz not eklenmedi</span>}
                </p>
              )}
            </div>

            {/* Comments */}
            <div>
              <span className="text-xs text-text-secondary block mb-2">
                Yorumlar {comments.length > 0 && `(${comments.length})`}
              </span>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addComment()}
                  placeholder="Yorum ekle..."
                  className="flex-1 bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary"
                />
                <button
                  onClick={addComment}
                  className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-colors font-medium"
                >
                  Gönder
                </button>
              </div>

              {comments.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                  {comments.map(c => (
                    <div key={c.id} className="flex items-start gap-2 group">
                      <div className="flex-1 bg-background-dark/50 rounded-xl px-4 py-2.5 border border-white/5">
                        <p className="text-sm text-white/80">{c.content}</p>
                        <span className="text-[10px] text-slate-600 mt-1 block">{formatDate(c.created_at)}</span>
                      </div>
                      <button
                        onClick={() => deleteComment(c.id)}
                        className="p-1.5 text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1"
                      >
                        <span className="material-symbols-rounded text-sm">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
