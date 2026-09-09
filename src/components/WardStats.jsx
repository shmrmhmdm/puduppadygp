import React from 'react';
import { Users, CheckCircle2, Clock, Award, UserX } from 'lucide-react';

export default function WardStats({ total = 0, completed = 0, pending = 0, deceased = 0 }) {
  const targetTotal = total - deceased > 0 ? total - deceased : 0;
  const percentage = targetTotal > 0 
    ? Math.round((completed / targetTotal) * 100) 
    : (total > 0 && deceased === total ? 100 : 0);
  const isAllComplete = targetTotal > 0 && pending === 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-4 sm:p-5">
      {/* Header with completion % */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
            വാർഡ് പുരോഗതി റിപ്പോർട്ട് | Live Ward Statistics
          </h2>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
          isAllComplete 
            ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
            : 'bg-slate-100 text-slate-700 border-slate-200'
        }`}>
          {percentage}% പൂർത്തിയായി (Done)
        </span>
      </div>

      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
        {/* Total */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 sm:p-3 text-center transition-all hover:bg-slate-100/80">
          <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 mx-auto flex items-center justify-center mb-1">
            <Users className="w-4 h-4" />
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
            {total}
          </div>
          <div className="text-[11px] sm:text-xs font-semibold text-slate-700 mt-1 line-clamp-1">
            ആകെ
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-500 hidden sm:block">
            Total Records
          </div>
        </div>

        {/* Completed */}
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-2.5 sm:p-3 text-center transition-all hover:bg-emerald-100/60">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white mx-auto flex items-center justify-center mb-1 shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-emerald-800 tracking-tight leading-none">
            {completed}
          </div>
          <div className="text-[11px] sm:text-xs font-bold text-emerald-800 mt-1 line-clamp-1">
            പൂർത്തിയായത്
          </div>
          <div className="text-[9px] sm:text-[10px] text-emerald-600 hidden sm:block">
            Completed ({percentage}%)
          </div>
        </div>

        {/* Deceased */}
        <div className="bg-rose-50/80 border border-rose-200/80 rounded-xl p-2.5 sm:p-3 text-center transition-all hover:bg-rose-100/60">
          <div className="w-7 h-7 rounded-lg bg-rose-600 text-white mx-auto flex items-center justify-center mb-1 shadow-sm">
            <UserX className="w-4 h-4" />
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-rose-900 tracking-tight leading-none">
            {deceased}
          </div>
          <div className="text-[11px] sm:text-xs font-bold text-rose-900 mt-1 line-clamp-1">
            മരണപ്പെട്ടവർ
          </div>
          <div className="text-[9px] sm:text-[10px] text-rose-700 hidden sm:block">
            Deceased Records
          </div>
        </div>

        {/* Pending */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-2.5 sm:p-3 text-center transition-all hover:bg-amber-100/60">
          <div className="w-7 h-7 rounded-lg bg-amber-600 text-white mx-auto flex items-center justify-center mb-1 shadow-sm">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-amber-900 tracking-tight leading-none">
            {pending}
          </div>
          <div className="text-[11px] sm:text-xs font-bold text-amber-900 mt-1 line-clamp-1">
            ശേഷിക്കുന്നത്
          </div>
          <div className="text-[9px] sm:text-[10px] text-amber-700 hidden sm:block">
            Pending Numbers
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        {isAllComplete && (
          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/80 py-1.5 px-3 rounded-lg border border-emerald-300 animate-in fade-in zoom-in-95">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>അഭിനന്ദനങ്ങൾ! ഈ വാർഡിലെ എല്ലാ ഗുണഭോക്താക്കളുടെയും മൊബൈൽ നമ്പർ പൂർത്തിയായി.</span>
          </div>
        )}
      </div>
    </div>
  );
}
