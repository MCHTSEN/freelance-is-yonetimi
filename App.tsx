import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './lib/AuthContext';
import { supabase } from './lib/supabase';
import Login from './screens/Login';
import SalesKanban from './screens/SalesKanban';
import CreateProposal from './screens/CreateProposal';
import MeetingNotes from './screens/MeetingNotes';
import CustomerCredentials from './screens/CustomerCredentials';
import FinanceDashboard from './screens/FinanceDashboard';
import CodeSnippets from './screens/CodeSnippets';
import AuthCallback from './screens/AuthCallback';
import PublicBooking from './screens/PublicBooking';

enum Screen {
  KANBAN = 'KANBAN',
  PROPOSAL = 'PROPOSAL',
  NOTES = 'NOTES',
  CREDENTIALS = 'CREDENTIALS',
  FINANCE = 'FINANCE',
  SNIPPETS = 'SNIPPETS',
  CALENDAR = 'CALENDAR'
}

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="flex h-screen w-screen bg-background-dark items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="material-symbols-rounded text-primary text-4xl animate-spin">progress_activity</span>
        <p className="text-text-secondary">Yükleniyor...</p>
      </div>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Main Dashboard (protected)
function Dashboard() {
  const { signOut } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.KANBAN);

  const NavItem = ({ screen, icon, label }: { screen: Screen; icon: string; label: string }) => (
    <button
      onClick={() => setCurrentScreen(screen)}
      className={`group relative flex items-center justify-center size-12 rounded-xl transition-all duration-200 ${
        currentScreen === screen
          ? 'bg-primary text-white shadow-lg shadow-primary/25'
          : 'text-slate-400 hover:bg-white/10 hover:text-white'
      }`}
      title={label}
    >
      <span className="material-symbols-outlined text-[24px]">{icon}</span>
    </button>
  );

  return (
    <div className="flex h-screen w-screen bg-[#0d141c] text-white overflow-hidden">
      {/* Main OS Dock / Navigation Rail */}
      <nav className="w-20 flex flex-col items-center py-6 gap-6 border-r border-white/5 bg-[#101922] shrink-0 z-50">
        <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
          <span className="material-symbols-outlined text-white text-[24px]">grid_view</span>
        </div>

        <div className="flex flex-col gap-4 w-full px-4 items-center">
          <NavItem screen={Screen.KANBAN} icon="view_kanban" label="Sales Process" />
          <NavItem screen={Screen.PROPOSAL} icon="description" label="Proposals" />
          <NavItem screen={Screen.NOTES} icon="calendar_month" label="Meetings & Notes" />
          <NavItem screen={Screen.CREDENTIALS} icon="lock" label="Customer Credentials" />
          <NavItem screen={Screen.FINANCE} icon="attach_money" label="Finance" />
          <NavItem screen={Screen.SNIPPETS} icon="code" label="Code Snippets" />
          <NavItem screen={Screen.CALENDAR} icon="event" label="Calendar & Bookings" />
        </div>

        <div className="mt-auto flex flex-col gap-4 items-center">
          {/* Logout Button */}
          <button
            onClick={signOut}
            className="size-10 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center justify-center"
            title="Çıkış Yap"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>

          {/* User Avatar */}
          <div className="size-10 rounded-full bg-primary/20 overflow-hidden border border-primary/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[20px]">person</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden bg-background-dark relative">
        {currentScreen === Screen.KANBAN && <SalesKanban />}
        {currentScreen === Screen.PROPOSAL && <CreateProposal />}
        {currentScreen === Screen.NOTES && <MeetingNotes />}
        {currentScreen === Screen.CREDENTIALS && <CustomerCredentials />}
        {currentScreen === Screen.FINANCE && <FinanceDashboard />}
        {currentScreen === Screen.SNIPPETS && <CodeSnippets />}
        {currentScreen === Screen.CALENDAR && <CalendarBookings />}
      </main>
    </div>
  );
}

