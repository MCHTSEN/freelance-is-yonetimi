import { useState } from 'react'
import { useCodeSnippets, type CodeSnippetWithProject } from '../hooks/useCodeSnippets'
import Modal from '../components/Modal'

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
    env_vars: Record<string, string> | null
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
    env_vars: initialData?.env_vars ? JSON.stringify(initialData.env_vars, null, 2) : '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      let envVars: Record<string, string> | null = null
      if (formData.env_vars.trim()) {
        try {
          envVars = JSON.parse(formData.env_vars)
        } catch {
          throw new Error('Env vars geçerli JSON formatında olmalı')
        }
      }

      await onSubmit({
        title: formData.title,
        code: formData.code,
        language: formData.language,
        description: formData.description || null,
        env_vars: envVars,
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

      <div>
        <label className="block text-sm text-text-secondary mb-2">
          Environment Variables (JSON)
          <span className="text-rose-400 ml-2 text-xs">Hassas veriler</span>
        </label>
        <textarea
          value={formData.env_vars}
          onChange={(e) => setFormData(prev => ({ ...prev, env_vars: e.target.value }))}
          className="w-full px-4 py-3 bg-[#0d1117] border border-rose-900/30 rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-rose-500 transition-colors resize-none font-mono text-sm"
          placeholder='{"API_KEY": "xxx", "SECRET": "yyy"}'
          rows={4}
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
  const [revealed, setRevealed] = useState(false)
  const [activeSnippetId, setActiveSnippetId] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingSnippet, setEditingSnippet] = useState<CodeSnippetWithProject | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLang, setFilterLang] = useState<string | null>(null)

  const activeSnippet = snippets.find(s => s.id === activeSnippetId) || snippets[0]

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
    env_vars: Record<string, string> | null
  }) => {
    const newSnippet = await addSnippet({
      title: data.title,
      code: data.code,
      language: data.language,
      description: data.description,
      env_vars: data.env_vars,
      project_id: null,
    })
    setShowForm(false)
    setActiveSnippetId(newSnippet.id)
  }

  const handleEdit = async (data: {
    title: string
    code: string
    language: string
    description: string | null
    env_vars: Record<string, string> | null
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

  const getLangColor = (lang: string) => {
    return LANGUAGE_OPTIONS.find(l => l.value === lang)?.color || 'gray'
  }

  if (loading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <span className="material-symbols-rounded text-primary text-4xl animate-spin">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="flex w-full h-full">
      {/* Sidebar */}
      <aside className="w-80 flex flex-col border-r border-border-dark bg-surface-dark shrink-0">
        <div className="p-4 border-b border-border-dark space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#192633] text-white placeholder-text-secondary text-sm rounded-lg border border-border-dark focus:border-primary focus:ring-1 focus:ring-primary pl-10 pr-3 py-2.5 outline-none transition-all"
                placeholder="Snippet ara..."
              />
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="size-10 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-rounded">add</span>
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setFilterLang(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                !filterLang ? 'bg-primary text-white' : 'bg-border-dark text-text-secondary hover:text-white'
              }`}
            >
              Tümü
            </button>
            {LANGUAGE_OPTIONS.slice(0, 5).map(lang => (
              <button
                key={lang.value}
                onClick={() => setFilterLang(filterLang === lang.value ? null : lang.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  filterLang === lang.value ? 'bg-primary text-white' : 'bg-border-dark text-text-secondary hover:text-white'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredSnippets.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-symbols-rounded text-text-secondary text-4xl mb-2">code_off</span>
              <p className="text-text-secondary text-sm">Snippet bulunamadı</p>
            </div>
          ) : (
            filteredSnippets.map(snippet => (
              <div
                key={snippet.id}
                onClick={() => { setActiveSnippetId(snippet.id); setRevealed(false) }}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  activeSnippetId === snippet.id || (!activeSnippetId && snippets[0]?.id === snippet.id)
                    ? 'bg-[#1f2e3d] border border-primary/30 shadow-sm relative overflow-hidden'
                    : 'hover:bg-border-dark/50'
                }`}
              >
                {(activeSnippetId === snippet.id || (!activeSnippetId && snippets[0]?.id === snippet.id)) && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                )}
                <span className={`material-symbols-outlined text-[20px] ${
                  activeSnippetId === snippet.id || (!activeSnippetId && snippets[0]?.id === snippet.id)
                    ? 'text-primary'
                    : 'text-text-secondary'
                }`}>
                  code
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${
                    activeSnippetId === snippet.id || (!activeSnippetId && snippets[0]?.id === snippet.id)
                      ? 'text-white'
                      : 'text-slate-300'
                  }`}>
                    {snippet.title}
                  </p>
                  <p className="text-text-secondary text-xs truncate">{snippet.language}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Editor */}
      {activeSnippet ? (
        <div className="flex-1 flex flex-col bg-background-dark min-w-0 relative">
          <div className="flex items-center justify-between px-8 py-4 border-b border-border-dark bg-surface-dark/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white tracking-tight">{activeSnippet.title}</h1>
                <span className={`px-2 py-0.5 rounded bg-${getLangColor(activeSnippet.language)}-500/10 text-${getLangColor(activeSnippet.language)}-400 border border-${getLangColor(activeSnippet.language)}-500/20 text-[10px] font-bold uppercase tracking-wide`}>
                  {activeSnippet.language}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingSnippet(activeSnippet)}
                className="flex items-center justify-center size-9 rounded text-text-secondary hover:bg-border-dark hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center justify-center size-9 rounded text-text-secondary hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
              <div className="h-6 w-px bg-border-dark mx-1" />
              <button
                onClick={handleCopy}
                className={`flex items-center justify-center gap-2 px-4 h-9 rounded text-sm font-bold transition-all ${
                  isCopied ? 'bg-green-500 text-white' : 'bg-white text-slate-900 hover:opacity-90'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{isCopied ? 'check' : 'content_copy'}</span>
                {isCopied ? 'Kopyalandı!' : 'Kopyala'}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-8 md:px-12 lg:px-20">
            <div className="max-w-4xl mx-auto space-y-6">
              {activeSnippet.description && (
                <p className="text-slate-300 leading-relaxed">{activeSnippet.description}</p>
              )}

              <div className="rounded-xl overflow-hidden border border-border-dark bg-[#0d1117] shadow-sm">
                <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-slate-800">
                  <span className="text-xs font-mono text-slate-400">{activeSnippet.language}</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="font-mono text-sm leading-6">
                    <code>{activeSnippet.code}</code>
                  </pre>
                </div>
              </div>

              {activeSnippet.env_vars && Object.keys(activeSnippet.env_vars).length > 0 && (
                <>
                  <p className="text-slate-300 leading-relaxed pt-2">
                    Environment variables: <strong className="text-rose-500">Hassas veriler, paylaşmayın.</strong>
                  </p>

                  <div className="group relative rounded-xl border border-rose-900/30 bg-rose-900/10 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-1.5 rounded bg-rose-900/40 text-rose-400">
                        <span className="material-symbols-outlined text-[20px]">lock</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Korunan Environment Variables</h3>
                        <p className="text-xs text-text-secondary">Görmek için tıklayın</p>
                      </div>
                    </div>
                    <div
                      className="relative rounded-lg bg-[#0d1117] border border-slate-800 overflow-hidden min-h-[100px]"
                      onClick={() => setRevealed(!revealed)}
                    >
                      {!revealed && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0d1117]/80 backdrop-blur-sm cursor-pointer hover:bg-[#0d1117]/60 transition-all">
                          <span className="material-symbols-outlined text-slate-400 text-3xl mb-2">visibility_off</span>
                          <span className="text-sm font-medium text-slate-300">Görmek için tıkla</span>
                        </div>
                      )}
                      <div className={`p-4 font-mono text-sm space-y-2 select-none ${revealed ? '' : 'filter blur-sm'}`}>
                        {Object.entries(activeSnippet.env_vars as Record<string, string>).map(([key, value]) => (
                          <div key={key} className="flex gap-4">
                            <span className="text-sky-400">{key}</span>
                            <span className="text-slate-400">=</span>
                            <span className="text-green-300">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="h-8 border-t border-border-dark bg-surface-dark flex items-center justify-between px-4 text-[11px] text-text-secondary select-none">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                {new Date(activeSnippet.created_at).toLocaleDateString('tr-TR')}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>{activeSnippet.language}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-background-dark">
          <span className="material-symbols-rounded text-text-secondary text-6xl mb-4">code</span>
          <p className="text-text-secondary text-lg mb-4">Henüz snippet yok</p>
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
