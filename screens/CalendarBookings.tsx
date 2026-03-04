import {
    CalendarDays,
    Calendar as CalendarIcon,
    CheckCircle2,
    Clock,
    Edit2,
    History,
    Loader2,
    Plus,
    Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../components/ui/select';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

export default function CalendarBookings() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    client_id: 'none',
    scheduled_at: '',
    duration_minutes: 30,
    notes: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .order('scheduled_at', { ascending: true });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedClient = clients.find(c => c.id === formData.client_id);
      const clientName = selectedClient
        ? `${selectedClient.first_name} ${selectedClient.last_name}`
        : 'Genel Randevu';
      const clientEmail = selectedClient?.email || '';

      const payload = {
        client_id: formData.client_id === 'none' ? null : formData.client_id,
        client_name: clientName,
        client_email: clientEmail,
        scheduled_at: formData.scheduled_at,
        duration_minutes: formData.duration_minutes,
        notes: formData.notes,
        status: 'confirmed'
      };

      if (editingId) {
        const { data, error } = await supabase
          .from('bookings')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', editingId)
          .select()
          .single();

        if (error) throw error;
        setMeetings(prev => prev.map(m => m.id === editingId ? data : m));
      } else {
        const { data, error } = await supabase
          .from('bookings')
          .insert({ ...payload, user_id: user?.id })
          .select()
          .single();

        if (error) throw error;
        setMeetings(prev => [...prev, data].sort((a, b) =>
          new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
        ));
      }

      setShowModal(false);
      setEditingId(null);
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleEdit = (meeting: any) => {
    setFormData({
      client_id: meeting.client_id || 'none',
      scheduled_at: meeting.scheduled_at ? new Date(meeting.scheduled_at).toISOString().slice(0, 16) : '',
      duration_minutes: meeting.duration_minutes || 30,
      notes: meeting.notes || ''
    });
    setEditingId(meeting.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
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
      weekday: 'short',
      day: 'numeric',
      month: 'short',
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
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      <header className="px-8 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="size-4 text-primary" />
            <span className="text-primary text-xs uppercase font-bold tracking-[0.2em] opacity-80">Planlama</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Takvim</h1>
          <p className="text-muted-foreground text-sm max-w-lg mt-1">
            Görüntülü görüşmelerinizi ve yüz yüze randevularınızı yönetin.
          </p>
        </div>

        <Button onClick={() => {
          setFormData({ client_id: 'none', scheduled_at: new Date().toISOString().slice(0, 16), duration_minutes: 30, notes: '' });
          setEditingId(null);
          setShowModal(true);
        }} className="gap-2 px-6 h-12">
          <Plus className="size-4" />
          <span>Yeni Randevu</span>
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-8 pb-10">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Upcoming Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
               <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                 <CalendarIcon className="size-3.5" />
                 YAKLAŞANLAR
               </h2>
               <div className="h-px flex-1 bg-border/40" />
               <Badge variant="outline" className="text-xs bg-secondary/30">{upcomingMeetings.length}</Badge>
            </div>

            {upcomingMeetings.length === 0 ? (
               <Card className="border-dashed h-40 flex flex-col items-center justify-center bg-accent/5">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-40">Planlanmış randevu yok</p>
               </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingMeetings.map(meeting => (
                  <Card key={meeting.id} className="group border-border/40 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/40 hover:shadow-md">
                    <CardHeader className="p-5 pb-2">
                       <div className="flex justify-between items-start">
                          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                             {meeting.client_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(meeting)}>
                              <Edit2 className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(meeting.id)}>
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                       </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-4 flex flex-col h-full">
                       <h3 className="font-bold text-base leading-tight mb-2 truncate">{meeting.client_name}</h3>
                       <div className="flex items-center gap-3 text-muted-foreground text-sm font-medium mb-4">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="size-3.5" />
                            <span>{formatDateTime(meeting.scheduled_at)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            <span>{meeting.duration_minutes}dk</span>
                          </div>
                       </div>
                       {meeting.notes && (
                         <p className="text-xs text-muted-foreground line-clamp-2 pt-3 border-t bg-muted/20 -mx-5 px-5 py-3">
                           {meeting.notes}
                         </p>
                       )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Past Section */}
          {pastMeetings.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                 <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                   <History className="size-3.5" />
                   GEÇMİŞ
                 </h2>
                 <div className="h-px flex-1 bg-border/40" />
              </div>
              <div className="border rounded-2xl overflow-hidden bg-card/30">
                 {pastMeetings.slice(0, 8).map(meeting => (
                   <div key={meeting.id} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {meeting.client_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                         </div>
                         <div>
                            <p className="text-sm font-bold">{meeting.client_name}</p>
                            <p className="text-xs text-muted-foreground font-medium">{formatDateTime(meeting.scheduled_at)}</p>
                         </div>
                      </div>
                      <Badge variant="outline" className="text-xs uppercase tracking-tighter opacity-50">
                        {meeting.status === 'cancelled' ? 'İptal' : 'Tamamlandı'}
                      </Badge>
                   </div>
                 ))}
              </div>
            </section>
          )}

        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Randevuyu Düzenle' : 'Yeni Randevu'}</DialogTitle>
            <DialogDescription>
              Toplantı detaylarını ve vaktini belirleyin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Müşteri</Label>
              <Select value={formData.client_id} onValueChange={(val) => setFormData(prev => ({ ...prev, client_id: val }))}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Seçiniz..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Genel Randevu</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tarih ve Saat</Label>
              <Input
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Süre (Dakika)</Label>
              <Input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: Number(e.target.value) }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Notlar</Label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Örn: Proje kapsamı hakkında ön görüşme..."
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">Vazgeç</Button>
              <Button type="submit" className="flex-1 gap-2">
                 <CheckCircle2 className="size-4" />
                 Kaydet
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
