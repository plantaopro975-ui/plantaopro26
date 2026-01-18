import { useEffect, useState } from 'react';
import { useBirthdayNotifications } from '@/hooks/useBirthdayNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Cake, Gift, PartyPopper, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { format, parseISO, differenceInDays, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
interface TeamMember {
  id: string;
  name: string;
  birth_date: string | null;
  team: string | null;
  avatar_url: string | null;
  daysUntil?: number;
}

interface BirthdayCardProps {
  agentId: string;
  team: string | null;
  unitId: string | null;
}

export function BirthdayCard({ agentId, team, unitId }: BirthdayCardProps) {
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  const { getUpcomingBirthdays, checkBirthdays } = useBirthdayNotifications({
    agentId,
    team,
    unitId,
    enabled: true,
  });

  useEffect(() => {
    loadBirthdays();
    checkBirthdays();
  }, [team, unitId]);

  const loadBirthdays = async () => {
    setIsLoading(true);
    const birthdays = await getUpcomingBirthdays();
    setUpcomingBirthdays(birthdays);
    setIsLoading(false);
  };

  const getBirthdayThisYear = (birthDate: string): Date => {
    const date = parseISO(birthDate);
    const today = new Date();
    return new Date(today.getFullYear(), date.getMonth(), date.getDate());
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (upcomingBirthdays.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Cake className="h-5 w-5 text-pink-500" />
            <span>Aniversários</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            <Gift className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum aniversário nos próximos 30 dias</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const todayBirthdays = upcomingBirthdays.filter(m => m.daysUntil === 0);
  const upcomingList = upcomingBirthdays.filter(m => (m.daysUntil ?? 0) > 0);

  return (
    <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-pink-500/30 rounded-xl overflow-hidden">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-2 pt-3 px-3">
          <CollapsibleTrigger className="w-full">
            <CardTitle className="flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-pink-500/20 border border-pink-500/30">
                  <Cake className="h-4 w-4 text-pink-400" />
                </div>
                <span className="text-sm font-bold text-pink-200">Aniversários</span>
                {todayBirthdays.length > 0 && (
                  <Badge className="bg-pink-500/30 text-pink-300 border-pink-500/40 text-[10px] px-1.5 py-0 animate-pulse">
                    <PartyPopper className="h-3 w-3 mr-1" />
                    Hoje!
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-slate-700/60 text-slate-300 border-slate-600/50 text-[10px] px-1.5 py-0">
                  {upcomingBirthdays.length}
                </Badge>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-pink-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-pink-400" />
                )}
              </div>
            </CardTitle>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="pt-1 px-3 pb-3 space-y-2">
            {/* Today's Birthdays - Compact */}
            {todayBirthdays.length > 0 && (
              <div className="space-y-1.5">
                {todayBirthdays.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 p-2 bg-gradient-to-r from-pink-500/20 to-purple-500/10 rounded-lg border border-pink-500/30"
                  >
                    <Avatar className="h-8 w-8 border border-pink-500/50">
                      {member.avatar_url && <AvatarImage src={member.avatar_url} />}
                      <AvatarFallback className="bg-pink-500/30 text-pink-300 text-xs font-bold">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-sm text-foreground truncate block">{member.name}</span>
                      <span className="text-[10px] text-pink-400">🎂 Aniversário hoje!</span>
                    </div>
                    <span className="text-xl">🎉</span>
                  </div>
                ))}
              </div>
            )}

            {/* Upcoming Birthdays - Compact List */}
            {upcomingList.length > 0 && (
              <div className="space-y-1">
                {todayBirthdays.length > 0 && (
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider pt-1">Próximos</p>
                )}
                {upcomingList.slice(0, 3).map((member) => {
                  const birthday = member.birth_date ? getBirthdayThisYear(member.birth_date) : null;
                  const daysUntil = member.daysUntil ?? 0;
                  
                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg border border-slate-600/40 hover:border-pink-500/30 transition-colors"
                    >
                      <Avatar className="h-7 w-7 border border-pink-500/20">
                        {member.avatar_url && <AvatarImage src={member.avatar_url} />}
                        <AvatarFallback className="bg-pink-500/10 text-pink-300 text-[10px] font-bold">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-xs text-foreground truncate block">{member.name}</span>
                        {birthday && (
                          <span className="text-[10px] text-slate-400">
                            {format(birthday, "dd/MM", { locale: ptBR })}
                          </span>
                        )}
                      </div>
                      <Badge 
                        className={`text-[9px] px-1.5 py-0 ${
                          daysUntil === 1 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                            : 'bg-slate-700/60 text-slate-400 border-slate-600/40'
                        }`}
                      >
                        {daysUntil === 1 ? 'Amanhã' : `${daysUntil}d`}
                      </Badge>
                    </div>
                  );
                })}
                {upcomingList.length > 3 && (
                  <p className="text-[10px] text-center text-slate-500">+{upcomingList.length - 3} mais</p>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
