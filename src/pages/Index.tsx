import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, Eye, EyeOff, UserCheck, Lock, Palette, Fingerprint, Shield, Users, KeyRound, Info, Mail, Calendar, Clock, BarChart3, RefreshCw, Target, Building2, Award, CheckCircle2, Zap, Radio, Settings, ChevronDown, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HomeMediaPlayer } from '@/components/HomeMediaPlayer';
import { DeveloperFooter } from '@/components/DeveloperFooter';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  validateCPF, 
  formatCPF, 
  formatMatricula,
  getMatriculaNumbers,
  formatBirthDate, 
  parseBirthDate, 
  calculateAge,
  formatPhone 
} from '@/lib/validators';
import { UnsavedChangesDialog } from '@/components/UnsavedChangesDialog';
import { ForgotPasswordDialog } from '@/components/ForgotPasswordDialog';
import { SavedCredentials, getAutoLoginCredential, getSavedCredentials, getQuickLoginCredential, canQuickLogin } from '@/components/auth/SavedCredentials';
import { ManageCredentialsDialog } from '@/components/auth/ManageCredentialsDialog';
import { MasterPasswordRecoveryDialog } from '@/components/MasterPasswordRecoveryDialog';
import { QuickAccessPanel } from '@/components/QuickAccessPanel';
import { InstitutionalBanner } from '@/components/InstitutionalBanner';
import { HomeAgentInfoBanner } from '@/components/HomeAgentInfoBanner';
import { HeroCinematic } from '@/components/home/HeroCinematic';
import { InstitutionalPillars } from '@/components/home/InstitutionalPillars';

import { useTheme } from '@/contexts/ThemeContext';
import { setMasterToken } from '@/lib/masterSession';
import { ThemedHomeBackground } from '@/components/ThemedHomeBackground';
import { HomeVideoBackground } from '@/components/HomeVideoBackground';
import { ThemedAnalogClock } from '@/components/ThemedAnalogClock';
import { SpectacularClock } from '@/components/SpectacularClock';
import { ThemedTeamCard } from '@/components/ThemedTeamCard';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { useSavedCredentialsSync } from '@/hooks/useSavedCredentialsSync';
import { getThemeAssets } from '@/lib/themeAssets';
import { ParticleBackground } from '@/components/ParticleBackground';
import { ErrorDialog } from '@/components/ErrorDialog';
import { ThemeSelector } from '@/components/ThemeSelector';
import { LockoutTimerDialog } from '@/components/LockoutTimerDialog';
import { PendingApprovalDialog } from '@/components/PendingApprovalDialog';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { TeamBadge } from '@/components/auth/TeamBadge';
import logoShield from '@/assets/logo-shield.png';


interface Unit {
  id: string;
  name: string;
  municipality: string;
}

const teams = ['ALFA', 'BRAVO', 'CHARLIE', 'DELTA'] as const;

