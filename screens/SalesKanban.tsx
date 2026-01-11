import { useState, useMemo, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { usePipeline, STAGE_CONFIG, PipelineStage, PipelineWithClient } from '../hooks/usePipeline'
import { useClients } from '../hooks/useClients'
import { supabase } from '../lib/supabase'
import Modal from '../components/Modal'
import ClientForm from '../components/ClientForm'
import PipelineForm from '../components/PipelineForm'
import type { Client, Booking } from '../lib/supabase'

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
      : item.clients.first_name
    : 'İsimsiz Müşteri'

  const initials = item.clients
    ? item.clients.company
      ? `${item.clients.first_name[0]}${item.clients.company[0]}`
      : item.clients.first_name.slice(0, 2).toUpperCase()
    : '??'

  const priorityConfig = {
    high: { color: 'bg-red-500/20 text-red-300', label: 'Yüksek' },
    medium: { color: 'bg-yellow-500/20 text-yellow-300', label: 'Orta' },
    low: { color: 'bg-gray-500/20 text-gray-300', label: 'Düşük' },
  }

  const priority = priorityConfig[item.priority as keyof typeof priorityConfig] || priorityConfig.medium

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return null
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value)
  }

  const formatMeetingTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffDays === 0) {
      if (diffHours <= 0) return 'Şimdi'
      if (diffHours < 24) return `${diffHours} saat sonra`
    }
    if (diffDays === 1) return 'Yarın'
    if (diffDays < 7) return `${diffDays} gün sonra`

    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
  }

  return (
    <div
      onClick={onEdit}
      className={`group relative bg-[#1a2634] p-4 rounded-xl border border-transparent hover:border-[#324d67] shadow-sm transition-all cursor-pointer ${
        isDragging ? 'opacity-50 scale-105 shadow-xl' : 'hover:-translate-y-1'
      }`}
    >
      {/* Upcoming Meeting Badge */}
      {upcomingMeeting && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg animate-pulse">
            <span className="material-symbols-outlined text-[12px]">videocam</span>
            {formatMeetingTime(upcomingMeeting.scheduled_at)}
          </div>
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div className={`${priority.color} text-xs font-bold px-2 py-1 rounded flex items-center gap-1`}>
          {priority.label}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAddMeeting()
            }}
            className="text-[#92adc9] hover:text-green-400 p-1"
            title="Toplantı Oluştur"
          >
            <span className="material-symbols-outlined text-[18px]">event</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAddNote()
            }}
            className="text-[#92adc9] hover:text-blue-400 p-1"
            title="Not Ekle"
          >
            <span className="material-symbols-outlined text-[18px]">note_add</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (window.confirm('Bu kartı silmek istediğinize emin misiniz?')) {
                onDelete()
              }
            }}
            className="text-[#92adc9] hover:text-red-400 p-1"
            title="Sil"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>

      <h4 className="text-white font-bold text-base mb-1">
        {clientName}
      </h4>

      {item.notes && (
        <p className="text-[#6b8ba3] text-sm mb-3 line-clamp-2">{item.notes}</p>
      )}

      {item.estimated_value && (
        <div className="mb-3">
          <p className="text-primary text-sm font-bold">{formatCurrency(item.estimated_value)}</p>
          {item.total_paid !== undefined && item.total_paid > 0 && (
            <p className="text-xs text-text-secondary mt-0.5">
              <span className="text-green-400">Ödenen: {formatCurrency(item.total_paid)}</span>
              {item.remaining !== undefined && item.remaining > 0 && (
                <span className="text-yellow-400 ml-2">Kalan: {formatCurrency(item.remaining)}</span>
              )}
            </p>
          )}
        </div>
      )}

      {item.follow_up_date && (
        <div className="flex items-center justify-between border-t border-[#324d67] pt-3 mt-2">
          <div className="flex items-center gap-2 text-[#92adc9] text-xs">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            <span>{formatDate(item.follow_up_date)}</span>
          </div>
          <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/30">
            {initials}
          </div>
        </div>
      )}

      {!item.follow_up_date && (
        <div className="flex justify-end mt-2">
          <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/30">
            {initials}
          </div>
        </div>
      )}
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
    <div className="flex flex-col w-[320px] shrink-0 gap-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm text-[#92adc9] uppercase tracking-wider">{title}</h3>
          <span className="bg-[#233648] text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onAddCard}
            className="text-[#92adc9] hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`flex flex-col gap-3 min-h-[200px] rounded-xl p-2 transition-all duration-200 ${
          isOver
            ? 'bg-primary/10 border-2 border-dashed border-primary'
            : 'border-2 border-transparent hover:border-[#233648]'
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
          <div className={`h-full flex items-center justify-center text-sm font-medium py-8 transition-colors ${
            isOver ? 'text-primary' : 'text-[#324d67]'
          }`}>
            {isOver ? 'Bırakın' : 'Buraya sürükleyin'}
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
  const [showMeetingsWidget, setShowMeetingsWidget] = useState(true)

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
    // Refresh every minute
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
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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
      // Check if over a column or a card in a column
      const stages = Object.keys(STAGE_CONFIG) as PipelineStage[]
      if (stages.includes(over.id as PipelineStage)) {
        setOverId(over.id as string)
      } else {
        // Find which stage the card belongs to
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

    // Determine target stage
    let targetStage: PipelineStage | null = null
    const stages = Object.keys(STAGE_CONFIG) as PipelineStage[]

    // Check if dropped directly on a column
    if (stages.includes(over.id as PipelineStage)) {
      targetStage = over.id as PipelineStage
    } else {
      // Check if dropped on a card - find which stage that card belongs to
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
    setPreselectedClient(null)
  }

  const handleClientSubmit = async (data: Parameters<typeof addClient>[0]) => {
    const newClient = await addClient(data)
    await refetchClients()
    setShowClientModal(false)

    // Otomatik olarak pipeline formunu aç ve yeni müşteriyi seç
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

      // Refresh meetings
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
      <div className="flex-1 flex items-center justify-center bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-rounded text-primary text-4xl animate-spin">progress_activity</span>
          <p className="text-text-secondary">Pipeline yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full h-full bg-background-dark">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#233648] px-10 py-3 bg-background-dark shrink-0">
        <div className="flex items-center gap-8">
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Personal OS</h2>
          <label className="flex flex-col min-w-40 !h-10 max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-[#92adc9] flex border-none bg-[#233648] items-center justify-center pl-4 rounded-l-lg border-r-0">
                <span className="material-symbols-outlined text-[24px]">search</span>
              </div>
              <input
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-[#233648] focus:border-none h-full placeholder:text-[#92adc9] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                placeholder="Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </label>
        </div>
        <div className="flex flex-1 justify-end gap-8">
          <div className="flex items-center gap-9">
            <span className="text-white text-sm font-bold border-b-2 border-primary pb-0.5">Müşteriler</span>
          </div>
        </div>
      </header>

      {/* Upcoming Meetings Widget */}
      {showMeetingsWidget && upcomingMeetings.length > 0 && (
        <div className="mx-6 mt-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-400">event</span>
              <h3 className="text-white font-semibold">Yaklaşan Toplantılar</h3>
              <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">
                {upcomingMeetings.length}
              </span>
            </div>
            <button
              onClick={() => setShowMeetingsWidget(false)}
              className="text-text-secondary hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {upcomingMeetings.slice(0, 5).map(meeting => {
              const date = new Date(meeting.scheduled_at)
              const isToday = new Date().toDateString() === date.toDateString()
              const isTomorrow = new Date(Date.now() + 86400000).toDateString() === date.toDateString()

              return (
                <div
                  key={meeting.id}
                  className="flex-shrink-0 bg-background-dark/50 rounded-lg p-3 border border-green-500/10 hover:border-green-500/30 transition-colors min-w-[200px]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold">
                      {meeting.client_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="text-white font-medium text-sm truncate">{meeting.client_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`font-bold ${isToday ? 'text-green-400' : isTomorrow ? 'text-yellow-400' : 'text-text-secondary'}`}>
                      {isToday ? 'Bugün' : isTomorrow ? 'Yarın' : date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="text-text-secondary">
                      {date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-text-secondary">({meeting.duration_minutes}dk)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Main Board */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="flex flex-col gap-6 mb-6 shrink-0">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex min-w-72 flex-col gap-1">
              <h1 className="text-white text-3xl font-black leading-tight tracking-[-0.033em]">Satış Süreci</h1>
              <p className="text-[#92adc9] text-base font-normal leading-normal">
                Müşteri adaylarını ve teklif durumlarını yönetin
              </p>
            </div>
            <button
              onClick={() => handleAddPipeline('lead')}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-primary hover:bg-blue-600 transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-lg shadow-blue-900/20 active:transform active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px] mr-2">add</span>
              <span className="truncate">Yeni Müşteri/Teklif Ekle</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto pb-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-6 min-w-full h-full items-start">
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

            <DragOverlay>
              {activeItem ? (
                <div className="rotate-3 opacity-90">
                  <KanbanCard item={activeItem} onDelete={() => {}} isDragging />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
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
