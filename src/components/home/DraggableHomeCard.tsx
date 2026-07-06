import { ReactNode } from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HomeCardId } from '@/hooks/useHomeCardOrder';

interface DraggableHomeCardProps {
  id: HomeCardId;
  onDropCard: (from: HomeCardId, to: HomeCardId) => void;
  className?: string;
  children: ReactNode;
}

export function DraggableHomeCard({ id, onDropCard, className, children }: DraggableHomeCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/home-card-id', id);
        e.dataTransfer.effectAllowed = 'move';
        (e.currentTarget as HTMLDivElement).classList.add('opacity-60');
      }}
      onDragEnd={(e) => (e.currentTarget as HTMLDivElement).classList.remove('opacity-60')}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('text/home-card-id')) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }
      }}
      onDrop={(e) => {
        const from = e.dataTransfer.getData('text/home-card-id') as HomeCardId;
        if (from) {
          e.preventDefault();
          onDropCard(from, id);
        }
      }}
      className={cn(
        'group relative rounded-lg outline-none transition-shadow',
        'hover:ring-1 hover:ring-primary/30',
        className,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute right-2 top-2 z-30 flex items-center gap-1 rounded-md',
          'bg-black/50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary',
          'opacity-0 ring-1 ring-primary/40 backdrop-blur transition-opacity group-hover:opacity-100',
        )}
        aria-hidden
      >
        <GripVertical className="h-3 w-3" />
        Arraste
      </div>
      {children}
    </div>
  );
}
