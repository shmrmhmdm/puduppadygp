import React from 'react';
import { 
  Building2, 
  RotateCw, 
  Settings, 
  Code2, 
  Download, 
  Wifi, 
  Link2,
  LogOut,
  UserCheck,
  Shield,
  Briefcase,
  Users,
  FileCheck,
  Smartphone
} from 'lucide-react';
import { isAdmin, isEmployee } from '../services/api';

export default function Header({ 
  hasScriptUrl,
  isOnline, 
  loading, 
  onRefresh, 
  onOpenSettings, 
  onOpenScriptModal, 
  onOpenExportModal,
  onOpenUserManagement,
  loggedInUser,
  onLogout,
  currentView,
  onSwitchView,
  pendingSevanaCount = 0
}) {
  const userIsAdmin = isAdmin(loggedInUser);
  const userIsEmployee = isEmployee(loggedInUser);

  return (
    <header className="bg-slate-800 text-white shadow-md border-b border-slate-700/60 sticky top-0 z-40">
      {/* Top Government Bar */}
      <div className="bg-emerald-800 px-3 sm:px-4 py-1 text-[11px] sm:text-xs text-emerald-100 border-b border-emerald-700/60">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5 font-medium truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 shrink-0"></span>
            <span className="truncate">പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത്</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] shrink-0">
            {hasScriptUrl ? (
              <span className="flex items-center gap-1 text-emerald-200">
                <Wifi className="w-3 h-3 text-emerald-300" />
                <span className="hidden xs:inline">Connected</span>
              </span>
            ) : (
              userIsAdmin && (
                <button
                  onClick={onOpenSettings}
                  className="flex items-center gap-1 text-amber-200 bg-amber-900/80 px-2 py-0.5 rounded border border-amber-500/40 text-[10px]"
                >
                  <Link2 className="w-2.5 h-2.5 text-amber-300" />
                  <span>കണക്ട് ചെയ്യുക</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Logo & Title */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-xs shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            <div className="min-w-0">
              <h1 className="text-xs sm:text-base font-black text-white tracking-tight leading-tight truncate">
                പുതുപ്പാടി പഞ്ചായത്ത്
              </h1>
              <p className="text-[10px] sm:text-xs font-semibold text-emerald-300 truncate">
                പെൻഷൻ മൊബൈൽ പോർട്ടൽ
              </p>
            </div>
          </div>

          {/* Quick Action Icons */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* View Switcher for Employee & Admin */}
            {userIsEmployee && (
              <div className="flex items-center bg-slate-900/90 p-0.5 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => onSwitchView('collection')}
                  title="മൊബൈൽ നമ്പർ കളക്ഷൻ"
                  className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    currentView === 'collection'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">കളക്ഷൻ</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSwitchView('sevana')}
                  title="സേവന അപ്ഡേഷൻ ക്യൂ"
                  className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    currentView === 'sevana'
                      ? 'bg-indigo-700 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5 text-indigo-200" />
                  <span className="hidden md:inline">സേവന</span>
                  {pendingSevanaCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-400 text-slate-950 font-black">
                      {pendingSevanaCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Admin User Management */}
            {userIsAdmin && (
              <button
                onClick={onOpenUserManagement}
                title="യൂസർ മാനേജ്‌മെന്റ്"
                className="p-1.5 sm:p-2 text-purple-200 bg-purple-950/70 border border-purple-600/40 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-purple-900 active:scale-95 transition-all"
              >
                <Users className="w-4 h-4 text-purple-300" />
                <span className="hidden lg:inline">യൂസർമാർ</span>
              </button>
            )}

            {/* Refresh */}
            <button
              onClick={onRefresh}
              disabled={loading || !hasScriptUrl}
              title="റീഫ്രഷ്"
              className="p-1.5 sm:p-2 text-slate-200 bg-slate-700/80 hover:bg-slate-600 border border-slate-600 rounded-xl text-xs font-medium flex items-center gap-1 disabled:opacity-40 active:scale-95 transition-all"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-300' : ''}`} />
              <span className="hidden lg:inline">റീഫ്രഷ്</span>
            </button>

            {/* Export */}
            <button
              onClick={onOpenExportModal}
              title="എക്സ്പോർട്ട്"
              className="p-1.5 sm:p-2 text-slate-200 bg-slate-700/80 hover:bg-slate-600 border border-slate-600 rounded-xl text-xs font-medium flex items-center gap-1 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4 text-teal-300" />
              <span className="hidden lg:inline">എക്സ്പോർട്ട്</span>
            </button>

            {/* Admin Settings */}
            {userIsAdmin && (
              <button
                onClick={onOpenSettings}
                title="സെറ്റിംഗ്സ്"
                className="p-1.5 sm:p-2 text-slate-300 bg-slate-700/80 hover:bg-slate-600 border border-slate-600 rounded-xl text-xs active:scale-95 transition-all"
              >
                <Settings className="w-4 h-4 text-slate-300" />
              </button>
            )}

            {/* Logout Button */}
            {loggedInUser && (
              <button
                onClick={onLogout}
                title="ലോഗൗട്ട്"
                className="p-1.5 sm:p-2 text-rose-200 bg-rose-950/70 hover:bg-rose-900 border border-rose-700/50 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
              >
                <LogOut className="w-4 h-4 text-rose-300" />
                <span className="hidden md:inline">ലോഗൗട്ട്</span>
              </button>
            )}
          </div>
        </div>

        {/* User Identity Mobile Bar */}
        {loggedInUser && (
          <div className="mt-1.5 pt-1.5 border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5 truncate">
              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded font-bold text-[9px] uppercase border shrink-0 ${
                userIsAdmin 
                  ? 'bg-purple-900/80 text-purple-200 border-purple-500/40' 
                  : userIsEmployee 
                  ? 'bg-indigo-900/80 text-indigo-200 border-indigo-500/40' 
                  : 'bg-emerald-900/80 text-emerald-200 border-emerald-500/40'
              }`}>
                {userIsAdmin ? 'അഡ്മിൻ' : userIsEmployee ? 'ജീവനക്കാരൻ' : 'മെമ്പർ'}
              </span>

              <span className="font-bold text-white truncate">{loggedInUser.name}</span>
              {loggedInUser.ward && loggedInUser.ward !== 'All' && (
                <span className="text-emerald-300 bg-emerald-950 px-1 py-0.2 rounded text-[9px] border border-emerald-700 shrink-0">
                  വാർഡ് {loggedInUser.ward}
                </span>
              )}
            </div>

            <span className="text-[10px] text-slate-400 shrink-0">പുതുപ്പാടി</span>
          </div>
        )}
      </div>
    </header>
  );
}
