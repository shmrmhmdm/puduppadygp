import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Users, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  TrendingUp, 
  Award, 
  Search, 
  Filter, 
  Building2, 
  Layers, 
  RefreshCw,
  UserCheck,
  Trophy,
  Medal,
  Sparkles,
  Calendar,
  Smartphone,
  UserX
} from 'lucide-react';

export default function AnalyticsDashboard({ 
  beneficiaries = [], 
  users = [], 
  onRefresh, 
  loading = false,
  currentUser = null
}) {
  const [selectedWardFilter, setSelectedWardFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('updated_by'); // 'updated_by' | 'wards' | 'schemes' | 'beneficiaries'

  // Filter beneficiaries by selected ward
  const filteredBeneficiaries = useMemo(() => {
    if (selectedWardFilter === 'all') {
      return beneficiaries;
    }
    return beneficiaries.filter((b) => b.ward === Number(selectedWardFilter));
  }, [beneficiaries, selectedWardFilter]);

  // Overall Statistics Calculations
  const stats = useMemo(() => {
    const total = filteredBeneficiaries.length;
    const deceased = filteredBeneficiaries.filter((b) => b.status === 'deceased').length;
    const completedMobile = filteredBeneficiaries.filter(
      (b) => b.status === 'completed' && b.mobile_no && b.status !== 'deceased'
    ).length;
    const pendingMobile = total - completedMobile - deceased >= 0 ? total - completedMobile - deceased : 0;
    const targetTotal = total - deceased > 0 ? total - deceased : 0;
    const mobilePercentage = targetTotal > 0 ? Math.round((completedMobile / targetTotal) * 100) : (total > 0 && deceased === total ? 100 : 0);

    const sevanaSynced = filteredBeneficiaries.filter(
      (b) => b.sevana_status === 'synced' && b.status !== 'deceased'
    ).length;
    const sevanaPending = completedMobile - sevanaSynced >= 0 ? completedMobile - sevanaSynced : 0;
    const sevanaPercentage = completedMobile > 0 ? Math.round((sevanaSynced / completedMobile) * 100) : 0;
    const sevanaTotalPercentage = targetTotal > 0 ? Math.round((sevanaSynced / targetTotal) * 100) : 0;

    return {
      total,
      deceased,
      completedMobile,
      pendingMobile,
      mobilePercentage,
      sevanaSynced,
      sevanaPending,
      sevanaPercentage,
      sevanaTotalPercentage
    };
  }, [filteredBeneficiaries]);

  // 1. "Updated By" Detailed Statistics (Who completed how many records)
  const updatedByData = useMemo(() => {
    const userMap = new Map();
    let totalUpdated = 0;

    filteredBeneficiaries.forEach((b) => {
      if (b.status === 'completed' && b.mobile_no) {
        totalUpdated += 1;
        const updaterRaw = (b.updated_by && b.updated_by.trim()) ? b.updated_by.trim() : 'നേരിട്ട് ചേർത്തത് (Direct / Other)';
        
        const current = userMap.get(updaterRaw) || {
          name: updaterRaw,
          completed: 0,
          wards: new Set(),
          latestTimestamp: null,
          sevanaSynced: 0,
        };

        current.completed += 1;
        if (b.ward) current.wards.add(b.ward);
        if (b.sevana_status === 'synced') current.sevanaSynced += 1;

        if (b.updated_at) {
          const t = new Date(b.updated_at).getTime();
          if (!current.latestTimestamp || (!isNaN(t) && t > current.latestTimestamp)) {
            current.latestTimestamp = t;
          }
        }

        userMap.set(updaterRaw, current);
      }
    });

    const list = Array.from(userMap.values()).map((u) => {
      const percent = totalUpdated > 0 ? Math.round((u.completed / totalUpdated) * 100) : 0;
      const totalPercent = stats.total > 0 ? Math.round((u.completed / stats.total) * 100) : 0;
      const wardArray = Array.from(u.wards).sort((a, b) => a - b);
      
      let formattedDate = 'ലഭ്യമല്ല';
      if (u.latestTimestamp) {
        try {
          formattedDate = new Date(u.latestTimestamp).toLocaleString('ml-IN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        } catch (e) {
          formattedDate = 'രേഖപ്പെടുത്തി';
        }
      }

      return {
        ...u,
        percent,
        totalPercent,
        wardCount: wardArray.length,
        wardsText: wardArray.length > 0 ? wardArray.join(', ') : 'All',
        latestDateText: formattedDate
      };
    });

    // Sort descending by highest completion count
    list.sort((a, b) => b.completed - a.completed);

    return {
      list,
      totalUpdated,
      uniqueContributorsCount: list.length
    };
  }, [filteredBeneficiaries, stats.total]);

  // 2. Ward-Wise Detailed Statistics (1 to 25)
  const wardStatsList = useMemo(() => {
    const list = [];
    const totalWards = 25;

    for (let w = 1; w <= totalWards; w++) {
      const wardItems = beneficiaries.filter((b) => b.ward === w);
      const total = wardItems.length;
      const deceased = wardItems.filter((b) => b.status === 'deceased').length;
      const completed = wardItems.filter((b) => b.status === 'completed' && b.mobile_no && b.status !== 'deceased').length;
      const pending = total - completed - deceased >= 0 ? total - completed - deceased : 0;
      const targetTotal = total - deceased > 0 ? total - deceased : 0;
      const percent = targetTotal > 0 ? Math.round((completed / targetTotal) * 100) : (total > 0 && deceased === total ? 100 : 0);
      const sevanaSynced = wardItems.filter((b) => b.sevana_status === 'synced' && b.status !== 'deceased').length;
      const sevanaPercent = targetTotal > 0 ? Math.round((sevanaSynced / targetTotal) * 100) : 0;

      // Find assigned ward member
      const member = users.find(
        (u) => String(u.ward) === String(w) && String(u.role).toLowerCase().includes('member')
      ) || users.find((u) => String(u.ward) === String(w));

      list.push({
        ward: w,
        total,
        completed,
        deceased,
        pending,
        percent,
        sevanaSynced,
        sevanaPercent,
        member: member ? member.name : 'നിശ്ചയിച്ചിട്ടില്ല',
        memberMobile: member ? member.mobile : ''
      });
    }

    return list;
  }, [beneficiaries, users]);

  // 3. Scheme-Wise Statistics
  const schemeStatsList = useMemo(() => {
    const schemeMap = new Map();

    filteredBeneficiaries.forEach((b) => {
      const schemeName = (b.scheme_ml || b.scheme_name || b.scheme_en || 'സാമൂഹ്യ സുരക്ഷാ പെൻഷൻ').trim();
      const current = schemeMap.get(schemeName) || {
        name: schemeName,
        code: b.scheme_code || '',
        total: 0,
        completed: 0,
        deceased: 0,
        pending: 0,
        sevanaSynced: 0
      };

      current.total += 1;
      if (b.status === 'deceased') {
        current.deceased += 1;
      } else if (b.status === 'completed' && b.mobile_no) {
        current.completed += 1;
      } else {
        current.pending += 1;
      }
      if (b.sevana_status === 'synced' && b.status !== 'deceased') {
        current.sevanaSynced += 1;
      }

      schemeMap.set(schemeName, current);
    });

    return Array.from(schemeMap.values()).map((s) => {
      const target = s.total - s.deceased > 0 ? s.total - s.deceased : 0;
      return {
        ...s,
        percent: target > 0 ? Math.round((s.completed / target) * 100) : (s.total > 0 && s.deceased === s.total ? 100 : 0),
        sevanaPercent: target > 0 ? Math.round((s.sevanaSynced / target) * 100) : 0
      };
    });
  }, [filteredBeneficiaries]);

  // 4. Read-only Search for beneficiaries
  const searchedBeneficiaries = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return filteredBeneficiaries.filter((b) => {
      return (
        (b.name_ml && b.name_ml.toLowerCase().includes(q)) ||
        (b.name_en && b.name_en.toLowerCase().includes(q)) ||
        (b.beneficiary_id && String(b.beneficiary_id).toLowerCase().includes(q)) ||
        (b.mobile_no && String(b.mobile_no).includes(q)) ||
        (b.updated_by && b.updated_by.toLowerCase().includes(q)) ||
        (b.ward && String(b.ward) === q)
      );
    }).slice(0, 50);
  }, [filteredBeneficiaries, searchQuery]);

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-200">
      {/* Top Banner / Role Notification */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-emerald-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                <span>Live Analytics & Monitor Portal</span>
              </span>
              {currentUser && (
                <span className="text-xs text-slate-300 font-medium">
                  • {currentUser.name}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              പെൻഷൻ പുരോഗതി സ്ഥിതിവിവരക്കണക്കുകൾ
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              ആരൊക്കെ എത്രയെണ്ണം രേഖപ്പെടുത്തി (Updated By), മൊബൈൽ ശേഖരണ പുരോഗതി, സേവന സിങ്കിംഗ് നിലവാരം എന്നിവ തത്സമയം നിരീക്ഷിക്കുക.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>ഡാറ്റ പുതുക്കുക</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ward Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="text-xs font-bold text-slate-700">വാർഡ് ഫിൽട്ടർ:</span>
          <select
            value={selectedWardFilter}
            onChange={(e) => setSelectedWardFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">എല്ലാ വാർഡുകളും (ഗ്രാമപഞ്ചായത്ത് ആകെ)</option>
            {Array.from({ length: 25 }, (_, i) => i + 1).map((w) => (
              <option key={w} value={w}>
                വാർഡ് {w} (Ward {w})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-bold text-slate-500 text-right">
          ആകെ കണ്ടെത്തിയത്: <span className="text-emerald-700 font-extrabold">{stats.total}</span> ഗുണഭോക്താക്കൾ
        </div>
      </div>

      {/* 5 Main Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        {/* Card 1: Total Beneficiaries */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-600 truncate">ആകെ പെൻഷൻകാർ</span>
            <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
            {stats.total.toLocaleString()}
          </div>
          <div className="text-[9px] sm:text-[10px] font-semibold text-slate-500 mt-0.5 truncate">
            {selectedWardFilter === 'all' ? '25 വാർഡുകളിൽ ആകെ' : `വാർഡ് ${selectedWardFilter}-ൽ`}
          </div>
        </div>

        {/* Card 2: Mobile Collection Completed */}
        <div className="bg-emerald-50/80 rounded-2xl p-3.5 sm:p-4 border border-emerald-200/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-emerald-900 truncate">മൊബൈൽ ശേഖരിച്ചത്</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-800 tracking-tight">
              {stats.completedMobile.toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-xs font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full border border-emerald-300">
              {stats.mobilePercentage}%
            </span>
          </div>
          <div className="w-full bg-emerald-200/70 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.mobilePercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Card 3: Deceased */}
        <div className="bg-rose-50/80 rounded-2xl p-3.5 sm:p-4 border border-rose-200/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-rose-950 truncate">മരണപ്പെട്ടവർ</span>
            <div className="w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <UserX className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-900 mt-1.5 tracking-tight">
            {stats.deceased.toLocaleString()}
          </div>
          <div className="text-[9px] sm:text-[10px] font-semibold text-rose-700 mt-0.5">
            നമ്പർ ആവശ്യമില്ലാത്തവർ
          </div>
        </div>

        {/* Card 4: Mobile Collection Pending */}
        <div className="bg-amber-50/80 rounded-2xl p-3.5 sm:p-4 border border-amber-200/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-amber-950 truncate">ശേഖരിക്കാൻ ബാക്കി</span>
            <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-xl sm:text-2xl font-black text-amber-900 tracking-tight">
              {stats.pendingMobile.toLocaleString()}
            </span>
          </div>
          <div className="text-[9px] sm:text-[10px] font-semibold text-amber-800 mt-0.5 truncate">
            നമ്പർ ലഭ്യമാക്കാനുള്ളവർ
          </div>
        </div>

        {/* Card 5: Sevana Synced */}
        <div className="bg-indigo-50/80 rounded-2xl p-3.5 sm:p-4 border border-indigo-200/90 shadow-sm relative overflow-hidden col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-indigo-950 truncate">സേവനയിൽ സിങ്ക്</span>
            <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-xl sm:text-2xl font-black text-indigo-900 tracking-tight">
              {stats.sevanaSynced.toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-xs font-extrabold text-indigo-800 bg-indigo-100 px-1.5 py-0.2 rounded-full border border-indigo-300">
              {stats.sevanaTotalPercentage}%
            </span>
          </div>
          <div className="w-full bg-indigo-200/70 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.sevanaTotalPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Views */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {/* Tab 1 (Primary): Updated By Performance */}
        <button
          type="button"
          onClick={() => setActiveTab('updated_by')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'updated_by'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>ആരൊക്കെ എത്ര ചെയ്തു (Updated By)</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
            activeTab === 'updated_by' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {updatedByData.list.length}
          </span>
        </button>

        {/* Tab 2: Ward-Wise */}
        <button
          type="button"
          onClick={() => setActiveTab('wards')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'wards'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>വാർഡ് തിരിച്ചുള്ള റിപ്പോർട്ട്</span>
        </button>

        {/* Tab 3: Scheme-Wise */}
        <button
          type="button"
          onClick={() => setActiveTab('schemes')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'schemes'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>പെൻഷൻ തരം തിരിച്ച്</span>
        </button>

        {/* Tab 4: Search Status */}
        <button
          type="button"
          onClick={() => setActiveTab('beneficiaries')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'beneficiaries'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>സ്റ്റാറ്റസ് പരിശോധിക്കുക</span>
        </button>
      </div>

      {/* Tab 1 View: "Updated By" Performance Leaderboard */}
      {activeTab === 'updated_by' && (
        <div className="space-y-4">
          {/* Top 3 Spotlight Cards if available */}
          {updatedByData.list.length >= 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* #2 Silver */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-center order-2 sm:order-1 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 mx-auto flex items-center justify-center font-black text-sm mb-2 shadow-xs">
                    🥈 #2
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 truncate">
                    {updatedByData.list[1].name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    വാർഡുകൾ: {updatedByData.list[1].wardsText}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200">
                  <span className="text-xl font-black text-slate-800">
                    {updatedByData.list[1].completed}
                  </span>
                  <span className="text-xs text-slate-500 block">രേഖപ്പെടുത്തിയവ ({updatedByData.list[1].percent}%)</span>
                </div>
              </div>

              {/* #1 Gold Champion */}
              <div className="bg-gradient-to-b from-amber-50 to-emerald-50/60 border-2 border-amber-300 rounded-2xl p-4 text-center order-1 sm:order-2 shadow-md flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                </div>
                <div>
                  <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 mx-auto flex items-center justify-center font-black text-base mb-2 shadow-sm">
                    🏆 #1
                  </div>
                  <h4 className="font-black text-base text-slate-950 truncate">
                    {updatedByData.list[0].name}
                  </h4>
                  <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">
                    വാർഡുകൾ: {updatedByData.list[0].wardsText}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-amber-200">
                  <span className="text-2xl font-black text-emerald-800">
                    {updatedByData.list[0].completed}
                  </span>
                  <span className="text-xs font-bold text-emerald-900 block">ഏറ്റവും കൂടുതൽ രേഖപ്പെടുത്തിയത് ({updatedByData.list[0].percent}%)</span>
                </div>
              </div>

              {/* #3 Bronze */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-center order-3 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 mx-auto flex items-center justify-center font-black text-sm mb-2 shadow-xs">
                    🥉 #3
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 truncate">
                    {updatedByData.list[2].name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    വാർഡുകൾ: {updatedByData.list[2].wardsText}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200">
                  <span className="text-xl font-black text-slate-800">
                    {updatedByData.list[2].completed}
                  </span>
                  <span className="text-xs text-slate-500 block">രേഖപ്പെടുത്തിയവ ({updatedByData.list[2].percent}%)</span>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Updated By List Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  <span>അപ്ഡേറ്റ് ചെയ്തവരുടെ പൂർണ്ണ വിവരങ്ങൾ (Updated By Data)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  ആകെ രേഖപ്പെടുത്തിയ {updatedByData.totalUpdated} എണ്ണത്തിൽ ഓരോരുത്തരുടെയും പങ്കാളിത്തം
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-xl border border-emerald-300 self-start sm:self-auto">
                ആകെ {updatedByData.list.length} വ്യക്തികൾ / അക്കൗണ്ടുകൾ
              </span>
            </div>

            {updatedByData.list.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                      <th className="p-3 sm:p-3.5 text-center w-12">റാങ്ക്</th>
                      <th className="p-3 sm:p-3.5">അപ്ഡേറ്റ് ചെയ്ത വ്യക്തി / റോൾ</th>
                      <th className="p-3 sm:p-3.5 text-center">ചെയ്ത എണ്ണം</th>
                      <th className="p-3 sm:p-3.5 min-w-[150px]">പങ്കാളിത്ത ശതമാനം</th>
                      <th className="p-3 sm:p-3.5">വാർഡുകൾ</th>
                      <th className="p-3 sm:p-3.5 text-center">സേവന സിങ്ക്</th>
                      <th className="p-3 sm:p-3.5 text-right">അവസാന അപ്ഡേറ്റ്</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {updatedByData.list.map((item, idx) => {
                      const isTop1 = idx === 0;
                      const isTop3 = idx < 3;

                      return (
                        <tr 
                          key={idx} 
                          className={`hover:bg-slate-50/90 transition-colors ${
                            isTop1 ? 'bg-emerald-50/20' : ''
                          }`}
                        >
                          {/* Rank */}
                          <td className="p-3 sm:p-3.5 text-center font-black">
                            <span className={`w-7 h-7 rounded-xl inline-flex items-center justify-center font-bold text-xs ${
                              idx === 0 
                                ? 'bg-amber-400 text-slate-950 font-black shadow-xs' 
                                : idx === 1 
                                ? 'bg-slate-300 text-slate-800' 
                                : idx === 2 
                                ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {idx + 1}
                            </span>
                          </td>

                          {/* Name / Role */}
                          <td className="p-3 sm:p-3.5 font-bold text-slate-900 text-sm">
                            <div className="flex items-center gap-2">
                              <span>{item.name}</span>
                              {isTop3 && (
                                <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 text-[9px] font-extrabold border border-amber-300">
                                  Top {idx + 1}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Completed Count */}
                          <td className="p-3 sm:p-3.5 text-center font-black text-emerald-800 text-base">
                            {item.completed}
                          </td>

                          {/* Progress Bar & Contribution % */}
                          <td className="p-3 sm:p-3.5">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    isTop1 
                                      ? 'bg-gradient-to-r from-emerald-600 to-teal-500' 
                                      : 'bg-emerald-600'
                                  }`}
                                  style={{ width: `${item.percent}%` }}
                                ></div>
                              </div>
                              <span className="font-extrabold text-slate-900 text-xs shrink-0 w-10 text-right">
                                {item.percent}%
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              ആകെ പെൻഷൻകാരിൽ {item.totalPercent}%
                            </span>
                          </td>

                          {/* Wards Covered */}
                          <td className="p-3 sm:p-3.5 text-slate-700 font-medium">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-semibold">
                              വാർഡ് {item.wardsText}
                            </span>
                          </td>

                          {/* Sevana Synced */}
                          <td className="p-3 sm:p-3.5 text-center">
                            <span className="font-bold text-indigo-700 text-sm">{item.sevanaSynced}</span>
                          </td>

                          {/* Last Active Timestamp */}
                          <td className="p-3 sm:p-3.5 text-right text-slate-500 font-medium">
                            <div className="flex items-center justify-end gap-1 text-[11px]">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{item.latestDateText}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-slate-500 space-y-2">
                <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold">ഇതുവരെ ആരും വിവരങ്ങൾ അപ്ഡേറ്റ് ചെയ്തിട്ടില്ല.</p>
                <p className="text-xs text-slate-400">മൊബൈൽ നമ്പറുകൾ രേഖപ്പെടുത്തി സേവ് ചെയ്യുമ്പോൾ ഇവിടെ ഓരോരുത്തരുടെയും കണക്കുകൾ തത്സമയം കാണാം.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2 View: Ward-Wise Performance Table */}
      {activeTab === 'wards' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span>വാർഡ് തിരിച്ചുള്ള തത്സമയ പുരോഗതി പട്ടിക</span>
              </h3>
              <p className="text-xs text-slate-500">25 വാർഡുകളിലെയും കളക്ഷൻ, സേവന സിങ്ക് വിവരങ്ങൾ</p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-xl border border-slate-200">
              ആകെ 25 വാർഡുകൾ
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <th className="p-3 sm:p-3.5">വാർഡ്</th>
                  <th className="p-3 sm:p-3.5">മെമ്പർ</th>
                  <th className="p-3 sm:p-3.5 text-center">ആകെ</th>
                  <th className="p-3 sm:p-3.5 text-center">ചെയ്തവ (Done)</th>
                  <th className="p-3 sm:p-3.5 text-center">മരണപ്പെട്ടവർ</th>
                  <th className="p-3 sm:p-3.5 text-center">ബാക്കി (Pending)</th>
                  <th className="p-3 sm:p-3.5 min-w-[140px]">ശേഖരണ ശതമാനം</th>
                  <th className="p-3 sm:p-3.5 text-center">സേവന സിങ്ക്</th>
                  <th className="p-3 sm:p-3.5 text-right">നിലവാരം</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {wardStatsList.map((w) => {
                  const isFinished = w.total > 0 && w.pending === 0;
                  const isHigh = w.percent >= 75;

                  return (
                    <tr 
                      key={w.ward} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isFinished ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      <td className="p-3 sm:p-3.5 font-black text-slate-900 text-sm">
                        <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 inline-flex items-center justify-center font-bold text-xs">
                          {w.ward}
                        </span>
                      </td>

                      <td className="p-3 sm:p-3.5">
                        <div className="font-bold text-slate-900">{w.member}</div>
                        {w.memberMobile && (
                          <div className="text-[10px] text-slate-500 font-mono">+91 {w.memberMobile}</div>
                        )}
                      </td>

                      <td className="p-3 sm:p-3.5 text-center font-extrabold text-slate-800 text-sm">
                        {w.total}
                      </td>

                      <td className="p-3 sm:p-3.5 text-center font-bold text-emerald-700 text-sm">
                        {w.completed}
                      </td>

                      <td className="p-3 sm:p-3.5 text-center font-bold text-rose-700 text-sm">
                        {w.deceased}
                      </td>

                      <td className="p-3 sm:p-3.5 text-center font-bold text-amber-700 text-sm">
                        {w.pending}
                      </td>

                      <td className="p-3 sm:p-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isFinished 
                                  ? 'bg-emerald-600' 
                                  : isHigh 
                                  ? 'bg-teal-600' 
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${w.percent}%` }}
                            ></div>
                          </div>
                          <span className="font-extrabold text-slate-900 text-[11px] shrink-0 w-9 text-right">
                            {w.percent}%
                          </span>
                        </div>
                      </td>

                      <td className="p-3 sm:p-3.5 text-center">
                        <span className="font-bold text-indigo-700">{w.sevanaSynced}</span>
                        <span className="text-[10px] text-slate-500 block">({w.sevanaPercent}%)</span>
                      </td>

                      <td className="p-3 sm:p-3.5 text-right">
                        {isFinished ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>പൂർത്തിയായി</span>
                          </span>
                        ) : isHigh ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                            75%+ മുന്നിൽ
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                            പുരോഗമിക്കുന്നു
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3 View: Scheme-Wise Breakdown */}
      {activeTab === 'schemes' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>പെൻഷൻ തരം തിരിച്ചുള്ള സ്ഥിതിവിവരക്കണക്കുകൾ</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schemeStatsList.map((scheme, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900">
                    {scheme.name}
                  </span>
                  <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    ആകെ {scheme.total}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center text-xs">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-1.5 sm:p-2">
                    <span className="text-[10px] text-emerald-800 font-bold block truncate">ചെയ്തവ</span>
                    <span className="text-sm sm:text-base font-extrabold text-emerald-900">{scheme.completed}</span>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-1.5 sm:p-2">
                    <span className="text-[10px] text-rose-800 font-bold block truncate">മരണപ്പെട്ടവർ</span>
                    <span className="text-sm sm:text-base font-extrabold text-rose-900">{scheme.deceased}</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-1.5 sm:p-2">
                    <span className="text-[10px] text-amber-800 font-bold block truncate">ബാക്കി</span>
                    <span className="text-sm sm:text-base font-extrabold text-amber-900">{scheme.pending}</span>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-1.5 sm:p-2">
                    <span className="text-[10px] text-indigo-800 font-bold block truncate">സേവന സിങ്ക്</span>
                    <span className="text-sm sm:text-base font-extrabold text-indigo-900">{scheme.sevanaSynced}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                    <span>മൊബൈൽ കളക്ഷൻ പുരോഗതി</span>
                    <span className="text-emerald-800">{scheme.percent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${scheme.percent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4 View: Search Beneficiary Status (Read-Only) */}
      {activeTab === 'beneficiaries' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-700" />
              <span>ഗുണഭോക്താവിന്റെ നിലവിലെ സ്റ്റാറ്റസ് തിരയുക</span>
            </h3>
            <p className="text-xs text-slate-500">
              പേര്, പെൻഷൻ നമ്പർ, മൊബൈൽ നമ്പർ, വാർഡ് അല്ലെങ്കിൽ അപ്ഡേറ്റ് ചെയ്ത ആളുടെ പേര് നൽകി പരിശോധിക്കുക.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ഉദാ: ഫാത്തിമ, 10245, സുരേഷ് ബാബു, 9847..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {searchQuery && (
            <div className="space-y-2 mt-4">
              <div className="text-xs font-bold text-slate-500">
                കണ്ടെത്തിയ ഫലങ്ങൾ: <span className="text-emerald-700">{searchedBeneficiaries.length}</span>
              </div>

              {searchedBeneficiaries.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {searchedBeneficiaries.map((b) => {
                    const isDeceased = b.status === 'deceased';
                    const isDone = b.status === 'completed' && b.mobile_no && !isDeceased;
                    const isSynced = b.sevana_status === 'synced';

                    return (
                      <div key={b.beneficiary_id} className="p-3.5 bg-white hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm ${isDeceased ? 'text-slate-600 line-through' : 'text-slate-900'}`}>
                              {b.name_ml || b.name_en}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-700">
                              വാർഡ് {b.ward}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            പെൻഷൻ നമ്പർ: <span className="font-mono font-semibold">{b.beneficiary_id}</span> • {b.scheme_ml || b.scheme_name}
                          </div>
                          {b.updated_by && (
                            <div className="text-[11px] text-emerald-800 font-semibold mt-0.5 flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-emerald-600" />
                              <span>{isDeceased ? 'രേഖപ്പെടുത്തിയത്' : 'അപ്ഡേറ്റ് ചെയ്തത്'}: <strong>{b.updated_by}</strong></span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                          {isDeceased ? (
                            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                              <UserX className="w-3.5 h-3.5 text-rose-600" />
                              <span>മരണപ്പെട്ടു</span>
                            </span>
                          ) : isDone ? (
                            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 font-mono">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>+91 {b.mobile_no}</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>ബാക്കി (Pending)</span>
                            </span>
                          )}

                          {isSynced && (
                            <span className="px-2 py-1 rounded-xl text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
                              സേവന സിങ്ക്ഡ്
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  വിവരങ്ങൾ ലഭ്യമല്ല. മറ്റൊരു വാക്കോ നമ്പറോ തിരയുക.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
