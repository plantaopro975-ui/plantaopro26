import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { 
  Plus, Pencil, Trash2, Eye, Loader2, Image, Video, 
  Layout, ExternalLink, Clock, Target, Megaphone, BarChart3 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdAnalyticsDashboard } from './AdAnalyticsDashboard';

interface Advertisement {
  id: string;
  name: string;
  ad_type: string;
  content_type: string;
  title: string | null;
  description: string | null;
  media_url: string | null;
  click_url: string | null;
  cta_text: string | null;
  is_active: boolean;
  is_mandatory: boolean;
  min_view_seconds: number | null;
  frequency_type: string | null;
  frequency_limit: number | null;
  priority: number;
  target_user_types: string[] | null;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
}

const adTypes = [
  { value: 'banner', label: 'Banner', icon: Layout },
  { value: 'popup', label: 'Popup', icon: Megaphone },
  { value: 'fullscreen', label: 'Tela Cheia', icon: Image },
  { value: 'video', label: 'Vídeo', icon: Video },
  { value: 'card', label: 'Card', icon: Layout },
];

const contentTypes = [
  { value: 'image', label: 'Imagem' },
  { value: 'video', label: 'Vídeo' },
  { value: 'html', label: 'HTML' },
  { value: 'interactive', label: 'Interativo' },
];

const frequencyTypes = [
  { value: 'per_login', label: 'Por Login' },
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'once', label: 'Uma Vez' },
];

