import React, { useState } from 'react';
import { ShieldCheck, Lock, Unlock, Eye, EyeOff, Sparkles, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';

export default function VaultLockScreen({ apiUrl, onUnlock }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [remember, setRemember] = useState(true);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!password.trim()) {
      setError('Por favor, introduce tu PIN o contraseña');
      triggerShake();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() })
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        if (remember) {
          localStorage.setItem('riftbard_vault_token', data.token);
        } else {
          sessionStorage.setItem('riftbard_vault_token', data.token);
        }
        onUnlock(data.token);
      } else {
        setError(data.error || 'PIN o contraseña incorrecta');
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

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07040d] px-4 overflow-hidden select-none">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-950/20 via-transparent to-transparent pointer-events-none" />

      {/* Main Vault Lock Card */}
      <div 
        className={`relative w-full max-w-md p-8 sm:p-10 rounded-3xl bg-[#0e081c]/90 border border-primary-500/20 shadow-[0_0_60px_rgba(139,92,246,0.18)] backdrop-blur-2xl transition-all duration-300 ${
          shake ? 'animate-shake' : ''
        }`}
      >
        {/* Glow corner accent */}
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-primary-400 to-transparent shadow-[0_0_15px_#a855f7]" />

        {/* Emblem */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-5 flex items-center justify-center">
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-tr from-primary-600 to-fuchsia-500 opacity-25 blur-lg animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-dark-800 to-primary-950/80 border border-primary-500/40 flex items-center justify-center shadow-inner group">
              <KeyRound className="w-8 h-8 text-primary-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-primary-500/10 text-primary-300 border border-primary-500/20 mb-2">
            <Lock className="w-3 h-3 text-primary-400" /> Bóveda Protegida
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
            RiftBard <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-fuchsia-400">Vault</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-xs leading-relaxed">
            Introduce tu PIN o contraseña maestra para acceder a tu colección y mazos.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex justify-between items-center px-1">
              <span>Clave de Acceso</span>
              <span className="text-[10px] text-slate-500 font-normal">PIN o contraseña</span>
            </label>

            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduce tu clave..."
                autoFocus
                disabled={loading}
                className="w-full h-12 pl-4 pr-12 rounded-xl bg-dark-900/90 border border-white/10 hover:border-primary-500/40 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-white placeholder-slate-500 text-sm transition-all outline-none font-mono"
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
          <div className="flex items-center justify-between px-1 text-xs text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-dark-900 text-primary-500 focus:ring-primary-500/20 cursor-pointer accent-primary-500"
              />
              <span className="group-hover:text-slate-300 transition-colors">Recordar en este dispositivo</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-2 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-primary-600 via-primary-500 to-fuchsia-600 hover:from-primary-500 hover:to-fuchsia-500 text-white shadow-[0_0_25px_rgba(168,85,247,0.35)] hover:shadow-[0_0_35px_rgba(168,85,247,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
        </form>

        {/* Security Footer Notice */}
        <div className="mt-8 pt-5 border-t border-white/[0.06] flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-primary-400/70" />
          <span>Cifrado HMAC SHA-256 • Base de datos Supabase protegida</span>
        </div>
      </div>
    </div>
  );
}
