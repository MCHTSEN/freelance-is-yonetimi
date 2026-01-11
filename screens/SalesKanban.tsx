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
import ClientForm from '../components/ClientForm'
import Modal from '../components/Modal'
import PipelineForm from '../components/PipelineForm'
import { useClients } from '../hooks/useClients'
import { PipelineStage, PipelineWithClient, STAGE_CONFIG, usePipeline } from '../hooks/usePipeline'
import type { Client } from '../lib/supabase'
import { supabase } from '../lib/supabase'

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
    high: { color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', label: 'Yüksek', dot: 'bg-rose-500' },
    medium: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Orta', dot: 'bg-amber-500' },
    low: { color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: 'Düşük', dot: 'bg-slate-400' },
  }

  const priority = priorityConfig[item.priority as keyof typeof priorityConfig] || priorityConfig.medium

  const formatCurrency = (value: number | null) => {
    if (!value) return null
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value)
  }

  return (
    <div
      onClick={onEdit}
      className={`group relative bg-surface-lighter border border-white/10 p-5 rounded-2xl shadow-premium transition-all duration-300 cursor-pointer ${
        isDragging ? 'opacity-40 scale-95' : 'hover:scale-[1.02] hover:bg-surface-lighter/80 hover:border-primary/50'
      }`}
    >
      {/* High-end glass shadow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Header Info */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${priority.color}`}>
          <span className={`size-1.5 rounded-full ${priority.dot} animate-pulse`} />
          {priority.label}
        </div>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
          <button
            onClick={(e) => { e.stopPropagation(); onAddMeeting(); }}
            className="size-8 rounded-lg bg-white/5 hover:bg-green-500/20 text-slate-400 hover:text-green-400 flex items-center justify-center transition-colors"
            title="Toplantı"
          >
            <span className="material-symbols-rounded text-[18px]">videocam</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAddNote(); }}
            className="size-8 rounded-lg bg-white/5 hover:bg-primary/20 text-slate-400 hover:text-primary flex items-center justify-center transition-colors"
            title="Not"
          >
            <span className="material-symbols-rounded text-[18px]">edit_note</span>
          </button>
        </div>
      </div>

      {/* Client Identity */}
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="size-10 rounded-xl bg-gradient-to-br from-primary/20 to-indigo-500/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-inner">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-base truncate tracking-tight">{clientName}</h4>
          {item.estimated_value && (
            <p className="text-slate-400 text-sm font-medium">{formatCurrency(item.estimated_value)}</p>
          )}
        </div>
      </div>

      {/* Status & Notes */}
      {item.notes && (
        <p className="text-slate-400 text-sm mb-4 line-clamp-2 italic font-light relative z-10">
          "{item.notes}"
        </p>
      )}

      {/* Progress or Meeting Info */}
      <div className="flex items-center justify-between border-t border-glass-border pt-4 relative z-10">
        {upcomingMeeting ? (
          <div className="flex items-center gap-2 text-green-400 text-xs font-medium">
            <span className="material-symbols-rounded text-[16px]">schedule</span>
            <span className="animate-pulse">
              Meeting at {new Date(upcomingMeeting.scheduled_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 text-xs text-secondary">
            <span className="material-symbols-rounded text-[16px] font-light">calendar_today</span>
            <span>{item.follow_up_date ? new Date(item.follow_up_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : 'No follow-up'}</span>
          </div>
        )}
        
        {item.total_paid && item.total_paid > 0 ? (
          <div className="flex items-center gap-1">
            <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full" 
                style={{ width: `${Math.min((item.total_paid / (item.estimated_value || 1)) * 100, 100)}%` }} 
              />
            </div>
          </div>
        ) : (
          <div className="size-2 rounded-full bg-slate-700" />
        )}
      </div>
    </div>
  )
}

// Sortable Card Wrapper
function SortableCard({
  item,
  onDelete,
  onEdit,
  onAddMeeting,
  onAddNote,
  upcomingMeeting
}: {
  item: PipelineWithClient
  onDelete: () => void
  onEdit: () => void
  onAddMeeting: () => void
  onAddNote: () => void
  upcomingMeeting?: UpcomingMeeting | null
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
      <KanbanCard
        item={item}
        onDelete={onDelete}
        onEdit={onEdit}
        onAddMeeting={onAddMeeting}
        onAddNote={onAddNote}
        isDragging={isDragging}
        upcomingMeeting={upcomingMeeting}
      />
    </div>
  )
}

// Droppable Column Component
interface ColumnProps {
  stage: PipelineStage
  title: string
  items: PipelineWithClient[]
  onAddCard: () => void
  onDeleteCard: (id: string) => void
  onEditCard: (item: PipelineWithClient) => void
  onAddMeeting: (item: PipelineWithClient) => void
  onAddNote: (item: PipelineWithClient) => void
  isOver: boolean
  clientMeetings: Map<string, UpcomingMeeting>
}

function Column({ stage, title, items, onAddCard, onDeleteCard, onEditCard, onAddMeeting, onAddNote, isOver, clientMeetings }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: stage,
  })

  return (
    <div className="flex flex-col w-[340px] shrink-0 h-full">
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-3">
          <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
          <h3 className="font-bold text-sm text-slate-300 uppercase tracking-[0.1em]">{title}</h3>
          <span className="text-[10px] text-slate-500 font-mono bg-white/5 px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
        <button
          onClick={onAddCard}
          className="size-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center border border-white/5"
        >
          <span className="material-symbols-rounded text-[20px]">add</span>
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar rounded-3xl p-3 transition-all duration-300 border-2 border-transparent ${
          isOver ? 'bg-primary/5 border-primary/20 scale-[0.99] border-dashed shadow-inner' : 'bg-transparent'
        }`}
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
          <div className="flex-1 flex flex-col items-center justify-center p-10 opacity-20 group">
             <div className="size-16 rounded-3xl border-2 border-dashed border-slate-500 flex items-center justify-center mb-4 group-hover:border-primary transition-colors">
                <span className="material-symbols-rounded text-3xl">add</span>
             </div>
             <p className="text-xs font-medium uppercase tracking-widest text-center">Empty Stage</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Main Component
export default function SalesKanban() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [showPipelineModal, setShowPipelineModal] = useState(false)
  const [showClientModal, setShowClientModal] = useState(false)
  const [selectedStage, setSelectedStage] = useState<PipelineStage>('lead')
  const [preselectedClient, setPreselectedClient] = useState<Client | null>(null)
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>([])

  // Edit modal state
  const [editingItem, setEditingItem] = useState<PipelineWithClient | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // Quick meeting modal state
  const [meetingItem, setMeetingItem] = useState<PipelineWithClient | null>(null)
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [meetingFormData, setMeetingFormData] = useState({ scheduled_at: '', duration_minutes: 30, notes: '' })

  // Quick note modal state
  const [noteItem, setNoteItem] = useState<PipelineWithClient | null>(null)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [noteContent, setNoteContent] = useState('')

  const { items, loading, updateStage, deleteItem, addItem, updateItem, getItemsByStage } = usePipeline()
  const { clients, addClient, refetch: refetchClients } = useClients()

  // Fetch upcoming meetings
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const now = new Date().toISOString()
        const { data, error } = await supabase
          .from('bookings')
          .select('id, client_id, client_name, scheduled_at, duration_minutes, notes')
          .gte('scheduled_at', now)
          .neq('status', 'cancelled')
          .order('scheduled_at', { ascending: true })
          .limit(10)

        if (!error && data) {
          setUpcomingMeetings(data)
        }
      } catch (err) {
        console.error('Failed to fetch meetings:', err)
      }
    }

    fetchMeetings()
    const interval = setInterval(fetchMeetings, 60000)
    return () => clearInterval(interval)
  }, [])

  // Create a map of client_id to their next meeting
  const clientMeetings = useMemo(() => {
    const map = new Map<string, UpcomingMeeting>()
    for (const meeting of upcomingMeetings) {
      if (meeting.client_id && !map.has(meeting.client_id)) {
        map.set(meeting.client_id, meeting)
      }
    }
    return map
  }, [upcomingMeetings])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeId),
    [activeId, items]
  )

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items
    const lowerQ = searchQuery.toLowerCase()
    return items.filter(item => {
      const clientName = item.clients
        ? `${item.clients.first_name} ${item.clients.last_name}`.toLowerCase()
        : ''
      const company = item.clients?.company?.toLowerCase() || ''
      const notes = item.notes?.toLowerCase() || ''
      return clientName.includes(lowerQ) || company.includes(lowerQ) || notes.includes(lowerQ)
    })
  }, [items, searchQuery])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    if (over) {
      const stages = Object.keys(STAGE_CONFIG) as PipelineStage[]
      if (stages.includes(over.id as PipelineStage)) {
        setOverId(over.id as string)
      } else {
        const overItem = items.find(i => i.id === over.id)
        if (overItem) {
          setOverId(overItem.stage)
        }
      }
    } else {
      setOverId(null)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setOverId(null)

    if (!over) return

    const activeItem = items.find(i => i.id === active.id)
    if (!activeItem) return

    let targetStage: PipelineStage | null = null
    const stages = Object.keys(STAGE_CONFIG) as PipelineStage[]

    if (stages.includes(over.id as PipelineStage)) {
      targetStage = over.id as PipelineStage
    } else {
      const overItem = items.find(i => i.id === over.id)
      if (overItem) {
        targetStage = overItem.stage as PipelineStage
      }
    }

    if (targetStage && activeItem.stage !== targetStage) {
      try {
        await updateStage(activeItem.id, targetStage)
      } catch (error) {
        console.error('Failed to update stage:', error)
      }
    }
  }

  const handleAddPipeline = (stage: PipelineStage) => {
    setSelectedStage(stage)
    setPreselectedClient(null)
    setShowPipelineModal(true)
  }

  const handlePipelineSubmit = async (data: Parameters<typeof addItem>[0]) => {
    await addItem(data)
    setShowPipelineModal(false)
  }

  const handleClientSubmit = async (data: Parameters<typeof addClient>[0]) => {
    const newClient = await addClient(data)
    await refetchClients()
    setShowClientModal(false)

    setPreselectedClient(newClient)
    setShowPipelineModal(true)
  }

  const handleOpenClientModal = () => {
    setShowPipelineModal(false)
    setShowClientModal(true)
  }

  // Edit card handler
  const handleEditCard = (item: PipelineWithClient) => {
    setEditingItem(item)
    setShowEditModal(true)
  }

  // Quick meeting handler
  const handleAddMeeting = (item: PipelineWithClient) => {
    setMeetingItem(item)
    setMeetingFormData({ scheduled_at: '', duration_minutes: 30, notes: '' })
    setShowMeetingModal(true)
  }

  const handleMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!meetingItem || !meetingFormData.scheduled_at) return

    try {
      const clientName = meetingItem.clients
        ? `${meetingItem.clients.first_name} ${meetingItem.clients.last_name}`
        : 'Bilinmeyen Müşteri'
      const clientEmail = meetingItem.clients?.email || `${meetingItem.client_id}@client.local`

      await supabase.from('bookings').insert({
        user_id: (await supabase.auth.getUser()).data.user?.id || '',
        client_id: meetingItem.client_id || null,
        client_name: clientName,
        client_email: clientEmail,
        scheduled_at: meetingFormData.scheduled_at,
        duration_minutes: meetingFormData.duration_minutes,
        notes: meetingFormData.notes,
        status: 'confirmed'
      })

      const now = new Date().toISOString()
      const { data } = await supabase
        .from('bookings')
        .select('id, client_id, client_name, scheduled_at, duration_minutes, notes')
        .gte('scheduled_at', now)
        .neq('status', 'cancelled')
        .order('scheduled_at', { ascending: true })
        .limit(10)

      if (data) setUpcomingMeetings(data)
      setShowMeetingModal(false)
      setMeetingItem(null)
    } catch (err) {
      console.error('Meeting creation failed:', err)
      alert('Toplantı oluşturulamadı!')
    }
  }

  // Quick note handler
  const handleAddNote = (item: PipelineWithClient) => {
    setNoteItem(item)
    setNoteContent(item.notes || '')
    setShowNoteModal(true)
  }

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteItem) return

    try {
      await updateItem(noteItem.id, { notes: noteContent })
      setShowNoteModal(false)
      setNoteItem(null)
    } catch (err) {
      console.error('Note update failed:', err)
      alert('Not kaydedilemedi!')
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-6">
          <div className="size-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-slate-400 font-medium tracking-widest uppercase text-xs">Initializing OS...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full h-full bg-transparent overflow-hidden px-8 py-6">
      {/* Dynamic Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-12 shrink-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="material-symbols-rounded text-primary">analytics</span>
            <span className="text-primary text-[10px] uppercase font-black tracking-[0.2em]">Management Console</span>
          </div>
          <h1 className="text-white text-5xl font-black leading-none tracking-[-0.05em]">Project Pipeline</h1>
          <p className="text-slate-500 text-base font-light max-w-lg mt-2">
            Track your journey from potential leads to successful collaborations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          {/* Next Meeting Square Widget */}
          {upcomingMeetings.length > 0 && (
            <div className="size-32 bg-glass-bg border border-glass-border rounded-3xl p-4 flex flex-col justify-between relative group hover:border-green-500/30 transition-all shadow-glass overflow-hidden">
               <div className="absolute top-0 right-0 p-2 opacity-20">
                  <span className="material-symbols-rounded text-green-400">schedule</span>
               </div>
               <div className="relative z-10">
                  <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Next Up</p>
                  <p className="text-white text-sm font-bold truncate">{upcomingMeetings[0].client_name}</p>
               </div>
               <div className="relative z-10 mt-auto">
                  <p className="text-slate-300 text-base font-black">
                    {new Date(upcomingMeetings[0].scheduled_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {new Date(upcomingMeetings[0].scheduled_at).toDateString() === new Date().toDateString() ? 'Today' : 'Upcoming'}
                  </p>
               </div>
            </div>
          )}

          {/* Active Deals / Stats Square Widget */}
          <div className="size-32 bg-glass-bg border border-glass-border rounded-3xl p-4 flex flex-col justify-between relative group hover:border-primary/30 transition-all shadow-glass">
             <div className="absolute top-0 right-0 p-2 opacity-20">
                <span className="material-symbols-rounded text-primary">rocket_launch</span>
             </div>
             <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Active</p>
                <p className="text-white text-3xl font-black">{items.length}</p>
             </div>
             <p className="text-[10px] text-slate-400 font-medium mt-auto text-secondary">Live Deals</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <button
                onClick={() => handleAddPipeline('lead')}
                className="relative flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all active:scale-95 group overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <span className="material-symbols-rounded font-bold">add_circle</span>
                <span>Create New Deal</span>
              </button>
            </div>
            
            <div className="flex bg-surface-dark/40 backdrop-blur-md rounded-2xl border border-glass-border p-1">
              <label className="flex items-center px-4 py-2 gap-2 cursor-text group">
                <span className="material-symbols-rounded text-slate-500 group-focus-within:text-primary transition-colors">search</span>
                <input
                  type="text"
                  placeholder="Find anything..."
                  className="bg-transparent border-none focus:ring-0 text-sm text-white placeholder-slate-500 w-40 focus:w-60 transition-all duration-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </label>
            </div>
          </div>
        </div>
      </header>

      {/* Main Board Container */}
      <div className="flex-1 overflow-x-auto pb-8 custom-scrollbar">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-8 min-w-full h-full pb-4">
            {(Object.entries(STAGE_CONFIG) as [PipelineStage, typeof STAGE_CONFIG[PipelineStage]][]).map(([stage, config]) => {
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
              <div className="rotate-3 scale-105 pointer-events-none drop-shadow-2xl">
                <KanbanCard item={activeItem} onDelete={() => {}} onEdit={() => {}} onAddMeeting={() => {}} onAddNote={() => {}} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Pipeline Modal */}
      <Modal
        isOpen={showPipelineModal}
        onClose={() => {
          setShowPipelineModal(false)
          setPreselectedClient(null)
        }}
        title="Yeni Pipeline Kartı"
      >
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
      </Modal>

      {/* Client Modal */}
      <Modal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        title="Yeni Müşteri"
      >
        <ClientForm
          onSubmit={handleClientSubmit}
          onCancel={() => setShowClientModal(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingItem(null) }}
        title="Kartı Düzenle"
      >
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
      </Modal>

      {/* Quick Meeting Modal */}
      <Modal
        isOpen={showMeetingModal}
        onClose={() => { setShowMeetingModal(false); setMeetingItem(null) }}
        title={`Toplantı Oluştur - ${meetingItem?.clients ? `${meetingItem.clients.first_name} ${meetingItem.clients.last_name}` : ''}`}
      >
        <form onSubmit={handleMeetingSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Tarih</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { label: 'Bugün', date: new Date() },
                { label: 'Yarın', date: new Date(Date.now() + 86400000) },
                { label: '2 Gün Sonra', date: new Date(Date.now() + 2 * 86400000) },
              ].map(({ label, date }) => {
                const dateStr = date.toISOString().split('T')[0]
                const isSelected = meetingFormData.scheduled_at.startsWith(dateStr)
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      const currentTime = meetingFormData.scheduled_at.split('T')[1] || '10:00'
                      setMeetingFormData(prev => ({ ...prev, scheduled_at: `${dateStr}T${currentTime}` }))
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-green-600 text-white'
                        : 'bg-white/10 text-text-secondary hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <input
              type="date"
              value={meetingFormData.scheduled_at.split('T')[0] || ''}
              onChange={(e) => {
                const currentTime = meetingFormData.scheduled_at.split('T')[1] || '10:00'
                setMeetingFormData(prev => ({ ...prev, scheduled_at: `${e.target.value}T${currentTime}` }))
              }}
              className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">Saat</label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(time => {
                const isSelected = meetingFormData.scheduled_at.includes(`T${time}`)
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => {
                      const currentDate = meetingFormData.scheduled_at.split('T')[0] || new Date().toISOString().split('T')[0]
                      setMeetingFormData(prev => ({ ...prev, scheduled_at: `${currentDate}T${time}` }))
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-green-600 text-white'
                        : 'bg-white/10 text-text-secondary hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {time}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">Süre</label>
            <select
              value={meetingFormData.duration_minutes}
              onChange={(e) => setMeetingFormData(prev => ({ ...prev, duration_minutes: Number(e.target.value) }))}
              className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white focus:outline-none focus:border-primary"
            >
              <option value={15}>15 dakika</option>
              <option value={30}>30 dakika</option>
              <option value={45}>45 dakika</option>
              <option value={60}>1 saat</option>
              <option value={90}>1.5 saat</option>
              <option value={120}>2 saat</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">Notlar</label>
            <textarea
              value={meetingFormData.notes}
              onChange={(e) => setMeetingFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white focus:outline-none focus:border-primary resize-none"
              rows={3}
              placeholder="Toplantı konusu..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowMeetingModal(false); setMeetingItem(null) }}
              className="flex-1 py-3 bg-surface-dark border border-border-dark hover:bg-background-dark text-white font-medium rounded-xl transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">event</span>
              Toplantı Oluştur
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Note Modal */}
      <Modal
        isOpen={showNoteModal}
        onClose={() => { setShowNoteModal(false); setNoteItem(null) }}
        title={`Not Ekle - ${noteItem?.clients ? `${noteItem.clients.first_name} ${noteItem.clients.last_name}` : ''}`}
      >
        <form onSubmit={handleNoteSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Not</label>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white focus:outline-none focus:border-primary resize-none"
              rows={5}
              placeholder="Müşteri hakkında notlar..."
              autoFocus
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowNoteModal(false); setNoteItem(null) }}
              className="flex-1 py-3 bg-surface-dark border border-border-dark hover:bg-background-dark text-white font-medium rounded-xl transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">save</span>
              Kaydet
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
