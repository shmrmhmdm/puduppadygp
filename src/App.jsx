import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import WardSelector from './components/WardSelector';
import WardStats from './components/WardStats';
import BeneficiaryList from './components/BeneficiaryList';
import EmployeeSevanaQueue from './components/EmployeeSevanaQueue';
import UserManagementModal from './components/UserManagementModal';
import SettingsModal from './components/SettingsModal';
import ScriptModal from './components/ScriptModal';
import ExportModal from './components/ExportModal';
import LoginScreen from './components/LoginScreen';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Toast from './components/Toast';
import { 
  fetchBeneficiaries, 
  updateBeneficiaryMobile, 
  updateBeneficiarySevanaStatus,
  addNewUser,
  getApiConfig, 
  saveApiConfig, 
  clearCache,
  getLoggedInUser,
  setLoggedInUser,
  logoutUser,
  getCachedUsers,
  isAdmin,
  isEmployee,
  isWardMember,
  isViewer
} from './services/api';
import { 
  FileSpreadsheet, 
  PlusCircle, 
  Code2, 
  RotateCw, 
  ShieldAlert, 
  CheckCircle2,
  HelpCircle,
  Users,
  FileCheck
} from 'lucide-react';

export default function App() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [users, setUsers] = useState(getCachedUsers() || []);
  const [loggedInUser, setLoggedInUserState] = useState(getLoggedInUser());
  const [selectedWard, setSelectedWard] = useState(1);
  const [currentView, setCurrentView] = useState('collection'); // 'collection' | 'sevana'
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [apiConfig, setApiConfigState] = useState(getApiConfig());
  const [toast, setToast] = useState(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  // Online / Offline tracking
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast({
        type: 'success',
        title_ml: 'ഇന്റർനെറ്റ് കണക്ഷൻ ലഭ്യമായി',
        title_en: 'Back Online',
      });
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast({
        type: 'error',
        title_ml: 'ഇന്റർനെറ്റ് വിച്ഛേദിക്കപ്പെട്ടു (ഓഫ്‌ലൈൻ മോഡ്)',
        title_en: 'You are offline.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showToast = useCallback((toastData) => {
    setToast(toastData);
    setTimeout(() => {
      setToast((prev) => (prev === toastData ? null : prev));
    }, 4000);
  }, []);

  // Fetch initial data
  const loadData = useCallback(async (forceRefresh = false) => {
    const config = getApiConfig();
    if (!config.scriptUrl) {
      setBeneficiaries([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetchBeneficiaries(forceRefresh);
      setBeneficiaries(res.data || []);
      if (res.users && res.users.length > 0) {
        setUsers(res.users);
      }
      if (forceRefresh) {
        showToast({
          type: 'success',
          title_ml: 'Google Sheet-ൽ നിന്നും വിവരങ്ങൾ പുതുക്കി',
          title_en: 'Data refreshed from Google Sheet',
        });
      }
    } catch (err) {
      console.error('Error loading data:', err);
      showToast({
        type: 'error',
        title_ml: 'ഡാറ്റ ലഭ്യമാക്കാൻ സാധിച്ചില്ല',
        title_en: 'Failed to fetch from Google Sheet',
        message_ml: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Login Handler
  const handleLoginSuccess = (user) => {
    setLoggedInUser(user);
    setLoggedInUserState(user);
    if (user.ward && user.ward !== 'All') {
      setSelectedWard(Number(user.ward));
    } else {
      setSelectedWard('all');
    }

    // Default view based on role
    if (isViewer(user)) {
      setCurrentView('stats');
    } else if (isEmployee(user) && !isWardMember(user)) {
      setCurrentView('sevana');
    } else {
      setCurrentView('collection');
    }

    showToast({
      type: 'success',
      title_ml: `സ്വാഗതം, ${user.name}!`,
      title_en: `Logged in as ${user.role}`,
    });
  };

  // Logout Handler
  const handleLogout = () => {
    logoutUser();
    setLoggedInUserState(null);
    showToast({
      type: 'info',
      title_ml: 'ലോഗൗട്ട് ചെയ്തു',
      title_en: 'Logged out successfully',
    });
  };

  // Save Mobile Number with Instant Optimistic UI Update & Audit
  const handleSaveMobile = async (beneficiaryId, mobileNo) => {
    const now = new Date().toISOString();
    const updatedByText = loggedInUser 
      ? `${loggedInUser.name} (${loggedInUser.ward !== 'All' ? 'വാർഡ് ' + loggedInUser.ward : loggedInUser.role})`
      : 'വാർഡ് മെമ്പർ';

    // 1. Optimistic Update in State immediately
    setBeneficiaries((prev) =>
      prev.map((item) => {
        if (item.beneficiary_id === beneficiaryId) {
          return {
            ...item,
            mobile_no: mobileNo,
            status: 'completed',
            updated_at: now,
            updated_by: updatedByText,
            sevana_status: item.sevana_status || 'pending',
          };
        }
        return item;
      })
    );

    // 2. Call API Service
    try {
      const result = await updateBeneficiaryMobile(beneficiaryId, mobileNo, updatedByText);

      showToast({
        type: 'success',
        title_ml: 'മൊബൈൽ നമ്പർ Google Sheet-ൽ രേഖപ്പെടുത്തി!',
        title_en: `Saved for ${beneficiaryId}`,
        message_ml: '+91 ' + mobileNo,
      });

      // Check if ward completed all records
      const currentWardItems = beneficiaries.filter((b) => 
        selectedWard === 'all' || b.ward === Number(selectedWard)
      );
      const remainingPending = currentWardItems.filter(
        (b) => b.beneficiary_id !== beneficiaryId && (b.status === 'pending' || !b.mobile_no)
      ).length;

      if (remainingPending === 0 && currentWardItems.length > 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#10b981', '#34d399', '#fbbf24'],
        });
      }

      return result;
    } catch (error) {
      console.error('Save failed:', error);
      showToast({
        type: 'error',
        title_ml: 'സേവ് ചെയ്യുന്നതിൽ തടസ്സം നേരിട്ടു',
        title_en: 'Failed to update mobile number',
      });
      loadData(false);
      throw error;
    }
  };

  // Update Sevana Status (Employee Action)
  const handleUpdateSevanaStatus = async (beneficiaryIds, newStatus, syncedBy) => {
    // 1. Optimistic Update in State
    setBeneficiaries((prev) =>
      prev.map((item) => {
        if (beneficiaryIds.includes(item.beneficiary_id)) {
          return {
            ...item,
            sevana_status: newStatus,
            sevana_synced_at: newStatus === 'synced' ? new Date().toISOString() : null,
            sevana_synced_by: newStatus === 'synced' ? syncedBy : '',
          };
        }
        return item;
      })
    );

    try {
      await updateBeneficiarySevanaStatus(beneficiaryIds, newStatus, syncedBy);
      showToast({
        type: 'success',
        title_ml: newStatus === 'synced' ? 'സേവനയിൽ അപ്ഡേറ്റ് ചെയ്തതായി രേഖപ്പെടുത്തി!' : 'സ്റ്റാറ്റസ് മാറ്റി',
        title_en: `Updated Sevana status for ${beneficiaryIds.length} records`,
      });
    } catch (err) {
      console.error('Sevana status update failed:', err);
      showToast({
        type: 'error',
        title_ml: 'സേവന സ്റ്റാറ്റസ് മാറ്റാൻ സാധിച്ചില്ല',
        title_en: err.message,
      });
      loadData(false);
    }
  };

  // Add User (Admin Action)
  const handleAddUser = async (userData) => {
    try {
      const res = await addNewUser(userData);
      setUsers((prev) => [...prev.filter((u) => u.mobile !== userData.mobile), userData]);
      showToast({
        type: 'success',
        title_ml: 'യൂസറെ വിജയകരമായി ചേർത്തു!',
        title_en: `Added ${userData.name} (${userData.role})`,
      });
      return res;
    } catch (err) {
      showToast({
        type: 'error',
        title_ml: 'യൂസറെ ചേർക്കാൻ സാധിച്ചില്ല',
        title_en: err.message,
      });
      throw err;
    }
  };

  // Config Update (Admin only)
  const handleSaveConfig = (newConfig) => {
    const updated = saveApiConfig(newConfig);
    setApiConfigState(updated);
    showToast({
      type: 'success',
      title_ml: 'Google Sheet URL സേവ് ചെയ്തു',
      title_en: 'Google Sheet connected successfully',
    });
    loadData(true);
  };

  // Clear Cache
  const handleClearCache = () => {
    clearCache();
    setBeneficiaries([]);
    setUsers([]);
    showToast({
      type: 'info',
      title_ml: 'ലോക്കൽ കാഷെ ക്ലിയർ ചെയ്തു',
      title_en: 'Local storage cache cleared',
    });
    loadData(true);
  };

  // Calculate stats for current selection
  const wardStats = useMemo(() => {
    const filtered = selectedWard === 'all'
      ? beneficiaries
      : beneficiaries.filter((b) => b.ward === Number(selectedWard));

    const total = filtered.length;
    const completed = filtered.filter((b) => b.status === 'completed' && b.mobile_no).length;
    const pending = total - completed;

    return { total, completed, pending };
  }, [beneficiaries, selectedWard]);

  // Pending Sevana Count across all completed beneficiaries
  const pendingSevanaCount = useMemo(() => {
    return beneficiaries.filter((b) => b.mobile_no && b.mobile_no.length === 10 && b.sevana_status !== 'synced').length;
  }, [beneficiaries]);

  const hasScriptUrl = Boolean(apiConfig.scriptUrl && apiConfig.scriptUrl.trim());

  // If user is not logged in, render the Login Screen
  if (!loggedInUser) {
    return (
      <>
        <LoginScreen
          users={users}
          onLoginSuccess={handleLoginSuccess}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenScriptModal={() => setIsScriptModalOpen(true)}
          hasScriptUrl={hasScriptUrl}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          config={apiConfig}
          onSaveConfig={handleSaveConfig}
          onClearCache={handleClearCache}
          onOpenScriptModal={() => setIsScriptModalOpen(true)}
          onNotify={showToast}
        />

        <ScriptModal
          isOpen={isScriptModalOpen}
          onClose={() => setIsScriptModalOpen(false)}
        />

        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 pb-16 flex flex-col font-sans">
      {/* Official Government Portal Header */}
      <Header
        hasScriptUrl={hasScriptUrl}
        isOnline={isOnline}
        loading={loading}
        onRefresh={() => loadData(true)}
        onOpenSettings={() => {
          if (isAdmin(loggedInUser)) setIsSettingsOpen(true);
        }}
        onOpenScriptModal={() => {
          if (isAdmin(loggedInUser)) setIsScriptModalOpen(true);
        }}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenUserManagement={() => {
          if (isAdmin(loggedInUser)) setIsUserManagementOpen(true);
        }}
        loggedInUser={loggedInUser}
        onLogout={handleLogout}
        currentView={currentView}
        onSwitchView={setCurrentView}
        pendingSevanaCount={pendingSevanaCount}
      />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-3.5 sm:px-6 pt-4 sm:pt-6 w-full flex-1 space-y-4 sm:space-y-5">
        {/* Offline Warning Banner */}
        {!isOnline && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2.5 rounded-2xl shadow-sm font-bold text-xs flex items-center gap-2 border border-amber-600/30">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              നിങ്ങൾ ഇപ്പോൾ ഓഫ്‌ലൈനിലാണ്. രേഖപ്പെടുത്തുന്ന വിവരങ്ങൾ ഇന്റർനെറ്റ് ലഭിക്കുമ്പോൾ Google Sheet-ലേക്ക് സ്വയം അപ്ഡേറ്റ് ആകും.
            </span>
          </div>
        )}

        {/* If Google Sheet is NOT connected yet, show Welcome Connect Card */}
        {!hasScriptUrl ? (
          <div className="bg-white rounded-3xl shadow-md border border-emerald-200 p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-inner">
              <FileSpreadsheet className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Google Sheet കണക്ട് ചെയ്യുക
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                നിങ്ങളുടെ പഞ്ചായത്തിലെ പെൻഷൻ ഗുണഭോക്താക്കളുടെ Google Sheet ഈ പോർട്ടലുമായി ബന്ധിപ്പിക്കാൻ താഴെയുള്ള ബട്ടണുകൾ ഉപയോഗിക്കുക.
              </p>
            </div>

            {isAdmin(loggedInUser) && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScriptModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span>1. Apps Script കോഡ് & നിർദ്ദേശങ്ങൾ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>2. Web App URL നൽകുക (Connect)</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* View 1: Analytics & Stats Dashboard */}
            {currentView === 'stats' ? (
              <AnalyticsDashboard
                beneficiaries={beneficiaries}
                users={users}
                onRefresh={() => loadData(true)}
                loading={loading}
                currentUser={loggedInUser}
              />
            ) : currentView === 'sevana' && isEmployee(loggedInUser) ? (
              /* View 2: Employee Sevana Sync Queue Dashboard */
              <EmployeeSevanaQueue
                beneficiaries={beneficiaries}
                onUpdateSevanaStatus={handleUpdateSevanaStatus}
                currentUser={loggedInUser}
              />
            ) : (
              /* View 3: Mobile Number Collection Portal */
              <>
                {/* Dynamic Ward Selector */}
                <WardSelector
                  selectedWard={selectedWard}
                  onSelectWard={setSelectedWard}
                  wardStats={wardStats}
                  beneficiaries={beneficiaries}
                  users={users}
                />

                {/* Ward Statistics Live Card */}
                <WardStats
                  total={wardStats.total}
                  completed={wardStats.completed}
                  pending={wardStats.pending}
                />

                {/* Beneficiary List & Mobile Collection Workflow */}
                <BeneficiaryList
                  beneficiaries={beneficiaries}
                  selectedWard={selectedWard}
                  onSaveMobile={handleSaveMobile}
                  isReadOnly={isViewer(loggedInUser)}
                />
              </>
            )}
          </>
        )}
      </main>

      {/* Admin Only Modals */}
      {isAdmin(loggedInUser) && (
        <>
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            config={apiConfig}
            onSaveConfig={handleSaveConfig}
            onClearCache={handleClearCache}
            onOpenScriptModal={() => setIsScriptModalOpen(true)}
            onNotify={showToast}
          />

          <ScriptModal
            isOpen={isScriptModalOpen}
            onClose={() => setIsScriptModalOpen(false)}
          />

          <UserManagementModal
            isOpen={isUserManagementOpen}
            onClose={() => setIsUserManagementOpen(false)}
            users={users}
            onAddUser={handleAddUser}
          />
        </>
      )}

      {/* Export Modal (All Roles) */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        beneficiaries={beneficiaries}
        selectedWard={selectedWard}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-slate-500 max-w-xl mx-auto px-4 space-y-1">
        <p className="font-bold text-slate-700">
          പുതുപ്പാടി ഗ്രാമപഞ്ചായത്ത് • സാമൂഹ്യ സുരക്ഷാ പെൻഷൻ പോർട്ടൽ
        </p>
        <p className="text-[11px] text-slate-500 font-bold tracking-wider uppercase">
          DEVELOPED BY SHAMEER TECHNICAL ASSISTANT
        </p>
      </footer>
    </div>
  );
}
