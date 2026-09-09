import { INITIAL_BENEFICIARIES } from './mockData';

const CACHE_KEY = 'panchayat_pension_beneficiaries_v1';
const USERS_CACHE_KEY = 'panchayat_pension_users_v1';
const LOGGED_IN_USER_KEY = 'panchayat_logged_in_user_v1';
const CONFIG_KEY = 'panchayat_pension_config_v1';
const OFFLINE_QUEUE_KEY = 'panchayat_pension_offline_queue_v1';

// Helper to normalize URL or Deployment ID
export const normalizeScriptUrl = (input) => {
  if (!input) return '';
  const trimmed = input.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://script.google.com/macros/s/${trimmed}/exec`;
};

// Default configuration with user's Google Apps Script URL
const DEFAULT_CONFIG = {
  scriptUrl: normalizeScriptUrl(import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxElQU_yeHq5Fwnbv6qDuzD1ayTqu3GNgAljQu8EBEC9E7TZLwePof-roJ6JjccEnzfGg/exec'),
  isLiveApi: true,
};

export const getApiConfig = () => {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { 
        ...DEFAULT_CONFIG, 
        ...parsed, 
        scriptUrl: normalizeScriptUrl(parsed.scriptUrl || DEFAULT_CONFIG.scriptUrl) 
      };
    }
  } catch (e) {
    console.error('Error reading config from localStorage:', e);
  }
  return DEFAULT_CONFIG;
};

export const saveApiConfig = (newConfig) => {
  try {
    const current = getApiConfig();
    const updated = { 
      ...current, 
      ...newConfig,
      scriptUrl: normalizeScriptUrl(newConfig.scriptUrl || current.scriptUrl)
    };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving config to localStorage:', e);
    return newConfig;
  }
};

// User Session Management
export const getLoggedInUser = () => {
  try {
    const saved = localStorage.getItem(LOGGED_IN_USER_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error reading logged in user:', e);
  }
  return null;
};

export const setLoggedInUser = (user) => {
  try {
    if (user) {
      localStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOGGED_IN_USER_KEY);
    }
  } catch (e) {
    console.error('Error saving logged in user:', e);
  }
};

export const logoutUser = () => {
  setLoggedInUser(null);
};

// Role Check Helpers
export const isAdmin = (user) => {
  if (!user) return false;
  const role = String(user.role || '').toLowerCase();
  return role === 'admin' || role === 'അഡ്മിൻ';
};

export const isEmployee = (user) => {
  if (!user) return false;
  const role = String(user.role || '').toLowerCase();
  if (role === 'viewer' || role === 'monitor' || role === 'നിരീക്ഷകൻ') return false;
  return role === 'employee' || role === 'clerk' || role === 'ജീവനക്കാരൻ' || role === 'admin';
};

export const isWardMember = (user) => {
  if (!user) return false;
  const role = String(user.role || '').toLowerCase();
  return role === 'ward member' || role === 'member' || role === 'മെമ്പർ';
};

export const isViewer = (user) => {
  if (!user) return false;
  const role = String(user.role || '').toLowerCase();
  return (
    role === 'viewer' ||
    role === 'monitor' ||
    role === 'supervisor' ||
    role === 'observer' ||
    role === 'നിരീക്ഷകൻ' ||
    role === 'സ്റ്റാറ്റ്സ്'
  );
};

// Beneficiaries Cache
export const getCachedBeneficiaries = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.error('Error reading from localStorage cache:', e);
  }
  return null;
};

export const setCachedBeneficiaries = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error writing to localStorage cache:', e);
  }
};

// Users Cache (Admin, Employee, Ward Members)
export const getCachedUsers = () => {
  try {
    const cached = localStorage.getItem(USERS_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.error('Error reading users cache:', e);
  }
  return [];
};

export const setCachedUsers = (users) => {
  try {
    localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error writing users cache:', e);
  }
};

export const clearCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(USERS_CACHE_KEY);
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (e) {
    console.error('Error clearing cache:', e);
  }
};

/**
 * Trigger Automatic Header Column Setup for Both Sheets
 */
