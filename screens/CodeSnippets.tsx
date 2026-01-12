import { useState } from 'react'
import Modal from '../components/Modal'
import { useCodeSnippets, type CodeSnippetWithProject } from '../hooks/useCodeSnippets'

const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript', color: 'yellow' },
  { value: 'typescript', label: 'TypeScript', color: 'blue' },
  { value: 'python', label: 'Python', color: 'green' },
  { value: 'json', label: 'JSON', color: 'amber' },
  { value: 'yaml', label: 'YAML', color: 'purple' },
  { value: 'sql', label: 'SQL', color: 'cyan' },
  { value: 'bash', label: 'Bash', color: 'slate' },
  { value: 'css', label: 'CSS', color: 'pink' },
  { value: 'html', label: 'HTML', color: 'orange' },
  { value: 'other', label: 'Diğer', color: 'gray' },
]

function SnippetForm({
  onSubmit,
  onCancel,
  initialData,
}: {
  onSubmit: (data: {
    title: string
    code: string
    language: string
    description: string | null
  }) => Promise<void>
  onCancel: () => void
  initialData?: CodeSnippetWithProject
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    code: initialData?.code || '',
    language: initialData?.language || 'javascript',
    description: initialData?.description || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await onSubmit({
        title: formData.title,
        code: formData.code,
        language: formData.language,
        description: formData.description || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-text-secondary mb-2">Başlık *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
          placeholder="Snippet başlığı"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-2">Dil</label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGE_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, language: option.value }))}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                formData.language === option.value
                  ? 'bg-primary text-white'
                  : 'bg-surface-dark text-text-secondary hover:bg-[#233648] hover:text-white border border-border-dark'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-2">Açıklama</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors resize-none"
          placeholder="Snippet hakkında kısa açıklama..."
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-2">Kod *</label>
        <textarea
          value={formData.code}
          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
          className="w-full px-4 py-3 bg-[#0d1117] border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors resize-none font-mono text-sm"
          placeholder="Kod buraya..."
          rows={10}
          required
        />
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 bg-surface-dark border border-border-dark hover:bg-background-dark text-white font-medium rounded-xl transition-colors"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="material-symbols-rounded animate-spin">progress_activity</span>
          ) : (
            <>
              <span className="material-symbols-rounded">{initialData ? 'save' : 'add'}</span>
              {initialData ? 'Kaydet' : 'Ekle'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default function CodeSnippets() {
  const { snippets, loading, addSnippet, updateSnippet, deleteSnippet } = useCodeSnippets()
  const [activeSnippetId, setActiveSnippetId] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingSnippet, setEditingSnippet] = useState<CodeSnippetWithProject | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLang, setFilterLang] = useState<string | null>(null)

  const activeSnippet = (activeSnippetId ? snippets.find(s => s.id === activeSnippetId) : snippets[0]) || null

  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = searchQuery === '' ||
      snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLang = !filterLang || snippet.language === filterLang
    return matchesSearch && matchesLang
  })

  const handleCopy = () => {
    if (!activeSnippet) return
    navigator.clipboard.writeText(activeSnippet.code)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleAdd = async (data: {
    title: string
    code: string
    language: string
    description: string | null
  }) => {
    const newSnippet = await addSnippet({
      title: data.title,
      code: data.code,
      language: data.language,
      description: data.description,
    })
    setShowForm(false)
    setActiveSnippetId(newSnippet.id)
  }

  const handleEdit = async (data: {
    title: string
    code: string
    language: string
    description: string | null
  }) => {
    if (!editingSnippet) return
    await updateSnippet(editingSnippet.id, data)
    setEditingSnippet(null)
  }

  const handleDelete = async () => {
    if (!activeSnippet) return
    if (!confirm('Bu snippet silinsin mi?')) return
    await deleteSnippet(activeSnippet.id)
    setActiveSnippetId(null)
  }

  if (loading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <span className="material-symbols-rounded text-primary text-4xl animate-spin">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="flex w-full h-full overflow-hidden">
      {/* Glassmorphic Sidebar */}
      <aside className="w-80 flex flex-col border-r border-white/5 bg-glass-bg backdrop-blur-3xl shrink-0 z-20">
        <div className="p-6 space-y-4">
          <div className="flex flex-col gap-1 mb-4">
            <span className="text-primary text-[10px] uppercase font-black tracking-widest opacity-70 leading-none">Geliştirici Kasası</span>
            <h2 className="text-white text-2xl font-black tracking-tight">Snippet'lar</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
               <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 text-white placeholder-slate-600 text-xs rounded-xl border border-white/5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 pl-10 pr-3 py-3 outline-none transition-all"
                placeholder="Kodlarda ara..."
              />
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="size-11 bg-primary hover:bg-primary-dark text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-primary/20 active:scale-90"
            >
              <span className="material-symbols-rounded font-black">add</span>
            </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setFilterLang(null)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                !filterLang ? 'bg-white text-slate-900 border-white' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Tümü
            </button>
            {LANGUAGE_OPTIONS.slice(0, 5).map(lang => (
              <button
                key={lang.value}
                onClick={() => setFilterLang(filterLang === lang.value ? null : lang.value)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                  filterLang === lang.value ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredSnippets.length === 0 ? (
            <div className="text-center py-12 px-4 opacity-30">
              <span className="material-symbols-rounded text-6xl mb-4">folder_off</span>
              <p className="text-sm font-black uppercase tracking-widest">Eşleşen öğe bulunamadı</p>
            </div>
          ) : (
            filteredSnippets.map(snippet => (
              <div
                key={snippet.id}
                onClick={() => setActiveSnippetId(snippet.id)}
                className={`group flex items-center gap-4 px-4 py-4 rounded-[1.25rem] cursor-pointer transition-all border ${
                  activeSnippet?.id === snippet.id
                    ? 'bg-white/10 border-primary/40 shadow-xl'
                    : 'hover:bg-white/5 border-transparent'
                }`}
              >
                <div className={`size-10 rounded-xl flex items-center justify-center transition-all ${
                  activeSnippet?.id === snippet.id
                    ? 'bg-primary text-white'
                    : 'bg-white/10 text-slate-400 group-hover:bg-white/20 group-hover:text-slate-200'
                }`}>
                   <span className="material-symbols-rounded text-[20px] font-light">code_blocks</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate tracking-tight transition-colors ${
                    activeSnippet?.id === snippet.id
                      ? 'text-white'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}>
                    {snippet.title}
                  </p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">{snippet.language}</p>
                </div>
                {activeSnippet?.id === snippet.id && <div className="size-1.5 rounded-full bg-primary animate-pulse" />}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Editor */}
      {activeSnippet ? (
        <div className="flex-1 flex flex-col bg-transparent min-w-0 relative h-full">
          <div className="flex items-center justify-between px-10 py-8 border-b border-white/5 bg-background-dark/30 backdrop-blur-md sticky top-0 z-30">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-white tracking-tight">{activeSnippet.title}</h1>
                <span className={`px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest`}>
                   {activeSnippet.language}
                </span>
              </div>
              <p className="text-slate-500 text-xs font-medium">
                Son güncelleme: {activeSnippet.created_at ? new Date(activeSnippet.created_at).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-2 py-1.5 bg-white/5 rounded-xl border border-white/5">
                <button
                  onClick={() => setEditingSnippet(activeSnippet)}
                  className="flex items-center justify-center size-9 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                  title="Düzenle"
                >
                  <span className="material-symbols-rounded text-[20px]">edit_square</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center justify-center size-9 rounded-lg text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-all active:scale-95"
                  title="Sil"
                >
                  <span className="material-symbols-rounded text-[20px]">delete</span>
                </button>
              </div>
              
              <button
                onClick={handleCopy}
                className={`flex items-center justify-center gap-3 px-8 h-12 rounded-[1rem] text-sm font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                  isCopied 
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                    : 'bg-white text-slate-900 hover:bg-slate-100 shadow-white/5'
                }`}
              >
                <span className="material-symbols-rounded text-[20px] font-black">{isCopied ? 'done_all' : 'content_copy'}</span>
                {isCopied ? 'Kopyalandı' : 'Kopyala'}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-10 py-10">
            <div className="max-w-5xl mx-auto space-y-10">
              {activeSnippet.description && (
                <div className="relative p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                   <p className="text-slate-400 leading-relaxed text-sm italic">"{activeSnippet.description}"</p>
                </div>
              )}

              <div className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#0d1117] shadow-2xl relative">
                <div className="flex items-center justify-between px-6 py-4 bg-[#161b22] border-b border-white/5">
                   <div className="flex gap-1.5">
                      <div className="size-3 rounded-full bg-rose-500/50" />
                      <div className="size-3 rounded-full bg-amber-500/50" />
                      <div className="size-3 rounded-full bg-emerald-500/50" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{activeSnippet.language}</span>
                </div>
                <div className="p-8 overflow-x-auto selection:bg-primary/30">
                  <pre className="font-mono text-sm leading-7">
                    <code className="text-slate-300">{activeSnippet.code}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div className="h-8 border-t border-white/5 bg-white/5 flex items-center justify-between px-4 text-[11px] text-slate-500 select-none">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                {activeSnippet.created_at ? new Date(activeSnippet.created_at).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>{activeSnippet.language}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-background-dark">
          <span className="material-symbols-rounded text-slate-600 text-6xl mb-4">code</span>
          <p className="text-slate-500 text-lg mb-4">Henüz snippet yok</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-rounded">add</span>
            İlk Snippet'i Ekle
          </button>
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Yeni Snippet"
      >
        <SnippetForm
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingSnippet}
        onClose={() => setEditingSnippet(null)}
        title="Snippet Düzenle"
      >
        {editingSnippet && (
          <SnippetForm
            onSubmit={handleEdit}
            onCancel={() => setEditingSnippet(null)}
            initialData={editingSnippet}
          />
        )}
      </Modal>
    </div>
  )
}
