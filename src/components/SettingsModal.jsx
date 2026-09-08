import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Database, 
  Save, 
  Trash2, 
  ShieldCheck, 
  Link2, 
  CheckCircle2, 
  Wand2, 
  Loader2 
} from 'lucide-react';
import { triggerAutoSetupHeaders } from '../services/api';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  config, 
  onSaveConfig, 
  onClearCache,
  onOpenScriptModal,
  onNotify
}) {
  const [scriptUrl, setScriptUrl] = useState(config.scriptUrl || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSettingUpHeaders, setIsSettingUpHeaders] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveConfig({
      scriptUrl: scriptUrl.trim(),
      isLiveApi: true,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleAutoSetupHeaders = async () => {
    if (!scriptUrl.trim()) {
      alert('ദയവായി ആദ്യം Google Apps Script Web App URL നൽകുക.');
      return;
    }

    setIsSettingUpHeaders(true);
    try {
      // Save URL first if changed
      onSaveConfig({ scriptUrl: scriptUrl.trim(), isLiveApi: true });
      const res = await triggerAutoSetupHeaders();
      if (res && res.success) {
        if (onNotify) {
          onNotify({
            type: 'success',
            title_ml: 'കോളങ്ങൾ ഓട്ടോമാറ്റിക്കായി സെറ്റ് ചെയ്തു!',
            title_en: 'Google Sheet headers created successfully',
          });
        }
        alert('✨ വിജയകരം! നിങ്ങളുടെ Google Sheet-ൽ ആവശ്യമായ എല്ലാ കോളങ്ങളും ഓട്ടോമാറ്റിക്കായി ക്രമീകരിച്ചു.');
      } else {
        throw new Error(res.error || 'Failed to setup headers');
      }
    } catch (err) {
      alert('കോളങ്ങൾ സെറ്റ് ചെയ്യുന്നതിൽ തടസ്സം നേരിട്ടു: ' + err.message + '\n\nApps Script കോഡ് കൃത്യമായി പേസ്റ്റ് ചെയ്ത് Deploy ചെയ്തതാണെന്ന് ഉറപ്പുവരുത്തുക.');
    } finally {
      setIsSettingUpHeaders(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                Google Sheet കണക്ഷൻ (Sheet Settings)
              </h3>
              <p className="text-xs text-slate-400">Google Apps Script Web App URL & Auto Setup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* URL Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 block">
                Google Apps Script Web App URL:
              </label>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenScriptModal) onOpenScriptModal();
                }}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
              >
                കോഡ് കാണുക (View Code.gs)
              </button>
            </div>

            <div className="relative">
              <Link2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                value={scriptUrl}
                onChange={(e) => setScriptUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                autoFocus
              />
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Google Sheet-ലെ Apps Script Deploy ചെയ്തു ലഭിച്ച Web App URL ഇവിടെ നൽകി സേവ് ചെയ്യുക.
            </p>
          </div>

          {/* 1-Click Auto Setup Headers Action Button */}
          {scriptUrl.trim() && (
            <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-950 block">
                    ഓട്ടോമാറ്റിക് കോളം നിർമ്മാണം (1-Click Header Setup)
                  </span>
                  <span className="text-[10px] text-emerald-800/90 block">
                    Google Sheet-ൽ ആവശ്യമായ എല്ലാ ഹെഡർ കോളങ്ങളും തനിയെ ഉണ്ടാക്കാൻ
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAutoSetupHeaders}
                disabled={isSettingUpHeaders}
                className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSettingUpHeaders ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>കോളങ്ങൾ ഉണ്ടാക്കുന്നു...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5 text-emerald-200" />
                    <span>ഷീറ്റിൽ കോളങ്ങൾ ഓട്ടോമാറ്റിക്കായി സെറ്റ് ചെയ്യുക</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Helper Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-700 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>ശ്രദ്ധിക്കുക:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              Apps Script Deploy ചെയ്യുമ്പോൾ <strong>"Who has access"</strong> എന്നത് <strong>"Anyone"</strong> എന്ന് നൽകുക.
            </p>
          </div>

          {/* Clear Cache */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-700 block">ലോക്കൽ കാഷെ ക്ലിയർ ചെയ്യുക</span>
              <span className="text-[10px] text-slate-500">ഫോണിൽ സൂക്ഷിച്ചിരിക്കുന്ന താൽക്കാലിക ഡാറ്റ ഒഴിവാക്കാൻ</span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('ഫോണിലെ താൽക്കാലിക കാഷെ ക്ലിയർ ചെയ്യണോ?')) {
                  onClearCache();
                  onClose();
                }
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cache</span>
            </button>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>കണക്ട് ചെയ്തു! (Connected)</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>കണക്ഷൻ സേവ് ചെയ്യുക (Connect Google Sheet)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
