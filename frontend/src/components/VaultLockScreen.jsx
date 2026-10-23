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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#070a10] px-4 overflow-y-auto select-none py-8">
      {/* Background Ambient Glows - Celestial Bard / Meep Amber & Starlight */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/15 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/20 via-transparent to-transparent pointer-events-none" />

      {/* Main Vault Lock Card */}
      <div 
        className={`relative w-full max-w-md p-6 sm:p-9 rounded-3xl bg-[#0d131f]/95 border border-amber-500/25 shadow-[0_0_60px_rgba(245,158,11,0.22)] backdrop-blur-2xl transition-all duration-300 my-auto ${
          shake ? 'animate-shake' : ''
        }`}
      >
        {/* Glow corner accent */}
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b]" />

        {/* Emblem */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4 flex items-center justify-center">
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-primary-500 to-yellow-400 opacity-30 blur-xl animate-pulse" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-dark-850 to-dark-900 border border-amber-400/50 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.35)] p-2 group overflow-hidden">
              <img src={appLogo} alt="RiftBard Meep Logo" className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(251,191,36,0.7)]" />
              <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-1.5">
            <Lock className="w-3 h-3 text-amber-400" /> Bóveda Protegida
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
            RiftBard <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-500">Vault</span>
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400 max-w-xs leading-relaxed">
            Accede con tu usuario y contraseña, o entra como invitado para testear.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
          {/* Username Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex justify-between items-center px-1">
              <span>Usuario</span>
              <span className="text-[10px] text-slate-500 font-normal">Cuenta</span>
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Introduce tu usuario..."
                autoFocus
                disabled={loading || guestLoading}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-dark-900/90 border border-white/10 hover:border-amber-500/40 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white placeholder-slate-500 text-sm transition-all outline-none font-medium"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex justify-between items-center px-1">
              <span>Contraseña</span>
              <span className="text-[10px] text-slate-500 font-normal">Clave de acceso</span>
            </label>

            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduce tu clave..."
                disabled={loading || guestLoading}
                className="w-full h-11 pl-10 pr-11 rounded-xl bg-dark-900/90 border border-white/10 hover:border-amber-500/40 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white placeholder-slate-500 text-sm transition-all outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1.5 text-slate-400 hover:text-white transition-colors"
                title={showPassword ? 'Ocultar' : 'Mostrar'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Remember Checkbox */}
          <div className="flex items-center justify-between px-1 text-xs text-slate-400 pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-dark-900 text-amber-500 focus:ring-amber-500/20 cursor-pointer accent-amber-500"
              />
              <span className="group-hover:text-slate-300 transition-colors">Recordar sesión</span>
            </label>
          </div>

          {/* Owner Submit Button */}
          <button
            type="submit"
            disabled={loading || guestLoading}
            className="w-full h-11 rounded-xl font-black text-sm tracking-wide bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.45)] hover:shadow-[0_0_35px_rgba(251,191,36,0.65)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
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
          <div className="relative flex items-center justify-center py-2">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#0d131f] px-3 text-[10px] uppercase font-bold tracking-widest text-slate-500 shrink-0">O BIEN</span>
            <div className="border-t border-white/10 w-full" />
          </div>

          {/* Guest Button */}
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={loading || guestLoading}
            className="w-full h-11 rounded-xl font-bold text-xs sm:text-sm tracking-wide bg-gradient-to-r from-slate-900 via-[#131b2e] to-slate-900 hover:from-[#17223b] hover:to-[#17223b] text-amber-300 border border-amber-500/30 hover:border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.12)] hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
          >
            {guestLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                <span>Iniciando sesión de invitado...</span>
              </>
            ) : (
              <>
                <Compass className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
                <span>Entrar como Invitado</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400/80 group-hover:scale-110 transition-transform" />
              </>
            )}
          </button>
          
          <p className="text-[11px] text-center text-slate-400 px-2 leading-relaxed">
            Modo prueba con una colección independiente iniciada desde cero.
          </p>
        </form>

        {/* Socials & Creator Bar */}
        <div className="mt-5 pt-4 border-t border-white/[0.07] flex flex-col items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <span>Creado por</span>
            <a 
              href="https://github.com/XDavider" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-amber-300 hover:text-amber-200 font-bold hover:underline transition-colors inline-flex items-center gap-1"
            >
              David <span className="text-slate-500 font-normal">(@XDavider)</span>
            </a>
          </div>

          <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap w-full">
            {/* GitHub Profile */}
            <a
              href="https://github.com/XDavider"
              target="_blank"
              rel="noopener noreferrer"
              title="Perfil de GitHub (@XDavider)"
              className="px-2.5 py-1.5 rounded-xl bg-dark-900/90 hover:bg-[#1a2333] border border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm group"
            >
              <Github size={13} className="text-slate-400 group-hover:text-amber-300 transition-colors" />
              <span>GitHub</span>
            </a>

            {/* GitHub Repository */}
            <a
              href="https://github.com/XDavider/RiftBard"
              target="_blank"
              rel="noopener noreferrer"
              title="Repositorio oficial en GitHub (RiftBard)"
              className="px-2.5 py-1.5 rounded-xl bg-dark-900/90 hover:bg-[#1a2333] border border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm group"
            >
              <Code2 size={13} className="text-slate-400 group-hover:text-amber-300 transition-colors" />
              <span>Repo</span>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/david-bermudez-445785403"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn (David Bermúdez)"
              className="px-2.5 py-1.5 rounded-xl bg-dark-900/90 hover:bg-[#0077b5]/20 border border-white/10 hover:border-[#0077b5]/50 text-slate-300 hover:text-[#38bdf8] text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm group"
            >
              <Linkedin size={13} className="text-slate-400 group-hover:text-[#38bdf8] transition-colors" />
              <span>LinkedIn</span>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/david_de_dora/"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram (@david_de_dora)"
              className="px-2.5 py-1.5 rounded-xl bg-dark-900/90 hover:bg-[#E4405F]/20 border border-white/10 hover:border-[#E4405F]/50 text-slate-300 hover:text-[#f43f5e] text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm group"
            >
              <Instagram size={13} className="text-slate-400 group-hover:text-[#f43f5e] transition-colors" />
              <span>Instagram</span>
            </a>

            {/* Discord Copy Button */}
            <button
              type="button"
              onClick={handleCopyDiscord}
              title="Copiar usuario de Discord (xdavider)"
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer select-none ${
                copiedDiscord
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-dark-900/90 hover:bg-[#5865F2]/20 border-white/10 hover:border-[#5865F2]/50 text-slate-300 hover:text-[#818cf8] group'
              }`}
            >
              <DiscordIcon className={`transition-colors ${copiedDiscord ? 'text-emerald-400' : 'text-slate-400 group-hover:text-[#818cf8]'}`} />
              <span>{copiedDiscord ? '¡Copiado!' : 'Discord'}</span>
              {copiedDiscord ? (
                <Check size={12} className="text-emerald-400" />
              ) : (
                <span className="text-[10px] text-slate-500 font-mono group-hover:text-slate-400 transition-colors">xdavider</span>
              )}
            </button>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="mt-3.5 pt-3 border-t border-white/[0.04] flex items-center justify-center gap-1.5 text-[10px] text-slate-500 text-center">
          <ShieldCheck className="w-3 h-3 text-amber-500/70" />
          <span>Cifrado HMAC SHA-256 • Bóveda Celestial de Bardo</span>
        </div>
      </div>
    </div>
  );
}
