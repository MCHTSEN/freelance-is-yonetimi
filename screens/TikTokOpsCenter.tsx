import {
  Bot,
  CheckCircle2,
  Clock3,
  CreditCard,
  Plus,
  Smartphone,
  Trash2,
  TriangleAlert,
  UserCircle2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { cn } from '../lib/utils';

type AccountStatus = 'active' | 'warming' | 'risky' | 'suspended';
type RiskLevel = 'low' | 'medium' | 'high';
type PhoneHealth = 'good' | 'warning' | 'critical';
type SubscriptionStatus = 'trial' | 'active' | 'paused' | 'cancelled';
type AutomationType = 'video' | 'visual';
type AutomationFrequency = '6h' | '12h' | 'daily' | 'weekly';
type AutomationStatus = 'active' | 'paused';

type Phone = {
  id: string;
  name: string;
  model: string;
  simNumber: string;
  proxyTag: string;
  maxAccounts: number;
  health: PhoneHealth;
  lastResetAt: string;
};

type Account = {
  id: string;
  handle: string;
  niche: string;
  owner: string;
  status: AccountStatus;
  risk: RiskLevel;
  phoneId: string | null;
  lastLoginAt: string;
  lastPostAt: string;
};

type SubscriptionPayment = {
  id: string;
  amount: number;
  paidAt: string;
  note: string;
};

type Subscription = {
  id: string;
  platform: string;
  plan: string;
  startAt: string;
  trialEndsAt: string | null;
  renewalAt: string | null;
  currency: 'TRY' | 'USD' | 'EUR';
  monthlyCost: number;
  status: SubscriptionStatus;
  notes: string;
  payments: SubscriptionPayment[];
};

type Automation = {
  id: string;
  name: string;
  type: AutomationType;
  accountId: string | null;
  promptTemplate: string;
  frequency: AutomationFrequency;
  status: AutomationStatus;
  outputPath: string;
  runCount: number;
  successCount: number;
  lastRunAt: string | null;
  nextRunAt: string | null;
};

type OpsState = {
  phones: Phone[];
  accounts: Account[];
  subscriptions: Subscription[];
  automations: Automation[];
};

const STORAGE_KEY = 'tiktok_ops_center_v1';

const today = new Date().toISOString().slice(0, 10);
const nowIso = new Date().toISOString();

const defaultState: OpsState = {
  phones: [
    {
      id: 'ph-1',
      name: 'iPhone-01',
      model: 'iPhone 13',
      simNumber: '+90 555 000 11 01',
      proxyTag: 'TR-RES-01',
      maxAccounts: 3,
      health: 'good',
      lastResetAt: today,
    },
    {
      id: 'ph-2',
      name: 'Android-03',
      model: 'Samsung A54',
      simNumber: '+90 555 000 11 02',
      proxyTag: 'TR-MOB-07',
      maxAccounts: 2,
      health: 'warning',
      lastResetAt: today,
    },
  ],
  accounts: [
    {
      id: 'acc-1',
      handle: '@freelancegrowth_tr',
      niche: 'Pazarlama',
      owner: 'Mert',
      status: 'active',
      risk: 'low',
      phoneId: 'ph-1',
      lastLoginAt: nowIso,
      lastPostAt: nowIso,
    },
    {
      id: 'acc-2',
      handle: '@agencyfunnellab',
      niche: 'Ajans',
      owner: 'Zeynep',
      status: 'warming',
      risk: 'medium',
      phoneId: 'ph-2',
      lastLoginAt: nowIso,
      lastPostAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    },
  ],
  subscriptions: [
    {
      id: 'sub-1',
      platform: 'CapCut Pro',
      plan: 'Team',
      startAt: today,
      trialEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6).toISOString().slice(0, 10),
      renewalAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
      currency: 'USD',
      monthlyCost: 19.99,
      status: 'trial',
      notes: 'Video şablon üretimi',
      payments: [],
    },
    {
      id: 'sub-2',
      platform: 'OpenClaw Cloud',
      plan: 'Automation-50k',
      startAt: today,
      trialEndsAt: null,
      renewalAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString().slice(0, 10),
      currency: 'USD',
      monthlyCost: 49,
      status: 'active',
      notes: 'Video ve görsel render',
      payments: [
        {
          id: 'pay-1',
          amount: 49,
          paidAt: today,
          note: 'İlk ödeme',
        },
      ],
    },
  ],
  automations: [
    {
      id: 'aut-1',
      name: 'Hook-Video Factory',
      type: 'video',
      accountId: 'acc-1',
      promptTemplate: 'HOOK -> Script -> Voice -> Caption -> 3 varyasyon',
      frequency: 'daily',
      status: 'active',
      outputPath: '/content/tiktok/videos',
      runCount: 12,
      successCount: 10,
      lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    },
    {
      id: 'aut-2',
      name: 'Carousel Visual Batch',
      type: 'visual',
      accountId: 'acc-2',
      promptTemplate: 'A/B görsel üretimi + CTA overlay',
      frequency: '12h',
      status: 'active',
      outputPath: '/content/tiktok/visuals',
      runCount: 20,
      successCount: 17,
      lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
    },
  ],
};

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function formatDate(value: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('tr-TR');
}

