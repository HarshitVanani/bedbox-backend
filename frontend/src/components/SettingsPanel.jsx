// frontend/src/components/SettingsPanel.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';
import { 
  ShieldCheck, KeyRound, Lock, RefreshCw, 
  Sun, Moon, Bell, BellOff, Palette 
} from 'lucide-react';

export default function SettingsPanel() {
  // 1. Password Modification States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState({ text: '', isError: false });

  // 2. Preferences States (Pre-loaded directly from browser storage)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('bedbox_theme') === 'dark';
  });
  const [muteNotifications, setMuteNotifications] = useState(() => {
    return localStorage.getItem('bedbox_notifications') === 'muted';
  });

  // Read active session meta records
  const userData = JSON.parse(localStorage.getItem('bedbox_user') || '{}');
  const userRole = userData.role || 'student';

  // Watcher side-effect hook to rewrite theme classes seamlessly on state shifts
  useEffect(() => {
    const rootCanvas = document.documentElement;
    if (darkMode) {
      rootCanvas.classList.add('dark');
      localStorage.setItem('bedbox_theme', 'dark');
    } else {
      rootCanvas.classList.remove('dark');
      localStorage.setItem('bedbox_theme', 'light');
    }
  }, [darkMode]);

  // Handle local persistence toggle adjustments for notification flags
  const handleNotificationToggle = () => {
    const nextMuteState = !muteNotifications;
    setMuteNotifications(nextMuteState);
    localStorage.setItem('bedbox_notifications', nextMuteState ? 'muted' : 'active');
  };

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    setPassMessage({ text: '', isError: false });

    if (newPassword !== confirmPassword) {
      return setPassMessage({ text: 'New password signatures do not match validation criteria.', isError: true });
    }
    if (newPassword.length < 6) {
      return setPassMessage({ text: 'Security guidelines require passwords to be at least 6 characters long.', isError: true });
    }

    try {
      setPassLoading(true);
      const token = localStorage.getItem('bedbox_token');
      const response = await axios.put(`${API_BASE_URL}/api/auth/update-password`, 
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPassMessage({ text: response.data.message || 'Password records updated securely.', isError: false });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassMessage({ 
        text: err.response?.data?.message || 'Authentication failure. Please verify old credentials.', 
        isError: true 
      });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-4 space-y-6 animate-fadeIn transition-colors duration-200">
      
      {/* SECTION A: PREMIUM WORKSPACE PREFERENCES CARD */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-5">
        <h5 className="text-xs font-bold text-slate-700 dark:text-slate-200 tracking-wide uppercase flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-blue-500" /> System Display & Interface Settings
        </h5>

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          
          {/* FEATURE ROW 1: THEME CONFIGURATION SLIDER */}
          <div className="flex items-center justify-between py-4 first:pt-0">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Application Canvas Theme Mode</p>
              <p className="text-[11px] text-slate-400">Toggle between a crisp light dashboard layout or a high-contrast dark theme mode.</p>
            </div>
            <button 
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl transition-all border flex items-center gap-2 text-xs font-bold cursor-pointer ${
                darkMode 
                  ? 'bg-slate-700 border-slate-600 text-amber-400 hover:bg-slate-600' 
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {darkMode ? (
                <>
                  <Moon className="w-3.5 h-3.5" /> Midnight Mode Active
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5" /> Light Mode Active
                </>
              )}
            </button>
          </div>

          {/* FEATURE ROW 2: AUDIO AND POPUP NOTIFICATION CONTROLLER */}
          <div className="flex items-center justify-between py-4 last:pb-0">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Mute Real-time System Alerts</p>
              <p className="text-[11px] text-slate-400">Silence background sound triggers for incoming complaints, room deployments, or invoicing runs.</p>
            </div>
            <button 
              type="button"
              onClick={handleNotificationToggle}
              className={`p-2 rounded-xl transition-all border flex items-center gap-2 text-xs font-bold cursor-pointer ${
                muteNotifications 
                  ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400' 
                  : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {muteNotifications ? (
                <>
                  <BellOff className="w-3.5 h-3.5" /> Alerts Silenced
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5" /> Alerts Enabled
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* SECTION B: CORE PASSWORD SECURITY ENVELOPE */}
      <form onSubmit={handlePasswordResetSubmit} className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
        <h5 className="text-xs font-bold text-slate-700 dark:text-slate-200 tracking-wide uppercase flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-blue-500" /> Rotate Profile Access Credentials
        </h5>

        {passMessage.text && (
          <div className={`text-xs px-4 py-2.5 font-semibold rounded-xl border ${
            passMessage.isError 
              ? 'text-red-600 bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/50' 
              : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50'
          }`}>
            {passMessage.text}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">Current Secure Password</label>
            <input 
              type="password" 
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 font-mono text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">New Password Selection</label>
            <input 
              type="password" 
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 font-mono text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">Confirm New Password Signature</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 font-mono text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={passLoading}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          {passLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Computing Hashing Blocks...
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5" /> Commit Secure Password Overwrite
            </>
          )}
        </button>
      </form>

      {/* COMPLIANCE INFRASTRUCTURE ACCORD BADGE */}
      <div className="bg-slate-900 rounded-xl p-4 text-white flex items-center justify-between text-xs">
        <p className="font-medium text-slate-300">🔐 Profile Session Node: Verified under active <span className="font-bold text-blue-400 uppercase">[{userRole}]</span> parameters.</p>
        <span className="font-mono text-[9px] text-slate-400 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">Vault Version: 2.1.0 // Production</span>
      </div>

    </div>
  );
}