// Calendar & Bookings screen - Simple meeting scheduler
function CalendarBookings() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [meetings, setMeetings] = useState<{
    id: string;
    client_id: string | null;
    client_name: string;
    scheduled_at: string;
    duration_minutes: number;
    notes: string;
    status: string;
  }[]>([]);
  const [clients, setClients] = useState<{ id: string; first_name: string; last_name: string; company?: string | null; email?: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    client_id: '',
    scheduled_at: '',
    duration_minutes: 30,
    notes: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch meetings and clients
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch meetings
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('*')
          .order('scheduled_at', { ascending: true });

        // Fetch clients
        const { data: clientsData } = await supabase
          .from('clients')
          .select('id, first_name, last_name, company, email')
          .order('first_name');

        setMeetings(bookingsData || []);
        setClients(clientsData || []);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedClient = clients.find(c => c.id === formData.client_id);
      const clientName = selectedClient
        ? `${selectedClient.first_name} ${selectedClient.last_name}`
        : 'Bilinmeyen Müşteri';
      const clientEmail = selectedClient?.email || `${formData.client_id}@client.local`;

      if (editingId) {
        // Update existing meeting
        const { data, error } = await supabase
          .from('bookings')
          .update({
            client_id: formData.client_id || null,
            client_name: clientName,
            client_email: clientEmail,
            scheduled_at: formData.scheduled_at,
            duration_minutes: formData.duration_minutes,
            notes: formData.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId)
          .select()
          .single();

        if (error) throw error;
        setMeetings(prev => prev.map(m => m.id === editingId ? data : m));
      } else {
        // Create new meeting
        const { data, error } = await supabase
          .from('bookings')
          .insert({
            user_id: user?.id || '',
            client_id: formData.client_id || null,
            client_name: clientName,
            client_email: clientEmail,
            scheduled_at: formData.scheduled_at,
            duration_minutes: formData.duration_minutes,
            notes: formData.notes,
            status: 'confirmed'
          })
          .select()
          .single();

        if (error) throw error;
        setMeetings(prev => [...prev, data].sort((a, b) =>
          new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
        ));
      }

      setShowModal(false);
      setFormData({ client_id: '', scheduled_at: '', duration_minutes: 30, notes: '' });
      setEditingId(null);
    } catch (err) {
      console.error('Save error:', err);
      alert('Kaydetme hatası!');
    }
  };

  const handleEdit = (meeting: typeof meetings[0]) => {
    setFormData({
      client_id: meeting.client_id || '',
      scheduled_at: meeting.scheduled_at.slice(0, 16), // Format for datetime-local
      duration_minutes: meeting.duration_minutes || 30,
      notes: meeting.notes || ''
    });
    setEditingId(meeting.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu toplantıyı silmek istediğinize emin misiniz?')) return;
    try {
      await supabase.from('bookings').delete().eq('id', id);
      setMeetings(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const upcomingMeetings = meetings.filter(m =>
    new Date(m.scheduled_at) >= new Date() && m.status !== 'cancelled'
  );
  const pastMeetings = meetings.filter(m =>
    new Date(m.scheduled_at) < new Date() || m.status === 'cancelled'
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background-dark">
        <span className="material-symbols-rounded text-primary text-4xl animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">Toplantılar</h1>
            <p className="text-text-secondary">Müşteri toplantılarınızı yönetin</p>
          </div>
          <button
            onClick={() => {
              setFormData({ client_id: '', scheduled_at: '', duration_minutes: 30, notes: '' });
              setEditingId(null);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Yeni Toplantı
          </button>
        </div>

        {/* Upcoming Meetings */}
        <div className="bg-surface-dark rounded-xl border border-border-dark p-6 mb-6">
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">event</span>
            Yaklaşan Toplantılar ({upcomingMeetings.length})
          </h2>
          {upcomingMeetings.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <span className="material-symbols-outlined text-4xl mb-3 block">event_busy</span>
              <p>Yaklaşan toplantı yok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingMeetings.map(meeting => (
                <div
                  key={meeting.id}
                  className="bg-background-dark rounded-lg p-4 border border-border-dark hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                          {meeting.client_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{meeting.client_name}</h3>
                          <p className="text-text-secondary text-sm">{formatDateTime(meeting.scheduled_at)}</p>
                        </div>
                      </div>
                      {meeting.notes && (
                        <p className="text-text-secondary text-sm mt-2 ml-13">{meeting.notes}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 ml-13">
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                          {meeting.duration_minutes} dakika
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(meeting)}
                        className="p-2 text-text-secondary hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(meeting.id)}
                        className="p-2 text-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Meetings */}
        {pastMeetings.length > 0 && (
          <div className="bg-surface-dark rounded-xl border border-border-dark p-6">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-text-secondary">history</span>
              Geçmiş Toplantılar ({pastMeetings.length})
            </h2>
            <div className="space-y-3">
              {pastMeetings.slice(0, 5).map(meeting => (
                <div
                  key={meeting.id}
                  className="bg-background-dark/50 rounded-lg p-4 border border-border-dark opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-white/10 flex items-center justify-center text-text-secondary text-xs font-bold">
                      {meeting.client_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm">{meeting.client_name}</h3>
                      <p className="text-text-secondary text-xs">{formatDateTime(meeting.scheduled_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-surface-dark rounded-xl border border-border-dark p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold text-white mb-6">
              {editingId ? 'Toplantıyı Düzenle' : 'Yeni Toplantı'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Müşteri</label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
                  className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                  required
                >
                  <option value="">Müşteri seçin...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.first_name} {client.last_name} {client.company ? `(${client.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Tarih</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    { label: 'Bugün', date: new Date() },
                    { label: 'Yarın', date: new Date(Date.now() + 86400000) },
                    { label: '2 Gün Sonra', date: new Date(Date.now() + 2 * 86400000) },
                    { label: 'Bu Hafta Sonu', date: (() => { const d = new Date(); d.setDate(d.getDate() + (6 - d.getDay())); return d; })() },
                  ].map(({ label, date }) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const isSelected = formData.scheduled_at.startsWith(dateStr);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          const currentTime = formData.scheduled_at.split('T')[1] || '10:00';
                          setFormData(prev => ({ ...prev, scheduled_at: `${dateStr}T${currentTime}` }));
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-primary text-white'
                            : 'bg-white/10 text-text-secondary hover:bg-white/20 hover:text-white'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="date"
                  value={formData.scheduled_at.split('T')[0] || ''}
                  onChange={(e) => {
                    const currentTime = formData.scheduled_at.split('T')[1] || '10:00';
                    setFormData(prev => ({ ...prev, scheduled_at: `${e.target.value}T${currentTime}` }));
                  }}
                  className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Saat</label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map(time => {
                    const isSelected = formData.scheduled_at.includes(`T${time}`);
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          const currentDate = formData.scheduled_at.split('T')[0] || new Date().toISOString().split('T')[0];
                          setFormData(prev => ({ ...prev, scheduled_at: `${currentDate}T${time}` }));
                        }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-primary text-white'
                            : 'bg-white/10 text-text-secondary hover:bg-white/20 hover:text-white'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="time"
                  value={formData.scheduled_at.split('T')[1] || ''}
                  onChange={(e) => {
                    const currentDate = formData.scheduled_at.split('T')[0] || new Date().toISOString().split('T')[0];
                    setFormData(prev => ({ ...prev, scheduled_at: `${currentDate}T${e.target.value}` }));
                  }}
                  className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Süre (dakika)</label>
                <select
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: Number(e.target.value) }))}
                  className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
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
                <label className="block text-sm font-medium text-text-secondary mb-2">Notlar (opsiyonel)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary resize-none"
                  rows={3}
                  placeholder="Toplantı konusu, gündem vb."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 rounded-lg text-white font-medium transition-colors"
                >
                  {editingId ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Login page wrapper (redirects if already logged in)
function LoginPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Login />;
}

// Main App with Router
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/booking/:userId" element={<PublicBooking />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
