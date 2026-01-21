import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Megaphone, 
  Plus, 
  Pencil, 
  Trash2, 
  AlertCircle, 
  Bell, 
  Eye, 
  EyeOff,
  Calendar,
  Target,
  Building2,
  Users,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string | null;
  priority: string;
  target_type: string;
  target_unit_id: string | null;
  target_team: string | null;
  is_active: boolean;
  starts_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Unit {
  id: string;
  name: string;
}

const priorityOptions = [
  { value: 'low', label: 'Baixa', color: 'bg-slate-500', icon: Megaphone },
  { value: 'normal', label: 'Normal', color: 'bg-blue-500', icon: Megaphone },
  { value: 'high', label: 'Alta', color: 'bg-amber-500', icon: Bell },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-500', icon: AlertCircle },
];

const targetOptions = [
  { value: 'all', label: 'Todos', icon: Users },
  { value: 'unit', label: 'Unidade Específica', icon: Building2 },
  { value: 'team', label: 'Equipe Específica', icon: Target },
];

const teamOptions = ['ALFA', 'BRAVO', 'CHARLIE', 'DELTA'];

export function AnnouncementsManager() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    target_type: 'all',
    target_unit_id: '',
    target_team: '',
    is_active: true,
    starts_at: '',
    expires_at: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [announcementsResult, unitsResult] = await Promise.all([
        supabase
          .from('admin_announcements')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('units')
          .select('id, name')
          .order('name')
      ]);

      if (announcementsResult.data) {
        setAnnouncements(announcementsResult.data as Announcement[]);
      }
      if (unitsResult.data) {
        setUnits(unitsResult.data as Unit[]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar avisos');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'normal',
      target_type: 'all',
      target_unit_id: '',
      target_team: '',
      is_active: true,
      starts_at: '',
      expires_at: '',
    });
    setEditingAnnouncement(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content || '',
      priority: announcement.priority,
      target_type: announcement.target_type,
      target_unit_id: announcement.target_unit_id || '',
      target_team: announcement.target_team || '',
      is_active: announcement.is_active,
      starts_at: announcement.starts_at ? format(parseISO(announcement.starts_at), "yyyy-MM-dd'T'HH:mm") : '',
      expires_at: announcement.expires_at ? format(parseISO(announcement.expires_at), "yyyy-MM-dd'T'HH:mm") : '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('O título é obrigatório');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim() || null,
        priority: formData.priority,
        target_type: formData.target_type,
        target_unit_id: formData.target_type === 'unit' ? formData.target_unit_id || null : null,
        target_team: formData.target_type === 'team' ? formData.target_team || null : null,
        is_active: formData.is_active,
        starts_at: formData.starts_at ? new Date(formData.starts_at).toISOString() : new Date().toISOString(),
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
      };

      if (editingAnnouncement) {
        const { error } = await supabase
          .from('admin_announcements')
          .update(payload)
          .eq('id', editingAnnouncement.id);

        if (error) throw error;
        toast.success('Aviso atualizado com sucesso');
      } else {
        const { error } = await supabase
          .from('admin_announcements')
          .insert(payload);

        if (error) throw error;
        toast.success('Aviso criado com sucesso');
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error('Erro ao salvar aviso');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('admin_announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Aviso excluído com sucesso');
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Erro ao excluir aviso');
    }
  };

  const toggleActive = async (announcement: Announcement) => {
    try {
      const { error } = await supabase
        .from('admin_announcements')
        .update({ is_active: !announcement.is_active })
        .eq('id', announcement.id);

      if (error) throw error;
      toast.success(`Aviso ${!announcement.is_active ? 'ativado' : 'desativado'}`);
      fetchData();
    } catch (error) {
      console.error('Error toggling announcement:', error);
      toast.error('Erro ao alterar status');
    }
  };

  const getPriorityConfig = (priority: string) => {
    return priorityOptions.find(p => p.value === priority) || priorityOptions[1];
  };

  const getTargetLabel = (announcement: Announcement) => {
    if (announcement.target_type === 'all') return 'Todos';
    if (announcement.target_type === 'unit') {
      const unit = units.find(u => u.id === announcement.target_unit_id);
      return unit ? unit.name : 'Unidade';
    }
    if (announcement.target_type === 'team') {
      return `Equipe ${announcement.target_team}`;
    }
    return 'Todos';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
            <Megaphone className="h-5 w-5 text-black" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Gerenciador de Avisos</h3>
            <p className="text-xs text-slate-400">Crie e gerencie avisos para os agentes</p>
          </div>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-bold shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Aviso
        </Button>
      </div>

      {/* Announcements List */}
      <ScrollArea className="h-[500px]">
        <div className="space-y-3 pr-4">
          {announcements.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Megaphone className="h-12 w-12 text-slate-600 mb-4" />
                <p className="text-slate-400 text-center">Nenhum aviso cadastrado</p>
                <p className="text-slate-500 text-sm text-center mt-1">
                  Clique em "Novo Aviso" para criar o primeiro
                </p>
              </CardContent>
            </Card>
          ) : (
            announcements.map((announcement) => {
              const priorityConfig = getPriorityConfig(announcement.priority);
              const PriorityIcon = priorityConfig.icon;
              const isExpired = announcement.expires_at && new Date(announcement.expires_at) < new Date();
              const hasStarted = new Date(announcement.starts_at) <= new Date();

              return (
                <Card 
                  key={announcement.id} 
                  className={`bg-gradient-to-br from-slate-800/70 to-slate-900/70 border transition-all ${
                    announcement.is_active && hasStarted && !isExpired
                      ? 'border-amber-500/40 shadow-lg shadow-amber-500/10'
                      : 'border-slate-700/50 opacity-60'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Priority Icon & Content */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg ${priorityConfig.color} flex-shrink-0`}>
                          <PriorityIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-white truncate">{announcement.title}</h4>
                            <Badge 
                              variant="outline" 
                              className={`text-[10px] ${
                                announcement.is_active && hasStarted && !isExpired
                                  ? 'border-emerald-500/50 text-emerald-400'
                                  : 'border-slate-600 text-slate-400'
                              }`}
                            >
                              {announcement.is_active && hasStarted && !isExpired ? 'Ativo' : 'Inativo'}
                            </Badge>
                            {isExpired && (
                              <Badge variant="outline" className="text-[10px] border-red-500/50 text-red-400">
                                Expirado
                              </Badge>
                            )}
                          </div>
                          {announcement.content && (
                            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{announcement.content}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {getTargetLabel(announcement)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(parseISO(announcement.starts_at), 'dd/MM/yy HH:mm', { locale: ptBR })}
                            </span>
                            {announcement.expires_at && (
                              <span className="flex items-center gap-1">
                                até {format(parseISO(announcement.expires_at), 'dd/MM/yy HH:mm', { locale: ptBR })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleActive(announcement)}
                          className="h-8 w-8 hover:bg-slate-700/50"
                        >
                          {announcement.is_active ? (
                            <Eye className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-slate-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(announcement)}
                          className="h-8 w-8 hover:bg-slate-700/50"
                        >
                          <Pencil className="h-4 w-4 text-blue-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingId(announcement.id);
                            setDeleteDialogOpen(true);
                          }}
                          className="h-8 w-8 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-amber-400" />
              {editingAnnouncement ? 'Editar Aviso' : 'Novo Aviso'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingAnnouncement 
                ? 'Atualize as informações do aviso' 
                : 'Preencha as informações para criar um novo aviso'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-200">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Digite o título do aviso"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-slate-200">Conteúdo</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Descrição detalhada do aviso (opcional)"
                className="bg-slate-800 border-slate-700 text-white min-h-[80px]"
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-slate-200">Prioridade</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-slate-700">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Type */}
            <div className="space-y-2">
              <Label className="text-slate-200">Destinatário</Label>
              <Select
                value={formData.target_type}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  target_type: value,
                  target_unit_id: '',
                  target_team: ''
                }))}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {targetOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-slate-700">
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4 text-slate-400" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Unit Selector */}
            {formData.target_type === 'unit' && (
              <div className="space-y-2">
                <Label className="text-slate-200">Unidade</Label>
                <Select
                  value={formData.target_unit_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, target_unit_id: value }))}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id} className="text-white hover:bg-slate-700">
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Team Selector */}
            {formData.target_type === 'team' && (
              <div className="space-y-2">
                <Label className="text-slate-200">Equipe</Label>
                <Select
                  value={formData.target_team}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, target_team: value }))}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Selecione a equipe" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {teamOptions.map((team) => (
                      <SelectItem key={team} value={team} className="text-white hover:bg-slate-700">
                        Equipe {team}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Dates Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="starts_at" className="text-slate-200">Início</Label>
                <Input
                  id="starts_at"
                  type="datetime-local"
                  value={formData.starts_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, starts_at: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expires_at" className="text-slate-200">Expiração</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="flex items-center gap-2">
                {formData.is_active ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-slate-500" />
                )}
                <Label htmlFor="is_active" className="text-slate-200 cursor-pointer">
                  Aviso ativo
                </Label>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-bold"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                editingAnnouncement ? 'Atualizar' : 'Criar Aviso'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-400" />
              Excluir Aviso
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Tem certeza que deseja excluir este aviso? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingId && handleDelete(deletingId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
