import React, { useState, useRef, useEffect } from 'react';
import { WARDS_LIST } from '../services/mockData';
import { MapPin, ChevronDown, UserCheck, Search, X } from 'lucide-react';

export default function WardSelector({ selectedWard, onSelectWard, wardStats }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const currentWardInfo = WARDS_LIST.find((w) => w.id === selectedWard) || {
    id: selectedWard,
    name_ml: selectedWard === 'all' ? 'എല്ലാ വാർഡുകളും (All Wards)' : `വാർഡ് ${selectedWard}`,
    name_en: selectedWard === 'all' ? 'All Wards' : `Ward ${selectedWard}`,
    member_ml: 'ഗ്രാമപഞ്ചായത്ത് സമിതി',
    member_en: 'Grama Panchayat Committee',
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredWards = WARDS_LIST.filter((ward) => {
    const term = searchTerm.toLowerCase();
    return (
      ward.name_ml.toLowerCase().includes(term) ||
      ward.name_en.toLowerCase().includes(term) ||
      ward.member_ml.toLowerCase().includes(term) ||
      ward.id.toString().includes(term)
    );
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Ward Selector Button */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-3 sm:p-4 transition-all hover:border-emerald-500/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>വാർഡ് തിരഞ്ഞെടുക്കുക | Select Ward</span>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full text-left flex items-center justify-between gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-900 font-bold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <div className="truncate">
                <span className="text-base sm:text-lg text-slate-900 block truncate">
                  {currentWardInfo.name_ml}
                </span>
                <span className="text-xs font-normal text-slate-500 block truncate">
                  {currentWardInfo.name_en}
                </span>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
            </button>
          </div>

          {/* Elected Ward Member Badge */}
          {currentWardInfo.member_ml && (
            <div className="sm:border-l sm:border-slate-200 sm:pl-4 flex items-center gap-2.5 bg-emerald-50/60 p-2 sm:p-2.5 rounded-xl border border-emerald-100 shrink-0">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="text-[11px] font-medium text-emerald-800 block">വാർഡ് മെമ്പർ (Ward Member)</span>
                <span className="font-bold text-slate-800 block">{currentWardInfo.member_ml}</span>
                <span className="text-[10px] text-slate-500 block">{currentWardInfo.member_en}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[380px] flex flex-col">
          {/* Quick Search Header */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/80 sticky top-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="വാർഡ് പേരോ നമ്പറോ തിരയുക (Search ward)..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 placeholder-slate-400"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Ward List Options */}
          <div className="overflow-y-auto p-2 space-y-1 divide-y divide-slate-50 flex-1">
            {/* All Wards Option */}
            <button
              onClick={() => {
                onSelectWard('all');
                setIsOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-between ${
                selectedWard === 'all'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'hover:bg-slate-100 text-slate-800'
              }`}
            >
              <div>
                <span className="block font-medium">എല്ലാ വാർഡുകളും ഒന്നിച്ചു കാണുക</span>
                <span className={`block text-xs ${selectedWard === 'all' ? 'text-emerald-100' : 'text-slate-500'}`}>
                  View All Wards (Consolidated)
                </span>
              </div>
            </button>

            {filteredWards.map((ward) => {
              const isSelected = selectedWard === ward.id;
              return (
                <button
                  key={ward.id}
                  onClick={() => {
                    onSelectWard(ward.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                      : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div>
                    <span className="block font-medium">{ward.name_ml}</span>
                    <span className={`block text-xs ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {ward.name_en} • മെമ്പർ: {ward.member_ml}
                    </span>
                  </div>
                  {ward.id <= 3 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      isSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-700'
                    }`}>
                      ഡാറ്റ ലഭ്യമാണ്
                    </span>
                  )}
                </button>
              );
            })}

            {filteredWards.length === 0 && (
              <div className="p-4 text-center text-sm text-slate-500">
                വാർഡുകൾ കണ്ടെത്താനായില്ല (No wards found)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
