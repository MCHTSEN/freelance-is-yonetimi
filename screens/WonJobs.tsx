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
import {
    CheckCircle2,
    Clock,
    Loader2,
    MessageSquare,
    Plus,
    Search,
    Trophy
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'

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

const STATUS_CONFIG: Record<JobStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | null | undefined }> = {
  planlama: { label: 'Planlama', variant: 'secondary' },
  yapiliyor: { label: 'Yapılıyor', variant: 'default' },
  bitti: { label: 'Bitti', variant: 'outline' },
}

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

// ── Kanban Card ──
function JobCard({ job, onClick, isDragging }: { job: WonJob; onClick: () => void; isDragging?: boolean }) {
  const priorityConfig = {
    high: { variant: 'destructive' as const, label: 'Kritik' },
    medium: { variant: 'default' as const, label: 'Normal' },
    low: { variant: 'secondary' as const, label: 'Düşük' },
  }
  const priority = priorityConfig[job.priority as keyof typeof priorityConfig] || priorityConfig.medium

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative transition-all duration-300 cursor-pointer overflow-hidden border-border/80 bg-card/60 backdrop-blur-md shadow-sm",
        isDragging ? "opacity-40 scale-95" : "hover:border-primary/50 hover:shadow-2xl hover:bg-card/90"
      )}
    >
      <CardHeader className="p-5 pb-2">
        <div className="flex justify-between items-start">
          <Badge variant={priority.variant} className="text-xs font-black px-2 py-0.5 tracking-tighter uppercase">
            {priority.label}
          </Badge>
          <div className="text-xs text-muted-foreground font-bold flex items-center gap-1.5 opacity-80">
             <Clock className="size-3.5" />
             <span>{job.created_at ? new Date(job.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : '---'}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-black ring-1 ring-primary/20 shadow-inner">
            {getInitials(job)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold truncate tracking-tight text-foreground">{getClientName(job)}</h4>
            <div className="flex items-center gap-2 mt-2">
               <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden ring-1 ring-border/20">
                 <div className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" style={{ width: `${job.job_progress}%` }} />
               </div>
               <span className="text-sm text-primary font-black">{job.job_progress}%</span>
            </div>
          </div>
        </div>

        {job.last_status_note && (
           <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10 transition-colors group-hover:bg-primary/10">
              <MessageSquare className="size-3.5 mt-0.5 text-primary shrink-0 opacity-70" />
              <p className="text-[12px] text-foreground/90 line-clamp-2 italic leading-relaxed font-medium">
                {job.last_status_note}
              </p>
           </div>
        )}
      </CardContent>
    </Card>
  )
}

function SortableJobCard({ job, onClick }: { job: WonJob; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: job.id })
  const style = { transform: CSS.Translate.toString(transform), transition }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <JobCard job={job} onClick={onClick} isDragging={isDragging} />
    </div>
  )
}

