import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { type = 'success', title_ml, title_en, message_ml, message_en } = toast;

  const bgStyles = {
    success: 'bg-emerald-900/95 border-emerald-500/50 text-white shadow-emerald-950/20',
    error: 'bg-rose-900/95 border-rose-500/50 text-white shadow-rose-950/20',
    info: 'bg-slate-900/95 border-slate-700 text-white shadow-slate-950/20',
  };

  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? AlertCircle : Info;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className={`p-4 rounded-xl border shadow-xl backdrop-blur-md flex items-start gap-3 ${bgStyles[type] || bgStyles.info}`}>
        <Icon className={`w-6 h-6 shrink-0 mt-0.5 ${type === 'success' ? 'text-emerald-400' : type === 'error' ? 'text-rose-400' : 'text-blue-400'}`} />
        
        <div className="flex-1 text-sm">
          <div className="font-semibold text-base leading-tight">
            {title_ml}
            {title_en && <span className="block text-xs font-normal text-slate-300 mt-0.5">{title_en}</span>}
          </div>
          {(message_ml || message_en) && (
            <div className="mt-1 text-xs text-slate-200 leading-relaxed">
              {message_ml}
              {message_en && <span className="block text-slate-400 mt-0.5">{message_en}</span>}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
