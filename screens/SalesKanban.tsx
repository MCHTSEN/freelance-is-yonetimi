import { useState, useMemo } from 'react'
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
import Modal from '../components/Modal'
import ClientForm from '../components/ClientForm'
import PipelineForm from '../components/PipelineForm'
import type { Client } from '../lib/supabase'

// Kanban Card Component
interface KanbanCardProps {
  item: PipelineWithClient
  onDelete: () => void
  isDragging?: boolean
}

function KanbanCard({ item, onDelete, isDragging }: KanbanCardProps) {
  const clientName = item.clients
    ? `${item.clients.first_name} ${item.clients.last_name}`
    : 'İsimsiz Müşteri'

  const initials = item.clients
    ? `${item.clients.first_name[0]}${item.clients.last_name[0]}`
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

  return (
    <div
      className={`group relative bg-[#1a2634] p-4 rounded-xl border border-transparent hover:border-[#324d67] shadow-sm transition-all ${
        isDragging ? 'opacity-50 scale-105 shadow-xl' : 'hover:-translate-y-1'
      } ${item.stage === 'lost' ? 'opacity-50 grayscale' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className={`${priority.color} text-xs font-bold px-2 py-1 rounded flex items-center gap-1`}>
          {priority.label}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (window.confirm('Bu kartı silmek istediğinize emin misiniz?')) {
              onDelete()
            }
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-[#92adc9] hover:text-red-400 p-1 -mr-2 -mt-2"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>

      <h4 className={`text-white font-bold text-base mb-1 ${item.stage === 'lost' ? 'line-through decoration-slate-500' : ''}`}>
        {clientName}
      </h4>

      {item.clients?.company && (
        <p className="text-[#92adc9] text-sm mb-2">{item.clients.company}</p>
      )}

      {item.notes && (
        <p className="text-[#6b8ba3] text-sm mb-3 line-clamp-2">{item.notes}</p>
      )}

      {item.estimated_value && (
        <p className="text-primary text-sm font-bold mb-3">{formatCurrency(item.estimated_value)}</p>
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
function SortableCard({ item, onDelete }: { item: PipelineWithClient; onDelete: () => void }) {
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
      <KanbanCard item={item} onDelete={onDelete} isDragging={isDragging} />
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
  isOver: boolean
}

function Column({ stage, title, items, onAddCard, onDeleteCard, isOver }: ColumnProps) {
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

  const { items, loading, updateStage, deleteItem, addItem, getItemsByStage } = usePipeline()
  const { clients, addClient, refetch: refetchClients } = useClients()

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
                    isOver={overId === stage}
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
    </div>
  )
}
