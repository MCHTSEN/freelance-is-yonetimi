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
    Calendar as CalendarIcon,
    CheckCircle2,
    Clock,
    FileEdit,
    Loader2,
    Plus,
    Rocket,
    Search,
    TrendingUp,
    Video
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ClientForm from '../components/ClientForm'
import PipelineForm from '../components/PipelineForm'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select'
import { useClients } from '../hooks/useClients'
import { PipelineStage, PipelineWithClient, SALES_STAGES, STAGE_CONFIG, usePipeline } from '../hooks/usePipeline'
import type { Client } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'

// Type for upcoming meeting display
interface UpcomingMeeting {
  id: string;
  client_id: string | null;
  client_name: string;
  scheduled_at: string;
  duration_minutes: number;
  notes: string | null;
}

// Kanban Card Component
interface KanbanCardProps {
  item: PipelineWithClient
  onDelete: () => void
  onEdit: () => void
  onAddMeeting: () => void
  onAddNote: () => void
  isDragging?: boolean
  upcomingMeeting?: UpcomingMeeting | null
}

function KanbanCard({ item, onDelete, onEdit, onAddMeeting, onAddNote, isDragging, upcomingMeeting }: KanbanCardProps) {
  const clientName = item.clients
    ? item.clients.company
      ? `${item.clients.first_name} (${item.clients.company})`
      : `${item.clients.first_name} ${item.clients.last_name || ''}`
    : 'İsimsiz Müşteri'

  const initials = item.clients
    ? item.clients.company
      ? `${item.clients.first_name[0]}${item.clients.company[0]}`
      : `${item.clients.first_name[0]}${item.clients.last_name?.[0] || ''}`.toUpperCase()
    : '??'

  const priorityConfig = {
    high: { variant: 'destructive' as const, label: 'Yüksek' },
    medium: { variant: 'default' as const, label: 'Orta' },
    low: { variant: 'secondary' as const, label: 'Düşük' },
  }

  const priority = priorityConfig[item.priority as keyof typeof priorityConfig] || priorityConfig.medium

  const formatCurrency = (value: number | null) => {
    if (!value) return null
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value)
  }

  return (
    <Card
      onClick={onEdit}
      className={cn(
        "group relative transition-all duration-300 cursor-pointer overflow-hidden border-border/80 bg-card/60 backdrop-blur-md",
        isDragging ? "opacity-40 scale-95" : "hover:border-primary/50 hover:shadow-2xl hover:bg-card/90"
      )}
    >
      <CardHeader className="p-5 pb-2">
        <div className="flex justify-between items-start">
          <Badge variant={priority.variant} className="text-xs font-bold px-2 py-0.5">
            {priority.label}
          </Badge>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={(e) => { e.stopPropagation(); onAddMeeting(); }}
            >
              <Video className="h-4 w-4 text-primary" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={(e) => { e.stopPropagation(); onAddNote(); }}
            >
              <FileEdit className="h-4 w-4 text-primary" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-black ring-1 ring-primary/20">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold truncate tracking-tight">{clientName}</h4>
            {item.estimated_value && (
              <p className="text-xs text-primary font-bold mt-0.5">{formatCurrency(item.estimated_value)}</p>
            )}
          </div>
        </div>
        
        {item.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-90 border-l-2 border-primary/20 pl-2">
            {item.notes}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border/60">
          {upcomingMeeting ? (
            <div className="flex items-center gap-1.5 text-primary text-xs font-bold">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {new Date(upcomingMeeting.scheduled_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} • {new Date(upcomingMeeting.scheduled_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>{item.follow_up_date ? new Date(item.follow_up_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : 'Takip yok'}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
             <div className="size-1.5 rounded-full bg-primary animate-pulse" />
             <span className="text-xs font-black uppercase text-primary/60 tracking-tighter">{item.id.slice(-4)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SortableCard(props: KanbanCardProps) {
  const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
  } = useSortable({ id: props.item.id })

  const style = {
      transform: CSS.Translate.toString(transform),
      transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCard {...props} isDragging={isDragging} />
    </div>
  )
}

// Column Component
interface ColumnProps {
  stage: PipelineStage
  title: string
  items: PipelineWithClient[]
  onAddCard: () => void
  onDeleteCard: (id: string) => void
  onEditCard: (item: PipelineWithClient) => void
  onAddMeeting: (item: PipelineWithClient) => void
  onAddNote: (item: PipelineWithClient) => void
  isOver?: boolean
  clientMeetings: Map<string, UpcomingMeeting>
}

function Column({ stage, title, items, onAddCard, onDeleteCard, onEditCard, onAddMeeting, onAddNote, isOver, clientMeetings }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: stage,
  })

  return (
    <div className="flex flex-col w-[300px] shrink-0 h-full">
      <div className="flex items-center justify-between mb-6 px-3">
        <div className="flex items-center gap-3">
           <div className={cn("size-2.5 rounded-full ring-4 ring-background shadow-sm", stage === 'lead' ? "bg-amber-500" : stage === 'proposal' ? "bg-blue-500" : "bg-emerald-500")} />
           <h3 className="font-black text-xs uppercase tracking-[0.15em] text-foreground/80">{title}</h3>
           <Badge variant="secondary" className="h-5 min-w-[22px] justify-center px-1 text-xs font-black bg-muted/80">
             {items.length}
           </Badge>
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 rounded-lg shadow-sm border-border/40 hover:bg-primary/10 hover:text-primary transition-all"
          onClick={onAddCard}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 flex flex-col gap-3 p-2 rounded-lg transition-colors duration-200 overflow-y-auto no-scrollbar",
          isOver ? "bg-accent/50 ring-1 ring-primary/20" : "bg-transparent"
        )}
      >
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableCard
              key={item.id}
              item={item}
              onDelete={() => onDeleteCard(item.id)}
              onEdit={() => onEditCard(item)}
              onAddMeeting={() => onAddMeeting(item)}
              onAddNote={() => onAddNote(item)}
              upcomingMeeting={item.client_id ? clientMeetings.get(item.client_id) : undefined}
            />
          ))}
        </SortableContext>
        
        {items.length === 0 && (
          <div className="flex-1 border-2 border-dashed border-muted rounded-lg flex flex-col items-center justify-center p-6 opacity-30">
            <p className="text-xs font-bold uppercase tracking-widest text-center">Aşama Boş</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SalesKanban() {
  const { items, loading, updateItem, moveItem, deleteItem, addItem } = usePipeline()
  const { clients, loading: clientsLoading, addClient } = useClients()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modals state
  const [showPipelineModal, setShowPipelineModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showClientModal, setShowClientModal] = useState(false)
  const [selectedStage, setSelectedStage] = useState<PipelineStage>('lead')
  const [editingItem, setEditingItem] = useState<PipelineWithClient | null>(null)
  const [preselectedClient, setPreselectedClient] = useState<Client | null>(null)

  // Quick Meeting Modal state
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [meetingItem, setMeetingItem] = useState<PipelineWithClient | null>(null)
  const [meetingFormData, setMeetingFormData] = useState({
    scheduled_at: '',
    duration_minutes: 30,
    notes: ''
  })

  // Quick Note Modal state
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [noteItem, setNoteItem] = useState<PipelineWithClient | null>(null)
  const [noteContent, setNoteContent] = useState('')

  // Meetings cache for badges/info
  const [clientMeetings, setClientMeetings] = useState<Map<string, UpcomingMeeting>>(new Map())
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>([])

  useEffect(() => {
    fetchUpcomingMeetings()
  }, [])

  const fetchUpcomingMeetings = async () => {
    const now = new Date().toISOString()
    const { data } = await supabase
      .from('meetings')
      .select('*, clients(first_name, last_name)')
      .gte('scheduled_at', now)
      .eq('status', 'scheduled')
      .order('scheduled_at', { ascending: true })

    if (data) {
      const meetingsMap = new Map()
      const list: UpcomingMeeting[] = []
      data.forEach(m => {
        const meeting = {
          id: m.id,
          client_id: m.client_id,
          client_name: m.clients ? `${m.clients.first_name} ${m.clients.last_name}` : 'Bilinmeyen',
          scheduled_at: m.scheduled_at,
          duration_minutes: m.duration_minutes,
          notes: m.notes
        }
        if (m.client_id && !meetingsMap.has(m.client_id)) {
          meetingsMap.set(m.client_id, meeting)
        }
        list.push(meeting)
      })
      setClientMeetings(meetingsMap)
      setUpcomingMeetings(list)
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const getItemsByStage = (stage: PipelineStage) => {
    return items.filter((item) => item.stage === stage)
  }

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items
    const query = searchQuery.toLowerCase()
    return items.filter(item => {
      const clientName = item.clients 
        ? `${item.clients.first_name} ${item.clients.last_name} ${item.clients.company || ''}`.toLowerCase()
        : ''
      return clientName.includes(query) || item.notes?.toLowerCase().includes(query)
    })
  }, [items, searchQuery])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    setOverId(over ? (over.id as string) : null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setOverId(null)

    if (!over) return

    const activeItem = items.find((item) => item.id === active.id)
    if (!activeItem) return

    const newStage = over.id as PipelineStage
    
    // Only update if stage changed
    if (activeItem.stage !== newStage) {
        await moveItem(active.id as string, newStage)
    }
  }

  const handleAddPipeline = (stage: PipelineStage) => {
    setSelectedStage(stage)
    setShowPipelineModal(true)
  }

  const handlePipelineSubmit = async (data: any) => {
    await addItem(data)
    setShowPipelineModal(false)
    setPreselectedClient(null)
  }

  const handleClientSubmit = async (data: any) => {
    const newClient = await addClient(data)
    if (newClient) {
      setPreselectedClient(newClient)
      setShowClientModal(false)
      setShowPipelineModal(true)
    }
  }

  const handleOpenClientModal = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowPipelineModal(false)
    setShowClientModal(true)
  }

  const handleEditCard = (item: PipelineWithClient) => {
    setEditingItem(item)
    setShowEditModal(true)
  }

  const handleAddMeeting = (item: PipelineWithClient) => {
    setMeetingItem(item)
    setMeetingFormData({
      scheduled_at: new Date().toISOString().split('T')[0] + 'T10:00',
      duration_minutes: 30,
      notes: ''
    })
    setShowMeetingModal(true)
  }

  const handleMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!meetingItem?.client_id) return

    const { error } = await supabase.from('meetings').insert({
      client_id: meetingItem.client_id,
      scheduled_at: meetingFormData.scheduled_at,
      duration_minutes: meetingFormData.duration_minutes,
      notes: `Pipeline'dan oluşturuldu. ${meetingItem.notes || ''}`,
      status: 'scheduled'
    })

    if (!error) {
      setShowMeetingModal(false)
      fetchUpcomingMeetings()
    }
  }

  const handleAddNote = (item: PipelineWithClient) => {
    setNoteItem(item)
    setNoteContent(item.notes || '')
    setShowNoteModal(true)
  }

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteItem) return

    await updateItem(noteItem.id, { notes: noteContent })
    setShowNoteModal(false)
  }

  const activeItem = useMemo(() => 
    activeId ? items.find(i => i.id === activeId) : null
  , [activeId, items])

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
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold tracking-tight">
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs uppercase tracking-[0.2em]">Pipeline</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Satış Süreci</h1>
          <p className="text-muted-foreground text-sm">
            Potansiyel fırsatlarınızı yönetin ve takip edin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Stats Summary */}
          <div className="flex gap-3">
            <Card className="p-3 w-32 border-border/40 bg-card/50">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Aktif</p>
              <div className="flex items-center gap-2 mt-1">
                <Rocket className="h-4 w-4 text-primary" />
                <span className="text-xl font-bold">{items.length}</span>
              </div>
            </Card>

            {upcomingMeetings.length > 0 && (
              <Card className="p-3 w-40 border-border/40 bg-card/50">
                <p className="text-xs font-bold text-primary uppercase tracking-widest">Sıradaki</p>
                <div className="flex items-center gap-2 mt-1 min-w-0">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold truncate">{upcomingMeetings[0].client_name}</span>
                </div>
              </Card>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-40 md:w-60 h-10"
              />
            </div>
            <Button onClick={() => handleAddPipeline('lead')} className="h-10">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Fırsat
            </Button>
          </div>
        </div>
      </header>

      {/* Main Board Container */}
      <div className="flex-1 overflow-x-auto pb-6 custom-scrollbar">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 min-w-full h-full">
            {SALES_STAGES.map((stage) => {
              const config = STAGE_CONFIG[stage]
              const stageItems = searchQuery
                ? filteredItems.filter(i => i.stage === stage)
                : getItemsByStage(stage)

              return (
                <Column
                  key={stage}
                  stage={stage}
                  title={config.title}
                  items={stageItems}
                  onAddCard={() => handleAddPipeline(stage)}
                  onDeleteCard={deleteItem}
                  onEditCard={handleEditCard}
                  onAddMeeting={handleAddMeeting}
                  onAddNote={handleAddNote}
                  isOver={overId === stage}
                  clientMeetings={clientMeetings}
                />
              )
            })}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeItem ? (
              <div className="rotate-3 scale-105 pointer-events-none opacity-90 drop-shadow-xl">
                <KanbanCard item={activeItem} onDelete={() => {}} onEdit={() => {}} onAddMeeting={() => {}} onAddNote={() => {}} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Pipeline Modal */}
      <Dialog 
        open={showPipelineModal} 
        onOpenChange={(open) => {
          if (!open) {
            setShowPipelineModal(false)
            setPreselectedClient(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Yeni Pipeline Kartı</DialogTitle>
          </DialogHeader>
          <PipelineForm
            clients={clients}
            onSubmit={handlePipelineSubmit}
            onCancel={() => {
              setShowPipelineModal(false)
              setPreselectedClient(null)
            }}
            onAddClient={handleOpenClientModal}
            initialStage={selectedStage}
            preselectedClientId={preselectedClient?.id}
          />
        </DialogContent>
      </Dialog>

      {/* Client Modal */}
      <Dialog open={showClientModal} onOpenChange={setShowClientModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Yeni Müşteri</DialogTitle>
          </DialogHeader>
          <ClientForm
            onSubmit={handleClientSubmit}
            onCancel={() => setShowClientModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog 
        open={showEditModal} 
        onOpenChange={(open) => {
          if (!open) {
            setShowEditModal(false)
            setEditingItem(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Kartı Düzenle</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <PipelineForm
              clients={clients}
              onSubmit={async (data) => {
                await updateItem(editingItem.id, data)
                setShowEditModal(false)
                setEditingItem(null)
              }}
              onCancel={() => { setShowEditModal(false); setEditingItem(null) }}
              onAddClient={handleOpenClientModal}
              initialStage={editingItem.stage as PipelineStage}
              preselectedClientId={editingItem.client_id || undefined}
              editMode
              initialData={{
                estimated_value: editingItem.estimated_value?.toString() || '',
                follow_up_date: editingItem.follow_up_date || '',
                priority: editingItem.priority || 'medium',
                notes: editingItem.notes || '',
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Meeting Modal */}
      <Dialog 
        open={showMeetingModal} 
        onOpenChange={(open) => {
          if (!open) {
            setShowMeetingModal(false)
            setMeetingItem(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Toplantı Oluştur</DialogTitle>
            <DialogDescription>
              {meetingItem?.clients ? `${meetingItem.clients.first_name} ${meetingItem.clients.last_name}` : ''} için hızlı toplantı planlayın.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleMeetingSubmit(e);
            }}
            className="space-y-4 pt-4"
          >
            <div className="space-y-2">
              <Label>Tarih</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {[
                  { label: 'Bugün', date: new Date() },
                  { label: 'Yarın', date: new Date(Date.now() + 86400000) },
                ].map(({ label, date }) => {
                  const dateStr = date.toISOString().split('T')[0]
                  const isSelected = meetingFormData.scheduled_at.startsWith(dateStr)
                  return (
                    <Button
                      key={label}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const currentTime = meetingFormData.scheduled_at.split('T')[1] || '10:00'
                        setMeetingFormData(prev => ({ ...prev, scheduled_at: `${dateStr}T${currentTime}` }))
                      }}
                      className="text-xs h-7 px-3 uppercase font-bold"
                    >
                      {label}
                    </Button>
                  )
                })}
              </div>
              <Input
                type="date"
                value={meetingFormData.scheduled_at.split('T')[0] || ''}
                onChange={(e) => {
                  const currentTime = meetingFormData.scheduled_at.split('T')[1] || '10:00'
                  setMeetingFormData(prev => ({ ...prev, scheduled_at: `${e.target.value}T${currentTime}` }))
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Saat</Label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map(time => {
                  const isSelected = meetingFormData.scheduled_at.includes(`T${time}`)
                  return (
                    <Button
                      key={time}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const currentDate = meetingFormData.scheduled_at.split('T')[0] || new Date().toISOString().split('T')[0]
                        setMeetingFormData(prev => ({ ...prev, scheduled_at: `${currentDate}T${time}` }))
                      }}
                      className="text-xs h-7 px-0 uppercase font-bold"
                    >
                      {time}
                    </Button>
                  )
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Süre</Label>
              <Select
                value={meetingFormData.duration_minutes.toString()}
                onValueChange={(val) => setMeetingFormData(prev => ({ ...prev, duration_minutes: Number(val) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 dakika</SelectItem>
                  <SelectItem value="30">30 dakika</SelectItem>
                  <SelectItem value="60">1 saat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full">
                <Video className="mr-2 h-4 w-4" />
                Planla
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quick Note Modal */}
      <Dialog 
        open={showNoteModal} 
        onOpenChange={(open) => {
          if (!open) {
            setShowNoteModal(false)
            setNoteItem(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Not Düzenle</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNoteSubmit(e);
            }}
            className="space-y-4 pt-4"
          >
            <div className="space-y-2">
              <Label>Not</Label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Notunuzu buraya yazın..."
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Kaydet
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
