import React from 'react';
import { Heart, Home, Scale, LayoutDashboard, Settings, Calendar, Sparkles } from 'lucide-react';
import { CoupleSettings } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'wedding' | 'home' | 'disputes';
  setActiveTab: (tab: 'dashboard' | 'wedding' | 'home' | 'disputes') => void;
  settings: CoupleSettings;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  settings,
  onOpenSettings,
}) => {
  // Calculate days until wedding
  const daysLeft = React.useMemo(() => {
    if (!settings.weddingDate) return null;
    const wedding = new Date(settings.weddingDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = wedding.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [settings.weddingDate]);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-rose-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Couple Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-champagne-400 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold font-display text-slate-800 tracking-tight">
                  {settings.coupleName || 'Nosso Sonho'}
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 hidden sm:inline-block">
                  Casamento & Lar
                </span>
              </div>
              {daysLeft !== null && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-rose-400" />
                  <span>
                    Faltam <strong className="text-rose-600 font-semibold">{daysLeft} dias</strong> para o grande dia!
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Visão Geral
            </button>

            <button
              onClick={() => setActiveTab('wedding')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'wedding'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500" />
              O Casamento
            </button>

            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'home'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Home className="w-4 h-4 text-emerald-500" />
              Casa Nova
            </button>

            <button
              onClick={() => setActiveTab('disputes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'disputes'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Scale className="w-4 h-4 text-indigo-500" />
              <span>O Que Compensa (IA)</span>
              <span className="bg-gradient-to-r from-indigo-500 to-rose-500 text-white text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-md">
                Smart
              </span>
            </button>
          </nav>

          {/* Right Action: Settings */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              title="Configurações e Orçamento"
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-2 transition-colors border border-transparent hover:border-slate-200"
            >
              <Settings className="w-5 h-5 text-slate-500" />
              <span className="text-xs font-medium hidden sm:inline-block">Configurações</span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'dashboard' ? 'text-rose-600' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Visão Geral</span>
        </button>

        <button
          onClick={() => setActiveTab('wedding')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'wedding' ? 'text-rose-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span>Casamento</span>
        </button>

        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'home' ? 'text-emerald-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Casa Nova</span>
        </button>

        <button
          onClick={() => setActiveTab('disputes')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded-lg transition-colors relative ${
            activeTab === 'disputes' ? 'text-indigo-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <span className="relative">
            <Scale className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-rose-500"></span>
          </span>
          <span>Compensa?</span>
        </button>
      </div>
    </header>
  );
};
