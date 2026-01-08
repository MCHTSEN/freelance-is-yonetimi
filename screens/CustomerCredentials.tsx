import { useState } from 'react'
import { useCredentials, type CredentialWithClient, type CredentialType } from '../hooks/useCredentials'
import { useClients } from '../hooks/useClients'
import Modal from '../components/Modal'

const CREDENTIAL_TYPES: { value: CredentialType; label: string; icon: string; color: string }[] = [
  { value: 'web', label: 'Web Login', icon: 'language', color: 'blue' },
  { value: 'ssh', label: 'SSH', icon: 'terminal', color: 'orange' },
  { value: 'db', label: 'Database', icon: 'database', color: 'purple' },
  { value: 'api', label: 'API', icon: 'api', color: 'emerald' },
]

function CredentialForm({
  clients,
  onSubmit,
  onCancel,
  initialData,
  preselectedClientId,
}: {
  clients: { id: string; first_name: string; last_name: string; company: string | null }[]
  onSubmit: (data: {
    client_id: string | null
    type: CredentialType
    title: string
    username: string | null
    password: string | null
    url: string | null
    host: string | null
    port: string | null
    notes: string | null
  }) => Promise<void>
  onCancel: () => void
  initialData?: CredentialWithClient
  preselectedClientId?: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    client_id: initialData?.client_id || preselectedClientId || '',
    type: (initialData?.type as CredentialType) || 'web',
    title: initialData?.title || '',
    username: initialData?.username || '',
    password: initialData?.password || '',
    url: initialData?.url || '',
    host: initialData?.host || '',
    port: initialData?.port || '',
    notes: initialData?.notes || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await onSubmit({
        client_id: formData.client_id || null,
        type: formData.type,
        title: formData.title,
        username: formData.username || null,
        password: formData.password || null,
        url: formData.url || null,
        host: formData.host || null,
        port: formData.port || null,
        notes: formData.notes || null,
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
        <label className="block text-sm text-text-secondary mb-2">Müşteri</label>
        <select
          value={formData.client_id}
          onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
          className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
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
        <label className="block text-sm text-text-secondary mb-2">Tür</label>
        <div className="flex flex-wrap gap-2">
          {CREDENTIAL_TYPES.map(type => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                formData.type === type.value
                  ? 'bg-primary text-white'
                  : 'bg-surface-dark text-text-secondary hover:bg-[#233648] hover:text-white border border-border-dark'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-2">Başlık *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
          placeholder="Örn: WordPress Admin, Production Server"
          required
        />
      </div>

      {(formData.type === 'web' || formData.type === 'api') && (
        <div>
          <label className="block text-sm text-text-secondary mb-2">URL</label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
            placeholder="https://example.com/admin"
          />
        </div>
      )}

      {(formData.type === 'ssh' || formData.type === 'db') && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Host</label>
            <input
              type="text"
              value={formData.host}
              onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
              className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
              placeholder="192.168.1.1"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">Port</label>
            <input
              type="text"
              value={formData.port}
              onChange={(e) => setFormData(prev => ({ ...prev, port: e.target.value }))}
              className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
              placeholder={formData.type === 'ssh' ? '22' : '3306'}
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm text-text-secondary mb-2">
          {formData.type === 'api' ? 'API Key / Client ID' : 'Kullanıcı Adı'}
        </label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors font-mono"
          placeholder={formData.type === 'api' ? 'pk_live_...' : 'admin'}
        />
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-2">
          {formData.type === 'api' ? 'API Secret' : 'Şifre'}
          <span className="text-rose-400 ml-2 text-xs">Hassas veri</span>
        </label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          className="w-full px-4 py-3 bg-background-dark border border-rose-900/30 rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-rose-500 transition-colors font-mono"
          placeholder="••••••••••"
        />
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-2">Notlar</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full px-4 py-3 bg-background-dark border border-border-dark rounded-xl text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors resize-none"
          placeholder="Ek notlar..."
          rows={2}
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

interface CredentialCardProps {
  cred: CredentialWithClient
  visibleSecrets: Record<string, boolean>
  toggleVisibility: (id: string) => void
  copiedId: string | null
  copyToClipboard: (text: string, id: string) => void
  onEdit: () => void
  onDelete: () => void
}

const CredentialCard = ({
  cred,
  visibleSecrets,
  toggleVisibility,
  copiedId,
  copyToClipboard,
  onEdit,
  onDelete,
}: CredentialCardProps) => {
  const typeConfig = CREDENTIAL_TYPES.find(t => t.value === cred.type) || CREDENTIAL_TYPES[0]

  return (
    <div className="bg-surface-dark border border-border-dark rounded-xl p-5 shadow-sm hover:border-primary/30 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`size-10 rounded-lg flex items-center justify-center bg-${typeConfig.color}-500/10 text-${typeConfig.color}-400`}>
            <span className="material-symbols-outlined text-[20px]">{typeConfig.icon}</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-base leading-tight">{cred.title}</h3>
            <span className="text-text-secondary text-xs font-medium uppercase tracking-wide">
              {typeConfig.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="text-text-secondary hover:text-white transition-colors p-1"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            onClick={onDelete}
            className="text-text-secondary hover:text-red-400 transition-colors p-1"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {cred.url && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-[#587593]">URL</label>
            <a
              href={cred.url}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline text-sm truncate flex items-center gap-1"
            >
              {cred.url} <span className="material-symbols-outlined text-[12px]">open_in_new</span>
            </a>
          </div>
        )}

        {cred.host && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-[#587593]">Host</label>
              <div className="group/field flex items-center justify-between bg-[#111a22] rounded px-2 py-1.5 border border-transparent hover:border-border-dark transition-colors">
                <span className="text-slate-300 text-sm font-mono truncate">{cred.host}</span>
                <button
                  onClick={() => copyToClipboard(cred.host!, `${cred.id}-host`)}
                  className="opacity-0 group-hover/field:opacity-100 text-text-secondary hover:text-white transition-opacity"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copiedId === `${cred.id}-host` ? 'check' : 'content_copy'}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-[#587593]">Port</label>
              <span className="text-slate-300 text-sm font-mono bg-[#111a22] rounded px-2 py-1.5">
                {cred.port}
              </span>
            </div>
          </div>
        )}

        {cred.username && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-[#587593]">
              {cred.type === 'api' ? 'API Key / ID' : 'Kullanıcı Adı'}
            </label>
            <div className="group/field flex items-center justify-between bg-[#111a22] rounded px-3 py-2 border border-transparent hover:border-border-dark transition-colors">
              <span className="text-white text-sm font-mono truncate select-all">{cred.username}</span>
              <button
                onClick={() => copyToClipboard(cred.username!, `${cred.id}-user`)}
                className="opacity-0 group-hover/field:opacity-100 text-text-secondary hover:text-white transition-opacity"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copiedId === `${cred.id}-user` ? 'check' : 'content_copy'}
                </span>
              </button>
            </div>
          </div>
        )}

        {cred.password && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-[#587593]">
              {cred.type === 'api' ? 'API Secret' : 'Şifre'}
            </label>
            <div
              className="group/field relative flex items-center justify-between bg-[#111a22] rounded px-3 py-2 border border-transparent hover:border-border-dark transition-colors overflow-hidden cursor-pointer"
              onClick={() => toggleVisibility(`${cred.id}-pass`)}
            >
              {!visibleSecrets[`${cred.id}-pass`] && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#111a22]/90 backdrop-blur-sm">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                    <span className="material-symbols-outlined text-[14px]">visibility</span>
                    Görmek için tıkla
                  </span>
                </div>
              )}
              <span
                className={`text-sm font-mono truncate transition-all ${
                  visibleSecrets[`${cred.id}-pass`] ? 'text-white' : 'blur-md text-slate-500 select-none'
                }`}
              >
                {cred.password}
              </span>

              {visibleSecrets[`${cred.id}-pass`] && (
                <div className="flex items-center gap-2 pl-2 bg-[#111a22]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleVisibility(`${cred.id}-pass`)
                    }}
                    className="text-text-secondary hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      copyToClipboard(cred.password!, `${cred.id}-pass`)
                    }}
                    className="text-text-secondary hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copiedId === `${cred.id}-pass` ? 'check' : 'content_copy'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CustomerCredentials() {
  const { credentials, loading, addCredential, updateCredential, deleteCredential } = useCredentials()
  const { clients } = useClients()
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingCredential, setEditingCredential] = useState<CredentialWithClient | null>(null)

  // Get unique clients from credentials
  const clientsWithCredentials = clients.filter(client =>
    credentials.some(cred => cred.client_id === client.id)
  )

  // Filter credentials based on selected client and search
  const filteredCredentials = credentials.filter(cred => {
    const matchesClient = !selectedClientId || cred.client_id === selectedClientId
    const matchesSearch = searchQuery === '' ||
      cred.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.username?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesClient && matchesSearch
  })

  const toggleVisibility = (id: string) => {
    setVisibleSecrets(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleAdd = async (data: Parameters<typeof addCredential>[0]) => {
    await addCredential(data)
    setShowForm(false)
  }

  const handleEdit = async (data: Parameters<typeof updateCredential>[1]) => {
    if (!editingCredential) return
    await updateCredential(editingCredential.id, data)
    setEditingCredential(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kimlik bilgisi silinsin mi?')) return
    await deleteCredential(id)
  }

  const getCredentialsByType = (type: CredentialType) =>
    filteredCredentials.filter(c => c.type === type)

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
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Müşteriler</h2>
            <button
              onClick={() => setShowForm(true)}
              className="text-primary hover:text-blue-400"
            >
              <span className="material-symbols-outlined">add_circle</span>
            </button>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">
              search
            </span>
            <input
              className="w-full bg-[#192633] text-white placeholder-text-secondary text-sm rounded-lg border border-border-dark focus:border-primary focus:ring-1 focus:ring-primary pl-10 pr-3 py-2.5 outline-none transition-all"
              placeholder="Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* All Credentials */}
          <div
            onClick={() => setSelectedClientId(null)}
            className={`group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${
              selectedClientId === null
                ? 'bg-[#1f2e3d] border border-primary/30 shadow-md'
                : 'hover:bg-[#1f2e3d] border border-transparent'
            }`}
          >
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">folder</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold truncate ${selectedClientId === null ? 'text-white' : 'text-slate-300'}`}>
                Tüm Kimlik Bilgileri
              </p>
              <p className="text-text-secondary text-xs truncate">{credentials.length} kayıt</p>
            </div>
          </div>

          {/* Clients with credentials */}
          {clientsWithCredentials.map(client => {
            const clientCredCount = credentials.filter(c => c.client_id === client.id).length
            const initials = `${client.first_name[0]}${client.last_name[0]}`

            return (
              <div
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className={`group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${
                  selectedClientId === client.id
                    ? 'bg-[#1f2e3d] border border-primary/30 shadow-md'
                    : 'hover:bg-[#1f2e3d] border border-transparent'
                }`}
              >
                <div className="size-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${selectedClientId === client.id ? 'text-white' : 'text-slate-300'}`}>
                    {client.first_name} {client.last_name}
                  </p>
                  <p className="text-text-secondary text-xs truncate">
                    {client.company || `${clientCredCount} kimlik bilgisi`}
                  </p>
                </div>
                {selectedClientId === client.id && (
                  <span className="material-symbols-outlined text-primary text-[20px]">chevron_right</span>
                )}
              </div>
            )
          })}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-background-dark min-w-0 overflow-hidden">
        {/* Header */}
        <header className="px-8 py-6 border-b border-border-dark bg-surface-dark/50 backdrop-blur-sm flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-black text-white leading-tight tracking-tight">
              {selectedClientId
                ? `${clients.find(c => c.id === selectedClientId)?.first_name} ${clients.find(c => c.id === selectedClientId)?.last_name}`
                : 'Tüm Kimlik Bilgileri'}
            </h1>
            <p className="text-text-secondary text-sm">
              {filteredCredentials.length} kimlik bilgisi
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex h-10 items-center justify-center gap-2 px-5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Yeni Ekle
          </button>
        </header>

        {/* Credentials Grid */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-6xl mx-auto">
            {filteredCredentials.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <span className="material-symbols-rounded text-text-secondary text-6xl mb-4">lock</span>
                <p className="text-text-secondary text-lg mb-4">Henüz kimlik bilgisi yok</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-rounded">add</span>
                  İlk Kimlik Bilgisini Ekle
                </button>
              </div>
            ) : (
              <>
                {/* Web Logins */}
                {getCredentialsByType('web').length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-text-secondary">language</span>
                      Web Erişimi
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {getCredentialsByType('web').map(cred => (
                        <CredentialCard
                          key={cred.id}
                          cred={cred}
                          visibleSecrets={visibleSecrets}
                          toggleVisibility={toggleVisibility}
                          copiedId={copiedId}
                          copyToClipboard={copyToClipboard}
                          onEdit={() => setEditingCredential(cred)}
                          onDelete={() => handleDelete(cred.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* SSH */}
                {getCredentialsByType('ssh').length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-text-secondary">dns</span>
                      Sunucu & SSH
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {getCredentialsByType('ssh').map(cred => (
                        <CredentialCard
                          key={cred.id}
                          cred={cred}
                          visibleSecrets={visibleSecrets}
                          toggleVisibility={toggleVisibility}
                          copiedId={copiedId}
                          copyToClipboard={copyToClipboard}
                          onEdit={() => setEditingCredential(cred)}
                          onDelete={() => handleDelete(cred.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Databases */}
                {getCredentialsByType('db').length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-text-secondary">database</span>
                      Veritabanı
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {getCredentialsByType('db').map(cred => (
                        <CredentialCard
                          key={cred.id}
                          cred={cred}
                          visibleSecrets={visibleSecrets}
                          toggleVisibility={toggleVisibility}
                          copiedId={copiedId}
                          copyToClipboard={copyToClipboard}
                          onEdit={() => setEditingCredential(cred)}
                          onDelete={() => handleDelete(cred.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* APIs */}
                {getCredentialsByType('api').length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-text-secondary">api</span>
                      API Anahtarları
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {getCredentialsByType('api').map(cred => (
                        <CredentialCard
                          key={cred.id}
                          cred={cred}
                          visibleSecrets={visibleSecrets}
                          toggleVisibility={toggleVisibility}
                          copiedId={copiedId}
                          copyToClipboard={copyToClipboard}
                          onEdit={() => setEditingCredential(cred)}
                          onDelete={() => handleDelete(cred.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Yeni Kimlik Bilgisi">
        <CredentialForm
          clients={clients}
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
          preselectedClientId={selectedClientId || undefined}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingCredential} onClose={() => setEditingCredential(null)} title="Kimlik Bilgisi Düzenle">
        {editingCredential && (
          <CredentialForm
            clients={clients}
            onSubmit={handleEdit}
            onCancel={() => setEditingCredential(null)}
            initialData={editingCredential}
          />
        )}
      </Modal>
    </div>
  )
}
