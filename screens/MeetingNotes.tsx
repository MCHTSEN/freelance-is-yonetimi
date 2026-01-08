import { useState, useMemo } from 'react'
import { useNotes, NoteWithRelations } from '../hooks/useNotes'
import { useClients } from '../hooks/useClients'
import RichTextEditor from '../components/RichTextEditor'
import Modal from '../components/Modal'

type NoteTypeFilter = 'all' | 'meeting' | 'technical' | 'general'

const NOTE_TYPES = [
  { value: 'meeting', label: 'Toplantı', icon: 'groups', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { value: 'technical', label: 'Teknik', icon: 'code', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { value: 'general', label: 'Genel', icon: 'description', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
]

export default function MeetingNotes() {
  const [selectedNote, setSelectedNote] = useState<NoteWithRelations | null>(null)
  const [showNewNoteModal, setShowNewNoteModal] = useState(false)
  const [typeFilter, setTypeFilter] = useState<NoteTypeFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Form state
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteType, setNoteType] = useState<'meeting' | 'technical' | 'general'>('meeting')
  const [selectedClientId, setSelectedClientId] = useState('')
  const [meetingDate, setMeetingDate] = useState('')

  const { notes, loading, addNote, updateNote, deleteNote } = useNotes()
  const { clients } = useClients()

  const filteredNotes = useMemo(() => {
    let result = notes

    if (typeFilter !== 'all') {
      result = result.filter(n => n.type === typeFilter)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(n =>
        n.title?.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q) ||
        n.clients?.first_name?.toLowerCase().includes(q) ||
        n.clients?.company?.toLowerCase().includes(q)
      )
    }

    return result
  }, [notes, typeFilter, searchQuery])

  const handleSelectNote = (note: NoteWithRelations) => {
    setSelectedNote(note)
    setNoteTitle(note.title || '')
    setNoteContent(note.content || '')
    setNoteType((note.type as 'meeting' | 'technical' | 'general') || 'general')
    setSelectedClientId(note.client_id || '')
    setMeetingDate(note.meeting_date ? note.meeting_date.split('T')[0] : '')
  }

  const handleNewNote = () => {
    setSelectedNote(null)
    setNoteTitle('')
    setNoteContent('')
    setNoteType('meeting')
    setSelectedClientId('')
    setMeetingDate(new Date().toISOString().split('T')[0])
    setShowNewNoteModal(true)
  }

  const handleSaveNewNote = async () => {
    try {
      const newNote = await addNote({
        title: noteTitle || 'Adsız Not',
        content: noteContent,
        type: noteType,
        client_id: selectedClientId || null,
        meeting_date: meetingDate ? new Date(meetingDate).toISOString() : null,
      })
      setShowNewNoteModal(false)
      handleSelectNote(newNote as NoteWithRelations)
    } catch (error) {
      console.error('Failed to create note:', error)
    }
  }

  const handleUpdateNote = async () => {
    if (!selectedNote) return
    try {
      await updateNote(selectedNote.id, {
        title: noteTitle,
        content: noteContent,
        type: noteType,
        client_id: selectedClientId || null,
        meeting_date: meetingDate ? new Date(meetingDate).toISOString() : null,
      })
    } catch (error) {
      console.error('Failed to update note:', error)
    }
  }

  const handleDeleteNote = async () => {
    if (!selectedNote) return
    if (!window.confirm('Bu notu silmek istediğinize emin misiniz?')) return
    try {
      await deleteNote(selectedNote.id)
      setSelectedNote(null)
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getTypeConfig = (type: string | null) => {
    return NOTE_TYPES.find(t => t.value === type) || NOTE_TYPES[2]
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-rounded text-primary text-4xl animate-spin">progress_activity</span>
          <p className="text-text-secondary">Notlar yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full h-full bg-background-dark overflow-hidden">
      {/* Header */}
      <header className="h-16 flex items-center justify-between border-b border-border-dark px-6 shrink-0 bg-surface-dark">
        <div className="flex flex-1 max-w-lg">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-text-secondary">search</span>
            </div>
            <input
              className="block w-full pl-10 pr-3 py-2 rounded-lg bg-background-dark border border-border-dark text-white placeholder-text-secondary focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
              placeholder="Not veya müşteri ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={handleNewNote}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-500/20 transition-all ml-4"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Yeni Not</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Notes List */}
        <div className="w-[380px] border-r border-border-dark flex flex-col shrink-0">
          {/* Filters */}
          <div className="p-4 border-b border-border-dark">
            <div className="flex gap-2">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  typeFilter === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-surface-dark text-text-secondary hover:text-white border border-border-dark'
                }`}
              >
                Tümü
              </button>
              {NOTE_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => setTypeFilter(type.value as NoteTypeFilter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    typeFilter === type.value
                      ? 'bg-primary text-white'
                      : 'bg-surface-dark text-text-secondary hover:text-white border border-border-dark'
                  }`}
                >
                  <span className="material-symbols-rounded text-sm">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                <span className="material-symbols-rounded text-4xl mb-2">description</span>
                <p>Henüz not yok</p>
                <button
                  onClick={handleNewNote}
                  className="mt-3 text-primary hover:underline text-sm"
                >
                  İlk notunuzu oluşturun
                </button>
              </div>
            ) : (
              filteredNotes.map(note => {
                const typeConfig = getTypeConfig(note.type)
                const isSelected = selectedNote?.id === note.id
                return (
                  <div
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    className={`p-4 border-b border-border-dark cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary/10 border-l-2 border-l-primary'
                        : 'hover:bg-surface-dark border-l-2 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className={`px-2 py-0.5 rounded text-xs font-medium ${typeConfig.color} border`}>
                        {typeConfig.label}
                      </div>
                      <span className="text-xs text-text-secondary">
                        {formatDate(note.created_at)}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold mb-1 line-clamp-1">
                      {note.title || 'Adsız Not'}
                    </h3>
                    {note.clients && (
                      <p className="text-text-secondary text-xs mb-2">
                        {note.clients.first_name} {note.clients.last_name}
                        {note.clients.company && ` • ${note.clients.company}`}
                      </p>
                    )}
                    {note.content && (
                      <p
                        className="text-text-secondary text-sm line-clamp-2"
                        dangerouslySetInnerHTML={{
                          __html: note.content.replace(/<[^>]*>/g, ' ').substring(0, 100)
                        }}
                      />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Editor Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedNote ? (
            <>
              {/* Note Header */}
              <div className="p-6 border-b border-border-dark bg-surface-dark">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      onBlur={handleUpdateNote}
                      className="w-full bg-transparent text-white text-2xl font-bold border-none focus:outline-none focus:ring-0 placeholder-text-secondary"
                      placeholder="Not başlığı..."
                    />
                  </div>
                  <button
                    onClick={handleDeleteNote}
                    className="p-2 text-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Notu sil"
                  >
                    <span className="material-symbols-rounded">delete</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Type Chips */}
                  <div className="flex gap-2">
                    {NOTE_TYPES.map(type => (
                      <button
                        key={type.value}
                        onClick={() => {
                          setNoteType(type.value as 'meeting' | 'technical' | 'general')
                          setTimeout(handleUpdateNote, 0)
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 border ${
                          noteType === type.value
                            ? type.color
                            : 'bg-surface-dark text-text-secondary border-border-dark hover:text-white'
                        }`}
                      >
                        <span className="material-symbols-rounded text-sm">{type.icon}</span>
                        {type.label}
                      </button>
                    ))}
                  </div>

                  <div className="h-6 w-px bg-border-dark" />

                  {/* Client Select */}
                  <select
                    value={selectedClientId}
                    onChange={(e) => {
                      setSelectedClientId(e.target.value)
                      setTimeout(handleUpdateNote, 0)
                    }}
                    className="px-3 py-1.5 bg-background-dark border border-border-dark rounded-lg text-sm text-white focus:outline-none focus:border-primary"
                  >
                    <option value="">Müşteri seçin...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.first_name} {client.last_name}
                      </option>
                    ))}
                  </select>

                  {/* Date */}
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => {
                      setMeetingDate(e.target.value)
                      setTimeout(handleUpdateNote, 0)
                    }}
                    className="px-3 py-1.5 bg-background-dark border border-border-dark rounded-lg text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 overflow-y-auto p-6">
                <RichTextEditor
                  content={noteContent}
                  onChange={(content) => {
                    setNoteContent(content)
                  }}
                  placeholder="Notlarınızı buraya yazın..."
                />
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleUpdateNote}
                    className="px-4 py-2 bg-primary hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-rounded text-lg">save</span>
                    Kaydet
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-secondary">
              <span className="material-symbols-rounded text-6xl mb-4">edit_note</span>
              <h3 className="text-xl font-semibold text-white mb-2">Not Seçin</h3>
              <p className="mb-4">Düzenlemek için sol taraftan bir not seçin</p>
              <button
                onClick={handleNewNote}
                className="px-4 py-2 bg-primary hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Yeni Not Oluştur
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Note Modal */}
      <Modal
        isOpen={showNewNoteModal}
        onClose={() => setShowNewNoteModal(false)}
        title="Yeni Not"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Başlık</label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary"
              placeholder="Not başlığı..."
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Not Türü</label>
            <div className="flex gap-2">
              {NOTE_TYPES.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setNoteType(type.value as 'meeting' | 'technical' | 'general')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 border ${
                    noteType === type.value
                      ? type.color
                      : 'bg-surface-dark text-text-secondary border-border-dark hover:text-white'
                  }`}
                >
                  <span className="material-symbols-rounded text-lg">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Müşteri (Opsiyonel)</label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white focus:outline-none focus:border-primary"
            >
              <option value="">Müşteri seçin...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.first_name} {client.last_name} {client.company && `(${client.company})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Tarih</label>
            <input
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowNewNoteModal(false)}
              className="flex-1 py-3 bg-surface-dark border border-border-dark hover:bg-background-dark text-white font-medium rounded-xl transition-colors"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleSaveNewNote}
              className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-rounded">add</span>
              Oluştur
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
