import React, { useState, useMemo } from 'react';
import { 
  ClipboardCopy, 
  Check, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Search, 
  Filter, 
  UserCheck, 
  Building2, 
  Sparkles, 
  Phone, 
  ExternalLink,
  Layers,
  ArrowRightLeft,
  X,
  RotateCw,
  FileCheck
} from 'lucide-react';
import { PENSION_SCHEMES, WARDS_LIST } from '../services/mockData';

export default function EmployeeSevanaQueue({ 
  beneficiaries = [], 
  onUpdateSevanaStatus, 
  currentUser 
}) {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'synced' | 'all'
  const [selectedWard, setSelectedWard] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScheme, setSelectedScheme] = useState('all');
  const [copiedKey, setCopiedKey] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter beneficiaries who have a mobile number (status === 'completed' or mobile_no exists)
  const completedBeneficiaries = useMemo(() => {
    return beneficiaries.filter((b) => b.mobile_no && b.mobile_no.trim().length === 10);
  }, [beneficiaries]);

  // Tab counts
  const pendingSevanaList = useMemo(() => {
    return completedBeneficiaries.filter((b) => b.sevana_status !== 'synced');
  }, [completedBeneficiaries]);

  const syncedSevanaList = useMemo(() => {
    return completedBeneficiaries.filter((b) => b.sevana_status === 'synced');
  }, [completedBeneficiaries]);

  // Filter based on active tab, ward, scheme, and search
  const filteredList = useMemo(() => {
    let list = activeTab === 'pending' 
      ? pendingSevanaList 
      : activeTab === 'synced' 
      ? syncedSevanaList 
      : completedBeneficiaries;

    if (selectedWard !== 'all') {
      list = list.filter((b) => b.ward === Number(selectedWard));
    }

    if (selectedScheme !== 'all') {
      list = list.filter((b) => b.scheme_code === selectedScheme);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((b) => {
        return (
          (b.beneficiary_id && b.beneficiary_id.toLowerCase().includes(q)) ||
          (b.name_ml && b.name_ml.toLowerCase().includes(q)) ||
          (b.mobile_no && b.mobile_no.includes(q)) ||
          (b.house_name && b.house_name.toLowerCase().includes(q))
        );
      });
    }

    return list;
  }, [activeTab, pendingSevanaList, syncedSevanaList, completedBeneficiaries, selectedWard, selectedScheme, searchQuery]);

  // Copy helper
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 1500);
  };

  // Mark single as synced / pending
  const handleToggleSync = async (beneficiaryId, currentStatus) => {
    const newStatus = currentStatus === 'synced' ? 'pending' : 'synced';
    setIsUpdating(true);
    try {
      await onUpdateSevanaStatus([beneficiaryId], newStatus, currentUser?.name || 'സേവന ക്ലർക്ക്');
    } finally {
      setIsUpdating(false);
    }
  };

  // Batch mark as synced
  const handleBatchMarkSynced = async () => {
    if (selectedIds.length === 0) return;
    setIsUpdating(true);
    try {
      await onUpdateSevanaStatus(selectedIds, 'synced', currentUser?.name || 'സേവന ക്ലർക്ക്');
      setSelectedIds([]);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredList.map((b) => b.beneficiary_id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* Top Banner for Employee */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-4 sm:p-6 shadow-xl border border-indigo-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shrink-0 mt-0.5">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-[11px] font-bold mb-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>സേവന പെൻഷൻ സോഫ്റ്റ്‌വെയർ അപ്ഡേഷൻ ഡാഷ്‌ബോർഡ്</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                സേവന അപ്ഡേഷൻ ക്യൂ (Sevana Queue)
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                വാർഡ് മെമ്പർമാർ ശേഖരിച്ച മൊബൈൽ നമ്പറുകൾ ഇവിടെ നിന്നും 1-ക്ലിക്കിൽ കോപ്പി ചെയ്ത് ഔദ്യോഗിക <strong>Sevana Pension Portal</strong>-ലേക്ക് എളുപ്പത്തിൽ ചേർക്കാം.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 sm:gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-700 shrink-0">
            <div className="text-center px-2">
              <span className="text-[10px] text-amber-300 font-bold block">നൽകാനുള്ളവ</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 leading-none">
                {pendingSevanaList.length}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-center px-2">
              <span className="text-[10px] text-emerald-300 font-bold block">ചേർത്തവ</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 leading-none">
                {syncedSevanaList.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-1.5 flex gap-1.5">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-1 ring-amber-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4 text-slate-950" />
          <span>സേവനയിൽ നൽകാനുള്ളവ (Pending)</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-black bg-slate-950 text-amber-300">
            {pendingSevanaList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('synced')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'synced'
              ? 'bg-emerald-600 text-white shadow-md font-black ring-1 ring-emerald-700/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>സേവനയിൽ ചേർത്തവ (Synced)</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-800 text-emerald-100">
            {syncedSevanaList.length}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-3 sm:p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Search Box */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ഐ.ഡി, പേര്, മൊബൈൽ തിരയുക..."
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Ward Selector */}
          <div>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            >
              <option value="all">എല്ലാ വാർഡുകളും (All Wards)</option>
              {WARDS_LIST.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name_ml} ({w.name_en})
                </option>
              ))}
            </select>
          </div>

          {/* Scheme Selector */}
          <div>
            <select
              value={selectedScheme}
              onChange={(e) => setSelectedScheme(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            >
              {PENSION_SCHEMES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.short_ml || s.name_ml}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Batch Actions Bar if selected */}
        {selectedIds.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 animate-in fade-in">
            <span className="text-xs font-bold text-indigo-900">
              <strong>{selectedIds.length}</strong> ഗുണഭോക്താക്കളെ തിരഞ്ഞെടുത്തു
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBatchMarkSynced}
                disabled={isUpdating}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>സേവനയിൽ അപ്ഡേറ്റ് ചെയ്തു എന്ന് മാർക്ക് ചെയ്യുക</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-2 bg-white text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold border border-slate-200"
              >
                ക്ലിയർ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Queue Beneficiary Cards */}
      {filteredList.length > 0 ? (
        <div className="space-y-3">
          {/* Select All Checkbox Header */}
          <div className="flex items-center justify-between px-2 text-xs text-slate-600 font-semibold">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selectedIds.length === filteredList.length && filteredList.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span>എല്ലാം തിരഞ്ഞെടുക്കുക (Select All)</span>
            </label>
            <span>കണ്ടെത്തിയത്: {filteredList.length} എണ്ണം</span>
          </div>

          {filteredList.map((beneficiary) => {
            const isSynced = beneficiary.sevana_status === 'synced';
            const isSelected = selectedIds.includes(beneficiary.beneficiary_id);

            return (
              <div
                key={beneficiary.beneficiary_id}
                className={`bg-white rounded-2xl shadow-sm border p-4 transition-all ${
                  isSynced
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : 'border-slate-200 hover:border-indigo-400 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Info with Checkbox */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOne(beneficiary.beneficiary_id)}
                      className="w-4 h-4 mt-1 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                    />

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base text-slate-900">
                          {beneficiary.name_ml}
                        </span>
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold border border-slate-200">
                          വാർഡ് {beneficiary.ward}
                        </span>
                        <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                          {beneficiary.scheme_ml}
                        </span>
                      </div>

                      {beneficiary.house_name && (
                        <p className="text-xs text-slate-500 font-medium">
                          {beneficiary.house_name}
                        </p>
                      )}

                      {beneficiary.updated_by && (
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>നമ്പർ എടുത്തത്: <strong>{beneficiary.updated_by}</strong></span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Center Copy Badges */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 shrink-0">
                    {/* Copy Beneficiary ID */}
                    <button
                      type="button"
                      onClick={() => handleCopy(beneficiary.beneficiary_id, `id-${beneficiary.beneficiary_id}`)}
                      title="പെൻഷൻ ഐ.ഡി കോപ്പി ചെയ്യുക"
                      className="flex-1 sm:flex-initial px-3 py-2 sm:py-1.5 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                    >
                      {copiedKey === `id-${beneficiary.beneficiary_id}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">ID കോപ്പി ചെയ്തു!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>ID: {beneficiary.beneficiary_id}</span>
                        </>
                      )}
                    </button>

                    {/* Copy Mobile Number */}
                    <button
                      type="button"
                      onClick={() => handleCopy(beneficiary.mobile_no, `mob-${beneficiary.beneficiary_id}`)}
                      title="മൊബൈൽ നമ്പർ കോപ്പി ചെയ്യുക"
                      className="flex-1 sm:flex-initial px-3 py-2 sm:py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      {copiedKey === `mob-${beneficiary.beneficiary_id}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>നമ്പർ കോപ്പി ചെയ്തു!</span>
                        </>
                      ) : (
                        <>
                          <Phone className="w-3.5 h-3.5" />
                          <span>+91 {beneficiary.mobile_no}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right Status / Action */}
                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleSync(beneficiary.beneficiary_id, beneficiary.sevana_status)}
                      disabled={isUpdating}
                      className={`w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                        isSynced
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-900/20'
                      }`}
                    >
                      {isSynced ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>സേവനയിൽ ചേർത്തു (Synced)</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4" />
                          <span>സേവനയിൽ അപ്ഡേറ്റ് ചെയ്തു</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
            {activeTab === 'pending'
              ? 'സേവനയിൽ നൽകാൻ ബാക്കിയുള്ളവർ ആരുമില്ല!'
              : 'രേഖകൾ കണ്ടെത്തിയില്ല'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            {activeTab === 'pending'
              ? 'വാർഡ് മെമ്പർമാർ പുതിയ മൊബൈൽ നമ്പറുകൾ രേഖപ്പെടുത്തുമ്പോൾ അവ തനിയെ ഈ ക്യൂവിൽ ലഭ്യമാകും.'
              : 'ഫിൽട്ടർ മാറ്റി പരിശോധിക്കുക.'}
          </p>
        </div>
      )}
    </div>
  );
}
