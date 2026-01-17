import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Volume2, VolumeX, Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface HomeAudioPlayerProps {
  className?: string;
}

// Key for localStorage to persist user preference
const AUDIO_PREFERENCE_KEY = 'plantaopro_audio_enabled';

export function HomeAudioPlayer({ className }: HomeAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  
  // Available tracks
  const tracks = [
    '/audio/plantao1.mp3',
    '/audio/plantao2.mp3',
    '/audio/plantao-pro.mp3',
    '/audio/vigilancia-urbana.mp3',
    '/audio/vigilancia-urbana-1.mp3'
  ];
  
  // Create audio element
  useEffect(() => {
    audioRef.current = new Audio(tracks[0]);
    audioRef.current.volume = 0.5;
    
    audioRef.current.addEventListener('ended', () => {
      // Switch to next track when current ends
      if (audioRef.current) {
        const nextTrack = (currentTrack + 1) % tracks.length;
        setCurrentTrack(nextTrack);
        audioRef.current.src = tracks[nextTrack];
        audioRef.current.play();
      }
    });
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  const changeTrack = (direction: 'next' | 'prev') => {
    if (!audioRef.current) return;
    
    const newTrack = direction === 'next' 
      ? (currentTrack + 1) % tracks.length
      : (currentTrack - 1 + tracks.length) % tracks.length;
    
    setCurrentTrack(newTrack);
    audioRef.current.src = tracks[newTrack];
    
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    }
  };
  
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      localStorage.setItem(AUDIO_PREFERENCE_KEY, 'false');
    } else {
      audioRef.current.play().catch(() => {
        console.log('Audio playback blocked');
      });
      setIsPlaying(true);
      localStorage.setItem(AUDIO_PREFERENCE_KEY, 'true');
    }
  };
  
  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className={cn(
      "flex items-center gap-0.5",
      className
    )}>
      {/* Previous Track - only when playing */}
      {isPlaying && (
        <button
          onClick={() => changeTrack('prev')}
          className="p-1 rounded transition-all duration-200 text-muted-foreground/50 hover:text-foreground/70"
          title="Música anterior"
        >
          <SkipBack className="h-2.5 w-2.5" />
        </button>
      )}
      
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className={cn(
          "p-1.5 rounded-lg transition-all duration-300",
          isPlaying 
            ? "bg-primary/20 text-primary border border-primary/40 shadow-lg shadow-primary/20" 
            : "bg-muted/30 text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 border border-transparent"
        )}
        title={isPlaying ? "Pausar música" : "Tocar música de abertura"}
      >
        {isPlaying ? (
          <Pause className="h-3 w-3" />
        ) : (
          <Play className="h-3 w-3" />
        )}
      </button>
      
      {/* Next Track - only when playing */}
      {isPlaying && (
        <button
          onClick={() => changeTrack('next')}
          className="p-1 rounded transition-all duration-200 text-muted-foreground/50 hover:text-foreground/70"
          title="Próxima música"
        >
          <SkipForward className="h-2.5 w-2.5" />
        </button>
      )}
      
      {/* Volume Button - only show when playing */}
      {isPlaying && (
        <button
          onClick={toggleMute}
          className="p-1 rounded transition-all duration-200 text-muted-foreground/50 hover:text-foreground/70"
          title={isMuted ? "Ativar som" : "Silenciar"}
        >
          {isMuted ? (
            <VolumeX className="h-2.5 w-2.5" />
          ) : (
            <Volume2 className="h-2.5 w-2.5" />
          )}
        </button>
      )}
      
      {/* Playing indicator */}
      {isPlaying && !isMuted && (
        <div className="flex items-center gap-0.5 ml-0.5">
          <div className="w-0.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-0.5 h-2.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="w-0.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      )}
    </div>
  );
}
