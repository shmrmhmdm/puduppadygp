import React, { useState } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  Shield, 
  Briefcase, 
  UserCheck, 
  Phone, 
  Save, 
  Loader2, 
  CheckCircle2, 
  Search,
  Plus
} from 'lucide-react';
import { WARDS_LIST } from '../services/mockData';

export default function UserManagementModal({ 
  isOpen, 
  onClose, 
  users = [], 
  onAddUser 
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('Ward Member');
  const [ward, setWard] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanMobile = mobile.trim().replace(/\D/g, '');

    if (!name.trim()) {
      setErrorMsg('പേര് നൽകുക.');
      return;
    }
    if (cleanMobile.length !== 10) {
      setErrorMsg('10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onAddUser({
        name: name.trim(),
        mobile: cleanMobile,
        role: role,
        ward: role === 'Admin' || role === 'Employee' ? 'All' : ward,
        status: 'Active',
      });

      setName('');
      setMobile('');
      setShowAddForm(false);
    } catch (err) {
      setErrorMsg('യൂസറെ ചേർക്കാൻ സാധിച്ചില്ല: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.mobile && u.mobile.includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q)) ||
      (u.ward && String(u.ward).includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                യൂസർ മാനേജ്‌മെന്റ് (User Management)
              </h3>
              <p className="text-xs text-slate-400">അഡ്മിൻ, ജീവനക്കാർ, വാർഡ് മെമ്പർമാരുടെ വിവരങ്ങൾ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Header & Search */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="പേര്, മൊബൈൽ, വാർഡ് തിരയുക..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showAddForm ? 'ഫോം ഒഴിവാക്കുക' : 'പുതിയ യൂസറെ ചേർക്കുക'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Add User Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-emerald-50/70 border border-emerald-300 rounded-2xl p-4 space-y-3 animate-in fade-in">
              <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-700" />
                <span>പുതിയ യൂസർ വിവരങ്ങൾ നൽകുക</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    യൂസറുടെ പേര് (Full Name):
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ശ്രീ. കെ. സുരേഷ് ബാബു"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    10 അക്ക മൊബൈൽ നമ്പർ (Login Key):
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="98XXXXXXXX"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    റോൾ (User Role):
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Ward Member">വാർഡ് മെമ്പർ (Ward Member)</option>
                    <option value="Employee">ജീവനക്കാരൻ / ക്ലർക്ക് (Employee)</option>
                    <option value="Admin">അഡ്മിൻ (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    വാർഡ് (Assigned Ward):
                  </label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    disabled={role === 'Admin' || role === 'Employee'}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="All">എല്ലാ വാർഡുകളും (All)</option>
                    {WARDS_LIST.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name_ml} ({w.name_en})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  റദ്ദാക്കുക
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>യൂസറെ സേവ് ചെയ്യുക</span>
                </button>
              </div>
            </form>
          )}

          {/* User List Table / Cards */}
          <div className="space-y-2">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u, idx) => {
                const isUserAdmin = u.role === 'Admin';
                const isUserEmployee = u.role === 'Employee';

                return (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 ${
                        isUserAdmin 
                          ? 'bg-purple-600 shadow-sm' 
                          : isUserEmployee 
                          ? 'bg-indigo-600 shadow-sm' 
                          : 'bg-emerald-600 shadow-sm'
                      }`}>
                        {isUserAdmin ? <Shield className="w-4 h-4" /> : isUserEmployee ? <Briefcase className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{u.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isUserAdmin 
                              ? 'bg-purple-100 text-purple-800' 
                              : isUserEmployee 
                              ? 'bg-indigo-100 text-indigo-800' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {u.role === 'Admin' ? 'അഡ്മിൻ' : u.role === 'Employee' ? 'ജീവനക്കാരൻ' : 'വാർഡ് മെമ്പർ'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span className="font-mono text-slate-700 font-semibold flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            +91 {u.mobile}
                          </span>
                          <span>•</span>
                          <span className="font-medium text-emerald-800">
                            {u.ward === 'All' ? 'എല്ലാ വാർഡുകളും' : `വാർഡ് ${u.ward}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Active
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                യൂസർമാരെ കണ്ടെത്തിയില്ല.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
          >
            മടങ്ങുക (Close)
          </button>
        </div>
      </div>
    </div>
  );
}
