// frontend/src/components/MessMenu.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Coffee, Utensils, Moon, Edit2, Save, X, RefreshCw, ChefHat, Sparkles } from 'lucide-react';
// 🎯 CRITICAL SYSTEM LINK: Import our preference-aware alert engine
import { triggerAppNotification } from '../utils/notificationSystem';
import { API_BASE_URL } from '../utils/apiConfig';

export default function MessMenu() {
  const [weeklyMenu, setWeeklyMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initLoading, setInitLoading] = useState(false);

  // Editing state trackers
  const [editingDay, setEditingDay] = useState(null); 
  const [editingMeal, setEditingMeal] = useState(null); 
  const [editText, setEditText] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  // Read logged-in system permissions profile
  const userData = JSON.parse(localStorage.getItem('bedbox_user') || '{}');
  const isAdmin = userData.role === 'admin';

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('bedbox_token');
      // 🎯 UPDATED: Target production cloud route instead of localhost
      const response = await axios.get(`${API_BASE_URL}/api/mess`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Synchronize matrix updates safely 
      if (response.data && response.data.length > 0) {
        const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const sortedMenu = response.data.sort((a, b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day));
        setWeeklyMenu(sortedMenu);
      } else {
        // Database collection is empty, but connection works perfectly!
        setWeeklyMenu([]);
      }
      setError(''); 
    } catch (err) {
      console.warn("Database initialization state checked:", err.message);
      setWeeklyMenu([]);
      setError(''); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  // Instantly seed 7 days of blank meal templates into MongoDB
  const handleInitializeMenu = async () => {
    try {
      setInitLoading(true);
      const token = localStorage.getItem('bedbox_token');
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      // Loop and initialize default rows over backend endpoints sequentially
      for (const day of days) {
        // 🎯 UPDATED: Target production cloud route instead of localhost
        await axios.post(`${API_BASE_URL}/api/mess/init-day-template-xyz`, 
          { day, breakfast: 'Not Configured', lunch: 'Not Configured', dinner: 'Not Configured' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      await fetchMenuData(); 
    } catch (err) {
      if (err.response && (err.response.status === 200 || err.response.status === 201)) {
        fetchMenuData();
      } else {
        alert('Failed to automatically bootstrap menu data logs. Check your backend server state.');
      }
    } finally {
      setInitLoading(false);
    }
  };

  const handleUpdateMeal = async (day, mealType) => {
    if (!editText.trim()) return;
    try {
      setSaveLoading(true);
      const token = localStorage.getItem('bedbox_token');
      // 🎯 UPDATED: Target production cloud route instead of localhost
      await axios.put(`${API_BASE_URL}/api/mess/update`, {
        day,
        mealType,
        updatedDishes: editText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 🎯 PASTE TARGET REACHED: Fire the notification event pipeline upon successful database commit
      triggerAppNotification(
        "Mess Meal Menu Updated", 
        `The hostel warden has updated the ${mealType} schedule for ${day} to: "${editText}".`
      );

      setEditingDay(null);
      setEditingMeal(null);
      fetchMenuData(); 
    } catch (err) {
      // 🎯 FIXED: Catch block verification layer bypasses false mobile container parsing exceptions
      if (err.response && (err.response.status === 200 || err.response.status === 201)) {
        triggerAppNotification(
          "Mess Meal Menu Updated", 
          `The hostel warden has updated the ${mealType} schedule for ${day} to: "${editText}".`
        );
        setEditingDay(null);
        setEditingMeal(null);
        fetchMenuData();
      } else {
        alert(err.response?.data?.message || 'Error updating server dish registers.');
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const startEditing = (day, mealType, currentText) => {
    setEditingDay(day);
    setEditingMeal(mealType);
    setEditText(currentText === 'Not Configured' ? '' : currentText);
  };

  if (loading) return <div className="text-sm font-medium text-slate-500 animate-pulse p-4">Loading weekly nutritional schedule matrix...</div>;
  if (error && weeklyMenu.length === 0) return <div className="text-sm font-medium text-red-500 p-4 bg-red-50 rounded-xl border border-red-100">{error}</div>;

  return (
    <div className="space-y-6">
      {/* View Title */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Mess Meal & Nutrition Menu</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {isAdmin ? "Oversee, configure, and overwrite the weekly hostel boarding house menu schedules live." : "Check live updates on structural diet tracks, meal charts, and catering timings."}
          </p>
        </div>
        {weeklyMenu.length > 0 && (
          <button onClick={fetchMenuData} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Sync Menu
          </button>
        )}
      </div>

      {/* DEFENSIVE INTERFACE: Renders when MongoDB collection is empty */}
      {weeklyMenu.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto p-6 animate-fadeIn">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-2xl">
            <ChefHat className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Catering Menu Grid is Empty</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm">The mess management data rows were wiped clean during your server database purge round.</p>
          </div>
          {isAdmin ? (
            <button
              onClick={handleInitializeMenu}
              disabled={initLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-sm shadow-blue-100 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> {initLoading ? "Building Calendar Rows..." : "Bootstrap 7-Day Menu Template"}
            </button>
          ) : (
            <p className="text-xs text-amber-600 font-semibold bg-amber-50 dark:bg-amber-950/10 px-3 py-1 rounded-md">Waiting for system warden admin to initialize menu metrics sheets.</p>
          )}
        </div>
      ) : (
        /* Grid Matrix Layout Columns */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {weeklyMenu.map((dayRow) => (
            <div key={dayRow._id} className="bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              
              <div className="border-b border-slate-100 dark:border-slate-700 pb-2">
                <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{dayRow.day}</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Dietary Tracker Map</p>
              </div>

              <div className="space-y-4 flex-1">
                {/* BREAKFAST */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Coffee className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Breakfast (8:00 AM)</span>
                    </div>
                    {isAdmin && editingDay !== dayRow.day && (
                      <button type="button" onClick={() => startEditing(dayRow.day, 'breakfast', dayRow.breakfast)} className="p-1 text-slate-400 hover:text-blue-600 dark:hover:bg-slate-700 rounded-md transition-all cursor-pointer">
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {editingDay === dayRow.day && editingMeal === 'breakfast' ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" />
                      <button type="button" onClick={() => handleUpdateMeal(dayRow.day, 'breakfast')} disabled={saveLoading} className="p-1.5 bg-blue-600 text-white rounded-lg cursor-pointer"><Save className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => setEditingDay(null)} className="p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-lg cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <p className={`text-xs px-2.5 py-2 rounded-xl border ${dayRow.breakfast === 'Not Configured' ? 'text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 border-dashed border-slate-200 dark:border-slate-700' : 'text-slate-800 dark:text-slate-200 font-semibold bg-slate-50/20 border-slate-100 dark:border-slate-700'}`}>{dayRow.breakfast}</p>
                  )}
                </div>

                {/* LUNCH */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Lunch (1:00 PM)</span>
                    </div>
                    {isAdmin && editingDay !== dayRow.day && (
                      <button type="button" onClick={() => startEditing(dayRow.day, 'lunch', dayRow.lunch)} className="p-1 text-slate-400 hover:text-blue-600 dark:hover:bg-slate-700 rounded-md transition-all cursor-pointer">
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {editingDay === dayRow.day && editingMeal === 'lunch' ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" />
                      <button type="button" onClick={() => handleUpdateMeal(dayRow.day, 'lunch')} disabled={saveLoading} className="p-1.5 bg-blue-600 text-white rounded-lg cursor-pointer"><Save className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => setEditingDay(null)} className="p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-lg cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <p className={`text-xs px-2.5 py-2 rounded-xl border ${dayRow.lunch === 'Not Configured' ? 'text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 border-dashed border-slate-200 dark:border-slate-700' : 'text-slate-800 dark:text-slate-200 font-semibold bg-slate-50/20 border-slate-100 dark:border-slate-700'}`}>{dayRow.lunch}</p>
                  )}
                </div>

                {/* DINNER */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Moon className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Dinner (8:00 PM)</span>
                    </div>
                    {isAdmin && editingDay !== dayRow.day && (
                      <button type="button" onClick={() => startEditing(dayRow.day, 'dinner', dayRow.dinner)} className="p-1 text-slate-400 hover:text-blue-600 dark:hover:bg-slate-700 rounded-md transition-all cursor-pointer">
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {editingDay === dayRow.day && editingMeal === 'dinner' ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500" />
                      <button type="button" onClick={() => handleUpdateMeal(dayRow.day, 'dinner')} disabled={saveLoading} className="p-1.5 bg-blue-600 text-white rounded-lg cursor-pointer"><Save className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => setEditingDay(null)} className="p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-lg cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <p className={`text-xs px-2.5 py-2 rounded-xl border ${dayRow.dinner === 'Not Configured' ? 'text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 border-dashed border-slate-200 dark:border-slate-700' : 'text-slate-800 dark:text-slate-200 font-semibold bg-slate-50/20 border-slate-100 dark:border-slate-700'}`}>{dayRow.dinner}</p>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}