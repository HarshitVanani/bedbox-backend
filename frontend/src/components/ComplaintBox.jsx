// frontend/src/components/ComplaintBox.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';
import { ClipboardList, AlertCircle, CheckCircle, Clock, Send, RefreshCw } from 'lucide-react';
// 🎯 CRITICAL SYSTEM LINK: Import our preference-aware alert engine
import { triggerAppNotification } from '../utils/notificationSystem';

export default function ComplaintBox() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form Fields State (For Student Use Only)
  const [title, setTitle] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [description, setDescription] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Extract logged-in user context session credentials
  const userData = JSON.parse(localStorage.getItem('bedbox_user') || '{}');
  const isAdmin = userData.role === 'admin';

  const fetchComplaintsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('bedbox_token');
      // 🎯 UPDATED: Target production cloud route
      const response = await axios.get(`${API_BASE_URL}/api/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(response.data);
      setError('');
    } catch (err) {
      setError('Could not retrieve maintenance tickets ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintsData();
  }, []);

  // 1. Submit a brand new maintenance issue request (Student Action)
  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!title || !roomNumber || !description) {
      alert('Please fully specify all form fields details.');
      return;
    }

    try {
      setSubmitLoading(true);
      const token = localStorage.getItem('bedbox_token');
      
      // Send the data package down the pipeline
      await axios.post(`${API_BASE_URL}/api/complaints`, 
        { title, roomNumber, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // 🎯 STANDARD SUCCESS PROCESSING
      triggerAppNotification(
        "New Maintenance Ticket Filed",
        `Issue regarding "${title}" has been successfully logged for Room ${roomNumber}.`
      );
      setSuccessMsg('Maintenance ticket logged successfully!');
      setTitle('');
      setRoomNumber('');
      setDescription('');
      fetchComplaintsData(); // Reload list view elements
      setTimeout(() => setSuccessMsg(''), 3000);

    } catch (err) {
      // 🎯 FIXED: Check fallback network indicators to catch silent webview parsed commits
      const serverStatus = err.response?.status || err.request?.status;
      
      if (serverStatus === 200 || serverStatus === 201) {
        triggerAppNotification(
          "New Maintenance Ticket Filed",
          `Issue regarding "${title}" has been successfully logged for Room ${roomNumber}.`
        );
        setSuccessMsg('Maintenance ticket logged successfully!');
        setTitle('');
        setRoomNumber('');
        setDescription('');
        fetchComplaintsData(); // Hot-reload data logs to clear visual delays
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        // True connectivity breakdown path
        alert('Failed to log problem entry ticket.');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // 2. Change ticket status state instantly (Admin Action)
  const handleUpdateStatus = async (complaintId, nextStatus) => {
    try {
      const token = localStorage.getItem('bedbox_token');
      
      // Grab localized targeted row reference before sending state update
      const targetTicket = complaints.find(c => c._id === complaintId);
      
      // 🎯 UPDATED: Target production cloud route
      await axios.put(`${API_BASE_URL}/api/complaints/resolve`, 
        { complaintId, nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 🎯 PASTE TARGET REACHED: Fire real-time notification based on status level change
      if (targetTicket) {
        const actionLabel = nextStatus === 'In Progress' ? "Placed Under Investigation" : "Marked Fully Resolved";
        triggerAppNotification(
          `Ticket Status: ${nextStatus}`,
          `The complaint regarding "${targetTicket.title}" for Room ${targetTicket.roomNumber} has been ${actionLabel}.`
        );
      }

      fetchComplaintsData();
    } catch (err) {
      // 🎯 FIXED: Catch block verification layer bypasses false mobile container parser errors
      const serverStatus = err.response?.status || err.request?.status;

      if (serverStatus === 200 || serverStatus === 201) {
        const targetTicket = complaints.find(c => c._id === complaintId);
        if (targetTicket) {
          const actionLabel = nextStatus === 'In Progress' ? "Placed Under Investigation" : "Marked Fully Resolved";
          triggerAppNotification(
            `Ticket Status: ${nextStatus}`,
            `The complaint regarding "${targetTicket.title}" for Room ${targetTicket.roomNumber} has been ${actionLabel}.`
          );
        }
        fetchComplaintsData();
      } else {
        alert('Error updating ticket timeline tracking status.');
      }
    }
  };

  if (loading) return <div className="text-sm font-medium text-slate-500 animate-pulse p-4">Loading active problem ticket matrices...</div>;

  return (
    <div className="space-y-6">
      {/* Dynamic View Title Row */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Hostel Maintenance Ticket Box</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {isAdmin ? "Oversee, organize, and resolve all submitted emergency infrastructure logs." : "Log structural defects or service malfunctions instantly to system management."}
          </p>
        </div>
        <button onClick={fetchComplaintsData} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" /> Synchronize Logs
        </button>
      </div>

      {error && <div className="text-sm text-red-500 p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 rounded-xl">{error}</div>}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* LEFT COMPONENT: Student Input Form Panel (Hidden automatically for Admins) */}
        {!isAdmin && (
          <div className="w-full lg:w-1/3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4 transition-colors duration-200">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-600" /> Log Problem Ticket
            </h4>
            
            {successMsg && (
              <div className="p-2.5 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmitTicket} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Issue Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Room Wifi Not Connecting" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Room / Location Code</label>
                <input type="text" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="e.g., 101-B or Mess Hall" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Elaborate Description</label>
                <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide full explicit details regarding the problem encountered..." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 transition-all resize-none" />
              </div>
              <button type="submit" disabled={submitLoading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer">
                <Send className="w-3.5 h-3.5" /> {submitLoading ? "Filing..." : "File Issue Ticket"}
              </button>
            </form>
          </div>
        )}

        {/* RIGHT COMPONENT: Master Tracking History Table Layout Ledger */}
        <div className={`w-full ${isAdmin ? 'lg:w-full' : 'lg:w-2/3'} bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm overflow-hidden transition-colors duration-200`}>
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">
            {isAdmin ? "Global Infrastructure Tickets Register" : "Your Personal Tickets Status History"}
          </h4>

          {complaints.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">No operational problem tickets recorded on system database.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/20">
                    {isAdmin && <th className="py-3 px-4">Resident</th>}
                    <th className="py-3 px-4">Room</th>
                    <th className="py-3 px-4">Problem Context</th>
                    <th className="py-3 px-4">Tracking State</th>
                    {isAdmin && <th className="py-3 px-4 text-right">Management Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
                  {complaints.map((item) => {
                    const isPending = item.status === 'Pending';
                    const isProgress = item.status === 'In Progress';
                    
                    return (
                      <tr key={item._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-all font-medium text-slate-600 dark:text-slate-300">
                        {isAdmin && <th className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200 capitalize text-left">{item.studentName}</th>}
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">Room {item.roomNumber}</td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.title}</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">{item.description}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                            isPending ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30' :
                            isProgress ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/30' : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                          }`}>
                            {isPending ? <Clock className="w-3 h-3" /> : isProgress ? <AlertCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                            {item.status}
                          </span>
                        </td>
                        
                        {/* Admin Inline Logic Action Toggles Row */}
                        {isAdmin && (
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center gap-1.5 justify-end">
                              {isPending && (
                                <button onClick={() => handleUpdateStatus(item._id, 'In Progress')} className="px-2.5 py-1 bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-600 text-[10px] font-bold rounded-lg transition-all shadow-sm cursor-pointer">
                                  Investigate
                                </button>
                              )}
                              {(isPending || isProgress) && (
                                <button onClick={() => handleUpdateStatus(item._id, 'Resolved')} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition-all shadow-sm border border-emerald-600 cursor-pointer">
                                  Resolve
                                </button>
                              )}
                              {item.status === 'Resolved' && (
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-2 tracking-wider italic">Closed Out</span>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}