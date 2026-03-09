import {
  Calendar,
  Bot,
  CheckSquare,
  ChevronRight,
  FileText,
  LayoutGrid,
  Loader2,
  LogOut,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  Timer,
  User,
  Wallet,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Button } from './components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";
import { useAuth } from './lib/AuthContext';
import { cn } from './lib/utils';
import AuthCallback from './screens/AuthCallback';
import CalendarBookings from './screens/CalendarBookings';
import CustomerCredentials from './screens/CustomerCredentials';
import FinanceDashboard from './screens/FinanceDashboard';
import Login from './screens/Login';
import MeetingNotes from './screens/MeetingNotes';
import PublicBooking from './screens/PublicBooking';
import SalesKanban from './screens/SalesKanban';
import TimerPage from './screens/TimerPage';
import TikTokOpsCenter from './screens/TikTokOpsCenter';
import WonJobs from './screens/WonJobs';

enum Screen {
  KANBAN = 'KANBAN',
  WON_JOBS = 'WON_JOBS',
  NOTES = 'NOTES',
  CREDENTIALS = 'CREDENTIALS',
  FINANCE = 'FINANCE',
  TIMER = 'TIMER',
  CALENDAR = 'CALENDAR',
  TIKTOK_OPS = 'TIKTOK_OPS'
}

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="flex h-screen w-screen bg-background items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="size-8 text-primary animate-spin" />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Sistem Yükleniyor</p>
      </div>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return <>{children}</>;
}

// Main Dashboard (protected)
function Dashboard() {
  const { signOut, user } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.KANBAN);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const NavItem = ({ screen, icon: Icon, label }: { screen: Screen; icon: any; label: string }) => (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setCurrentScreen(screen)}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-300 group relative",
              currentScreen === screen
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:bg-card hover:text-foreground hover:shadow-sm"
            )}
          >
            <Icon className={cn("size-4.5 shrink-0 transition-transform group-hover:scale-110", currentScreen === screen ? "text-primary-foreground" : "text-muted-foreground")} />
            {!isSidebarCollapsed && <span className="text-xs font-semibold tracking-tight">{label}</span>}
            
            {currentScreen === screen && !isSidebarCollapsed && (
              <div className="ml-auto flex items-center gap-1">
                 <div className="size-1 rounded-full bg-primary-foreground/40" />
                 <ChevronRight className="size-3 text-primary-foreground/60" />
              </div>
            )}
            
            {currentScreen === screen && isSidebarCollapsed && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
            )}
          </button>
        </TooltipTrigger>
        {isSidebarCollapsed && (
          <TooltipContent side="right" className="font-bold text-xs">
            {label}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden font-display antialiased">
      {/* Premium Minimalist Sidebar */}
      <nav className={cn(
        "flex flex-col bg-card/80 backdrop-blur-xl border-r border-border/20 transition-all duration-500 ease-in-out z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]",
        isSidebarCollapsed ? "w-20 p-3" : "w-72 p-6"
      )}>
        {/* Brand */}
        <div className={cn("flex items-center gap-3 mb-10 transition-all duration-300", isSidebarCollapsed ? "justify-center" : "px-2")}>
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <Zap className="size-5 text-primary-foreground fill-primary-foreground opacity-90" />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-black tracking-tighter text-2xl leading-none">FREE.OS</span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Freelancer Workspace</span>
            </div>
          )}
        </div>

        {/* Menu Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-10 size-6 bg-card border rounded-full shadow-sm z-50 hover:bg-accent"
        >
          <Menu className="size-3 text-muted-foreground" />
        </Button>

        {/* Navigation */}
        <div className="flex flex-col gap-1.5 w-full flex-1">
          {!isSidebarCollapsed && <p className="text-xs font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mb-2 px-2">Ana Menü</p>}
          <NavItem screen={Screen.KANBAN} icon={LayoutGrid} label="Satış Süreci" />
          <NavItem screen={Screen.WON_JOBS} icon={CheckSquare} label="Kazanılan İşler" />
          <NavItem screen={Screen.TIMER} icon={Timer} label="Zaman Takibi" />
          
          <div className="my-4 h-px bg-border/40 w-full" />
          
          {!isSidebarCollapsed && <p className="text-xs font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mb-2 px-2">Operasyon</p>}
          <NavItem screen={Screen.CALENDAR} icon={Calendar} label="Takvim & Randevu" />
          <NavItem screen={Screen.TIKTOK_OPS} icon={Bot} label="Operasyon Merkezi" />
          <NavItem screen={Screen.NOTES} icon={FileText} label="Meeting Notes" />
          <NavItem screen={Screen.CREDENTIALS} icon={ShieldCheck} label="Client Vault" />
          <NavItem screen={Screen.FINANCE} icon={Wallet} label="Finans" />
        </div>

        {/* Footer */}
        <div className="mt-auto flex flex-col gap-4">
          {/* Theme Toggle */}
          <div className={cn(
            "flex items-center gap-2 p-1.5 rounded-2xl bg-secondary/30",
            isSidebarCollapsed ? "flex-col" : "flex-row"
          )}>
            <Button
              variant={theme === 'light' ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setTheme('light')}
              className={cn("h-8 flex-1 rounded-xl transition-all", theme === 'light' && "bg-background shadow-sm text-primary")}
            >
              <Sun className="size-4" />
            </Button>
            <Button
              variant={theme === 'dark' ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setTheme('dark')}
              className={cn("h-8 flex-1 rounded-xl transition-all", theme === 'dark' && "bg-background shadow-sm text-primary")}
            >
              <Moon className="size-4" />
            </Button>
          </div>

          <div className={cn("flex items-center gap-3 p-2 rounded-2xl bg-secondary/30", isSidebarCollapsed ? "justify-center" : "")}>
            <div className="size-9 rounded-xl bg-white border flex items-center justify-center shrink-0">
              <User className="size-4 text-muted-foreground" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold truncate leading-none mb-0.5">{user?.email?.split('@')[0]}</span>
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Administrator</span>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            onClick={signOut}
            className={cn(
              "justify-start gap-3 h-11 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all",
              isSidebarCollapsed ? "px-0 justify-center" : ""
            )}
          >
            <LogOut className="size-4 text-muted-foreground/60 transition-colors group-hover:text-destructive" />
            {!isSidebarCollapsed && <span className="text-xs font-bold">Oturumu Kapat</span>}
          </Button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background/80 backdrop-blur-3xl relative">
        <div className="flex-1 overflow-hidden relative">
          {/* Subtle page transitions would go here */}
          {currentScreen === Screen.KANBAN && <SalesKanban />}
          {currentScreen === Screen.WON_JOBS && <WonJobs />}
          {currentScreen === Screen.NOTES && <MeetingNotes />}
          {currentScreen === Screen.CREDENTIALS && <CustomerCredentials />}
          {currentScreen === Screen.FINANCE && <FinanceDashboard />}
          {currentScreen === Screen.TIMER && <TimerPage />}
          {currentScreen === Screen.CALENDAR && <CalendarBookings />}
          {currentScreen === Screen.TIKTOK_OPS && <TikTokOpsCenter />}
        </div>
      </main>
    </div>
  );
}

// Login page wrapper (redirects if already logged in)
function LoginPage() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to="/" replace />;
  return <Login />;
}

// Main App with Router
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/booking/:userId" element={<PublicBooking />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
