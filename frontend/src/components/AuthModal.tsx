import React, { useState } from 'react';
import { api, setAuthToken } from '../services/api';
import { User } from '../types';
import { translations, Lang } from '../i18n';
import { Lock, Mail, User as UserIcon, ArrowRight, Globe } from 'lucide-react';

interface AuthModalProps {
  onLoginSuccess: (user: User) => void;
  lang: Lang;
  onToggleLang: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLoginSuccess, lang, onToggleLang }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t = translations[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email, password } : { email, password, name };
      const res = await api.post<{ token: string; user: User }>(endpoint, payload);
      
      setAuthToken(res.token);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-shtab-dark flex items-center justify-center p-4 relative">
      {/* Language Switcher in top right */}
      <div className="absolute top-6 right-6">
        <button
          onClick={onToggleLang}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition border border-slate-700 shadow"
        >
          <Globe size={15} />
          <span>{lang === 'ru' ? 'EN' : 'RU'}</span>
        </button>
      </div>

      <div className="bg-shtab-sidebar border border-slate-700 w-full max-w-md rounded-2xl p-8 shadow-2xl text-slate-100">
        <div className="flex flex-col items-center mb-8">
          {/* 
            ========================================================================
            LOGOTYPE PLACEMENT INSTRUCTION:
            File: frontend/src/components/AuthModal.tsx
            Line: ~51
            Tag: <img src="/logo.svg" alt="Shtab Logo" className="w-8 h-8 text-white" />
            Path to image: public/logo.svg
            ========================================================================
          */}
          <div className="w-14 h-14 bg-shtab-accent rounded-xl flex items-center justify-center shadow-lg mb-3">
            <img src="/logo.svg" alt="Shtab Logo" className="w-8 h-8 text-white" onError={(e)=>{
              (e.target as HTMLElement).style.display = 'none';
            }} />
            <span className="text-white font-bold text-2xl absolute">Ш</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Shtab Project Manager</h1>
          <p className="text-slate-400 text-sm mt-1">
            {isLogin ? t.signIn : t.signUp}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                {t.fullName}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon size={18} />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-shtab-accent text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              {t.emailLabel}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-shtab-accent text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              {t.passwordLabel}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-shtab-accent text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-shtab-accent hover:bg-shtab-accentHover text-white font-medium rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/30"
          >
            <span>{isLogin ? t.signIn : t.signUp}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          {isLogin ? t.noAccount : t.hasAccount}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-shtab-accent hover:underline font-medium ml-1"
          >
            {isLogin ? t.signUp : t.signIn}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-500 text-center">
          {t.defaultAdminInfo}
        </div>
      </div>
    </div>
  );
};
