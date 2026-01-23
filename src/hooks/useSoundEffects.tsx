import { useState, useCallback, useEffect } from 'react';

type SoundType = 
  | 'theme-change' 
  | 'notification' 
  | 'click' 
  | 'success' 
  | 'error' 
  | 'shift-start' 
  | 'shift-end' 
  | 'hover' 
  | 'card-select' 
  | 'button-press' 
  | 'nav-click'
  | 'tactical-click'
  | 'tactical-hover'
  | 'tactical-confirm'
  | 'status-change'
  | 'radio-static'
  | 'access-denied';

type ThemeType = 'tactical' | 'cyber' | 'crimson' | 'arctic' | 'sovereign' | 'nexus' | 'ember' | 'system';

export function useSoundEffects() {
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('plantaopro-sound-enabled');
    return saved !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('plantaopro-sound-enabled', String(isSoundEnabled));
  }, [isSoundEnabled]);

  // Get current theme from localStorage
  const getCurrentTheme = useCallback((): ThemeType => {
    const saved = localStorage.getItem('plantaopro-theme');
    return (saved as ThemeType) || 'tactical';
  }, []);

  // Theme-specific sound configurations
  const getThemeSoundConfig = useCallback((theme: ThemeType) => {
    const configs = {
      tactical: {
        themeChange: { freq: [300, 800, 600], type: 'sine' as OscillatorType, duration: 0.3 },
        hover: { freq: [800, 600], type: 'sine' as OscillatorType, duration: 0.05 },
        cardSelect: { freqs: [440, 587], type: 'sine' as OscillatorType },
      },
      cyber: {
        themeChange: { freq: [200, 1200, 800], type: 'sawtooth' as OscillatorType, duration: 0.35 },
        hover: { freq: [1200, 900], type: 'square' as OscillatorType, duration: 0.04 },
        cardSelect: { freqs: [523, 784], type: 'square' as OscillatorType },
      },
      crimson: {
        themeChange: { freq: [150, 600, 400], type: 'sawtooth' as OscillatorType, duration: 0.4 },
        hover: { freq: [600, 400], type: 'triangle' as OscillatorType, duration: 0.06 },
        cardSelect: { freqs: [349, 523], type: 'sawtooth' as OscillatorType },
      },
      arctic: {
        themeChange: { freq: [500, 1000, 800], type: 'sine' as OscillatorType, duration: 0.4 },
        hover: { freq: [1000, 800], type: 'sine' as OscillatorType, duration: 0.03 },
        cardSelect: { freqs: [659, 880], type: 'sine' as OscillatorType },
      },
      sovereign: {
        themeChange: { freq: [250, 500, 750], type: 'triangle' as OscillatorType, duration: 0.5 },
        hover: { freq: [700, 550], type: 'triangle' as OscillatorType, duration: 0.05 },
        cardSelect: { freqs: [392, 523], type: 'triangle' as OscillatorType },
      },
      nexus: {
        themeChange: { freq: [400, 1000, 600], type: 'square' as OscillatorType, duration: 0.3 },
        hover: { freq: [1100, 850], type: 'square' as OscillatorType, duration: 0.04 },
        cardSelect: { freqs: [494, 659], type: 'square' as OscillatorType },
      },
      ember: {
        themeChange: { freq: [180, 700, 500], type: 'sawtooth' as OscillatorType, duration: 0.45 },
        hover: { freq: [650, 450], type: 'triangle' as OscillatorType, duration: 0.05 },
        cardSelect: { freqs: [370, 554], type: 'sawtooth' as OscillatorType },
      },
      system: {
        themeChange: { freq: [300, 800, 600], type: 'sine' as OscillatorType, duration: 0.3 },
        hover: { freq: [800, 600], type: 'sine' as OscillatorType, duration: 0.05 },
        cardSelect: { freqs: [440, 587], type: 'sine' as OscillatorType },
      },
    };
    return configs[theme] || configs.tactical;
  }, []);

  const playSound = useCallback((type: SoundType, themeOverride?: ThemeType) => {
    if (!isSoundEnabled) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const now = audioContext.currentTime;
    const currentTheme = themeOverride || getCurrentTheme();
    const themeConfig = getThemeSoundConfig(currentTheme);

    switch (type) {
      case 'theme-change': {
        const config = themeConfig.themeChange;
        oscillator.type = config.type;
        oscillator.frequency.setValueAtTime(config.freq[0], now);
        oscillator.frequency.exponentialRampToValueAtTime(config.freq[1], now + config.duration * 0.5);
        oscillator.frequency.exponentialRampToValueAtTime(config.freq[2], now + config.duration * 0.85);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + config.duration);
        oscillator.start(now);
        oscillator.stop(now + config.duration);
        break;
      }

      case 'hover': {
        const config = themeConfig.hover;
        oscillator.type = config.type;
        oscillator.frequency.setValueAtTime(config.freq[0], now);
        oscillator.frequency.exponentialRampToValueAtTime(config.freq[1], now + config.duration * 0.6);
        gainNode.gain.setValueAtTime(0.04, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + config.duration);
        oscillator.start(now);
        oscillator.stop(now + config.duration);
        break;
      }

      case 'card-select': {
        const config = themeConfig.cardSelect;
        oscillator.type = config.type;
        oscillator.frequency.setValueAtTime(config.freqs[0], now);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        
        // Second beep (higher pitch)
        setTimeout(() => {
          const osc2 = audioContext.createOscillator();
          const gain2 = audioContext.createGain();
          osc2.connect(gain2);
          gain2.connect(audioContext.destination);
          osc2.type = config.type;
          osc2.frequency.setValueAtTime(config.freqs[1], audioContext.currentTime);
          gain2.gain.setValueAtTime(0.18, audioContext.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.12);
          osc2.start(audioContext.currentTime);
          osc2.stop(audioContext.currentTime + 0.15);
        }, 80);
        break;
      }

      case 'notification':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523, now);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.15);
        
        setTimeout(() => {
          const osc2 = audioContext.createOscillator();
          const gain2 = audioContext.createGain();
          osc2.connect(gain2);
          gain2.connect(audioContext.destination);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(659, audioContext.currentTime);
          gain2.gain.setValueAtTime(0.2, audioContext.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
          osc2.start(audioContext.currentTime);
          osc2.stop(audioContext.currentTime + 0.2);
        }, 120);
        
        setTimeout(() => {
          const osc3 = audioContext.createOscillator();
          const gain3 = audioContext.createGain();
          osc3.connect(gain3);
          gain3.connect(audioContext.destination);
          osc3.type = 'sine';
          osc3.frequency.setValueAtTime(784, audioContext.currentTime);
          gain3.gain.setValueAtTime(0.2, audioContext.currentTime);
          gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          osc3.start(audioContext.currentTime);
          osc3.stop(audioContext.currentTime + 0.35);
        }, 240);
        break;

      case 'click':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        break;

      case 'success':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.setValueAtTime(500, now + 0.1);
        oscillator.frequency.setValueAtTime(600, now + 0.2);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        oscillator.start(now);
        oscillator.stop(now + 0.4);
        break;

      case 'error':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.setValueAtTime(100, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
        break;

      case 'shift-start':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(392, now);
        oscillator.frequency.setValueAtTime(523, now + 0.15);
        oscillator.frequency.setValueAtTime(659, now + 0.3);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        oscillator.start(now);
        oscillator.stop(now + 0.5);
        break;

      case 'shift-end':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(659, now);
        oscillator.frequency.setValueAtTime(523, now + 0.15);
        oscillator.frequency.setValueAtTime(392, now + 0.3);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        oscillator.start(now);
        oscillator.stop(now + 0.5);
        break;

      case 'button-press':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(500, now);
        oscillator.frequency.exponentialRampToValueAtTime(350, now + 0.05);
        oscillator.frequency.exponentialRampToValueAtTime(420, now + 0.1);
        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        oscillator.start(now);
        oscillator.stop(now + 0.15);
        break;

      case 'nav-click':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(700, now);
        oscillator.frequency.exponentialRampToValueAtTime(500, now + 0.06);
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        break;

      case 'tactical-click':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(1200, now);
        oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.02);
        oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        oscillator.start(now);
        oscillator.stop(now + 0.08);
        break;

      case 'tactical-hover':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1400, now);
        oscillator.frequency.exponentialRampToValueAtTime(1000, now + 0.02);
        gainNode.gain.setValueAtTime(0.03, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
        oscillator.start(now);
        oscillator.stop(now + 0.04);
        break;

      case 'tactical-confirm':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, now);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        oscillator.start(now);
        oscillator.stop(now + 0.08);

        setTimeout(() => {
          const osc2 = audioContext.createOscillator();
          const gain2 = audioContext.createGain();
          osc2.connect(gain2);
          gain2.connect(audioContext.destination);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1100, audioContext.currentTime);
          gain2.gain.setValueAtTime(0.12, audioContext.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          osc2.start(audioContext.currentTime);
          osc2.stop(audioContext.currentTime + 0.12);
        }, 60);
        break;

      case 'status-change':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.setValueAtTime(900, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
        break;

      case 'radio-static': {
        const bufferSize = audioContext.sampleRate * 0.05;
        const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const noiseNode = audioContext.createBufferSource();
        noiseNode.buffer = noiseBuffer;
        const noiseGain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        filter.Q.value = 0.5;
        noiseNode.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(audioContext.destination);
        noiseGain.gain.setValueAtTime(0.06, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        noiseNode.start(now);
        noiseNode.stop(now + 0.05);
        return;
      }

      case 'access-denied':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.08);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.12);

        setTimeout(() => {
          const osc2 = audioContext.createOscillator();
          const gain2 = audioContext.createGain();
          osc2.connect(gain2);
          gain2.connect(audioContext.destination);
          osc2.type = 'square';
          osc2.frequency.setValueAtTime(600, audioContext.currentTime);
          osc2.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.08);
          gain2.gain.setValueAtTime(0.18, audioContext.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          osc2.start(audioContext.currentTime);
          osc2.stop(audioContext.currentTime + 0.12);
        }, 150);

        setTimeout(() => {
          const osc3 = audioContext.createOscillator();
          const gain3 = audioContext.createGain();
          osc3.connect(gain3);
          gain3.connect(audioContext.destination);
          osc3.type = 'sawtooth';
          osc3.frequency.setValueAtTime(300, audioContext.currentTime);
          osc3.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.15);
          gain3.gain.setValueAtTime(0.12, audioContext.currentTime);
          gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          osc3.start(audioContext.currentTime);
          osc3.stop(audioContext.currentTime + 0.25);
        }, 300);
        break;
    }
  }, [isSoundEnabled, getCurrentTheme, getThemeSoundConfig]);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled(prev => !prev);
  }, []);

  return {
    isSoundEnabled,
    toggleSound,
    playSound,
  };
}