export default function Index() {
  const { user, isLoading, signIn, signUp, setMasterSession, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { playSound } = useSoundEffects();
  const { themeConfig, theme, resolvedTheme } = useTheme();
  const themeAssets = getThemeAssets(theme, resolvedTheme);
  const { isAvailable: isBiometricAvailable, isEnrolled: isBiometricEnrolled, enrolledCpf, enrollBiometric, authenticateBiometric } = useBiometricAuth();
  const { saveCredential, updateLastLogin } = useSavedCredentialsSync();

  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [showCpfCheck, setShowCpfCheck] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showMasterLogin, setShowMasterLogin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showCredentialsManager, setShowCredentialsManager] = useState(false);
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingCpf, setIsCheckingCpf] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  
  // Master/Admin login
  const [masterUsername, setMasterUsername] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // CPF check
  const [checkCpf, setCheckCpf] = useState('');
  const [foundAgent, setFoundAgent] = useState<{ name: string; team: string | null } | null>(null);
  const [isSearchingAgent, setIsSearchingAgent] = useState(false);
  
  // Login form
  const [loginCpf, setLoginCpf] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [saveCpfEnabled, setSaveCpfEnabled] = useState(true); // Default to save CPF
  const [savePasswordEnabled, setSavePasswordEnabled] = useState(true); // Default to quick login
  const [enableBiometric, setEnableBiometric] = useState(false);
  const [quickLoginLoadingCpf, setQuickLoginLoadingCpf] = useState<string | null>(null);

  // Registration form
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    matricula: '',
    unit_id: '',
    birth_date: '',
    phone: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingCloseAction, setPendingCloseAction] = useState<(() => void) | null>(null);
  
  // Error dialog state
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    type: 'error' | 'warning' | 'auth' | 'password' | 'team';
  }>({ open: false, title: '', message: '', type: 'auth' });
  
  // Lockout timer state
  const [lockoutDialog, setLockoutDialog] = useState<{
    open: boolean;
    endTime: Date;
    identifier: string;
  }>({ open: false, endTime: new Date(), identifier: '' });
  
  // Pending approval dialog state
  const [pendingApprovalDialog, setPendingApprovalDialog] = useState<{
    open: boolean;
    agentName?: string;
  }>({ open: false });
  
  // Real-time CPF validation state
  const [cpfValidation, setCpfValidation] = useState<{
    isValid: boolean;
    isChecking: boolean;
    exists: boolean;
    existingAgent: { name: string; team: string | null } | null;
  }>({ isValid: false, isChecking: false, exists: false, existingAgent: null });

  // Check if registration form has data
  const hasRegistrationData = Boolean(
    formData.name || 
    formData.matricula || 
    formData.birth_date || 
    formData.phone || 
    formData.address || 
    formData.email || 
    formData.password
  );

  useEffect(() => {
    if (!isLoading && user) {
      // Route by role to avoid admins being sent to the agent panel (which requires an agent profile)
      navigate(isAdmin ? '/admin' : '/agent-panel', { replace: true });
    }
  }, [user, isLoading, isAdmin, navigate]);

  const LAST_CPF_KEY = 'plantaopro_last_cpf';

  const persistLastCpf = (cpf: string) => {
    try {
      const clean = cpf.replace(/\D/g, '');
      if (clean.length === 11) localStorage.setItem(LAST_CPF_KEY, clean);
    } catch {
      // ignore
    }
  };

  const readLastCpf = (): string | null => {
    try {
      const v = localStorage.getItem(LAST_CPF_KEY);
      if (!v) return null;
      const clean = v.replace(/\D/g, '');
      return clean.length === 11 ? clean : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  useEffect(() => {
    if (formData.birth_date.length === 10) {
      const date = parseBirthDate(formData.birth_date);
      if (date) {
        setCalculatedAge(calculateAge(date));
      } else {
        setCalculatedAge(null);
      }
    } else {
      setCalculatedAge(null);
    }
  }, [formData.birth_date]);

  // Real-time CPF validation for registration form
  useEffect(() => {
    const cleanCpf = formData.cpf.replace(/\D/g, '');
    
    if (cleanCpf.length === 11) {
      const isValidFormat = validateCPF(formData.cpf);
      
      if (isValidFormat) {
        setCpfValidation(prev => ({ ...prev, isChecking: true }));
        
        const checkCpfExists = async () => {
          try {
            const { data } = await supabase
              .from('agents')
              .select('name, team')
              .eq('cpf', cleanCpf)
              .maybeSingle();
            
            setCpfValidation({
              isValid: true,
              isChecking: false,
              exists: !!data,
              existingAgent: data
            });
          } catch (error) {
            setCpfValidation({
              isValid: true,
              isChecking: false,
              exists: false,
              existingAgent: null
            });
          }
        };
        
        checkCpfExists();
      } else {
        setCpfValidation({ isValid: false, isChecking: false, exists: false, existingAgent: null });
      }
    } else {
      setCpfValidation({ isValid: false, isChecking: false, exists: false, existingAgent: null });
    }
  }, [formData.cpf]);

  // Smart prefill when dialogs open (no auto-submit, to avoid race conditions)
  const [prefillAttempted, setPrefillAttempted] = useState(false);

  useEffect(() => {
    if (!showCpfCheck) {
      setPrefillAttempted(false);
      return;
    }

    if (prefillAttempted) return;
    const lastCpf = readLastCpf();
    if (!lastCpf) {
      setPrefillAttempted(true);
      return;
    }

    // Only prefill if user hasn't typed anything yet
    if (!checkCpf) {
      setPrefillAttempted(true);
      // Reuse the existing real-time lookup flow
      handleCpfInputChange(lastCpf);
    }
  }, [showCpfCheck, prefillAttempted, checkCpf]);

  useEffect(() => {
    if (!showLogin) return;

    // If login is opened directly (quick login select / biometric), prefill CPF from last usage
    if (!loginCpf) {
      const lastCpf = readLastCpf();
      if (lastCpf) setLoginCpf(formatCPF(lastCpf));
    }

    // Prefill password (only) when we have a single auto-login credential
    const autoLoginCred = getAutoLoginCredential();
    const currentCpf = loginCpf.replace(/\D/g, '');
    if (autoLoginCred && (!currentCpf || currentCpf === autoLoginCred.cpf) && !loginPassword) {
      setLoginCpf(formatCPF(autoLoginCred.cpf));
      setLoginPassword(autoLoginCred.password);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLogin]);

  const fetchUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('municipality, name');

      if (error) throw error;
      setUnits(data || []);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const handleTeamClick = (team: string) => {
    setSelectedTeam(team);
    setShowCpfCheck(true);
    setCheckCpf('');
    setFoundAgent(null);
  };

  // Real-time CPF search with auto-login for registered agents
  const handleCpfInputChange = async (value: string) => {
    const formatted = formatCPF(value);
    setCheckCpf(formatted);
    
    const cleanCpf = formatted.replace(/\D/g, '');
    
    if (cleanCpf.length === 11) {
      setIsSearchingAgent(true);
      try {
        const { data } = await supabase
          .from('agents')
          .select('name, team')
          .eq('cpf', cleanCpf)
          .maybeSingle();
        
        setFoundAgent(data);
        
        // Auto-login: If agent exists and belongs to selected team, auto-proceed to login
        if (data && data.team === selectedTeam) {
          // Small delay to show found status, then auto-proceed
          setTimeout(() => {
            setShowCpfCheck(false);
            setLoginCpf(formatted);
            setShowLogin(true);
            toast({
              title: `Bem-vindo, ${data.name}!`,
              description: 'Digite sua senha para entrar.',
              duration: 3000,
            });
          }, 800);
        } else if (data && data.team && data.team !== selectedTeam) {
          // Wrong team - show professional security-style warning via ErrorDialog
          playSound('access-denied');
          setShowCpfCheck(false);
          setErrorDialog({
            open: true,
            title: 'ACESSO RESTRITO',
            message: `⚠️ ATENÇÃO, AGENTE ${data.name.split(' ')[0].toUpperCase()}!\n\nVocê está cadastrado na EQUIPE ${data.team}.\n\nPor protocolo de segurança, o acesso é permitido apenas pela equipe designada.\n\nSelecione o card da EQUIPE ${data.team} para continuar.`,
            type: 'warning',
          });
        }
      } catch (error) {
        console.error('Error searching agent:', error);
        setFoundAgent(null);
      }
      setIsSearchingAgent(false);
    } else {
      setFoundAgent(null);
    }
  };

  const handleCheckCpf = async () => {
    if (!checkCpf || checkCpf.replace(/\D/g, '').length !== 11) {
      toast({
        title: 'CPF Inválido',
        description: 'Digite um CPF válido com 11 dígitos.',
        variant: 'destructive',
      });
      return;
    }

    setIsCheckingCpf(true);

    try {
      const cleanCpf = checkCpf.replace(/\D/g, '');
      const { data: existingAgent } = await supabase
        .from('agents')
        .select('id, cpf, team, name, is_active, is_frozen, license_status, license_expires_at')
        .eq('cpf', cleanCpf)
        .maybeSingle();

      if (existingAgent) {
        // 1. Bloqueio por desativação manual
        if (existingAgent.is_active === false) {
          playSound('access-denied');
          setShowCpfCheck(false);
          setErrorDialog({
            open: true,
            title: 'ACESSO BLOQUEADO',
            message: 'Seu acesso foi desativado pelo administrador.\n\nEntre em contato com a coordenação para regularizar.',
            type: 'error',
          });
          return;
        }
        
        // 2. Bloqueio por congelamento
        if (existingAgent.is_frozen === true) {
          playSound('access-denied');
          setShowCpfCheck(false);
          setErrorDialog({
            open: true,
            title: 'CONTA CONGELADA',
            message: 'Sua conta foi congelada pelo sistema.\n\nEntre em contato com o administrador para reativar seu acesso.',
            type: 'error',
          });
          return;
        }
        
        // 3. Bloqueio por licença expirada
        const licenseStatus = existingAgent.license_status;
        const licenseExpires = existingAgent.license_expires_at ? new Date(existingAgent.license_expires_at) : null;
        const now = new Date();
        const gracePeriodDays = 3;
        const isLicenseExpired = licenseExpires && 
          new Date(licenseExpires.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000) < now;
        
        if (licenseStatus === 'expired' || licenseStatus === 'frozen' || isLicenseExpired) {
          playSound('access-denied');
          setShowCpfCheck(false);
          setErrorDialog({
            open: true,
            title: 'LICENÇA EXPIRADA',
            message: 'Sua licença de acesso expirou.\n\nEntre em contato com o administrador para renovar seu acesso ao sistema.',
            type: 'error',
          });
          return;
        }
        
        // 4. Bloqueio por falta de equipe
        if (!existingAgent.team) {
          playSound('access-denied');
          setShowCpfCheck(false);
          setErrorDialog({
            open: true,
            title: 'CADASTRO INCOMPLETO',
            message: 'Seu cadastro está sem equipe vinculada.\n\nEntre em contato com o administrador para regularizar sua situação.',
            type: 'error',
          });
          return;
        }
        
        // 5. Verificar se pertence à equipe selecionada
        if (existingAgent.team !== selectedTeam) {
          playSound('access-denied');
          setShowCpfCheck(false);
          setErrorDialog({
            open: true,
            title: 'ACESSO RESTRITO',
            message: `Você está registrado na EQUIPE ${existingAgent.team}.\n\nRetorne à tela inicial e selecione o card correto da sua equipe para acessar o sistema.\n\nPara mudar de equipe, solicite desligamento no seu painel.`,
            type: 'team',
          });
        } else {
          // Tudo OK - mostrar login
          setShowCpfCheck(false);
          setLoginCpf(checkCpf);
          setFoundAgent({ name: existingAgent.name || '', team: existingAgent.team });
          setShowLogin(true);
        }
      } else {
        // CPF não cadastrado - redirecionar para registro
        setShowCpfCheck(false);
        setFormData(prev => ({ 
          ...prev, 
          cpf: checkCpf,
          unit_id: '',
        }));
        setShowRegistration(true);
        toast({
          title: 'CPF Não Cadastrado',
          description: 'Preencha seus dados para se cadastrar no sistema.',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error checking CPF:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível verificar o CPF.',
        variant: 'destructive',
      });
    }

    setIsCheckingCpf(false);
  };

  const validateRegistration = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Nome deve ter pelo menos 3 caracteres';
    } else if (/\d/.test(formData.name)) {
      errors.name = 'Nome não pode conter números';
    }
    
    if (!formData.cpf) {
      errors.cpf = 'CPF é obrigatório';
    } else if (!validateCPF(formData.cpf)) {
      errors.cpf = 'CPF inválido';
    }
    
    // Matrícula is optional at registration - validated only if provided (8 digits)
    const matriculaNumbers = formData.matricula.replace(/\D/g, '');
    if (matriculaNumbers && matriculaNumbers.length !== 8) {
      errors.matricula = 'Matrícula deve ter 8 dígitos';
    }
    
    if (!formData.unit_id) {
      errors.unit_id = 'Selecione uma unidade';
    }
    
    if (formData.birth_date && formData.birth_date.length > 0) {
      if (formData.birth_date.length !== 10) {
        errors.birth_date = 'Data incompleta (DD-MM-AAAA)';
      } else if (!parseBirthDate(formData.birth_date)) {
        errors.birth_date = 'Data de nascimento inválida';
      }
    }
    
    if (!formData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'As senhas não conferem';
    }
    
    setRegErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRegistration() || !selectedTeam) return;
    
    setIsSubmitting(true);
    
    try {
      const matriculaClean = formData.matricula ? getMatriculaNumbers(formData.matricula) : null;
      
      // Build query based on whether matricula is provided
      let query = supabase
        .from('agents')
        .select('id, cpf, matricula')
        .eq('cpf', formData.cpf.replace(/\D/g, ''));
      
      const { data: existingByCpf } = await query.maybeSingle();

      if (existingByCpf) {
        // CPF já cadastrado - não permitir novo cadastro
        setRegErrors({ cpf: 'CPF já cadastrado. Faça login ou solicite ao Master para excluir o cadastro anterior.' });
        setIsSubmitting(false);
        return;
      }
      
      // Check matricula only if provided
      if (matriculaClean) {
        const { data: existingByMatricula } = await supabase
          .from('agents')
          .select('id, matricula')
          .eq('matricula', matriculaClean)
          .maybeSingle();
          
        if (existingByMatricula) {
          setRegErrors({ matricula: 'Matrícula já cadastrada' });
          setIsSubmitting(false);
          return;
        }
      }

      let birthDate: string | null = null;
      let age: number | null = null;
      if (formData.birth_date.length === 10) {
        const date = parseBirthDate(formData.birth_date);
        if (date) {
          birthDate = date.toISOString().split('T')[0];
          age = calculateAge(date);
        }
      }

      const cleanCpf = formData.cpf.replace(/\D/g, '');
      const authEmail = formData.email || `${cleanCpf}@agent.plantaopro.com`;
      
      // CRÍTICO: Limpar possível usuário órfão em auth.users antes de registrar
      // Isso acontece quando um registro anterior falhou no meio do processo
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        await fetch(`${supabaseUrl}/functions/v1/admin-operations`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'cleanup_orphan_auth', cpf: cleanCpf }),
        });
        // Pequeno delay para garantir que a limpeza foi processada
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (cleanupErr) {
        console.warn('Cleanup warning (non-fatal):', cleanupErr);
      }
      
      const { error: signUpError } = await signUp(
        authEmail, 
        formData.password, 
        formData.name.toUpperCase()
      );
      
      if (signUpError) throw signUpError;

      // Wait for session to be established after signup (auto-confirm enabled)
      let retries = 0;
      let sessionUserId: string | null = null;
      while (retries < 10 && !sessionUserId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          sessionUserId = session.user.id;
        } else {
          await new Promise(resolve => setTimeout(resolve, 300));
          retries++;
        }
      }

      if (!sessionUserId) {
        throw new Error('Não foi possível estabelecer a sessão. Tente novamente.');
      }

      // Calcular data de expiração: 30 dias de teste gratuito
      const trialExpiresAt = new Date();
      trialExpiresAt.setDate(trialExpiresAt.getDate() + 30);

      const { error: agentError } = await supabase.from('agents').insert({
        id: sessionUserId,
        name: formData.name.toUpperCase().trim(),
        cpf: cleanCpf,
        matricula: matriculaClean || null,
        unit_id: formData.unit_id,
        team: selectedTeam,
        birth_date: birthDate,
        age: age,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        approval_status: 'approved',
        is_active: true,
        license_status: 'trial',
        license_expires_at: trialExpiresAt.toISOString(),
        license_notes: 'Período de teste gratuito - 30 dias',
      });

      if (agentError) {
        console.error('Agent creation error:', agentError);
        throw agentError;
      }

      // Salvar CPF para prefill futuro
      persistLastCpf(cleanCpf);

      setFormData({
        name: '',
        cpf: '',
        matricula: '',
        unit_id: '',
        birth_date: '',
        phone: '',
        address: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      setCalculatedAge(null);
      setSelectedTeam(null);
      setShowRegistration(false);

      toast({
        title: 'Cadastro concluído!',
        description: 'Você tem 30 dias de acesso gratuito para teste.',
        duration: 5000,
      });

      // Redirecionar para painel do agente (sessão já está ativa)
      navigate('/agent-panel', { replace: true });
      
    } catch (error: any) {
      console.error('Registration error:', error);
      let message = 'Não foi possível criar a conta.';
      if (error.message?.includes('User already registered')) {
        message = 'Este CPF já está cadastrado.';
      }
      
      toast({
        title: 'Erro ao cadastrar',
        description: message,
        variant: 'destructive',
      });
    }
    
    setIsSubmitting(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: Record<string, string> = {};
    const cleanCpf = loginCpf.replace(/\D/g, '');
    
    if (!cleanCpf || cleanCpf.length !== 11) {
      errors.cpf = 'CPF inválido';
    }
    if (!loginPassword || loginPassword.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    setLoginErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    setIsSubmitting(true);
    
    // Verificar status completo do agente: ativo, equipe, licença, congelamento
    const { data: agentCheck } = await supabase
      .from('agents')
      .select('is_active, name, team, is_frozen, license_status, license_expires_at')
      .eq('cpf', cleanCpf)
      .maybeSingle();
    
    // 1. Bloqueio por desativação manual (is_active = false)
    if (agentCheck?.is_active === false) {
      setIsSubmitting(false);
      setShowLogin(false);
      setErrorDialog({
        open: true,
        title: 'ACESSO BLOQUEADO',
        message: 'Seu acesso foi desativado pelo administrador.\n\nEntre em contato com a coordenação para regularizar.',
        type: 'error',
      });
      return;
    }
    
    // 2. Bloqueio por congelamento (is_frozen = true)
    if (agentCheck?.is_frozen === true) {
      setIsSubmitting(false);
      setShowLogin(false);
      setErrorDialog({
        open: true,
        title: 'CONTA CONGELADA',
        message: 'Sua conta foi congelada pelo sistema.\n\nEntre em contato com o administrador para reativar seu acesso.',
        type: 'error',
      });
      return;
    }
    
    // 3. Bloqueio por licença expirada ou inativa
    const licenseStatus = agentCheck?.license_status;
    const licenseExpires = agentCheck?.license_expires_at ? new Date(agentCheck.license_expires_at) : null;
    const now = new Date();
    const gracePeriodDays = 3; // 3 dias de carência após expiração
    
    // Verificar se licença expirou (com período de carência)
    const isLicenseExpired = licenseExpires && 
      new Date(licenseExpires.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000) < now;
    
    if (licenseStatus === 'expired' || licenseStatus === 'frozen' || isLicenseExpired) {
      setIsSubmitting(false);
      setShowLogin(false);
      setErrorDialog({
        open: true,
        title: 'LICENÇA EXPIRADA',
        message: 'Sua licença de acesso expirou.\n\nEntre em contato com o administrador para renovar seu acesso ao sistema.',
        type: 'error',
      });
      return;
    }
    
    // 4. Bloqueio por falta de equipe (team = null)
    if (!agentCheck?.team) {
      setIsSubmitting(false);
      setShowLogin(false);
      setErrorDialog({
        open: true,
        title: 'CADASTRO INCOMPLETO',
        message: 'Seu cadastro está sem equipe vinculada.\n\nEntre em contato com o administrador para regularizar sua situação.',
        type: 'error',
      });
      return;
    }
    
    const authEmail = `${cleanCpf}@agent.plantaopro.com`;
    const { error } = await signIn(authEmail, loginPassword);
    
    if (error) {
      // Check if it's a rate limit error
      if (error.message.includes('Muitas tentativas') || error.message.includes('rate limit') || error.message.includes('15 minutos')) {
        // Show lockout timer dialog
        const lockoutEnd = new Date();
        lockoutEnd.setMinutes(lockoutEnd.getMinutes() + 15);
        setLockoutDialog({
          open: true,
          endTime: lockoutEnd,
          identifier: formatCPF(cleanCpf)
        });
        setShowLogin(false);
      } else {
        // Show password error dialog
        setErrorDialog({
          open: true,
          title: 'Senha Incorreta',
          message: error.message === 'Invalid login credentials' 
            ? 'A senha digitada está incorreta.\n\nVerifique suas credenciais e tente novamente.' 
            : error.message || 'Não foi possível autenticar. Tente novamente.',
          type: 'password',
        });
      }
    } else {
      persistLastCpf(cleanCpf);
      // Save credentials if enabled and update last login time
      if (saveCpfEnabled) {
        const { data: agentData } = await supabase
          .from('agents')
          .select('name')
          .eq('cpf', cleanCpf)
          .single();
        saveCredential(cleanCpf, agentData?.name, savePasswordEnabled ? loginPassword : undefined);
      }
      // Always update last login time for quick login feature
      updateLastLogin(cleanCpf);
      
      // Enroll biometric if enabled and available
      if (enableBiometric && isBiometricAvailable) {
        const { data: agentData } = await supabase
          .from('agents')
          .select('name')
          .eq('cpf', cleanCpf)
          .single();
        await enrollBiometric(cleanCpf, agentData?.name);
        toast({
          title: 'Biometria Configurada',
          description: 'No próximo acesso, use sua biometria para entrar.',
        });
      }
      
      toast({
        title: 'Bem-vindo!',
        description: 'Login realizado com sucesso.',
      });
      navigate('/agent-panel', { replace: true });
    }
    
    setIsSubmitting(false);
  };

  const handleMasterLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Guarantee separation: master login cannot share a normal user session
      await supabase.auth.signOut();

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/master-login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: masterUsername, password: masterPassword }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success || !json?.data?.token) {
        throw new Error(json?.error || 'Credenciais inválidas.');
      }

      setMasterToken(json.data.token);
      setMasterSession(masterUsername);

      toast({
        title: 'Acesso Master',
        description: 'Bem-vindo ao painel de controle.',
      });

      setShowMasterLogin(false);
      navigate('/master', { replace: true });
    } catch (error: any) {
      console.error('Master login error:', error);
      setMasterToken(null);
      toast({
        title: 'Erro',
        description: error?.message || 'Não foi possível autenticar.',
        variant: 'destructive',
      });
    }

    setIsSubmitting(false);
  };

  // Handle admin login - use master-login edge function like master panel
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use the same master-login edge function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/master-login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: adminEmail, password: adminPassword }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success || !json?.data?.token) {
        throw new Error(json?.error || 'Credenciais inválidas.');
      }

      // Store session and navigate to admin panel
      setMasterToken(json.data.token);
      setMasterSession(adminEmail);
      
      toast({
        title: 'Acesso Admin',
        description: 'Bem-vindo ao painel administrativo.',
      });

      setShowAdminLogin(false);
      navigate('/admin', { replace: true });
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast({
        title: 'Erro',
        description: error?.message || 'Credenciais inválidas.',
        variant: 'destructive',
      });
    }

    setIsSubmitting(false);
  };

  // Handle quick login from cards (1-click)
  const handleQuickLogin = async (cpf: string, password: string) => {
    setQuickLoginLoadingCpf(cpf);
    
    try {
      const cleanCpf = cpf.replace(/\D/g, '');
      
      // Verificar status completo do agente
      const { data: agentCheck } = await supabase
        .from('agents')
        .select('is_active, team, is_frozen, license_status, license_expires_at')
        .eq('cpf', cleanCpf)
        .maybeSingle();
      
      // Bloqueio por desativação
      if (agentCheck?.is_active === false) {
        toast({
          title: 'Acesso Bloqueado',
          description: 'Seu acesso foi desativado. Contate o administrador.',
          variant: 'destructive',
        });
        setQuickLoginLoadingCpf(null);
        return;
      }
      
      // Bloqueio por congelamento
      if (agentCheck?.is_frozen === true) {
        toast({
          title: 'Conta Congelada',
          description: 'Sua conta foi congelada. Contate o administrador.',
          variant: 'destructive',
        });
        setQuickLoginLoadingCpf(null);
        return;
      }
      
      // Bloqueio por licença expirada
      const licenseStatus = agentCheck?.license_status;
      const licenseExpires = agentCheck?.license_expires_at ? new Date(agentCheck.license_expires_at) : null;
      const now = new Date();
      const gracePeriodDays = 3;
      const isLicenseExpired = licenseExpires && 
        new Date(licenseExpires.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000) < now;
      
      if (licenseStatus === 'expired' || licenseStatus === 'frozen' || isLicenseExpired) {
        toast({
          title: 'Licença Expirada',
          description: 'Sua licença expirou. Contate o administrador.',
          variant: 'destructive',
        });
        setQuickLoginLoadingCpf(null);
        return;
      }
      
      // Bloqueio por falta de equipe
      if (!agentCheck?.team) {
        toast({
          title: 'Cadastro Incompleto',
          description: 'Sem equipe vinculada. Contate o administrador.',
          variant: 'destructive',
        });
        setQuickLoginLoadingCpf(null);
        return;
      }
      
      const authEmail = `${cleanCpf}@agent.plantaopro.com`;
      
      const { error } = await signIn(authEmail, password);
      
      if (error) {
        toast({
          title: 'Falha no Login Rápido',
          description: 'Credenciais inválidas. Faça login manualmente.',
          variant: 'destructive',
        });
      } else {
        persistLastCpf(cleanCpf);
        updateLastLogin(cleanCpf);
        toast({
          title: 'Bem-vindo!',
          description: 'Login rápido realizado com sucesso.',
        });
        navigate('/agent-panel', { replace: true });
      }
    } catch (error) {
      console.error('Quick login error:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível realizar o login rápido.',
        variant: 'destructive',
      });
    }
    
    setQuickLoginLoadingCpf(null);
  };

  // Handle credential selection (without password)
  const handleQuickLoginSelect = (cpf: string) => {
    persistLastCpf(cpf);
    setLoginCpf(formatCPF(cpf));
    setSelectedTeam(null); // Clear team selection for direct login
    setShowLogin(true);
    toast({
      title: 'CPF Carregado',
      description: 'Digite sua senha para entrar.',
    });
  };

  const handleBiometricLogin = async () => {
    setIsBiometricLoading(true);
    try {
      const cpf = await authenticateBiometric();
      if (cpf) {
        // Get agent info
        const { data: agentData, error: agentError } = await supabase
          .from('agents')
          .select('email')
          .eq('cpf', cpf)
          .maybeSingle();
        
        if (agentError || !agentData) {
          toast({
            title: 'Erro',
            description: 'CPF não encontrado no sistema.',
            variant: 'destructive',
          });
          setIsBiometricLoading(false);
          return;
        }
        
        // We need the password for login - prompt user
        const authEmail = agentData.email || `${cpf}@agent.plantaopro.com`;
        persistLastCpf(cpf);
        setLoginCpf(formatCPF(cpf));
        setShowLogin(true);
        toast({
          title: 'Biometria Confirmada',
          description: 'Digite sua senha para continuar.',
        });
      } else {
        toast({
          title: 'Biometria Cancelada',
          description: 'Autenticação biométrica foi cancelada.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      toast({
        title: 'Erro na Biometria',
        description: 'Não foi possível autenticar com biometria.',
        variant: 'destructive',
      });
    }
    setIsBiometricLoading(false);
  };

  const closeAllDialogs = () => {
    setShowCpfCheck(false);
    setShowLogin(false);
    setShowRegistration(false);
    setShowMasterLogin(false);
    setShowAdminLogin(false);
    setSelectedTeam(null);
    setCheckCpf('');
    setLoginCpf('');
    setLoginPassword('');
    setMasterUsername('');
    setMasterPassword('');
    setAdminEmail('');
    setAdminPassword('');
    // Reset registration form
    setFormData({
      name: '',
      cpf: '',
      matricula: '',
      unit_id: '',
      birth_date: '',
      phone: '',
      address: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setRegErrors({});
    setCalculatedAge(null);
  };

  // Safe close that checks for unsaved changes
  const safeCloseRegistration = () => {
    if (hasRegistrationData) {
      setPendingCloseAction(() => closeAllDialogs);
      setShowUnsavedDialog(true);
    } else {
      closeAllDialogs();
    }
  };

  const handleDiscardChanges = () => {
    setShowUnsavedDialog(false);
    if (pendingCloseAction) {
      pendingCloseAction();
      setPendingCloseAction(null);
    }
  };

  const handleCancelClose = () => {
    setShowUnsavedDialog(false);
    setPendingCloseAction(null);
  };

  const selectedUnit = units.find(u => u.id === formData.unit_id);
  const currentTeamConfig = selectedTeam ? {
    icon: themeAssets.teamIcons[selectedTeam as keyof typeof themeAssets.teamIcons],
    ...themeAssets.teamColors[selectedTeam as keyof typeof themeAssets.teamColors],
    ...themeAssets.teamDescriptions[selectedTeam as keyof typeof themeAssets.teamDescriptions],
  } : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-[100dvh] flex flex-col bg-background relative overflow-x-hidden overscroll-none">
        {/* Video Background with Security/Surveillance footage */}
        <HomeVideoBackground />
        
        {/* Themed Animated Background with Rotating Team Images */}
        <ThemedHomeBackground />
        
        {/* Animated Particles/Stars Effect */}
        <ParticleBackground particleCount={50} />

      {/* Header with PLANTÃO PRO Banner at the very top */}
      <header className="relative z-20 shrink-0">
        {/* Institutional Banner - PLANTÃO PRO - Full top position */}
        <InstitutionalBanner />

        {/* Cinematic institutional hero (Navy Trust + Amber) */}
        <div className="px-3 sm:px-6 pt-3">
          <HeroCinematic
            onPrimaryAction={() => {
              const first = document.querySelector<HTMLElement>('[data-team-card]');
              first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
          />
        </div>

        {/* Dynamic Agent Info Banner - Shows rotating critical info for logged agents */}
        <div className="px-3 sm:px-6 py-2">
          <HomeAgentInfoBanner />
        </div>
      </header>
      
      {/* Teams Grid Section - Main content area - FULL HEIGHT */}
      <section className="flex-1 py-3 sm:py-4 px-3 sm:px-6 relative z-10 flex flex-col min-h-0">
        
        {/* Quick Access Panel - Shows when credentials are saved */}
        {getSavedCredentials().length > 0 && (
          <div className="w-full mb-3 sm:mb-4 animate-fade-in shrink-0" style={{ animationDelay: '200ms' }}>
            <QuickAccessPanel
              onQuickLogin={handleQuickLogin}
              onSelectCredential={handleQuickLoginSelect}
              isLoading={!!quickLoginLoadingCpf}
              loadingCpf={quickLoginLoadingCpf || undefined}
            />
          </div>
        )}
        
        {/* Teams Grid - Full width responsive */}
        <div className="flex-1 w-full max-w-6xl mx-auto flex items-center justify-center">
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {teams.map((team, index) => (
              <div
                key={team}
                className="animate-fade-in-scale flex justify-center"
                style={{
                  animationDelay: `${200 + index * 80}ms`,
                }}
              >
                <ThemedTeamCard
                  team={team}
                  onClick={() => handleTeamClick(team)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institutional pillars — bento grid (Phase 4) */}
      <InstitutionalPillars />




      {/* Footer - Clean Professional Design (Reference Style) */}
      <footer className="py-2 px-3 sm:px-4 bg-gradient-to-r from-slate-900/98 via-slate-800/98 to-slate-900/98 backdrop-blur-md border-t border-slate-700/50 relative z-20 shrink-0">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Developer Badge + Audio */}
          <div className="flex items-center gap-2">
            <div className="relative group">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/60 border border-amber-500/40 hover:border-amber-400/60 transition-all">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <span className="text-[8px] font-black text-black">FD</span>
                </div>
                <span className="text-xs font-black tracking-wider uppercase text-amber-400">
                  FRANC D'NIS
                </span>
                <Zap className="h-3 w-3 text-amber-400" />
              </div>
            </div>
            <HomeMediaPlayer />
          </div>
          
          {/* Center: Copyright */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-sm sm:text-base font-semibold text-muted-foreground/80 tracking-wide">
              © 2026 PlantãoPro
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground/60 tracking-widest uppercase hidden sm:inline font-medium">
              FEIJÓ/AC
            </span>
          </div>
          
          {/* Right: Estilo Button + Admin + Tactical Clock */}
          <div className="flex items-center gap-2">
            {/* Saved Credentials */}
            {getSavedCredentials().length > 0 && (
              <button
                onClick={() => setShowCredentialsManager(true)}
                className="p-1.5 text-muted-foreground hover:text-emerald-400 rounded hover:bg-emerald-500/10 transition-all hidden sm:block"
                title="Credenciais Salvas"
              >
                <KeyRound className="h-4 w-4" />
              </button>
            )}
            
            {/* Theme Selector Button - "Estilo" */}
            <button
              onClick={() => setShowThemeSelector(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-600/50 hover:border-primary/50 text-muted-foreground hover:text-primary transition-all"
            >
              <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base font-semibold tracking-wide">Estilo</span>
            </button>
            
            {/* Admin/Master Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center justify-center p-2 text-muted-foreground hover:text-primary rounded-lg bg-slate-800/50 hover:bg-slate-700/70 border border-slate-700/50 hover:border-primary/50 transition-all"
                  title="Acesso Administrativo"
                >
                  <Lock className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-44 bg-slate-900 border border-slate-700/80 shadow-xl z-[100] p-1"
              >
                <DropdownMenuItem 
                  onClick={() => setShowAdminLogin(true)}
                  className="flex items-center gap-2 py-2 px-2.5 cursor-pointer rounded text-xs hover:bg-blue-500/10 focus:bg-blue-500/10 group"
                >
                  <KeyRound className="h-3.5 w-3.5 text-blue-400" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-blue-400 group-hover:text-blue-300">Admin</span>
                    <span className="text-[9px] text-slate-500">Gestão operacional</span>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-slate-700/50 my-0.5" />
                
                <DropdownMenuItem 
                  onClick={() => setShowMasterLogin(true)}
                  className="flex items-center gap-2 py-2 px-2.5 cursor-pointer rounded text-xs hover:bg-amber-500/10 focus:bg-amber-500/10 group"
                >
                  <Shield className="h-3.5 w-3.5 text-amber-400" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-amber-400 group-hover:text-amber-300">Master</span>
                    <span className="text-[9px] text-slate-500">Controle total</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* About App */}
            <button
              onClick={() => setShowAboutDialog(true)}
              className="p-1.5 text-muted-foreground hover:text-primary rounded hover:bg-primary/10 transition-all hidden sm:block"
              title="Sobre o App"
            >
              <Info className="h-4 w-4" />
            </button>
            
            {/* Tactical Clock - Compact */}
            <div className="p-1 rounded-xl bg-slate-800/60 border border-primary/40">
              <SpectacularClock size={44} />
            </div>
          </div>
        </div>
      </footer>

      {/* CPF Check Dialog - Ultra Professional */}
      <AuthDialog
        open={showCpfCheck}
        onOpenChange={(open) => !open && closeAllDialogs()}
        variant="check"
        title={`Equipe ${selectedTeam}`}
        subtitle="Digite seu CPF para identificação"
        teamBadge={selectedTeam && <TeamBadge team={selectedTeam as any} size="lg" />}
      >
        <div className="space-y-5">
          <AuthInput
            value={checkCpf}
            onChange={(e) => handleCpfInputChange(e.target.value)}
            placeholder="000.000.000-00"
            variant="centered"
            maxLength={14}
            rightIcon={isSearchingAgent ? (
              <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
            ) : undefined}
          />
          
          {/* Found agent feedback */}
          {foundAgent && (
            <div className={cn(
              "p-4 rounded-xl border-2 animate-fade-in",
              foundAgent.team && foundAgent.team !== selectedTeam 
                ? 'bg-gradient-to-r from-red-500/15 to-red-600/10 border-red-500/40' 
                : 'bg-gradient-to-r from-emerald-500/15 to-green-500/10 border-emerald-500/40'
            )}>
              <div className="flex items-center gap-3">
                {foundAgent.team && foundAgent.team !== selectedTeam ? (
                  <>
                    <div className="p-2 rounded-lg bg-red-500/20">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-red-400 text-base block">EQUIPE INCORRETA</span>
                      <span className="text-red-300/80 text-sm">Você pertence à {foundAgent.team}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                      <UserCheck className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-emerald-400 text-base block truncate">{foundAgent.name}</span>
                      {foundAgent.team && (
                        <span className="text-emerald-300/80 text-sm">Equipe {foundAgent.team}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          
          {checkCpf.replace(/\D/g, '').length === 11 && !foundAgent && !isSearchingAgent && (
            <div className="p-4 bg-gradient-to-r from-amber-500/15 to-orange-500/10 rounded-xl border-2 border-amber-500/40 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                </div>
                <span className="text-amber-400 font-bold text-base">CPF não cadastrado</span>
              </div>
            </div>
          )}
          
          <AuthButton
            onClick={handleCheckCpf}
            disabled={isCheckingCpf || checkCpf.replace(/\D/g, '').length !== 11}
            variant="master"
            loading={isCheckingCpf}
            loadingText="Verificando..."
            icon={foundAgent ? <Lock className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
          >
            {foundAgent ? 'Fazer Login' : 'Continuar'}
          </AuthButton>
        </div>
      </AuthDialog>

      {/* Login Dialog - Ultra Professional */}
      <AuthDialog
        open={showLogin}
        onOpenChange={(open) => !open && closeAllDialogs()}
        variant="agent"
        title={`Equipe ${selectedTeam}`}
        subtitle="Autenticação de Agente"
        teamBadge={selectedTeam && <TeamBadge team={selectedTeam as any} size="md" />}
      >
        <form onSubmit={handleLogin} className="space-y-5" data-login-form="true">
          <AuthInput
            label="CPF"
            value={loginCpf}
            onChange={(e) => setLoginCpf(formatCPF(e.target.value))}
            placeholder="000.000.000-00"
            variant="centered"
            maxLength={14}
            disabled={!!selectedTeam}
            error={loginErrors.cpf}
          />
          
          <AuthInput
            label="Senha"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="••••••••"
            isPassword
            error={loginErrors.password}
          />
          
          <SavedCredentials
            onSelectCredential={(cpf, savedPassword) => {
              setLoginCpf(formatCPF(cpf));
              if (savedPassword) {
                setLoginPassword(savedPassword);
              }
            }}
            onSaveChange={(cpf, pwd) => {
              setSaveCpfEnabled(cpf);
              setSavePasswordEnabled(pwd);
            }}
            saveCpf={saveCpfEnabled}
            savePassword={savePasswordEnabled}
          />
          
          <div className="flex items-center justify-between pt-1">
            <ForgotPasswordDialog />
          </div>
          
          <AuthButton
            type="submit"
            disabled={isSubmitting}
            variant="primary"
            loading={isSubmitting}
            loadingText="Entrando..."
            icon={<Lock className="h-5 w-5" />}
          >
            Entrar
          </AuthButton>
        </form>
      </AuthDialog>

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        hasUnsavedChanges={hasRegistrationData}
        onDiscard={handleDiscardChanges}
        onCancel={handleCancelClose}
        open={showUnsavedDialog}
        showSaveOption={false}
      />

      {/* Registration Dialog - Ultra Professional */}
      <AuthDialog
        open={showRegistration}
        onOpenChange={(open) => !open && safeCloseRegistration()}
        variant="register"
        title={`Cadastro - ${selectedTeam}`}
        subtitle="Novo Agente"
        teamBadge={selectedTeam && <TeamBadge team={selectedTeam as any} size="md" />}
      >
        {/* Info alerts */}
        <div className="space-y-3 mb-6">
          <div className="p-4 bg-gradient-to-r from-amber-500/15 to-orange-500/10 rounded-xl border-2 border-amber-500/40">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <p className="text-amber-300/90 text-sm font-semibold">
                <strong className="text-amber-400">CPF</strong> será seu usuário de acesso
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-cyan-500/15 to-teal-500/10 rounded-xl border-2 border-cyan-500/40">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20 shrink-0">
                <Clock className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="space-y-1">
                <p className="text-cyan-300 text-sm font-bold">Aprovação Necessária</p>
                <p className="text-cyan-200/70 text-sm leading-relaxed">
                  Cadastro será analisado antes da liberação.
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSignUp} className="space-y-5">
          {/* Nome */}
          <AuthInput
            label="Nome Completo *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value.replace(/\d/g, '').toUpperCase() })}
            placeholder="NOME COMPLETO"
            className="uppercase"
            error={regErrors.name}
          />
          
          {/* CPF e Matrícula */}
          <div className="grid grid-cols-2 gap-4">
            <AuthInput
              label="CPF *"
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
              placeholder="000.000.000-00"
              maxLength={14}
              error={regErrors.cpf}
              rightIcon={formData.cpf.replace(/\D/g, '').length === 11 ? (
                cpfValidation.isChecking ? (
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                ) : cpfValidation.isValid && !cpfValidation.exists ? (
                  <UserCheck className="h-5 w-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                )
              ) : undefined}
            />
            <AuthInput
              label="Matrícula"
              value={formData.matricula}
              onChange={(e) => setFormData({ ...formData, matricula: formatMatricula(e.target.value) })}
              placeholder="000.000.00"
              maxLength={10}
              error={regErrors.matricula}
            />
          </div>
          
          {/* Unidade */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Unidade *
            </label>
            <Select
              value={formData.unit_id}
              onValueChange={(value) => setFormData({ ...formData, unit_id: value })}
            >
              <SelectTrigger className="h-14 text-lg bg-slate-800/80 border-2 border-slate-700/80 hover:border-slate-600">
                <SelectValue placeholder={units.length === 0 ? "Carregando..." : "Selecione a unidade"} />
              </SelectTrigger>
              <SelectContent className="max-h-48" position="popper" sideOffset={4} style={{ zIndex: 9999 }}>
                {units.length === 0 ? (
                  <div className="px-3 py-2 text-slate-400 text-base">Carregando...</div>
                ) : (
                  units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id} className="text-base">
                      <span className="font-medium">{unit.name}</span>
                      <span className="text-slate-400 ml-1.5">({unit.municipality})</span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {regErrors.unit_id && <p className="text-sm text-red-400">{regErrors.unit_id}</p>}
          </div>

          {/* Nascimento e Telefone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <AuthInput
                label="Nascimento"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: formatBirthDate(e.target.value) })}
                placeholder="DD-MM-AAAA"
                maxLength={10}
              />
              {calculatedAge !== null && (
                <p className="text-sm text-amber-400 font-bold mt-2">{calculatedAge} anos</p>
              )}
            </div>
            <AuthInput
              label="Telefone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
          </div>

          {/* Senhas */}
          <div className="grid grid-cols-2 gap-4">
            <AuthInput
              label="Senha *"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Mín. 6 caracteres"
              isPassword
              error={regErrors.password}
            />
            <AuthInput
              label="Confirmar *"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Repita a senha"
              isPassword
              error={regErrors.confirmPassword}
            />
          </div>
          
          <AuthButton
            type="submit"
            disabled={isSubmitting}
            variant="register"
            loading={isSubmitting}
            loadingText="Cadastrando..."
            icon={<UserCheck className="h-5 w-5" />}
          >
            Cadastrar Agente
          </AuthButton>
        </form>
      </AuthDialog>

      {/* Master Admin Login Dialog - Ultra Professional */}
      <AuthDialog
        open={showMasterLogin}
        onOpenChange={(open) => !open && closeAllDialogs()}
        variant="master"
        title="Acesso Master"
        subtitle="Área restrita para administradores"
        icon={<Lock className="h-6 w-6 text-amber-400" />}
      >
        <form onSubmit={handleMasterLogin} className="space-y-5">
          <AuthInput
            label="Usuário"
            value={masterUsername}
            onChange={(e) => setMasterUsername(e.target.value)}
            placeholder="plantaopro@proton.me"
          />
          <AuthInput
            label="Senha"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            placeholder="••••••••"
            isPassword
          />
          <div className="flex justify-end">
            <MasterPasswordRecoveryDialog />
          </div>
          <AuthButton
            type="submit"
            disabled={isSubmitting || !masterUsername || !masterPassword}
            variant="master"
            loading={isSubmitting}
            loadingText="Autenticando..."
            icon={<Lock className="h-5 w-5" />}
          >
            Acessar Painel
          </AuthButton>
        </form>
      </AuthDialog>

      {/* Admin Login Dialog - Ultra Professional */}
      <AuthDialog
        open={showAdminLogin}
        onOpenChange={(open) => !open && closeAllDialogs()}
        variant="admin"
        title="Login Administrativo"
        subtitle="Credenciais de administrador"
        icon={<Shield className="h-6 w-6 text-indigo-400" />}
      >
        <form onSubmit={handleAdminLogin} className="space-y-5">
          <AuthInput
            label="E-mail"
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="plantaopro@proton.me"
          />
          <AuthInput
            label="Senha"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="••••••••"
            isPassword
          />
          <AuthButton
            type="submit"
            disabled={isSubmitting || !adminEmail || !adminPassword}
            variant="admin"
            loading={isSubmitting}
            loadingText="Autenticando..."
            icon={<Lock className="h-5 w-5" />}
          >
            Entrar
          </AuthButton>
        </form>
      </AuthDialog>

      {/* Manage Credentials Dialog */}
      <ManageCredentialsDialog 
        open={showCredentialsManager} 
        onOpenChange={setShowCredentialsManager} 
      />

      {/* About Dialog */}
      <Dialog open={showAboutDialog} onOpenChange={setShowAboutDialog}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[85vh] p-0 overflow-hidden">
          <ScrollArea className="max-h-[85vh]">
            <div className="p-6">
              <DialogHeader className="mb-6">
                <div className="flex items-center justify-center mb-4">
                  <img 
                    src={logoShield} 
                    alt="Plantão Pro" 
                    className="w-28 h-auto drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  />
                </div>
                <DialogTitle className="text-center text-2xl font-bold text-foreground">
                  PlantãoPro
                </DialogTitle>
                <DialogDescription className="text-center text-muted-foreground max-w-md mx-auto">
                  Solução para profissionais da Segurança Pública organizarem sua vida funcional de forma prática e eficiente.
                </DialogDescription>
              </DialogHeader>

              <Separator className="my-4" />

              {/* Features Grid */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-3 text-center">
                  Funcionalidades
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { icon: Calendar, title: 'Plantões', desc: 'Organize visualmente' },
                    { icon: BarChart3, title: 'Escalas', desc: 'Acompanhe equipe' },
                    { icon: Clock, title: 'Banco de Horas', desc: 'Controle completo' },
                    { icon: RefreshCw, title: 'Permutas', desc: 'Trocas simples' },
                    { icon: Users, title: 'Equipes', desc: 'Chat integrado' },
                    { icon: Target, title: 'Planejamento', desc: 'Rotina organizada' },
                  ].map((feature) => (
                    <div 
                      key={feature.title}
                      className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center"
                    >
                      <feature.icon className="h-5 w-5 text-primary mx-auto mb-1.5" />
                      <p className="text-xs font-medium text-foreground">{feature.title}</p>
                      <p className="text-[10px] text-muted-foreground">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Origin */}
              <Card className="border-border/50 bg-muted/20 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">Desenvolvedor</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <strong className="text-foreground text-sm">Franc D'nis</strong>
                        <br />
                        <span className="text-primary">Agente Socioeducativo</span> • <strong className="text-foreground">Feijó, Acre</strong>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Desenvolvido para resolver problemas reais do dia a dia da categoria.
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          <Award className="h-3 w-3" /> Feito por quem entende
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Problemas reais
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact - Apenas email do app */}
              <div className="text-center">
                <h4 className="text-sm font-semibold text-foreground mb-2">Contato</h4>
                <a 
                  href="mailto:plantaopro@proton.me"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg bg-muted/30 hover:bg-muted/50"
                >
                  <Mail className="h-3.5 w-3.5" />
                  plantaopro@proton.me
                </a>
              </div>

              {/* Footer com desenvolvedor */}
              <div className="mt-6 pt-4 border-t border-border/30 text-center space-y-1">
                <p className="text-[10px] text-muted-foreground/80 flex items-center justify-center gap-1.5">
                  <span className="font-bold bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">FRANC D'NIS</span>
                  <span className="text-muted-foreground/50">•</span>
                  <span>Feijó/AC</span>
                </p>
                <p className="text-[9px] text-muted-foreground/50">
                  © {new Date().getFullYear()} PlantãoPro
                </p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      {/* Theme Selector Dialog */}
      <Dialog open={showThemeSelector} onOpenChange={setShowThemeSelector}>
        <DialogContent className="bg-transparent border-0 p-0 shadow-none max-w-sm">
          <ThemeSelector onSelect={() => setShowThemeSelector(false)} />
        </DialogContent>
      </Dialog>

      {/* Error Dialog - Professional */}
      <ErrorDialog
        open={errorDialog.open}
        onClose={() => setErrorDialog(prev => ({ ...prev, open: false }))}
        title={errorDialog.title}
        message={errorDialog.message}
        type={errorDialog.type}
      />
      
      {/* Lockout Timer Dialog */}
      <LockoutTimerDialog
        open={lockoutDialog.open}
        onClose={() => setLockoutDialog(prev => ({ ...prev, open: false }))}
        lockoutEndTime={lockoutDialog.endTime}
        identifier={lockoutDialog.identifier}
      />
      
      {/* Pending Approval Dialog */}
      <PendingApprovalDialog
        open={pendingApprovalDialog.open}
        onClose={() => setPendingApprovalDialog({ open: false })}
        agentName={pendingApprovalDialog.agentName}
      />
      </div>
    </>
  );
}
