import React from 'react';
import { X, Download, Printer, FileText, CheckCircle2, Clock } from 'lucide-react';
import { WARDS_LIST } from '../services/mockData';

export default function ExportModal({ 
  isOpen, 
  onClose, 
  beneficiaries, 
  selectedWard 
}) {
  if (!isOpen) return null;

  const wardInfo = WARDS_LIST.find((w) => w.id === selectedWard) || {
    name_ml: selectedWard === 'all' ? 'എല്ലാ വാർഡുകളും' : `വാർഡ് ${selectedWard}`,
    name_en: selectedWard === 'all' ? 'All Wards' : `Ward ${selectedWard}`,
  };

  const wardData = selectedWard === 'all' 
    ? beneficiaries 
    : beneficiaries.filter((b) => b.ward === Number(selectedWard));

  const completedCount = wardData.filter((b) => b.status === 'completed' && b.mobile_no).length;
  const pendingCount = wardData.length - completedCount;

  // Export to CSV Function
  const exportToCSV = () => {
    const headers = [
      'Beneficiary ID',
      'Name (Malayalam)',
      'Name (English)',
      'Gender',
      'Age',
      'Ward',
      'Scheme Name',
      'House Name',
      'Mobile Number',
      'Status',
      'Updated At',
      'Updated By',
      'Sevana Status',
      'Sevana Synced At',
      'Sevana Synced By'
    ];

    const rows = wardData.map((b) => [
      `"${b.beneficiary_id}"`,
      `"${b.name_ml || ''}"`,
      `"${b.name_en || ''}"`,
      `"${b.gender || ''}"`,
      b.age || '',
      b.ward || '',
      `"${b.scheme_ml || ''}"`,
      `"${b.house_name || ''}"`,
      `"${b.mobile_no || ''}"`,
      `"${b.status || ''}"`,
      `"${b.updated_at || ''}"`,
      `"${b.updated_by || ''}"`,
      `"${b.sevana_status || ''}"`,
      `"${b.sevana_synced_at || ''}"`,
      `"${b.sevana_synced_by || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Puthuppadi_Panchayat_Pension_Ward_${selectedWard}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Summary
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത്
              </h3>
              <p className="text-xs text-slate-400">സാമൂഹ്യ സുരക്ഷാ പെൻഷൻ റിപ്പോർട്ട് എക്സ്പോർട്ട്</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-800 text-sm">{wardInfo.name_ml}</span>
              <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold">
                ആകെ: {wardData.length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-slate-500 block">പൂർത്തിയായത്:</span>
                  <span className="font-bold text-emerald-800 text-sm">{completedCount} എണ്ണം</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="text-slate-500 block">ശേഷിക്കുന്നത്:</span>
                  <span className="font-bold text-amber-800 text-sm">{pendingCount} എണ്ണം</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Options */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={exportToCSV}
              className="w-full p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <FileText className="w-5 h-5" />
              <span>CSV ഫയലായി ഡൗൺലോഡ് ചെയ്യുക (Excel Compatible)</span>
            </button>

            <button
              onClick={handlePrint}
              className="w-full p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl border border-slate-200 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <Printer className="w-5 h-5 text-slate-600" />
              <span>റിപ്പോർട്ട് പ്രിന്റ് ചെയ്യുക (Print Summary)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            മടങ്ങുക (Close)
          </button>
        </div>
      </div>
    </div>
  );
}
