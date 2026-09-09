import React, { useState, useMemo } from 'react';
import BeneficiaryCard from './BeneficiaryCard';
import { PENSION_SCHEMES } from '../services/mockData';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  X, 
  ListFilter
} from 'lucide-react';

export default function BeneficiaryList({ 
  beneficiaries, 
  selectedWard, 
  onSaveMobile,
  isReadOnly = false
}) {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScheme, setSelectedScheme] = useState('all');
  const [pageSize, setPageSize] = useState(25); // Smooth chunking for ~2000 records

  // Filter by selected ward first
  const wardBeneficiaries = useMemo(() => {
    if (selectedWard === 'all') {
      return beneficiaries;
    }
    return beneficiaries.filter((b) => b.ward === Number(selectedWard));
  }, [beneficiaries, selectedWard]);

  // Tab counts
  const pendingList = useMemo(() => {
    return wardBeneficiaries.filter((b) => b.status === 'pending' || !b.mobile_no);
  }, [wardBeneficiaries]);

  const completedList = useMemo(() => {
    return wardBeneficiaries.filter((b) => b.status === 'completed' && b.mobile_no);
  }, [wardBeneficiaries]);

  // Active list based on tab
  const activeList = activeTab === 'pending' ? pendingList : completedList;

  // Dynamic distinct schemes from Google Sheet 'Scheme Name' column
  const availableSchemes = useMemo(() => {
    const schemeMap = new Map();
    beneficiaries.forEach((b) => {
      const sName = (b.scheme_ml || b.scheme_name || b.scheme_en || '').trim();
      if (sName) {
        if (!schemeMap.has(sName)) {
          schemeMap.set(sName, {
            name: sName,
            code: b.scheme_code || sName
          });
        }
      }
    });

    const dynamicList = Array.from(schemeMap.values());
    if (dynamicList.length > 0) {
      return dynamicList;
    }
    return PENSION_SCHEMES.map(s => ({ name: s.short_ml || s.name_ml, code: s.id }));
  }, [beneficiaries]);

  // Search and Scheme Filtering
  const filteredList = useMemo(() => {
    return activeList.filter((item) => {
      // Dynamic Scheme filter based on Sheet's Scheme Name or code
      if (selectedScheme !== 'all') {
        const itemSchemeName = (item.scheme_ml || item.scheme_name || '').trim().toLowerCase();
        const itemSchemeCode = (item.scheme_code || '').trim().toLowerCase();
        const target = selectedScheme.trim().toLowerCase();
        if (itemSchemeName !== target && itemSchemeCode !== target) {
          return false;
        }
      }

      // Search query filter
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase().trim();
      const matchNameMl = item.name_ml && item.name_ml.toLowerCase().includes(query);
      const matchNameEn = item.name_en && item.name_en.toLowerCase().includes(query);
      const matchId = item.beneficiary_id && item.beneficiary_id.toLowerCase().includes(query);
      const matchHouse = item.house_name && item.house_name.toLowerCase().includes(query);
      const matchMobile = item.mobile_no && item.mobile_no.includes(query);

      return matchNameMl || matchNameEn || matchId || matchHouse || matchMobile;
    });
  }, [activeList, selectedScheme, searchQuery]);

  // Paginated visible slice for peak performance
  const visibleList = useMemo(() => {
    return filteredList.slice(0, pageSize);
  }, [filteredList, pageSize]);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Dual Tab Interface */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-1 flex gap-1 sticky top-[72px] sm:top-[76px] z-30 backdrop-blur-md bg-white/95">
        {/* Tab 1: Pending */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('pending');
            setPageSize(25);
          }}
          className={`flex-1 py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">നമ്പർ ചേർക്കാനുള്ളവർ</span>
          <span className={`px-1.5 sm:px-2 py-0.2 rounded-full text-[10px] sm:text-xs font-black shrink-0 ${
            activeTab === 'pending'
              ? 'bg-slate-950 text-amber-300'
              : 'bg-amber-100 text-amber-900'
          }`}>
            {pendingList.length}
          </span>
        </button>

        {/* Tab 2: Completed */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('completed');
            setPageSize(25);
          }}
          className={`flex-1 py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-emerald-700 text-white shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">പൂർത്തിയായവർ</span>
          <span className={`px-1.5 sm:px-2 py-0.2 rounded-full text-[11px] sm:text-xs font-black shrink-0 ${
            activeTab === 'completed'
              ? 'bg-emerald-900 text-emerald-100'
              : 'bg-emerald-100 text-emerald-900'
          }`}>
            {completedList.length}
          </span>
        </button>
      </div>

      {/* Search & Scheme Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-3 sm:p-4 space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="പേര്, ഐ.ഡി, വീട്ടുപേര് തിരയുക..."
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-800 placeholder-slate-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Scheme Filter Select */}
          <div className="sm:w-60 shrink-0">
            <div className="relative">
              <ListFilter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={selectedScheme}
                onChange={(e) => setSelectedScheme(e.target.value)}
                className="w-full pl-9 pr-7 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-800 appearance-none transition-all cursor-pointer"
              >
                <option value="all">എല്ലാ പെൻഷനുകളും (All Schemes)</option>
                {availableSchemes.map((scheme) => (
                  <option key={scheme.name} value={scheme.name}>
                    {scheme.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Search Results Summary */}
        {(searchQuery || selectedScheme !== 'all') && (
          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-lg">
            <span>
              കണ്ടെത്തിയത്: <strong>{filteredList.length}</strong> എണ്ണം
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedScheme('all');
              }}
              className="text-emerald-700 hover:underline font-bold"
            >
              ഫിൽട്ടർ ഒഴിവാക്കുക
            </button>
          </div>
        )}
      </div>

      {/* Beneficiary Cards List */}
      {visibleList.length > 0 ? (
        <div className="space-y-3">
          {isReadOnly && (
            <div className="bg-cyan-50 border border-cyan-200 text-cyan-900 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-between">
              <span>👀 നിരീക്ഷകൻ (Viewer) മോഡ്: വിവരങ്ങൾ പരിശോധിക്കാൻ മാത്രമുള്ള അനുമതി (Read Only).</span>
            </div>
          )}
          {visibleList.map((beneficiary) => (
            <BeneficiaryCard
              key={beneficiary.beneficiary_id}
              beneficiary={beneficiary}
              activeTab={activeTab}
              onSaveMobile={onSaveMobile}
              showWard={selectedWard === 'all'}
              isReadOnly={isReadOnly}
            />
          ))}

          {/* Pagination / Load More Button */}
          {visibleList.length < filteredList.length && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setPageSize((prev) => prev + 25)}
                className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 text-emerald-800 font-bold border border-emerald-300 rounded-xl shadow-2xs transition-all cursor-pointer text-xs sm:text-sm"
              >
                കൂടുതൽ ഗുണഭോക്താക്കളെ കാണുക ({visibleList.length} / {filteredList.length})
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            {activeTab === 'pending' ? <CheckCircle2 className="w-7 h-7 text-emerald-600" /> : <Clock className="w-7 h-7 text-amber-500" />}
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            {activeTab === 'pending' 
              ? 'നമ്പർ ചേർക്കാനുള്ളവർ ആരുമില്ല!' 
              : 'പൂർത്തിയായ രേഖകൾ കണ്ടെത്തിയില്ല'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'pending'
              ? 'ഈ വാർഡിലെ എല്ലാ ഗുണഭോക്താക്കളുടെയും മൊബൈൽ നമ്പറുകൾ പൂർത്തിയായിരിക്കുന്നു.'
              : 'മൊബൈൽ നമ്പറുകൾ രേഖപ്പെടുത്തി സേവ് ചെയ്യുമ്പോൾ അവ ഇവിടെ ദൃശ്യമാകും.'}
          </p>
        </div>
      )}
    </div>
  );
}
