import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Unlock, Eye, EyeOff, Sparkles, AlertCircle, ArrowRight, User, Compass,
  Github, Linkedin, Instagram, Code2, Check
} from 'lucide-react';
import appLogo from '../assets/logo.png';

const DiscordIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

export default function VaultLockScreen({ apiUrl, API_URL, onUnlock, onUnlockSuccess }) {
  const effectiveApiUrl = (apiUrl || API_URL || '/api').replace(/\/$/, '');
  const handleSuccess = onUnlock || onUnlockSuccess || (() => {});
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [remember, setRemember] = useState(true);
  const [copiedDiscord, setCopiedDiscord] = useState(false);

  const handleCopyDiscord = () => {
    navigator.clipboard.writeText('xdavider');
    setCopiedDiscord(true);
    setTimeout(() => setCopiedDiscord(false), 2200);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor, introduce tu usuario y contraseña');
      triggerShake();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${effectiveApiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username.trim(),
          password: password.trim() 
        })
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        if (remember) {
          localStorage.setItem('riftbard_vault_token', data.token);
          localStorage.setItem('riftbard_user_role', 'owner');
        } else {
          sessionStorage.setItem('riftbard_vault_token', data.token);
          sessionStorage.setItem('riftbard_user_role', 'owner');
        }
        sessionStorage.removeItem('riftbard_guest_collection');
        handleSuccess(data.token, 'owner');
      } else {
        setError(data.error || 'Usuario o contraseña incorrectos');
        triggerShake();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('No se pudo conectar con el servidor. Revisa tu conexión.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    setError('');

    try {
      const res = await fetch(`${effectiveApiUrl}/auth/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        // En modo invitado, no se guarda en localStorage persistente para que sea una sesión aislada
        sessionStorage.setItem('riftbard_vault_token', data.token);
        sessionStorage.setItem('riftbard_user_role', 'guest');
        sessionStorage.removeItem('riftbard_guest_collection'); // Inicia colección limpia desde 0
        sessionStorage.removeItem('riftbard_guest_decks'); // Inicia mazos limpios desde 0
        localStorage.removeItem('riftbard_vault_token');
        localStorage.removeItem('riftbard_user_role');
        handleSuccess(data.token, 'guest');
      } else {
        setError(data.error || 'No se pudo iniciar la sesión de invitado');
        triggerShake();
      }
    } catch (err) {
      console.error('Guest login error:', err);
      setError('No se pudo conectar con el servidor.');
      triggerShake();
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-app px-4 overflow-y-auto select-none py-8">
      {/* Main Vault Lock Card */}
      <div 
        className={`relative w-full max-w-md p-6 sm:p-8 rounded-2xl bg-surface border border-line transition-all duration-200 my-auto ${
          shake ? 'animate-shake' : ''
        }`}
      >
        {/* Emblem */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-subtle border border-line flex items-center justify-center p-2 overflow-hidden">
            <img src={appLogo} alt="RiftBard Meep Logo" className="w-full h-full object-contain" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#FFFBEB] dark:bg-amber-950/50 text-[#92400E] dark:text-amber-300 border border-[#FDE68A] dark:border-amber-700/60 mb-2">
            <Lock className="w-3 h-3 text-[#B45309]" /> Bóveda Protegida
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-primary font-display tracking-tight">
            RiftBard <span className="text-[#B45309]">Vault</span>
          </h1>
          <p className="mt-1.5 text-sm text-ink-secondary max-w-xs leading-relaxed">
            Accede con tu usuario y contraseña, o entra como invitado para testear.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wider text-ink-secondary uppercase flex justify-between items-center px-0.5">
              <span>Usuario</span>
              <span className="text-[11px] text-ink-muted font-normal">Cuenta</span>
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-4 h-4 text-ink-muted pointer-events-none" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Introduce tu usuario..."
                autoFocus
                disabled={loading || guestLoading}
                className="w-full min-h-[44px] pl-10 pr-4 rounded-[10px] bg-surface border border-line hover:border-line-strong focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/15 text-ink-primary placeholder-ink-muted text-base sm:text-sm transition-all outline-none font-medium"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wider text-ink-secondary uppercase flex justify-between items-center px-0.5">
              <span>Contraseña</span>
              <span className="text-[11px] text-ink-muted font-normal">Clave de acceso</span>
            </label>

            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-ink-muted pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduce tu clave..."
                disabled={loading || guestLoading}
                className="w-full min-h-[44px] pl-10 pr-12 rounded-[10px] bg-surface border border-line hover:border-line-strong focus:border-[#B45309] focus:ring-2 focus:ring-[#B45309]/15 text-ink-primary placeholder-ink-muted text-base sm:text-sm transition-all outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1.5 min-w-[40px] min-h-[40px] flex items-center justify-center text-ink-secondary hover:text-ink-primary transition-colors rounded-lg"
                title={showPassword ? 'Ocultar' : 'Mostrar'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-[10px] bg-red-50 border border-red-200 text-[#B91C1C] text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#B91C1C]" />
              <span>{error}</span>
            </div>
          )}

          {/* Remember Checkbox */}
          <div className="flex items-center justify-between px-0.5 text-xs text-ink-secondary">
            <label className="flex items-center gap-2 cursor-pointer select-none min-h-[36px]">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-line-strong text-[#B45309] focus:ring-[#B45309]/20 cursor-pointer accent-[#B45309]"
              />
              <span>Recordar sesión</span>
            </label>
          </div>

          {/* Owner Submit Button */}
          <button
            type="submit"
            disabled={loading || guestLoading}
            className="w-full min-h-[44px] rounded-[10px] font-semibold text-sm bg-[#B45309] hover:bg-[#92400E] text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <span>Desbloquear Bóveda</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-1">
            <div className="border-t border-line w-full" />
            <span className="bg-surface px-3 text-[11px] uppercase font-semibold tracking-widest text-ink-muted shrink-0">O BIEN</span>
            <div className="border-t border-line w-full" />
          </div>

          {/* Guest Button */}
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={loading || guestLoading}
            className="w-full min-h-[44px] rounded-[10px] font-semibold text-sm bg-subtle hover:bg-line text-ink-primary border border-line active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {guestLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#B45309]/30 border-t-[#B45309] rounded-full animate-spin" />
                <span>Iniciando sesión de invitado...</span>
              </>
            ) : (
              <>
                <Compass className="w-4 h-4 text-[#B45309]" />
                <span>Entrar como Invitado</span>
              </>
            )}
          </button>
          
          <p className="text-xs text-center text-ink-secondary px-2 leading-relaxed">
            Modo prueba con una colección independiente iniciada desde cero.
          </p>
        </form>

        {/* Socials & Creator Bar */}
        <div className="mt-5 pt-4 border-t border-line flex flex-col items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-ink-secondary font-medium">
            <span>Creado por</span>
            <a 
              href="https://github.com/XDavider" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#B45309] hover:text-[#92400E] dark:text-amber-300 font-semibold hover:underline transition-colors inline-flex items-center gap-1"
            >
              David <span className="text-ink-muted font-normal">(@XDavider)</span>
            </a>
          </div>

          <div className="flex items-center justify-center gap-1.5 flex-wrap w-full">
            <a
              href="https://github.com/XDavider"
              target="_blank"
              rel="noopener noreferrer"
              title="Perfil de GitHub (@XDavider)"
              className="px-2.5 py-1.5 rounded-lg bg-subtle hover:bg-line border border-line text-ink-primary text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Github size={13} className="text-ink-secondary" />
              <span>GitHub</span>
            </a>

            <a
              href="https://github.com/XDavider/RiftBard"
              target="_blank"
              rel="noopener noreferrer"
              title="Repositorio oficial en GitHub (RiftBard)"
              className="px-2.5 py-1.5 rounded-lg bg-subtle hover:bg-line border border-line text-ink-primary text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Code2 size={13} className="text-ink-secondary" />
              <span>Repo</span>
            </a>

            <a
              href="https://www.linkedin.com/in/david-bermudez-445785403"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn (David Bermúdez)"
              className="px-2.5 py-1.5 rounded-lg bg-subtle hover:bg-line border border-line text-ink-primary text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Linkedin size={13} className="text-ink-secondary" />
              <span>LinkedIn</span>
            </a>

            <a
              href="https://www.instagram.com/david_de_dora/"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram (@david_de_dora)"
              className="px-2.5 py-1.5 rounded-lg bg-subtle hover:bg-line border border-line text-ink-primary text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Instagram size={13} className="text-ink-secondary" />
              <span>Instagram</span>
            </a>

            <button
              type="button"
              onClick={handleCopyDiscord}
              title="Copiar usuario de Discord (xdavider)"
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer select-none ${
                copiedDiscord
                  ? 'bg-green-50 border-green-300 text-[#15803D]'
                  : 'bg-subtle hover:bg-line border-line text-ink-primary'
              }`}
            >
              <DiscordIcon className={copiedDiscord ? 'text-[#15803D]' : 'text-ink-secondary'} />
              <span>{copiedDiscord ? '¡Copiado!' : 'Discord'}</span>
              {copiedDiscord ? (
                <Check size={12} className="text-[#15803D]" />
              ) : (
                <span className="text-[11px] text-ink-muted font-mono">xdavider</span>
              )}
            </button>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="mt-4 pt-3 border-t border-line flex items-center justify-center gap-1.5 text-[11px] text-ink-muted text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-[#B45309]" />
          <span>Cifrado HMAC SHA-256 • Bóveda Celestial de Bardo</span>
        </div>
      </div>
    </div>
  );
}
