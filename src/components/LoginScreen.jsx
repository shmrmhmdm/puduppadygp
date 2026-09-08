import React, { useState } from 'react';
import { 
  Building2, 
  Phone, 
  LogIn, 
  AlertCircle, 
  Loader2,
  Lock
} from 'lucide-react';
import { fetchBeneficiaries } from '../services/api';

export default function LoginScreen({ 
  users = [], 
  onLoginSuccess 
}) {
  const [mobileInput, setMobileInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) {
      setMobileInput(val);
      if (errorMsg) setErrorMsg('');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanMobile = mobileInput.trim();

    if (!cleanMobile) {
      setErrorMsg('ദയവായി നിങ്ങളുടെ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.');
      return;
    }

    if (cleanMobile.length !== 10) {
      setErrorMsg('10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // 1. Check local/passed users list first
      let currentUsers = users;
      let foundUser = currentUsers.find((u) => {
        const uClean = String(u.mobile || '').replace(/\D/g, '');
        return uClean === cleanMobile;
      });

      // 2. If not found in cache or list is empty, fetch fresh from Google Sheet live
      if (!foundUser) {
        const freshRes = await fetchBeneficiaries(true);
        if (freshRes && freshRes.users && freshRes.users.length > 0) {
          currentUsers = freshRes.users;
          foundUser = currentUsers.find((u) => {
            const uClean = String(u.mobile || '').replace(/\D/g, '');
            return uClean === cleanMobile;
          });
        }
      }

      if (foundUser) {
        onLoginSuccess(foundUser);
      } else {
        if (currentUsers.length === 0) {
          setErrorMsg(
            'Google Sheet-ലെ "Users" ഷീറ്റിൽ വിവരങ്ങൾ ലഭ്യമായിട്ടില്ല. ദയവായി Google Sheet-ൽ നിങ്ങളുടെ മൊബൈൽ നമ്പർ ചേർക്കുക.'
          );
        } else {
          setErrorMsg(
            `"${cleanMobile}" എന്ന മൊബൈൽ നമ്പർ Google Sheet-ൽ രജിസ്റ്റർ ചെയ്തിട്ടില്ല! ദയവായി പരിശോധിക്കുക.`
          );
        }
      }
    } catch (err) {
      setErrorMsg('ലോഗിൻ പരിശോധിക്കുന്നതിൽ തടസ്സം നേരിട്ടു: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 text-slate-800 font-sans selection:bg-emerald-600 selection:text-white">
      {/* Panchayat Header */}
      <div className="text-center mb-6 space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-emerald-700 mx-auto flex items-center justify-center text-white shadow-md border border-emerald-600/30">
          <Building2 className="w-9 h-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800">
          പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത്
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-emerald-800">
          സാമൂഹ്യ സുരക്ഷാ പെൻഷൻ പോർട്ടൽ
        </p>
      </div>

      {/* Login Box with Eye-Friendly Calm Colors */}
      <div className="w-full max-w-sm bg-white text-slate-800 rounded-3xl shadow-xl shadow-slate-200/60 p-6 sm:p-8 border border-slate-200/90">
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-black text-slate-800">
            ലോഗിൻ
          </h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              മൊബൈൽ നമ്പർ:
            </label>

            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-500 font-bold text-sm border-r border-slate-200 pr-2">
                <Phone className="w-4 h-4 text-emerald-700" />
                <span>+91</span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={mobileInput}
                onChange={handleInputChange}
                placeholder="98XXXXXXXX"
                className={`w-full pl-18 pr-4 py-3 bg-slate-50 border rounded-xl text-base font-black text-slate-800 tracking-wider placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all ${
                  errorMsg ? 'border-rose-300 bg-rose-50/50' : 'border-slate-300'
                }`}
                autoFocus
              />
            </div>

            {errorMsg && (
              <div className="flex items-start gap-1.5 text-xs text-rose-700 font-semibold mt-2 leading-relaxed bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Login Button with Soft Eye-Friendly Emerald */}
          <button
            type="submit"
            disabled={isLoading || mobileInput.length !== 10}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-black text-sm rounded-xl shadow-md shadow-emerald-900/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>പരിശോധിക്കുന്നു...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>ലോഗിൻ ചെയ്യുക</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 text-center space-y-1">
        <p className="text-xs text-slate-500 font-medium">
          പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത് • കേരള തദ്ദേശ സ്വയംഭരണ വകുപ്പ്
        </p>
        <p className="text-[11px] text-slate-500 font-bold tracking-wider uppercase">
          DEVELOPED BY SHAMEER TECHNICAL ASSISTANT
        </p>
      </div>
    </div>
  );
}
