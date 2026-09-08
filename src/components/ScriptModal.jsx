import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Code2, 
  ExternalLink, 
  FileSpreadsheet, 
  Wand2, 
  CheckCircle2,
  Sparkles 
} from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../services/googleAppsScriptSnippet';

export default function ScriptModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                Google Apps Script Backend Code
              </h3>
              <p className="text-xs text-slate-400">ഓട്ടോമാറ്റിക് കോളം സെറ്റപ്പും ലൈവ് ഡാറ്റ കണക്ഷനും</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 flex-1">
          {/* Automatic Column Creation Highlight */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-black text-emerald-900 text-sm">
              <Wand2 className="w-4 h-4 text-emerald-700" />
              <span>✨ കോളങ്ങൾ ഓട്ടോമാറ്റിക്കായി ഉണ്ടാക്കുന്ന വിധം (Auto Setup):</span>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed">
              ഈ കോഡ് Google Sheet-ൽ പേസ്റ്റ് ചെയ്തുകഴിഞ്ഞാൽ, ഷീറ്റിന്റെ മുകളിലെ മെനുവിൽ <strong>'🏛️ പഞ്ചായത്ത് പോർട്ടൽ'</strong> എന്നൊരു പുതിയ മെനു വരുന്നതാണ്. അതിൽ ക്ലിക്ക് ചെയ്ത് <strong>'✨ 1. കോളങ്ങൾ ഓട്ടോമാറ്റിക്കായി ഉണ്ടാക്കുക'</strong> തിരഞ്ഞെടുത്താൽ 12 കോളങ്ങളും (Emerald Green തീമിൽ) തനിയെ സെറ്റാകുന്നതാണ്!
            </p>
          </div>

          {/* Step by Step Setup */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <FileSpreadsheet className="w-4 h-4 text-slate-700" />
              <span>ക്രമീകരിക്കേണ്ട ഘട്ടങ്ങൾ (Setup Steps):</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 pl-1 leading-relaxed">
              <li>നിങ്ങളുടെ Google Sheet തുറക്കുക.</li>
              <li>മുകളിലെ മെനുവിൽ നിന്നും <strong>Extensions &gt; Apps Script</strong> ക്ലിക്ക് ചെയ്യുക.</li>
              <li>താഴെയുള്ള കോഡ് <strong>കോപ്പി ചെയ്ത്</strong> അവിടെയുള്ള പഴയ കോഡ് മുഴുവൻ മാറ്റി പേസ്റ്റ് ചെയ്യുക (Ctrl+A &gt; Ctrl+V).</li>
              <li>സേവ് (Save) ഐക്കൺ ക്ലിക്ക് ചെയ്യുക.</li>
              <li>മുകളിൽ വലതുവശത്തെ <strong>Deploy &gt; New deployment</strong> ക്ലിക്ക് ചെയ്യുക.</li>
              <li>ഗിയർ ഐക്കൺ ക്ലിക്ക് ചെയ്ത് <strong>Web app</strong> തിരഞ്ഞെടുക്കുക.</li>
              <li><strong>Execute as</strong>: <code>Me</code>, <strong>Who has access</strong>: <code>Anyone</code> എന്ന് നൽകി <strong>Deploy</strong> ചെയ്യുക.</li>
              <li>ലഭിക്കുന്ന <strong>Web App URL</strong> കോപ്പി ചെയ്ത് ഈ ആപ്പിലെ Settings-ൽ നൽകുക.</li>
            </ol>
          </div>

          {/* Code Block Container */}
          <div className="relative">
            <div className="flex items-center justify-between bg-slate-800 text-slate-200 px-4 py-2 rounded-t-xl font-mono text-xs">
              <span>Code.gs</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg font-sans font-semibold text-xs transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>കോപ്പി ചെയ്തു! (Copied)</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>കോഡ് കോപ്പി ചെയ്യുക</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-900 text-emerald-300 font-mono text-xs p-4 rounded-b-xl overflow-x-auto max-h-64 select-all leading-relaxed">
              <code>{GOOGLE_APPS_SCRIPT_CODE}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
          >
            ശരി (Close)
          </button>
        </div>
      </div>
    </div>
  );
}