export function AdvertisementsManager() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    ad_type: 'banner',
    content_type: 'image',
    title: '',
    description: '',
    media_url: '',
    click_url: '',
    cta_text: '',
    is_active: false,
    is_mandatory: false,
    min_view_seconds: 5,
    frequency_type: 'per_login',
    frequency_limit: 1,
    priority: 0,
  });

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .order('priority', { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
      toast({ title: 'Erro ao carregar propagandas', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (ad?: Advertisement) => {
    if (ad) {
      setEditingAd(ad);
      setFormData({
        name: ad.name,
        ad_type: ad.ad_type,
        content_type: ad.content_type,
        title: ad.title || '',
        description: ad.description || '',
        media_url: ad.media_url || '',
        click_url: ad.click_url || '',
        cta_text: ad.cta_text || '',
        is_active: ad.is_active,
        is_mandatory: ad.is_mandatory,
        min_view_seconds: ad.min_view_seconds || 5,
        frequency_type: ad.frequency_type || 'per_login',
        frequency_limit: ad.frequency_limit || 1,
        priority: ad.priority,
      });
    } else {
      setEditingAd(null);
      setFormData({
        name: '',
        ad_type: 'banner',
        content_type: 'image',
        title: '',
        description: '',
        media_url: '',
        click_url: '',
        cta_text: '',
        is_active: false,
        is_mandatory: false,
        min_view_seconds: 5,
        frequency_type: 'per_login',
        frequency_limit: 1,
        priority: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      if (editingAd) {
        const { error } = await supabase
          .from('advertisements')
          .update({
            name: formData.name,
            ad_type: formData.ad_type,
            content_type: formData.content_type,
            title: formData.title || null,
            description: formData.description || null,
            media_url: formData.media_url || null,
            click_url: formData.click_url || null,
            cta_text: formData.cta_text || null,
            is_active: formData.is_active,
            is_mandatory: formData.is_mandatory,
            min_view_seconds: formData.min_view_seconds,
            frequency_type: formData.frequency_type,
            frequency_limit: formData.frequency_limit,
            priority: formData.priority,
          })
          .eq('id', editingAd.id);

        if (error) throw error;
        toast({ title: 'Propaganda atualizada com sucesso' });
      } else {
        const { error } = await supabase
          .from('advertisements')
          .insert({
            name: formData.name,
            ad_type: formData.ad_type,
            content_type: formData.content_type,
            title: formData.title || null,
            description: formData.description || null,
            media_url: formData.media_url || null,
            click_url: formData.click_url || null,
            cta_text: formData.cta_text || null,
            is_active: formData.is_active,
            is_mandatory: formData.is_mandatory,
            min_view_seconds: formData.min_view_seconds,
            frequency_type: formData.frequency_type,
            frequency_limit: formData.frequency_limit,
            priority: formData.priority,
          });

        if (error) throw error;
        toast({ title: 'Propaganda criada com sucesso' });
      }

      setIsDialogOpen(false);
      fetchAds();
    } catch (error) {
      console.error('Error saving ad:', error);
      toast({ title: 'Erro ao salvar propaganda', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta propaganda?')) return;

    try {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Propaganda excluída' });
      fetchAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast({ title: 'Erro ao excluir propaganda', variant: 'destructive' });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('advertisements')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchAds();
    } catch (error) {
      console.error('Error toggling ad:', error);
    }
  };

  const [activeView, setActiveView] = useState<'list' | 'analytics'>('list');

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-purple-400" />
              Gestão de Propagandas
            </CardTitle>
            <CardDescription>
              Crie e gerencie banners, popups e vídeos promocionais
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'list' | 'analytics')}>
              <TabsList className="bg-slate-700/50">
                <TabsTrigger value="list" className="data-[state=active]:bg-purple-600">
                  <Megaphone className="h-4 w-4 mr-1" />
                  Anúncios
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {activeView === 'list' && (
              <Button onClick={() => handleOpenDialog()} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activeView === 'analytics' ? (
          <AdAnalyticsDashboard />
        ) : isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>Nenhuma propaganda cadastrada</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ads.map((ad) => (
                <TableRow key={ad.id} className="border-slate-700">
                  <TableCell>
                    <div>
                      <div className="font-medium">{ad.name}</div>
                      {ad.title && (
                        <div className="text-xs text-muted-foreground">{ad.title}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                      {adTypes.find(t => t.value === ad.ad_type)?.label || ad.ad_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{ad.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={ad.is_active}
                      onCheckedChange={() => toggleActive(ad.id, ad.is_active)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {ad.media_url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(ad.media_url!, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(ad)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => handleDelete(ad.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle>
              {editingAd ? 'Editar Propaganda' : 'Nova Propaganda'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome*</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome interno da propaganda"
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={formData.ad_type}
                  onValueChange={(v) => setFormData({ ...formData, ad_type: v })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {adTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título exibido"
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Conteúdo</Label>
                <Select
                  value={formData.content_type}
                  onValueChange={(v) => setFormData({ ...formData, content_type: v })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do anúncio"
                className="bg-slate-800 border-slate-600"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>URL da Mídia</Label>
                <Input
                  value={formData.media_url}
                  onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                  placeholder="https://..."
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label>URL de Clique</Label>
                <Input
                  value={formData.click_url}
                  onChange={(e) => setFormData({ ...formData, click_url: e.target.value })}
                  placeholder="https://..."
                  className="bg-slate-800 border-slate-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Texto CTA</Label>
                <Input
                  value={formData.cta_text}
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                  placeholder="Saiba mais"
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label>Frequência</Label>
                <Select
                  value={formData.frequency_type}
                  onValueChange={(v) => setFormData({ ...formData, frequency_type: v })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  className="bg-slate-800 border-slate-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tempo mínimo (segundos)</Label>
                <Input
                  type="number"
                  value={formData.min_view_seconds}
                  onChange={(e) => setFormData({ ...formData, min_view_seconds: parseInt(e.target.value) || 5 })}
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label>Limite de exibições</Label>
                <Input
                  type="number"
                  value={formData.frequency_limit}
                  onChange={(e) => setFormData({ ...formData, frequency_limit: parseInt(e.target.value) || 1 })}
                  className="bg-slate-800 border-slate-600"
                />
              </div>
            </div>

            <div className="flex gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
                <Label>Ativo</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_mandatory}
                  onCheckedChange={(v) => setFormData({ ...formData, is_mandatory: v })}
                />
                <Label>Obrigatório</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-purple-600 hover:bg-purple-700">
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingAd ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
