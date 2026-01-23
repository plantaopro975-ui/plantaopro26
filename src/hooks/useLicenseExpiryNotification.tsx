import { useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface LicenseExpiryConfig {
  licenseExpiresAt: string | null | undefined;
  agentId: string | null | undefined;
  agentName?: string | null;
  enabled?: boolean;
  warningDaysBefore?: number;
}

const NOTIFICATION_KEY_PREFIX = 'plantaopro_license_expiry_notified_';
const PUSH_NOTIFICATION_KEY_PREFIX = 'plantaopro_license_push_notified_';

export function useLicenseExpiryNotification(config: LicenseExpiryConfig) {
  const {
    licenseExpiresAt,
    agentId,
    agentName,
    enabled = true,
    warningDaysBefore = 7,
  } = config;

  const { toast } = useToast();
  const { 
    isEnabled: isPushEnabled, 
    showNotification: showPushNotification,
    playTacticalSound,
    requestPermission 
  } = usePushNotifications();
  
  const hasRequestedPermission = useRef(false);

  const getDaysUntilExpiry = useCallback((): number | null => {
    if (!licenseExpiresAt) return null;
    
    // Handle date-only format (YYYY-MM-DD)
    const expiryDate = /^\d{4}-\d{2}-\d{2}$/.test(licenseExpiresAt)
      ? new Date(`${licenseExpiresAt}T23:59:59.999`)
      : new Date(licenseExpiresAt);
    
    if (Number.isNaN(expiryDate.getTime())) return null;
    
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }, [licenseExpiresAt]);

  const getNotificationKey = useCallback(() => {
    if (!agentId) return null;
    const today = new Date().toISOString().split('T')[0];
    return `${NOTIFICATION_KEY_PREFIX}${agentId}_${today}`;
  }, [agentId]);

  const getPushNotificationKey = useCallback(() => {
    if (!agentId) return null;
    const today = new Date().toISOString().split('T')[0];
    return `${PUSH_NOTIFICATION_KEY_PREFIX}${agentId}_${today}`;
  }, [agentId]);

  const hasNotifiedToday = useCallback((): boolean => {
    const key = getNotificationKey();
    if (!key) return true;
    return localStorage.getItem(key) === 'true';
  }, [getNotificationKey]);

  const hasPushNotifiedToday = useCallback((): boolean => {
    const key = getPushNotificationKey();
    if (!key) return true;
    return localStorage.getItem(key) === 'true';
  }, [getPushNotificationKey]);

  const markAsNotified = useCallback(() => {
    const key = getNotificationKey();
    if (key) {
      localStorage.setItem(key, 'true');
    }
  }, [getNotificationKey]);

  const markPushAsNotified = useCallback(() => {
    const key = getPushNotificationKey();
    if (key) {
      localStorage.setItem(key, 'true');
    }
  }, [getPushNotificationKey]);

  // Request push permission when license is expiring soon
  useEffect(() => {
    if (!enabled || !agentId || !licenseExpiresAt) return;
    if (hasRequestedPermission.current) return;

    const daysUntilExpiry = getDaysUntilExpiry();
    if (daysUntilExpiry !== null && daysUntilExpiry <= warningDaysBefore && daysUntilExpiry > 0) {
      if (!isPushEnabled) {
        hasRequestedPermission.current = true;
        // Request permission silently (user will see browser prompt)
        requestPermission();
      }
    }
  }, [enabled, agentId, licenseExpiresAt, getDaysUntilExpiry, warningDaysBefore, isPushEnabled, requestPermission]);

  // Send push notification
  useEffect(() => {
    if (!enabled || !agentId || !licenseExpiresAt) return;
    if (!isPushEnabled) return;

    const daysUntilExpiry = getDaysUntilExpiry();
    if (daysUntilExpiry === null) return;

    // Send push notification if within warning period
    if (daysUntilExpiry > 0 && daysUntilExpiry <= warningDaysBefore && !hasPushNotifiedToday()) {
      const isUrgent = daysUntilExpiry <= 3;
      
      const title = isUrgent 
        ? `🚨 Licença expira em ${daysUntilExpiry} dia${daysUntilExpiry > 1 ? 's' : ''}!`
        : `⚠️ Licença expirando`;
      
      const body = daysUntilExpiry === 1
        ? `${agentName || 'Agente'}, sua licença expira AMANHÃ! Entre em contato com o administrador.`
        : `${agentName || 'Agente'}, sua licença expira em ${daysUntilExpiry} dias. Renove para continuar acessando.`;

      // Delay to avoid interference with page load
      const timeout = setTimeout(() => {
        showPushNotification({
          title,
          body,
          icon: '/favicon.png',
          tag: 'license-expiry',
          requireInteraction: isUrgent,
          playSound: true,
          soundType: isUrgent ? 'urgent' : 'alert',
        });
        markPushAsNotified();
      }, 3000);

      return () => clearTimeout(timeout);
    }

    // Critical: License expired
    if (daysUntilExpiry <= 0 && !hasPushNotifiedToday()) {
      const timeout = setTimeout(() => {
        showPushNotification({
          title: '🚨 LICENÇA EXPIRADA',
          body: `${agentName || 'Agente'}, sua licença expirou! Seu acesso será bloqueado em breve.`,
          icon: '/favicon.png',
          tag: 'license-expired',
          requireInteraction: true,
          playSound: true,
          soundType: 'urgent',
        });
        markPushAsNotified();
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [enabled, agentId, agentName, licenseExpiresAt, getDaysUntilExpiry, warningDaysBefore, isPushEnabled, hasPushNotifiedToday, showPushNotification, markPushAsNotified]);

  // In-app toast notification
  useEffect(() => {
    if (!enabled || !agentId || !licenseExpiresAt) return;

    const daysUntilExpiry = getDaysUntilExpiry();
    
    if (daysUntilExpiry === null) return;

    // Only notify if within warning period and not already notified today
    if (daysUntilExpiry > 0 && daysUntilExpiry <= warningDaysBefore && !hasNotifiedToday()) {
      const message = daysUntilExpiry === 1
        ? 'Sua licença expira amanhã! Entre em contato com o administrador.'
        : `Sua licença expira em ${daysUntilExpiry} dias. Entre em contato com o administrador para renovação.`;

      // Delay notification to avoid UI interference during mount
      const timeout = setTimeout(() => {
        // Play sound for urgent notifications
        if (daysUntilExpiry <= 3) {
          playTacticalSound('urgent');
        } else {
          playTacticalSound('alert');
        }

        toast({
          title: '⚠️ Licença Expirando',
          description: message,
          duration: 10000,
          variant: daysUntilExpiry <= 3 ? 'destructive' : 'default',
        });
        markAsNotified();
      }, 2000);

      return () => clearTimeout(timeout);
    }

    // If already expired, show critical notification
    if (daysUntilExpiry <= 0 && !hasNotifiedToday()) {
      const timeout = setTimeout(() => {
        playTacticalSound('urgent');
        toast({
          title: '🚨 Licença Expirada',
          description: 'Sua licença expirou. Entre em contato com o administrador para renovação imediata.',
          duration: 15000,
          variant: 'destructive',
        });
        markAsNotified();
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [enabled, agentId, licenseExpiresAt, getDaysUntilExpiry, hasNotifiedToday, markAsNotified, warningDaysBefore, toast, playTacticalSound]);

  return {
    daysUntilExpiry: getDaysUntilExpiry(),
    isExpiringSoon: (getDaysUntilExpiry() ?? Infinity) <= warningDaysBefore && (getDaysUntilExpiry() ?? 0) > 0,
    isExpired: (getDaysUntilExpiry() ?? Infinity) <= 0,
    isPushEnabled,
  };
}