// ── Column ──
function Column({ status, jobs, onJobClick, isOver }: { status: JobStatus; jobs: WonJob[]; onJobClick: (j: WonJob) => void; isOver?: boolean }) {
  const { setNodeRef } = useDroppable({ id: status })
  const config = STATUS_CONFIG[status]

  return (
    <div className="flex flex-col w-[320px] shrink-0 h-full">
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
           <div className={cn("size-2.5 rounded-full ring-4 ring-background shadow-sm", status === 'planlama' ? "bg-amber-500" : status === 'yapiliyor' ? "bg-blue-500" : "bg-emerald-500")} />
           <h3 className="font-black text-xs uppercase tracking-[0.15em] text-foreground/80">{config.label}</h3>
           <Badge variant="secondary" className="h-5 min-w-[22px] justify-center px-1 text-xs font-black bg-muted/80">
             {jobs.length}
           </Badge>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 flex flex-col gap-3 p-2 rounded-lg transition-colors duration-200 overflow-y-auto no-scrollbar",
          isOver ? "bg-accent/50 ring-1 ring-primary/20" : "bg-transparent"
        )}
      >
        <SortableContext items={jobs.map((j) => j.id)} strategy={verticalListSortingStrategy}>
          {jobs.map((job) => (
            <SortableJobCard key={job.id} job={job} onClick={() => onJobClick(job)} />
          ))}
        </SortableContext>
        
        {jobs.length === 0 && (
          <div className="flex-1 border-2 border-dashed border-muted rounded-lg flex flex-col items-center justify-center p-6 opacity-30">
            <p className="text-xs font-bold uppercase tracking-widest text-center">Aşama Boş</p>
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
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [selectedJob, setSelectedJob] = useState<WonJob | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [comments, setComments] = useState<JobComment[]>([])
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('pipeline')
      .select('*, clients(first_name, last_name, company)')
      .eq('stage', 'won')
      .order('created_at', { ascending: false })

    if (!error && data) setJobs(data as WonJob[])
    setLoading(false)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string)

  const handleDragOver = (e: DragOverEvent) => setOverId(e.over ? (e.over.id as string) : null)

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveId(null)
    setOverId(null)
    const { active, over } = e
    if (!over) return

    const job = jobs.find((j) => j.id === active.id)
    if (!job) return

    const newStatus = over.id as JobStatus
    if (job.job_status !== newStatus) {
      const { error } = await supabase.from('pipeline').update({ job_status: newStatus }).eq('id', job.id)
      if (!error) {
        setJobs(jobs.map((j) => (j.id === job.id ? { ...j, job_status: newStatus } : j)))
      }
    }
  }

  const handleJobClick = async (job: WonJob) => {
    setSelectedJob(job)
    setShowDetailModal(true)
    fetchComments(job.id)
  }

  const fetchComments = async (jobId: string) => {
    const { data } = await supabase.from('job_comments').select('*').eq('pipeline_id', jobId).order('created_at', { ascending: false })
    if (data) setComments(data)
  }

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedJob || !newComment.trim()) return
    const { data, error } = await supabase
      .from('job_comments')
      .insert({ pipeline_id: selectedJob.id, content: newComment })
      .select()
      .single()

    if (!error && data) {
      setComments([data, ...comments])
      setNewComment('')
      // Update last status note for UI immediate feedback
      setJobs(jobs.map(j => j.id === selectedJob.id ? { ...j, last_status_note: newComment } : j))
      // Also update in DB
      await supabase.from('pipeline').update({ last_status_note: newComment }).eq('id', selectedJob.id)
    }
  }

  const updateProgress = async (val: number) => {
    if (!selectedJob) return
    const { error } = await supabase.from('pipeline').update({ job_progress: val }).eq('id', selectedJob.id)
    if (!error) {
      setJobs(jobs.map(j => j.id === selectedJob.id ? { ...j, job_progress: val } : j))
      setSelectedJob({ ...selectedJob, job_progress: val })
    }
  }

  const filteredJobs = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return jobs.filter(j => 
       getClientName(j).toLowerCase().includes(q) || 
       j.notes?.toLowerCase().includes(q)
    )
  }, [jobs, searchQuery])

  const activeJob = activeId ? jobs.find((j) => j.id === activeId) : null

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden px-6 py-6 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-black tracking-[0.2em] shadow-sm">
            <Trophy className="size-5" />
            <span className="text-xs uppercase">Aktif Projeler</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">Başarılarım</h1>
          <p className="text-muted-foreground text-base max-w-lg leading-relaxed">Kazandığınız işlerin ilerleyişini yönetin.</p>
        </div>

        <div className="flex items-center gap-4">
           {/* Summary Stats */}
           <div className="flex gap-3">
              <Card className="p-3 w-32 border-border/40 bg-card/50">
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tamamlanan</p>
                 <div className="flex items-center gap-2 mt-1">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <span className="text-xl font-bold">{jobs.filter(j => j.job_status === 'bitti').length}</span>
                 </div>
              </Card>
           </div>
           
           <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Proje ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-40 md:w-60 h-10"
              />
           </div>
        </div>
      </header>

      {/* Board */}
      <div className="flex-1 overflow-x-auto pb-6 custom-scrollbar">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 min-w-full h-full">
            {(['planlama', 'yapiliyor', 'bitti'] as JobStatus[]).map((status) => (
              <Column
                key={status}
                status={status}
                jobs={filteredJobs.filter((j) => j.job_status === status)}
                onJobClick={handleJobClick}
                isOver={overId === status}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeJob ? (
              <div className="rotate-3 scale-105 pointer-events-none opacity-90 drop-shadow-xl">
                <JobCard job={activeJob} onClick={() => {}} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
             <div className="flex items-center gap-3 mb-2">
                <Badge variant={selectedJob?.priority === 'high' ? 'destructive' : 'default'}>
                   {selectedJob?.priority === 'high' ? 'Kritik' : 'Normal'}
                </Badge>
                <div className="size-1.5 rounded-full bg-border" />
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Proje Detayları</span>
             </div>
             <DialogTitle className="text-2xl">{selectedJob ? getClientName(selectedJob) : ''}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
             {/* Progress Controls */}
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <Label className="text-sm">İlerleme Durumu</Label>
                   <span className="text-2xl font-black text-primary">{selectedJob?.job_progress}%</span>
                </div>
                <div className="flex gap-2">
                   {[0, 25, 50, 75, 100].map((v) => (
                      <Button
                        key={v}
                        variant={selectedJob?.job_progress === v ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateProgress(v)}
                        className="flex-1 h-10 text-xs font-bold uppercase"
                      >
                         {v}%
                      </Button>
                   ))}
                </div>
             </div>

             {/* Comments / Status Updates */}
             <div className="space-y-4">
                <div className="flex items-center gap-2">
                   <MessageSquare className="size-4 text-primary" />
                   <h4 className="font-bold text-sm uppercase tracking-wider">Durum Notları</h4>
                </div>
                
                <form onSubmit={addComment} className="flex gap-2">
                   <Input
                      placeholder="Güncelleme notu ekleyin..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1"
                   />
                   <Button type="submit" size="icon">
                      <Plus className="size-4" />
                   </Button>
                </form>

                <div className="space-y-3">
                   {comments.map((c) => (
                      <div key={c.id} className="p-3 bg-muted/40 rounded-xl border border-border/40 relative group">
                         <p className="text-sm leading-relaxed">{c.content}</p>
                         <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-tight">
                               {new Date(c.created_at).toLocaleString('tr-TR')}
                            </span>
                         </div>
                      </div>
                   ))}
                   {comments.length === 0 && (
                      <div className="text-center py-6 opacity-30 italic text-sm">Henüz not eklenmemiş.</div>
                   )}
                </div>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
