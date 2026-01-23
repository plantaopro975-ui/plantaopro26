import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Volume2, VolumeX, Play, Pause, SkipBack, SkipForward, Film, Music } from 'lucide-react';

interface HomeMediaPlayerProps {
  className?: string;
}

// Key for localStorage to persist user preference
const MEDIA_PREFERENCE_KEY = 'plantaopro_media_enabled';
const LAST_VIDEO_INDEX_KEY = 'plantaopro_last_video';
const LAST_AUDIO_INDEX_KEY = 'plantaopro_last_audio';

export function HomeMediaPlayer({ className }: HomeMediaPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [showVideoOverlay, setShowVideoOverlay] = useState(false);
  
  // Media library
  const videos = [
    '/video/intro-1.mp4',
    '/video/intro-2.mp4',
  ];
  
  const tracks = [
    '/audio/plantao1.mp3',
    '/audio/plantao2.mp3',
    '/audio/plantao-pro.mp3',
    '/audio/vigilancia-urbana.mp3',
    '/audio/vigilancia-urbana-1.mp3'
  ];
  
  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(tracks[0]);
    audioRef.current.volume = 0.5;
    
    audioRef.current.addEventListener('ended', handleAudioEnded);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', handleAudioEnded);
        audioRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleAudioEnded = useCallback(() => {
    if (audioRef.current) {
      const nextIndex = (currentAudioIndex + 1) % tracks.length;
      setCurrentAudioIndex(nextIndex);
      audioRef.current.src = tracks[nextIndex];
      audioRef.current.play().catch(() => {});
    }
  }, [currentAudioIndex, tracks]);
  
  const handleVideoEnded = useCallback(() => {
    // Move to next video or switch to audio
    const nextVideoIndex = currentVideoIndex + 1;
    
    if (nextVideoIndex < videos.length) {
      setCurrentVideoIndex(nextVideoIndex);
      if (videoRef.current) {
        videoRef.current.src = videos[nextVideoIndex];
        videoRef.current.play().catch(() => {});
      }
    } else {
      // All videos played, switch to audio mode
      setIsVideoMode(false);
      setShowVideoOverlay(false);
      setCurrentVideoIndex(0);
      
      if (audioRef.current) {
        audioRef.current.src = tracks[currentAudioIndex];
        audioRef.current.play().catch(() => {});
      }
    }
  }, [currentVideoIndex, videos, tracks, currentAudioIndex]);
  
  const startPlayback = useCallback(() => {
    setIsPlaying(true);
    setIsVideoMode(true);
    setCurrentVideoIndex(0);
    setShowVideoOverlay(true);
    localStorage.setItem(MEDIA_PREFERENCE_KEY, 'true');
    
    // Start with videos
    if (videoRef.current) {
      videoRef.current.src = videos[0];
      videoRef.current.play().catch(() => {
        // If video fails, go to audio
        setIsVideoMode(false);
        setShowVideoOverlay(false);
        if (audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
      });
    }
  }, [videos]);
  
  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    setShowVideoOverlay(false);
    localStorage.setItem(MEDIA_PREFERENCE_KEY, 'false');
    
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);
  
  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };
  
  const changeTrack = (direction: 'next' | 'prev') => {
    if (isVideoMode) {
      // Skip video
      const newIndex = direction === 'next' 
        ? (currentVideoIndex + 1) % videos.length
        : (currentVideoIndex - 1 + videos.length) % videos.length;
      setCurrentVideoIndex(newIndex);
      if (videoRef.current) {
        videoRef.current.src = videos[newIndex];
        if (isPlaying) videoRef.current.play().catch(() => {});
      }
    } else {
      // Skip audio
      const newIndex = direction === 'next' 
        ? (currentAudioIndex + 1) % tracks.length
        : (currentAudioIndex - 1 + tracks.length) % tracks.length;
      setCurrentAudioIndex(newIndex);
      if (audioRef.current) {
        audioRef.current.src = tracks[newIndex];
        if (isPlaying) audioRef.current.play().catch(() => {});
      }
    }
  };
  
  const skipToAudio = () => {
    setIsVideoMode(false);
    setShowVideoOverlay(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (audioRef.current) {
      audioRef.current.src = tracks[currentAudioIndex];
      audioRef.current.play().catch(() => {});
    }
  };
  
  const toggleMute = () => {
    if (videoRef.current) videoRef.current.muted = !isMuted;
    if (audioRef.current) audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <>
      {/* Video Overlay */}
      {showVideoOverlay && (
        <div 
          ref={videoContainerRef}
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          onClick={() => skipToAudio()}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            muted={isMuted}
            playsInline
            onEnded={handleVideoEnded}
          />
          
          {/* Skip hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-pulse">
            <span className="text-white/60 text-sm font-medium">Toque para pular</span>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <Music className="h-4 w-4 text-white/70" />
              <span className="text-white/80 text-xs">Ir para música</span>
            </div>
          </div>
          
          {/* Video indicator */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/20">
            <Film className="h-4 w-4 text-amber-400" />
            <span className="text-white/90 text-sm font-medium">
              Vídeo {currentVideoIndex + 1} de {videos.length}
            </span>
          </div>
        </div>
      )}
      
      {/* Player Controls */}
      <div className={cn(
        "flex items-center gap-0.5",
        className
      )}>
        {/* Previous Track - only when playing */}
        {isPlaying && (
          <button
            onClick={() => changeTrack('prev')}
            className="p-1 rounded transition-all duration-200 text-muted-foreground/50 hover:text-foreground/70"
            title="Anterior"
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
          title={isPlaying ? "Pausar" : "Reproduzir mídia"}
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
            title="Próximo"
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
        
        {/* Mode indicator */}
        {isPlaying && !showVideoOverlay && (
          <div className="flex items-center gap-0.5 ml-0.5">
            {isVideoMode ? (
              <Film className="h-2.5 w-2.5 text-amber-400" />
            ) : (
              <>
                <div className="w-0.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-0.5 h-2.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="w-0.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
