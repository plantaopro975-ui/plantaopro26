import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Volume2, VolumeX, Play, Pause, SkipBack, SkipForward, Music, X } from 'lucide-react';

interface HomeMediaPlayerProps {
  className?: string;
}

export function HomeMediaPlayer({ className }: HomeMediaPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay policy
  const [isVideoMode, setIsVideoMode] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [showVideoOverlay, setShowVideoOverlay] = useState(false);
  
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
  
  useEffect(() => {
    audioRef.current = new Audio(tracks[0]);
    audioRef.current.volume = 0.5;
    
    const handleEnded = () => {
      const nextIndex = (currentAudioIndex + 1) % tracks.length;
      setCurrentAudioIndex(nextIndex);
      if (audioRef.current) {
        audioRef.current.src = tracks[nextIndex];
        audioRef.current.play().catch(() => {});
      }
    };
    
    audioRef.current.addEventListener('ended', handleEnded);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current = null;
      }
    };
  }, []);
  
  const handleVideoEnded = useCallback(() => {
    const nextVideoIndex = currentVideoIndex + 1;
    
    if (nextVideoIndex < videos.length) {
      setCurrentVideoIndex(nextVideoIndex);
      if (videoRef.current) {
        videoRef.current.src = videos[nextVideoIndex];
        videoRef.current.muted = isMuted;
        videoRef.current.play().catch(() => {});
      }
    } else {
      // All videos done, switch to audio
      setIsVideoMode(false);
      setShowVideoOverlay(false);
      setCurrentVideoIndex(0);
      
      if (audioRef.current) {
        audioRef.current.muted = isMuted;
        audioRef.current.src = tracks[currentAudioIndex];
        audioRef.current.play().catch(() => {});
      }
    }
  }, [currentVideoIndex, isMuted, currentAudioIndex]);
  
  const startPlayback = useCallback(() => {
    setIsPlaying(true);
    setIsVideoMode(true);
    setCurrentVideoIndex(0);
    setShowVideoOverlay(true);
    
    // Start video muted to bypass autoplay restrictions
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.src = videos[0];
        videoRef.current.muted = true;
        setIsMuted(true);
        videoRef.current.play().catch((err) => {
          console.log('Video playback failed:', err);
          // Fallback to audio only
          setIsVideoMode(false);
          setShowVideoOverlay(false);
          if (audioRef.current) {
            audioRef.current.play().catch(() => {});
          }
        });
      }
    }, 100);
  }, []);
  
  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    setShowVideoOverlay(false);
    
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
    if (isVideoMode && showVideoOverlay) {
      const newIndex = direction === 'next' 
        ? (currentVideoIndex + 1) % videos.length
        : (currentVideoIndex - 1 + videos.length) % videos.length;
      setCurrentVideoIndex(newIndex);
      if (videoRef.current) {
        videoRef.current.src = videos[newIndex];
        videoRef.current.muted = isMuted;
        if (isPlaying) videoRef.current.play().catch(() => {});
      }
    } else {
      const newIndex = direction === 'next' 
        ? (currentAudioIndex + 1) % tracks.length
        : (currentAudioIndex - 1 + tracks.length) % tracks.length;
      setCurrentAudioIndex(newIndex);
      if (audioRef.current) {
        audioRef.current.src = tracks[newIndex];
        audioRef.current.muted = isMuted;
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
      audioRef.current.muted = isMuted;
      audioRef.current.play().catch(() => {});
    }
  };
  
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (videoRef.current) videoRef.current.muted = newMuted;
    if (audioRef.current) audioRef.current.muted = newMuted;
  };

  return (
    <>
      {/* Video Overlay */}
      {showVideoOverlay && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            playsInline
            muted={isMuted}
            onEnded={handleVideoEnded}
          />
          
          {/* Controls overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="max-w-md mx-auto flex items-center justify-between gap-4">
              {/* Unmute prompt */}
              <button
                onClick={toggleMute}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                  isMuted 
                    ? "bg-amber-500/80 text-black animate-pulse" 
                    : "bg-white/10 text-white"
                )}
              >
                {isMuted ? (
                  <>
                    <VolumeX className="h-4 w-4" />
                    <span className="text-sm font-medium">Ativar Som</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Som Ativo</span>
                  </>
                )}
              </button>
              
              {/* Video indicator */}
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs">
                <span>{currentVideoIndex + 1}/{videos.length}</span>
              </div>
              
              {/* Skip/Close */}
              <button
                onClick={skipToAudio}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <Music className="h-4 w-4" />
                <span className="text-sm">Música</span>
              </button>
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={stopPlayback}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      
      {/* Player Controls */}
      <div className={cn("flex items-center gap-0.5", className)}>
        {isPlaying && (
          <button
            onClick={() => changeTrack('prev')}
            className="p-1 rounded transition-all duration-200 text-muted-foreground/50 hover:text-foreground/70"
            title="Anterior"
          >
            <SkipBack className="h-2.5 w-2.5" />
          </button>
        )}
        
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
          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </button>
        
        {isPlaying && (
          <button
            onClick={() => changeTrack('next')}
            className="p-1 rounded transition-all duration-200 text-muted-foreground/50 hover:text-foreground/70"
            title="Próximo"
          >
            <SkipForward className="h-2.5 w-2.5" />
          </button>
        )}
        
        {isPlaying && (
          <button
            onClick={toggleMute}
            className="p-1 rounded transition-all duration-200 text-muted-foreground/50 hover:text-foreground/70"
            title={isMuted ? "Ativar som" : "Silenciar"}
          >
            {isMuted ? <VolumeX className="h-2.5 w-2.5" /> : <Volume2 className="h-2.5 w-2.5" />}
          </button>
        )}
        
        {isPlaying && !showVideoOverlay && (
          <div className="flex items-center gap-0.5 ml-0.5">
            <div className="w-0.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-0.5 h-2.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-0.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>
    </>
  );
}
