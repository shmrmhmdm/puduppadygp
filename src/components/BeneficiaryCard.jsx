import React, { useState } from 'react';
import { 
  Phone, 
  Save, 
  CheckCircle2, 
  Edit3, 
  User, 
  Home, 
  Loader2, 
  AlertCircle, 
  PhoneCall, 
  X,
  UserCheck,
  Clock
} from 'lucide-react';
import { PENSION_SCHEMES } from '../services/mockData';

export default function BeneficiaryCard({ 
  beneficiary, 
  activeTab, 
  onSaveMobile, 
  showWard = false,
  isReadOnly = false
}) {
  const [mobileInput, setMobileInput] = useState(beneficiary.mobile_no || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Find Scheme details
  const scheme = PENSION_SCHEMES.find((s) => s.id === beneficiary.scheme_code) || {
    name_ml: beneficiary.scheme_ml || 'സാമൂഹ്യ സുരക്ഷാ പെൻഷൻ',
    name_en: beneficiary.scheme_en || 'Pension Scheme',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  const validateMobile = (number) => {
    const cleaned = number.trim();
    if (!cleaned) {
      return 'മൊബൈൽ നമ്പർ നൽകുക (Please enter mobile number)';
    }
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      return '6, 7, 8, 9 എന്നിവയിൽ ആരംഭിക്കുന്ന 10 അക്ക നമ്പർ നൽകുക';
    }
    return '';
  };

  const handleInputChange = (e) => {
    const val = e.target.value.replace(/\D/g, ''); // Numeric only
    if (val.length <= 10) {
      setMobileInput(val);
      if (errorMsg) setErrorMsg('');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const error = validateMobile(mobileInput);
    if (error) {
      setErrorMsg(error);
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      await onSaveMobile(beneficiary.beneficiary_id, mobileInput);
      setIsEditing(false);
    } catch (err) {
      setErrorMsg('സേവ് ചെയ്യാൻ സാധിച്ചില്ല. വീണ്ടും ശ്രമിക്കുക');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setMobileInput(beneficiary.mobile_no || '');
    setIsEditing(false);
    setErrorMsg('');
  };

  const isPending = activeTab === 'pending' || (!beneficiary.mobile_no && !isEditing);

  return (
    <div className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 overflow-hidden ${
      isPending 
        ? 'border-slate-200/90 hover:border-emerald-600' 
        : 'border-emerald-200/90 bg-gradient-to-b from-white to-emerald-50/20'
    }`}>
      {/* Top Scheme Badge & Beneficiary ID Bar */}
      <div className="px-3.5 sm:px-4 py-2 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between gap-2 text-xs">
        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] sm:text-[11px] border truncate max-w-[200px] ${scheme.color || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
          {beneficiary.scheme_ml || scheme.name_ml}
        </span>

        <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
          <span className="text-slate-400">ID:</span>
          <span>{beneficiary.beneficiary_id}</span>
        </div>
      </div>

      {/* Main Beneficiary Info */}
      <div className="p-3.5 sm:p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {beneficiary.name_ml}
            </h3>
            {beneficiary.name_en && (
              <p className="text-xs text-slate-500 font-medium truncate">
                {beneficiary.name_en}
              </p>
            )}
          </div>

          <div className="shrink-0 text-right">
            <span className="inline-block bg-slate-100 text-slate-700 text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-md border border-slate-200">
              {beneficiary.gender === 'M' ? 'പുരുഷൻ' : beneficiary.gender === 'F' ? 'സ്ത്രീ' : ''}{' '}
              {beneficiary.age ? `• ${beneficiary.age} വയസ്സ്` : ''}
            </span>
          </div>
        </div>

        {/* House Name & Address Full View */}
        {(beneficiary.house_name || showWard) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-slate-700 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80">
            {beneficiary.house_name && (
              <div className="flex items-start gap-1.5 font-medium text-slate-800 leading-snug">
                <Home className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span className="break-words select-text">
                  {beneficiary.house_name}
                </span>
              </div>
            )}
            {showWard && (
              <div className="shrink-0 self-start sm:self-auto">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-200">
                  വാർഡ് {beneficiary.ward}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Area */}
        {isReadOnly ? (
          /* Read Only Mode for Viewer Role */
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2">
            {isPending ? (
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>മൊബൈൽ നമ്പർ ശേഖരിക്കാൻ ബാക്കിയുണ്ട് (Pending)</span>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      രേഖപ്പെടുത്തിയ നമ്പർ
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 font-mono block">
                      +91 {beneficiary.mobile_no}
                    </span>
                  </div>
                </div>

                <a
                  href={`tel:${beneficiary.mobile_no}`}
                  title="വിളിക്കുക"
                  className="py-1.5 px-3 text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs shrink-0"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>വിളിക്കുക</span>
                </a>
              </div>
            )}
          </div>
        ) : isPending || isEditing ? (
          /* Mobile Input Form */
          <form onSubmit={handleSave} className="space-y-2 pt-1">
            <label className="block text-xs font-bold text-slate-700">
              10 അക്ക മൊബൈൽ നമ്പർ നൽകുക:
            </label>

            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-500 font-bold text-sm border-r border-slate-200 pr-2">
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
                  className={`w-full pl-16 pr-3 py-3 bg-slate-50 border rounded-xl text-base font-black text-slate-900 tracking-wider placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all ${
                    errorMsg ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                  disabled={isSaving}
                  autoFocus={isEditing}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSaving || mobileInput.length !== 10}
                  className="flex-1 sm:flex-initial px-5 py-3 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-sm font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>സേവ് ചെയ്യുന്നു...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>സേവ് ചെയ്യുക</span>
                    </>
                  )}
                </button>

                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1 text-xs text-rose-700 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </form>
        ) : (
          /* Completed View */
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">
                  രേഖപ്പെടുത്തിയ നമ്പർ
                </span>
                <span className="text-base font-extrabold text-slate-900 tracking-wide font-mono block">
                  +91 {beneficiary.mobile_no}
                </span>
                {beneficiary.updated_by && (
                  <span className="text-[10px] text-emerald-900 flex items-center gap-1 mt-0.5 truncate font-medium">
                    <UserCheck className="w-3 h-3 text-emerald-700 shrink-0" />
                    <span className="truncate">അപ്ഡേറ്റ് ചെയ്തത്: <strong>{beneficiary.updated_by}</strong></span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-emerald-200/60">
              <a
                href={`tel:${beneficiary.mobile_no}`}
                title="വിളിക്കുക"
                className="flex-1 sm:flex-initial py-2 px-3 text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>വിളിക്കുക</span>
              </a>

              <button
                type="button"
                onClick={() => setIsEditing(true)}
                title="തിരുത്തുക"
                className="flex-1 sm:flex-initial py-2 px-3 text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>തിരുത്തുക</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
