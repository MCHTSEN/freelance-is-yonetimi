import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './lib/AuthContext';
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

// Calendar & Bookings screen (placeholder for now)
function CalendarBookings() {
  const { user } = useAuth();
  const bookingLink = `${window.location.origin}/booking/${user?.id}`;

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">Takvim & Randevular</h1>
            <p className="text-text-secondary">Google Calendar entegrasyonu ve randevu yönetimi</p>
          </div>
        </div>

        {/* Public Booking Link */}
        <div className="bg-surface-dark rounded-xl border border-border-dark p-6 mb-6">
          <h2 className="text-lg font-medium text-white mb-4">Randevu Linkiniz</h2>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={bookingLink}
              readOnly
              className="flex-1 bg-background-dark border border-border-dark rounded-lg px-4 py-3 text-white font-mono text-sm"
            />
            <button
              onClick={() => navigator.clipboard.writeText(bookingLink)}
              className="px-4 py-3 bg-primary hover:bg-primary/90 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">content_copy</span>
              Kopyala
            </button>
          </div>
          <p className="text-text-secondary text-sm mt-3">
            Bu linki müşterilerinizle paylaşarak randevu almalarını sağlayabilirsiniz.
          </p>
        </div>

        {/* Google Calendar Connection */}
        <div className="bg-surface-dark rounded-xl border border-border-dark p-6 mb-6">
          <h2 className="text-lg font-medium text-white mb-4">Google Calendar</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-white">calendar_month</span>
              </div>
              <div>
                <p className="text-white font-medium">Google Calendar Bağlantısı</p>
                <p className="text-text-secondary text-sm">Takviminizdeki etkinlikleri senkronize edin</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">link</span>
              Google'a Bağlan
            </button>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-surface-dark rounded-xl border border-border-dark p-6">
          <h2 className="text-lg font-medium text-white mb-4">Yaklaşan Randevular</h2>
          <div className="text-center py-12 text-text-secondary">
            <span className="material-symbols-outlined text-4xl mb-3 block">event_busy</span>
            <p>Henüz randevu bulunmuyor</p>
            <p className="text-sm mt-1">Randevu linkinizi paylaşarak yeni randevular alabilirsiniz</p>
          </div>
        </div>
      </div>
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
