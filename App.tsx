import { useState } from 'react';
import { useAuth } from './lib/AuthContext';
import Login from './screens/Login';
import SalesKanban from './screens/SalesKanban';
import CreateProposal from './screens/CreateProposal';
import MeetingNotes from './screens/MeetingNotes';
import CustomerCredentials from './screens/CustomerCredentials';
import FinanceDashboard from './screens/FinanceDashboard';
import CodeSnippets from './screens/CodeSnippets';

enum Screen {
  KANBAN = 'KANBAN',
  PROPOSAL = 'PROPOSAL',
  NOTES = 'NOTES',
  CREDENTIALS = 'CREDENTIALS',
  FINANCE = 'FINANCE',
  SNIPPETS = 'SNIPPETS'
}

export default function App() {
  const { user, loading, signOut } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.KANBAN);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex h-screen w-screen bg-background-dark items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-rounded text-primary text-4xl animate-spin">progress_activity</span>
          <p className="text-text-secondary">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return <Login />;
  }

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
      </main>
    </div>
  );
}