export const triggerAutoSetupHeaders = async () => {
  const config = getApiConfig();
  if (!config.scriptUrl) {
    throw new Error('Google Apps Script URL നൽകിയിട്ടില്ല');
  }

  try {
    const response = await fetch(`${config.scriptUrl}?action=setupHeaders`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const result = await response.json();
    return result;
  } catch (err) {
    console.error('Failed to trigger auto setup headers:', err);
    throw err;
  }
};

/**
 * Fetch beneficiaries and registered users from Google Apps Script Web App
 */
export const fetchBeneficiaries = async (forceRefresh = false) => {
  const config = getApiConfig();
  const cached = getCachedBeneficiaries();
  const cachedUsers = getCachedUsers();

  if (cached && !forceRefresh) {
    return { 
      data: cached, 
      users: cachedUsers, 
      source: 'cache', 
      isLive: config.isLiveApi, 
      scriptUrl: config.scriptUrl 
    };
  }

  if (config.scriptUrl) {
    try {
      const response = await fetch(`${config.scriptUrl}?action=getBeneficiaries`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result = await response.json();
      if (result && result.success) {
        const beneficiaries = Array.isArray(result.data) ? result.data : [];
        const users = Array.isArray(result.users) ? result.users : Array.isArray(result.members) ? result.members : [];
        
        setCachedBeneficiaries(beneficiaries);
        setCachedUsers(users);
        
        return { 
          data: beneficiaries, 
          users: users, 
          source: 'live_api', 
          isLive: true, 
          scriptUrl: config.scriptUrl 
        };
      } else {
        throw new Error(result.error || 'Google Apps Script invalid response format');
      }
    } catch (err) {
      console.warn('Failed to fetch from Google Apps Script:', err);
      const fallback = cached || [];
      return { 
        data: fallback, 
        users: cachedUsers, 
        source: 'fallback', 
        isLive: true, 
        error: err.message, 
        scriptUrl: config.scriptUrl 
      };
    }
  }

  const emptyData = cached || [];
  return { data: emptyData, users: cachedUsers, source: 'unconfigured', isLive: true, scriptUrl: '' };
};

/**
 * Update beneficiary mobile number and record who updated it
 */
export const updateBeneficiaryMobile = async (beneficiary_id, mobile_no, updated_by = '') => {
  const config = getApiConfig();
  const now = new Date().toISOString();
  const cleanMobile = mobile_no.trim();
  const newStatus = cleanMobile ? 'completed' : 'pending';

  // 1. Update in Local Storage Cache immediately
  const currentData = getCachedBeneficiaries() || [];
  const updatedData = currentData.map((item) => {
    if (item.beneficiary_id === beneficiary_id) {
      return {
        ...item,
        mobile_no: cleanMobile,
        status: newStatus,
        updated_at: now,
        updated_by: updated_by || item.updated_by || '',
        sevana_status: item.sevana_status || 'pending',
      };
    }
    return item;
  });
  setCachedBeneficiaries(updatedData);

  // 2. Sync with Google Apps Script
  if (config.scriptUrl) {
    try {
      const payload = {
        beneficiary_id,
        mobile_no: cleanMobile,
        status: newStatus,
        updated_at: now,
        updated_by: updated_by,
      };

      const response = await fetch(config.scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      return {
        success: true,
        beneficiary_id,
        mobile_no: cleanMobile,
        status: newStatus,
        updated_at: now,
        updated_by,
        synced: true,
        apiResult: result,
      };
    } catch (err) {
      console.warn('Network sync failed, queued offline:', err);
      queueOfflineUpdate({ beneficiary_id, mobile_no: cleanMobile, updated_at: now, updated_by });
      return {
        success: true,
        beneficiary_id,
        mobile_no: cleanMobile,
        status: newStatus,
        updated_at: now,
        updated_by,
        synced: false,
        offline: true,
      };
    }
  }

};

/**
 * Update beneficiary status (e.g. 'deceased', 'pending', 'completed')
 */
export const updateBeneficiaryStatus = async (beneficiary_id, status = 'deceased', updated_by = '') => {
  const config = getApiConfig();
  const now = new Date().toISOString();

  // 1. Update in Local Storage Cache immediately
  const currentData = getCachedBeneficiaries() || [];
  const updatedData = currentData.map((item) => {
    if (item.beneficiary_id === beneficiary_id) {
      return {
        ...item,
        status: status,
        updated_at: now,
        updated_by: updated_by || item.updated_by || '',
      };
    }
    return item;
  });
  setCachedBeneficiaries(updatedData);

  // 2. Sync with Google Apps Script
  if (config.scriptUrl) {
    try {
      const payload = {
        action: 'updateStatus',
        beneficiary_id,
        status,
        updated_at: now,
        updated_by,
      };

      const response = await fetch(config.scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      return {
        success: true,
        beneficiary_id,
        status,
        updated_at: now,
        updated_by,
        synced: true,
        apiResult: result,
      };
    } catch (err) {
      console.warn('Status update network sync failed, queued offline:', err);
      queueOfflineUpdate({ beneficiary_id, status, updated_at: now, updated_by });
      return {
        success: true,
        beneficiary_id,
        status,
        updated_at: now,
        updated_by,
        synced: false,
        offline: true,
      };
    }
  }

  return {
    success: true,
    beneficiary_id,
    status,
    updated_at: now,
    updated_by,
    synced: false,
  };
};

/**
 * Update Sevana Software Sync Status (Employee Feature)
 */
export const updateBeneficiarySevanaStatus = async (beneficiaryIds, sevanaStatus = 'synced', syncedBy = '') => {
  const config = getApiConfig();
  const now = new Date().toISOString();
  const idsArray = Array.isArray(beneficiaryIds) ? beneficiaryIds : [beneficiaryIds];

  // 1. Update in Local Storage Cache immediately
  const currentData = getCachedBeneficiaries() || [];
  const updatedData = currentData.map((item) => {
    if (idsArray.includes(item.beneficiary_id)) {
      return {
        ...item,
        sevana_status: sevanaStatus,
        sevana_synced_at: sevanaStatus === 'synced' ? now : null,
        sevana_synced_by: sevanaStatus === 'synced' ? syncedBy : '',
      };
    }
    return item;
  });
  setCachedBeneficiaries(updatedData);

  // 2. Sync with Google Apps Script
  if (config.scriptUrl) {
    try {
      const payload = {
        action: 'updateSevanaStatus',
        beneficiary_ids: idsArray,
        sevana_status: sevanaStatus,
        synced_by: syncedBy,
      };

      const response = await fetch(config.scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      return {
        success: true,
        beneficiary_ids: idsArray,
        sevana_status: sevanaStatus,
        synced_by: syncedBy,
        synced_at: now,
        synced: true,
        apiResult: result,
      };
    } catch (err) {
      console.warn('Sevana status network sync failed:', err);
      return {
        success: true,
        beneficiary_ids: idsArray,
        sevana_status: sevanaStatus,
        synced_by: syncedBy,
        synced_at: now,
        synced: false,
        offline: true,
      };
    }
  }

  return {
    success: true,
    beneficiary_ids: idsArray,
    sevana_status: sevanaStatus,
    synced_by: syncedBy,
    synced_at: now,
    synced: false,
  };
};

/**
 * Add / Update User (Admin Feature)
 */
export const addNewUser = async (userData) => {
  const config = getApiConfig();
  const now = new Date().toISOString();
  const newUser = {
    ward: String(userData.ward || 'All'),
    name: userData.name.trim(),
    mobile: userData.mobile.trim().replace(/\D/g, ''),
    role: userData.role || 'Ward Member',
    status: userData.status || 'Active',
    created_at: now,
  };

  // 1. Update in Local Storage Cache immediately
  const currentUsers = getCachedUsers() || [];
  const existingIdx = currentUsers.findIndex((u) => u.mobile === newUser.mobile);
  let updatedUsers;
  if (existingIdx !== -1) {
    updatedUsers = [...currentUsers];
    updatedUsers[existingIdx] = { ...updatedUsers[existingIdx], ...newUser };
  } else {
    updatedUsers = [...currentUsers, newUser];
  }
  setCachedUsers(updatedUsers);

  // 2. Sync with Google Apps Script
  if (config.scriptUrl) {
    try {
      const payload = {
        action: 'addUser',
        ...newUser,
      };

      const response = await fetch(config.scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      return { success: true, user: newUser, synced: true, apiResult: result };
    } catch (err) {
      console.warn('Add user network sync failed:', err);
      return { success: true, user: newUser, synced: false, offline: true };
    }
  }

  return { success: true, user: newUser, synced: false };
};

export const queueOfflineUpdate = (item) => {
  try {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    queue.push(item);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Error queueing offline update:', e);
  }
};
