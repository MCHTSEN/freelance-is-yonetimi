import React, { useState } from 'react';
import SalesKanban from './screens/SalesKanban';
import CreateProposal from './screens/CreateProposal';
import MeetingNotes from './screens/MeetingNotes';
import CustomerCredentials from './screens/CustomerCredentials';
import FinanceDashboard from './screens/FinanceDashboard';

enum Screen {
  KANBAN = 'KANBAN',
  PROPOSAL = 'PROPOSAL',
  NOTES = 'NOTES',
  CREDENTIALS = 'CREDENTIALS',
  FINANCE = 'FINANCE'
}

export default function App() {
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
        </div>

        <div className="mt-auto flex flex-col gap-4">
          <div className="size-10 rounded-full bg-slate-700 overflow-hidden border border-white/10">
             <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBL1_Ye6TOS2wERfNU196H1ydxH7JOn7q9tS8KSisgAFxubytj_M0tDHz4tB4Uy0EyADcMrkRWp7R1ZLT4FQyDR2lb5BI9AFk-cyPwhJM5F0EzE-eO-diselCFlKKOKjQ7tWngFtuWhBAWIn7CTluTDUguiUZNE4v4Wpk3myidqAI26dR_R4HC_5ZQh8mUTcpY09if5rCFvlLds0J_AlYqblQMhpf45V3SXuX_0gDsiYG2RvelA_2AhNeqMOcvMEnVsvyMBM_cv6Zo" alt="User" className="w-full h-full object-cover" />
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
      </main>
    </div>
  );
}