function formatDateTime(value: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function calculateDaysLeft(dateValue: string | null) {
  if (!dateValue) return null;
  const target = new Date(dateValue);
  const diff = target.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function calculateNextRun(base: Date, frequency: AutomationFrequency) {
  const minutesByFrequency: Record<AutomationFrequency, number> = {
    '6h': 60 * 6,
    '12h': 60 * 12,
    daily: 60 * 24,
    weekly: 60 * 24 * 7,
  };
  return new Date(base.getTime() + minutesByFrequency[frequency] * 60 * 1000).toISOString();
}

function getStatusBadge(status: AccountStatus) {
  if (status === 'active') return <Badge className="text-[10px] uppercase">Aktif</Badge>;
  if (status === 'warming') return <Badge variant="secondary" className="text-[10px] uppercase">Isınma</Badge>;
  if (status === 'risky') return <Badge variant="destructive" className="text-[10px] uppercase">Riskte</Badge>;
  return <Badge variant="outline" className="text-[10px] uppercase">Askıda</Badge>;
}

function getRiskBadge(level: RiskLevel) {
  if (level === 'low') return <Badge variant="outline" className="text-[10px]">Düşük</Badge>;
  if (level === 'medium') return <Badge variant="secondary" className="text-[10px]">Orta</Badge>;
  return <Badge variant="destructive" className="text-[10px]">Yüksek</Badge>;
}

function getPhoneHealthBadge(health: PhoneHealth) {
  if (health === 'good') return <Badge className="text-[10px]">Sağlıklı</Badge>;
  if (health === 'warning') return <Badge variant="secondary" className="text-[10px]">Uyarı</Badge>;
  return <Badge variant="destructive" className="text-[10px]">Kritik</Badge>;
}

function getSubscriptionStatusBadge(status: SubscriptionStatus) {
  if (status === 'trial') return <Badge variant="secondary" className="text-[10px] uppercase">Trial</Badge>;
  if (status === 'active') return <Badge className="text-[10px] uppercase">Aktif</Badge>;
  if (status === 'paused') return <Badge variant="outline" className="text-[10px] uppercase">Duraklatıldı</Badge>;
  return <Badge variant="destructive" className="text-[10px] uppercase">İptal</Badge>;
}

function getAutomationTypeBadge(type: AutomationType) {
  if (type === 'video') return <Badge className="text-[10px] uppercase">Video</Badge>;
  return <Badge variant="secondary" className="text-[10px] uppercase">Görsel</Badge>;
}

function formatCurrencyBuckets(buckets: Record<'TRY' | 'USD' | 'EUR', number>) {
  return (Object.keys(buckets) as Array<'TRY' | 'USD' | 'EUR'>)
    .filter(currency => buckets[currency] > 0)
    .map(currency =>
      `${currency} ${buckets[currency].toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    )
    .join(' | ') || '0';
}

export default function TikTokOpsCenter() {
  const [state, setState] = useState<OpsState>(defaultState);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showAutomationDialog, setShowAutomationDialog] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);

  const [phoneForm, setPhoneForm] = useState({
    name: '',
    model: '',
    simNumber: '',
    proxyTag: '',
    maxAccounts: '2',
    health: 'good' as PhoneHealth,
  });

  const [accountForm, setAccountForm] = useState({
    handle: '',
    niche: '',
    owner: '',
    status: 'active' as AccountStatus,
    risk: 'low' as RiskLevel,
    phoneId: 'none',
  });

  const [subscriptionForm, setSubscriptionForm] = useState({
    platform: '',
    plan: '',
    startAt: today,
    trialEndsAt: '',
    renewalAt: '',
    currency: 'USD' as 'TRY' | 'USD' | 'EUR',
    monthlyCost: '',
    status: 'trial' as SubscriptionStatus,
    notes: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paidAt: today,
    note: '',
  });

  const [automationForm, setAutomationForm] = useState({
    name: '',
    type: 'video' as AutomationType,
    accountId: 'none',
    promptTemplate: '',
    frequency: 'daily' as AutomationFrequency,
    status: 'active' as AutomationStatus,
    outputPath: '/content/tiktok',
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as OpsState;
      if (!parsed?.accounts || !parsed?.phones || !parsed?.subscriptions || !parsed?.automations) return;
      setState(parsed);
    } catch {
      // Keep defaults if local state parsing fails.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const assignedCounts = useMemo(() => {
    return state.accounts.reduce<Record<string, number>>((acc, account) => {
      if (!account.phoneId) return acc;
      acc[account.phoneId] = (acc[account.phoneId] || 0) + 1;
      return acc;
    }, {});
  }, [state.accounts]);

  const stats = useMemo(() => {
    const monthlyByCurrency: Record<'TRY' | 'USD' | 'EUR', number> = { TRY: 0, USD: 0, EUR: 0 };
    const paidByCurrency: Record<'TRY' | 'USD' | 'EUR', number> = { TRY: 0, USD: 0, EUR: 0 };

    state.subscriptions.forEach(sub => {
      if (sub.status !== 'cancelled') {
        monthlyByCurrency[sub.currency] += sub.monthlyCost;
      }
      const paid = sub.payments.reduce((total, payment) => total + payment.amount, 0);
      paidByCurrency[sub.currency] += paid;
    });

    const trialsEndingSoon = state.subscriptions.filter(sub => {
      const left = calculateDaysLeft(sub.trialEndsAt);
      return left !== null && left >= 0 && left <= 7;
    }).length;

    const inactiveAccounts = state.accounts.filter(account => {
      const diff = Date.now() - new Date(account.lastPostAt).getTime();
      return diff > 1000 * 60 * 60 * 24;
    }).length;

    return {
      monthlyByCurrency,
      paidByCurrency,
      trialsEndingSoon,
      inactiveAccounts,
      activeAutomations: state.automations.filter(auto => auto.status === 'active').length,
    };
  }, [state.subscriptions, state.accounts, state.automations]);

  const removePhone = (phoneId: string) => {
    setState(prev => ({
      ...prev,
      phones: prev.phones.filter(phone => phone.id !== phoneId),
      accounts: prev.accounts.map(account =>
        account.phoneId === phoneId ? { ...account, phoneId: null } : account
      ),
    }));
  };

  const removeAccount = (accountId: string) => {
    setState(prev => ({
      ...prev,
      accounts: prev.accounts.filter(account => account.id !== accountId),
      automations: prev.automations.map(auto =>
        auto.accountId === accountId ? { ...auto, accountId: null } : auto
      ),
    }));
  };

  const removeSubscription = (subscriptionId: string) => {
    setState(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.filter(sub => sub.id !== subscriptionId),
    }));
  };

  const removeAutomation = (automationId: string) => {
    setState(prev => ({
      ...prev,
      automations: prev.automations.filter(auto => auto.id !== automationId),
    }));
  };

  const onAddPhone = () => {
    if (!phoneForm.name.trim()) return;
    const newPhone: Phone = {
      id: createId('phone'),
      name: phoneForm.name.trim(),
      model: phoneForm.model.trim() || 'Belirtilmedi',
      simNumber: phoneForm.simNumber.trim() || '-',
      proxyTag: phoneForm.proxyTag.trim() || '-',
      maxAccounts: Number(phoneForm.maxAccounts) || 1,
      health: phoneForm.health,
      lastResetAt: today,
    };

    setState(prev => ({ ...prev, phones: [...prev.phones, newPhone] }));
    setShowPhoneDialog(false);
    setPhoneForm({
      name: '',
      model: '',
      simNumber: '',
      proxyTag: '',
      maxAccounts: '2',
      health: 'good',
    });
  };

  const onAddAccount = () => {
    if (!accountForm.handle.trim()) return;
    const now = new Date().toISOString();
    const newAccount: Account = {
      id: createId('account'),
      handle: accountForm.handle.trim().startsWith('@')
        ? accountForm.handle.trim()
        : `@${accountForm.handle.trim()}`,
      niche: accountForm.niche.trim() || 'Genel',
      owner: accountForm.owner.trim() || 'Atanmadı',
      status: accountForm.status,
      risk: accountForm.risk,
      phoneId: accountForm.phoneId === 'none' ? null : accountForm.phoneId,
      lastLoginAt: now,
      lastPostAt: now,
    };

    setState(prev => ({ ...prev, accounts: [...prev.accounts, newAccount] }));
    setShowAccountDialog(false);
    setAccountForm({
      handle: '',
      niche: '',
      owner: '',
      status: 'active',
      risk: 'low',
      phoneId: 'none',
    });
  };

  const onAddSubscription = () => {
    if (!subscriptionForm.platform.trim()) return;
    const monthlyCost = Number(subscriptionForm.monthlyCost) || 0;
    const newSubscription: Subscription = {
      id: createId('sub'),
      platform: subscriptionForm.platform.trim(),
      plan: subscriptionForm.plan.trim() || 'Standard',
      startAt: subscriptionForm.startAt,
      trialEndsAt: subscriptionForm.trialEndsAt || null,
      renewalAt: subscriptionForm.renewalAt || null,
      currency: subscriptionForm.currency,
      monthlyCost,
      status: subscriptionForm.status,
      notes: subscriptionForm.notes.trim(),
      payments: [],
    };

    setState(prev => ({ ...prev, subscriptions: [...prev.subscriptions, newSubscription] }));
    setShowSubscriptionDialog(false);
    setSubscriptionForm({
      platform: '',
      plan: '',
      startAt: today,
      trialEndsAt: '',
      renewalAt: '',
      currency: 'USD',
      monthlyCost: '',
      status: 'trial',
      notes: '',
    });
  };

  const onAddPayment = () => {
    if (!selectedSubscriptionId) return;
    const amount = Number(paymentForm.amount);
    if (!amount || amount <= 0) return;

    setState(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(sub => {
        if (sub.id !== selectedSubscriptionId) return sub;
        return {
          ...sub,
          payments: [
            ...sub.payments,
            {
              id: createId('pay'),
              amount,
              paidAt: paymentForm.paidAt,
              note: paymentForm.note.trim(),
            },
          ],
        };
      }),
    }));

    setShowPaymentDialog(false);
    setSelectedSubscriptionId(null);
    setPaymentForm({
      amount: '',
      paidAt: today,
      note: '',
    });
  };

  const onAddAutomation = () => {
    if (!automationForm.name.trim()) return;
    const base = new Date();
    const newAutomation: Automation = {
      id: createId('auto'),
      name: automationForm.name.trim(),
      type: automationForm.type,
      accountId: automationForm.accountId === 'none' ? null : automationForm.accountId,
      promptTemplate: automationForm.promptTemplate.trim() || 'Hook > Script > Render > Caption',
      frequency: automationForm.frequency,
      status: automationForm.status,
      outputPath: automationForm.outputPath.trim() || '/content/tiktok',
      runCount: 0,
      successCount: 0,
      lastRunAt: null,
      nextRunAt: calculateNextRun(base, automationForm.frequency),
    };

    setState(prev => ({ ...prev, automations: [...prev.automations, newAutomation] }));
    setShowAutomationDialog(false);
    setAutomationForm({
      name: '',
      type: 'video',
      accountId: 'none',
      promptTemplate: '',
      frequency: 'daily',
      status: 'active',
      outputPath: '/content/tiktok',
    });
  };

  const assignPhone = (accountId: string, phoneId: string) => {
    setState(prev => ({
      ...prev,
      accounts: prev.accounts.map(account =>
        account.id === accountId ? { ...account, phoneId: phoneId === 'none' ? null : phoneId } : account
      ),
    }));
  };

  const toggleAutomationStatus = (automationId: string) => {
    setState(prev => ({
      ...prev,
      automations: prev.automations.map(auto => {
        if (auto.id !== automationId) return auto;
        return { ...auto, status: auto.status === 'active' ? 'paused' : 'active' };
      }),
    }));
  };

  const registerRun = (automationId: string, success: boolean) => {
    const now = new Date();
    setState(prev => ({
      ...prev,
      automations: prev.automations.map(auto => {
        if (auto.id !== automationId) return auto;
        return {
          ...auto,
          runCount: auto.runCount + 1,
          successCount: success ? auto.successCount + 1 : auto.successCount,
          lastRunAt: now.toISOString(),
          nextRunAt: calculateNextRun(now, auto.frequency),
        };
      }),
    }));
  };

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      <header className="px-8 py-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Bot className="size-4 text-primary" />
            <span className="text-primary text-xs uppercase font-bold tracking-[0.2em] opacity-80">Tiktok Operasyon</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Operasyon Merkezi</h1>
          <p className="text-muted-foreground text-sm max-w-3xl mt-1">
            Hesap, telefon, abonelik ve OpenClaw içerik otomasyonunu tek panelden yönet.
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-8 pb-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            <Card className="bg-card/60 border-border/40">
              <CardContent className="p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Hesap</p>
                <p className="text-3xl font-bold mt-2">{state.accounts.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/60 border-border/40">
              <CardContent className="p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Telefon</p>
                <p className="text-3xl font-bold mt-2">{state.phones.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/60 border-border/40">
              <CardContent className="p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Trial Bitecek</p>
                <p className="text-3xl font-bold mt-2">{stats.trialsEndingSoon}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/60 border-border/40">
              <CardContent className="p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Aylık Abonelik</p>
                <p className="text-sm font-bold mt-2">{formatCurrencyBuckets(stats.monthlyByCurrency)}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/60 border-border/40">
              <CardContent className="p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Aktif Otomasyon</p>
                <p className="text-3xl font-bold mt-2">{stats.activeAutomations}</p>
              </CardContent>
            </Card>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-1 border-border/40 bg-card/50">
              <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg">Telefon Envanteri</h2>
                  <p className="text-xs text-muted-foreground mt-1">Cihaz kapasitesi ve sağlık durumu</p>
                </div>
                <Button size="sm" className="gap-2 h-8" onClick={() => setShowPhoneDialog(true)}>
                  <Plus className="size-3.5" /> Ekle
                </Button>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3">
                {state.phones.map(phone => {
                  const assigned = assignedCounts[phone.id] || 0;
                  const isOverCapacity = assigned > phone.maxAccounts;
                  return (
                    <div key={phone.id} className={cn(
                      'rounded-xl border p-3 space-y-2',
                      isOverCapacity ? 'border-destructive/60 bg-destructive/5' : 'border-border/50 bg-background/40'
                    )}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Smartphone className="size-4 text-primary" />
                          <p className="font-semibold text-sm">{phone.name}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          onClick={() => removePhone(phone.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>{phone.model}</p>
                        <p>SIM: {phone.simNumber}</p>
                        <p>Proxy: {phone.proxyTag}</p>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        {getPhoneHealthBadge(phone.health)}
                        <Badge variant={isOverCapacity ? 'destructive' : 'outline'} className="text-[10px]">
                          {assigned}/{phone.maxAccounts} hesap
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="xl:col-span-2 border-border/40 bg-card/50">
              <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg">TikTok Hesapları</h2>
                  <p className="text-xs text-muted-foreground mt-1">Hesap sağlığı, atama ve son aktivite</p>
                </div>
                <Button size="sm" className="gap-2 h-8" onClick={() => setShowAccountDialog(true)}>
                  <Plus className="size-3.5" /> Hesap Ekle
                </Button>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hesap</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Telefon Ataması</TableHead>
                      <TableHead>Son Gönderi</TableHead>
                      <TableHead className="w-[56px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.accounts.map(account => (
                      <TableRow key={account.id}>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-sm">{account.handle}</p>
                            <p className="text-xs text-muted-foreground">{account.niche} • {account.owner}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(account.status)}</TableCell>
                        <TableCell>{getRiskBadge(account.risk)}</TableCell>
                        <TableCell className="min-w-[200px]">
                          <Select
                            value={account.phoneId ?? 'none'}
                            onValueChange={(value) => assignPhone(account.id, value)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Telefon seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Atanmadı</SelectItem>
                              {state.phones.map(phone => (
                                <SelectItem key={phone.id} value={phone.id}>
                                  {phone.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            'text-xs font-medium',
                            Date.now() - new Date(account.lastPostAt).getTime() > 1000 * 60 * 60 * 24
                              ? 'text-amber-500'
                              : 'text-muted-foreground'
                          )}>
                            {formatDateTime(account.lastPostAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => removeAccount(account.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card className="border-border/40 bg-card/50">
              <CardHeader className="p-5 pb-3 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="font-bold text-lg">Abonelik ve Trial Takibi</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Trial bitiş tarihi, aylık maliyet ve toplam ödenen tutarı tek noktada izle.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-[10px]">Toplam Ödenen: {formatCurrencyBuckets(stats.paidByCurrency)}</Badge>
                  <Button size="sm" className="gap-2 h-8" onClick={() => setShowSubscriptionDialog(true)}>
                    <Plus className="size-3.5" /> Abonelik Ekle
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Trial</TableHead>
                      <TableHead>Aylık</TableHead>
                      <TableHead>Ödenen</TableHead>
                      <TableHead>Yenileme</TableHead>
                      <TableHead className="w-[150px]">İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.subscriptions.map(subscription => {
                      const daysLeft = calculateDaysLeft(subscription.trialEndsAt);
                      const paid = subscription.payments.reduce((sum, payment) => sum + payment.amount, 0);
                      return (
                        <TableRow key={subscription.id}>
                          <TableCell>
                            <div>
                              <p className="font-semibold text-sm">{subscription.platform}</p>
                              <p className="text-xs text-muted-foreground">{subscription.notes || '-'}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">{subscription.plan}</TableCell>
                          <TableCell>{getSubscriptionStatusBadge(subscription.status)}</TableCell>
                          <TableCell>
                            {subscription.trialEndsAt ? (
                              <div className="text-xs space-y-0.5">
                                <p>{formatDate(subscription.trialEndsAt)}</p>
                                <p className={cn(
                                  'font-semibold',
                                  (daysLeft ?? 99) <= 3 ? 'text-destructive' : 'text-muted-foreground'
                                )}>
                                  {daysLeft !== null ? `${daysLeft} gün` : '-'}
                                </p>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs font-medium">
                            {subscription.monthlyCost.toLocaleString('tr-TR', {
                              style: 'currency',
                              currency: subscription.currency,
                            })}
                          </TableCell>
                          <TableCell className="text-xs font-medium">
                            {paid.toLocaleString('tr-TR', {
                              style: 'currency',
                              currency: subscription.currency,
                            })}
                          </TableCell>
                          <TableCell className="text-xs">{formatDate(subscription.renewalAt)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-[11px]"
                                onClick={() => {
                                  setSelectedSubscriptionId(subscription.id);
                                  setShowPaymentDialog(true);
                                }}
                              >
                                Ödeme
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                onClick={() => removeSubscription(subscription.id)}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2 border-border/40 bg-card/50">
              <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg">OpenClaw İçerik Otomasyonu</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Video/görsel üretim akışlarını takip et, koşu başarısını ölç.
                  </p>
                </div>
                <Button size="sm" className="gap-2 h-8" onClick={() => setShowAutomationDialog(true)}>
                  <Plus className="size-3.5" /> Akış Ekle
                </Button>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Akış</TableHead>
                      <TableHead>Tür</TableHead>
                      <TableHead>Hesap</TableHead>
                      <TableHead>Sıklık</TableHead>
                      <TableHead>Başarı</TableHead>
                      <TableHead>Sonraki Çalışma</TableHead>
                      <TableHead className="w-[210px]">Aksiyon</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.automations.map(auto => {
                      const successRate = auto.runCount === 0 ? 0 : Math.round((auto.successCount / auto.runCount) * 100);
                      const account = state.accounts.find(acc => acc.id === auto.accountId);
                      return (
                        <TableRow key={auto.id}>
                          <TableCell>
                            <div>
                              <p className="font-semibold text-sm">{auto.name}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[260px]">{auto.promptTemplate}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getAutomationTypeBadge(auto.type)}</TableCell>
                          <TableCell className="text-xs">{account?.handle || 'Genel Havuz'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] uppercase">{auto.frequency}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <p className="font-semibold">{successRate}%</p>
                              <p className="text-muted-foreground">{auto.successCount}/{auto.runCount}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">{formatDateTime(auto.nextRunAt)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-[11px]"
                                onClick={() => registerRun(auto.id, true)}
                              >
                                <CheckCircle2 className="size-3.5 mr-1" />
                                Başarılı
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-[11px]"
                                onClick={() => registerRun(auto.id, false)}
                              >
                                Hata
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  'h-7 w-7',
                                  auto.status === 'active' ? 'text-primary' : 'text-muted-foreground'
                                )}
                                onClick={() => toggleAutomationStatus(auto.id)}
                                title={auto.status === 'active' ? 'Duraklat' : 'Aktif et'}
                              >
                                <Clock3 className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                onClick={() => removeAutomation(auto.id)}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/50">
              <CardHeader className="p-5 pb-3">
                <h2 className="font-bold text-lg">OpenClaw Checkpoint</h2>
                <p className="text-xs text-muted-foreground mt-1">Önerilen üretim standardı</p>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3 text-xs">
                <div className="rounded-xl border border-border/60 p-3 bg-background/40">
                  <p className="font-semibold mb-1">1) Brief Standardı</p>
                  <p className="text-muted-foreground">Hedef persona, içerik açısı, CTA ve yasaklı kelime listesini prompt içine zorunlu alan yap.</p>
                </div>
                <div className="rounded-xl border border-border/60 p-3 bg-background/40">
                  <p className="font-semibold mb-1">2) A/B Batch Üretim</p>
                  <p className="text-muted-foreground">Her çalıştırmada 3 video + 3 kapak + 2 açıklama varyasyonu üret ve en iyi kombinasyonu işaretle.</p>
                </div>
                <div className="rounded-xl border border-border/60 p-3 bg-background/40">
                  <p className="font-semibold mb-1">3) QA Gate</p>
                  <p className="text-muted-foreground">Filigran, çözünürlük, ses clipping ve caption taşması kontrolleri geçmeden yayın kuyruğuna alma.</p>
                </div>
                <div className="rounded-xl border border-amber-500/40 p-3 bg-amber-500/5">
                  <p className="font-semibold mb-1 flex items-center gap-1">
                    <TriangleAlert className="size-3.5 text-amber-500" />
                    Risk Kontrolü
                  </p>
                  <p className="text-muted-foreground">Aynı gün aynı cihazda ardışık çoklu hesap değişimi varsa planı yavaşlat.</p>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border/40 bg-card/50">
              <CardContent className="p-4 flex items-center gap-3">
                <TriangleAlert className="size-5 text-amber-500" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.15em]">Paylaşım Uyarısı</p>
                  <p className="font-bold">{stats.inactiveAccounts} hesap 24+ saattir içerik atmadı</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card/50">
              <CardContent className="p-4 flex items-center gap-3">
                <CreditCard className="size-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.15em]">Maliyet Takibi</p>
                  <p className="font-bold">Toplam ödeme: {formatCurrencyBuckets(stats.paidByCurrency)}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card/50">
              <CardContent className="p-4 flex items-center gap-3">
                <UserCircle2 className="size-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.15em]">Atama Kontrolü</p>
                  <p className="font-bold">{state.accounts.filter(account => !account.phoneId).length} hesap telefonsuz</p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Telefon Ekle</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-2">
              <Label>Cihaz Adı</Label>
              <Input
                value={phoneForm.name}
                onChange={(event) => setPhoneForm(prev => ({ ...prev, name: event.target.value }))}
                placeholder="iPhone-06"
              />
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Input
                value={phoneForm.model}
                onChange={(event) => setPhoneForm(prev => ({ ...prev, model: event.target.value }))}
                placeholder="iPhone 14"
              />
            </div>
            <div className="space-y-2">
              <Label>SIM</Label>
              <Input
                value={phoneForm.simNumber}
                onChange={(event) => setPhoneForm(prev => ({ ...prev, simNumber: event.target.value }))}
                placeholder="+90 ..."
              />
            </div>
            <div className="space-y-2">
              <Label>Proxy Etiketi</Label>
              <Input
                value={phoneForm.proxyTag}
                onChange={(event) => setPhoneForm(prev => ({ ...prev, proxyTag: event.target.value }))}
                placeholder="TR-RES-12"
              />
            </div>
            <div className="space-y-2">
              <Label>Maks Hesap</Label>
              <Input
                type="number"
                value={phoneForm.maxAccounts}
                onChange={(event) => setPhoneForm(prev => ({ ...prev, maxAccounts: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Cihaz Sağlığı</Label>
              <Select value={phoneForm.health} onValueChange={(value: PhoneHealth) => setPhoneForm(prev => ({ ...prev, health: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Sağlıklı</SelectItem>
                  <SelectItem value="warning">Uyarı</SelectItem>
                  <SelectItem value="critical">Kritik</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPhoneDialog(false)}>İptal</Button>
            <Button onClick={onAddPhone}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hesap Ekle</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-2">
              <Label>Kullanıcı Adı</Label>
              <Input
                value={accountForm.handle}
                onChange={(event) => setAccountForm(prev => ({ ...prev, handle: event.target.value }))}
                placeholder="@ornekhesap"
              />
            </div>
            <div className="space-y-2">
              <Label>Niche</Label>
              <Input
                value={accountForm.niche}
                onChange={(event) => setAccountForm(prev => ({ ...prev, niche: event.target.value }))}
                placeholder="E-ticaret"
              />
            </div>
            <div className="space-y-2">
              <Label>Sorumlu</Label>
              <Input
                value={accountForm.owner}
                onChange={(event) => setAccountForm(prev => ({ ...prev, owner: event.target.value }))}
                placeholder="Ekip üyesi"
              />
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Select
                value={accountForm.phoneId}
                onValueChange={(value) => setAccountForm(prev => ({ ...prev, phoneId: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Atanmadı</SelectItem>
                  {state.phones.map(phone => (
                    <SelectItem key={phone.id} value={phone.id}>{phone.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Durum</Label>
              <Select
                value={accountForm.status}
                onValueChange={(value: AccountStatus) => setAccountForm(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="warming">Isınma</SelectItem>
                  <SelectItem value="risky">Riskte</SelectItem>
                  <SelectItem value="suspended">Askıda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Risk</Label>
              <Select
                value={accountForm.risk}
                onValueChange={(value: RiskLevel) => setAccountForm(prev => ({ ...prev, risk: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Düşük</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="high">Yüksek</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAccountDialog(false)}>İptal</Button>
            <Button onClick={onAddAccount}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abonelik Ekle</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Input
                value={subscriptionForm.platform}
                onChange={(event) => setSubscriptionForm(prev => ({ ...prev, platform: event.target.value }))}
                placeholder="OpenClaw / CapCut"
              />
            </div>
            <div className="space-y-2">
              <Label>Plan</Label>
              <Input
                value={subscriptionForm.plan}
                onChange={(event) => setSubscriptionForm(prev => ({ ...prev, plan: event.target.value }))}
                placeholder="Pro"
              />
            </div>
            <div className="space-y-2">
              <Label>Başlangıç</Label>
              <Input
                type="date"
                value={subscriptionForm.startAt}
                onChange={(event) => setSubscriptionForm(prev => ({ ...prev, startAt: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Trial Bitişi</Label>
              <Input
                type="date"
                value={subscriptionForm.trialEndsAt}
                onChange={(event) => setSubscriptionForm(prev => ({ ...prev, trialEndsAt: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Yenileme</Label>
              <Input
                type="date"
                value={subscriptionForm.renewalAt}
                onChange={(event) => setSubscriptionForm(prev => ({ ...prev, renewalAt: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Aylık Maliyet</Label>
              <Input
                type="number"
                value={subscriptionForm.monthlyCost}
                onChange={(event) => setSubscriptionForm(prev => ({ ...prev, monthlyCost: event.target.value }))}
                placeholder="49"
              />
            </div>
            <div className="space-y-2">
              <Label>Para Birimi</Label>
              <Select
                value={subscriptionForm.currency}
                onValueChange={(value: 'TRY' | 'USD' | 'EUR') => setSubscriptionForm(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRY">TRY</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Durum</Label>
              <Select
                value={subscriptionForm.status}
                onValueChange={(value: SubscriptionStatus) => setSubscriptionForm(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="paused">Duraklatıldı</SelectItem>
                  <SelectItem value="cancelled">İptal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Not</Label>
              <Input
                value={subscriptionForm.notes}
                onChange={(event) => setSubscriptionForm(prev => ({ ...prev, notes: event.target.value }))}
                placeholder="Bu abonelik ne için kullanılıyor?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubscriptionDialog(false)}>İptal</Button>
            <Button onClick={onAddSubscription}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ödeme Kaydı Ekle</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 pt-2">
            <div className="space-y-2">
              <Label>Tutar</Label>
              <Input
                type="number"
                value={paymentForm.amount}
                onChange={(event) => setPaymentForm(prev => ({ ...prev, amount: event.target.value }))}
                placeholder="49"
              />
            </div>
            <div className="space-y-2">
              <Label>Tarih</Label>
              <Input
                type="date"
                value={paymentForm.paidAt}
                onChange={(event) => setPaymentForm(prev => ({ ...prev, paidAt: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Not</Label>
              <Input
                value={paymentForm.note}
                onChange={(event) => setPaymentForm(prev => ({ ...prev, note: event.target.value }))}
                placeholder="Mart fatura ödemesi"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>İptal</Button>
            <Button onClick={onAddPayment}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAutomationDialog} onOpenChange={setShowAutomationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>OpenClaw Akışı Ekle</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-2">
              <Label>Akış Adı</Label>
              <Input
                value={automationForm.name}
                onChange={(event) => setAutomationForm(prev => ({ ...prev, name: event.target.value }))}
                placeholder="UGC Generator"
              />
            </div>
            <div className="space-y-2">
              <Label>Tür</Label>
              <Select
                value={automationForm.type}
                onValueChange={(value: AutomationType) => setAutomationForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="visual">Görsel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Hedef Hesap</Label>
              <Select
                value={automationForm.accountId}
                onValueChange={(value) => setAutomationForm(prev => ({ ...prev, accountId: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Genel Havuz</SelectItem>
                  {state.accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>{account.handle}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sıklık</Label>
              <Select
                value={automationForm.frequency}
                onValueChange={(value: AutomationFrequency) => setAutomationForm(prev => ({ ...prev, frequency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6h">6 Saat</SelectItem>
                  <SelectItem value="12h">12 Saat</SelectItem>
                  <SelectItem value="daily">Günlük</SelectItem>
                  <SelectItem value="weekly">Haftalık</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Prompt Şablonu</Label>
              <Input
                value={automationForm.promptTemplate}
                onChange={(event) => setAutomationForm(prev => ({ ...prev, promptTemplate: event.target.value }))}
                placeholder="Persona + Hook + Senaryo + CTA + Caption"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Output Path</Label>
              <Input
                value={automationForm.outputPath}
                onChange={(event) => setAutomationForm(prev => ({ ...prev, outputPath: event.target.value }))}
                placeholder="/content/tiktok/videos"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAutomationDialog(false)}>İptal</Button>
            <Button onClick={onAddAutomation}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
