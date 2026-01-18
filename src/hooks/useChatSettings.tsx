import { useState, useEffect } from 'react';

export type ChatBackgroundTheme = 'tactical' | 'military' | 'alert' | 'cyber' | 'none';
export type ShiftReminderHours = 12 | 24 | 48;

interface ChatSettings {
  backgroundTheme: ChatBackgroundTheme;
  shiftReminderHours: ShiftReminderHours;
}

const STORAGE_KEY = 'chat_settings';

const defaultSettings: ChatSettings = {
  backgroundTheme: 'tactical',
  shiftReminderHours: 24,
};

export function useChatSettings(agentId: string) {
  const [settings, setSettings] = useState<ChatSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    if (!agentId) return;
    
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${agentId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Error loading chat settings:', error);
    }
    setIsLoaded(true);
  }, [agentId]);

  // Save settings to localStorage
  const saveSettings = (newSettings: Partial<ChatSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    if (agentId) {
      try {
        localStorage.setItem(`${STORAGE_KEY}_${agentId}`, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving chat settings:', error);
      }
    }
  };

  const setBackgroundTheme = (theme: ChatBackgroundTheme) => {
    saveSettings({ backgroundTheme: theme });
  };

  const setShiftReminderHours = (hours: ShiftReminderHours) => {
    saveSettings({ shiftReminderHours: hours });
  };

  return {
    ...settings,
    isLoaded,
    setBackgroundTheme,
    setShiftReminderHours,
  };
}

// Hook to get just the shift reminder hours for a given agent
export function useShiftReminderHours(agentId: string): ShiftReminderHours {
  const [hours, setHours] = useState<ShiftReminderHours>(24);

  useEffect(() => {
    if (!agentId) return;
    
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${agentId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.shiftReminderHours) {
          setHours(parsed.shiftReminderHours);
        }
      }
    } catch (error) {
      console.error('Error loading shift reminder hours:', error);
    }
  }, [agentId]);

  return hours;
}

// Hook to get just the chat background theme for a given agent
export function useChatBackgroundTheme(agentId: string): ChatBackgroundTheme {
  const [theme, setTheme] = useState<ChatBackgroundTheme>('tactical');

  useEffect(() => {
    if (!agentId) return;
    
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${agentId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.backgroundTheme) {
          setTheme(parsed.backgroundTheme);
        }
      }
    } catch (error) {
      console.error('Error loading chat background theme:', error);
    }
  }, [agentId]);

  return theme;
}
