// frontend/src/components/MaintenancePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';
import { Wrench, Trash2, AlertTriangle, PlusCircle, Clock } from 'lucide-react';

export default function MaintenancePage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form States (For Admin)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [areaOrLocation, setAreaOrLocation] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Check if logged-in user is Admin
  const userData = JSON.parse(localStorage.getItem('bedbox_user') || '{}');
  const isAdmin = userData.role === 'admin';

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('bedbox_token');
      const response = await axios.get(`${API_BASE_URL}/api/maintenance-notices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotices(response.data);
    } catch (err) {
      console.error('Error fetching maintenance updates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!title || !description || !areaOrLocation) {
      alert('Please fill in all entry fields.');
      return;
    }

    try {
      setSubmitLoading(true);
      const token = localStorage.getItem('bedbox_token');
      await axios.post(`${API_BASE_URL}/api/maintenance-notices/create`, 
        { title, description, areaOrLocation },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTitle('');
      setDescription('');
      setAreaOrLocation('');
      fetchNotices(); // Reload the list instantly
    } catch (err) {
      alert('Failed to publish maintenance notice.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Mark this task as completed and remove the notice?')) return;
    try {
      const token = localStorage.getItem('bedbox_token');
      await axios.delete(`https://bedbox-backend.onrender.com/api/maintenance-notices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotices(); // Reload list instantly
    } catch (err) {
      alert('Error clearing the notice update.');
    }
  };

  if (loading) return <div className="text-xs font-medium text-slate-400 animate-pulse p-4">Syncing live maintenance deck...</div>;

  return (
    <div className="space-y-6 mt-4 animate-fadeIn">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Maintenance & Repair Desk</h3>
        <p className="text-xs text-slate-400">Track active facility operations, utility downtime windows, and structural repair logs.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT COLUMN: Admin Creation Panel */}
        {isAdmin && (
          <form onSubmit={handleCreateNotice} className="w-full lg:w-[340px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4 shrink-0">
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-blue-600" /> Log Repair Task
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Issue / Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Water Pipeline Repair" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Impacted Area / Location</label>
                {/* 🎯 FIXED: Changed areaOrLocation(e.target.value) to setAreaOrLocation(e.target.value) */}
                <input type="text" value={areaOrLocation} onChange={(e) => setAreaOrLocation(e.target.value)} placeholder="e.g., Block B Washrooms" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description / Timeline Notice</label>
                <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Water supply will be unavailable from 2:00 PM to 4:00 PM for maintenance." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100 resize-none" />
              </div>

              <button type="submit" disabled={submitLoading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer">
                <Wrench className="w-3.5 h-3.5" /> {submitLoading ? "Publishing Notice..." : "Broadcast Notice"}
              </button>
            </div>
          </form>
        )}

        {/* RIGHT COLUMN: Interactive Notice Board Feed (Visible to both Students and Admin) */}
        <div className="flex-1 w-full space-y-4">
          <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Active Board Notices</h4>

          {notices.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-10 text-center shadow-sm">
              <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-medium">All systems operational. No active maintenance notices found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {notices.map((notice) => (
                <div key={notice._id} className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex items-start justify-between gap-4 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-slate-900 dark:text-slate-100">{notice.title}</span>
                      <span className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">{notice.areaOrLocation}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-2xl">{notice.description}</p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                      <Clock className="w-3 h-3" /> Logged on: {new Date(notice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>

                  {/* Delete Option for Admin Mode Only */}
                  {isAdmin && (
                    <button onClick={() => handleDeleteNotice(notice._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all cursor-pointer shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}