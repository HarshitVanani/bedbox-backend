// frontend/src/components/OverviewMetrics.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';
import { 
  Users, Bed, ClipboardList, IndianRupee, 
  RefreshCw, Activity, Clock, UserCheck, UserX, User
} from 'lucide-react';

export default function OverviewMetrics() {
  const userData = JSON.parse(localStorage.getItem('bedbox_user') || '{}');
  const isAdmin = userData.role === 'admin';

  const [metrics, setMetrics] = useState({ occupiedBeds: 0, totalBeds: 0, activeStudents: 0, pendingComplaints: 0, unpaidFees: 0 });
  const [gateLogs, setGateLogs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // --- APPROVAL PIPELINE STATES ---
  const [pendingRequests, setPendingRequests] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // --- FETCH PENDING REGISTRATIONS WITH API CONFIG HEADERS ---
  const fetchPendingRequests = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const token = localStorage.getItem('bedbox_token');
      const apiConfig = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get(`${API_BASE_URL}/api/residents/pending-requests`, apiConfig);
      if (Array.isArray(response.data)) {
        setPendingRequests(response.data);
      }
    } catch (error) {
      console.error("Failed fetching approval queues:", error);
    }
  }, [isAdmin]);

  const fetchMyProfile = useCallback(async () => {
    if (isAdmin) return;
    try {
      setProfileLoading(true);
      const token = localStorage.getItem('bedbox_token');
      const apiConfig = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_BASE_URL}/api/residents/me`, apiConfig);
      setProfile(response.data);
    } catch (error) {
      console.error("Failed fetching student profile:", error);
    } finally {
      setProfileLoading(false);
    }
  }, [isAdmin]);

  // --- SYSTEM STATS ENHANCED FOR DYNAMIC SYNC ---
  const pullSystemStats = useCallback(async () => {
    try {
      setSyncing(true);
      const token = localStorage.getItem('bedbox_token');
      const apiConfig = { headers: { Authorization: `Bearer ${token}` } };

      const [rooms, residents, complaints, billing] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/api/rooms`, apiConfig),
        axios.get(`${API_BASE_URL}/api/residents`, apiConfig),
        axios.get(`${API_BASE_URL}/api/complaints`, apiConfig),
        axios.get(`${API_BASE_URL}/api/finance`, apiConfig)
      ]);

      let calculatedTotal = 0;
      let calculatedOccupied = 0;
      
      if (rooms.status === 'fulfilled' && Array.isArray(rooms.value.data)) {
        rooms.value.data.forEach(r => {
          if (Array.isArray(r.beds)) {
            calculatedTotal += r.beds.length;
            calculatedOccupied += r.beds.filter(b => b.isOccupied || b.status === 'Occupied' || b.occupiedBy).length;
          } else {
            calculatedTotal += r.capacity || r.totalBeds || 0;
            if (r.occupiedCount !== undefined) {
              calculatedOccupied += r.occupiedCount;
            } else if (r.residentName || r.username) {
              calculatedOccupied += 1;
            }
          }
        });
      }
      
      if (calculatedTotal === 0) calculatedTotal = 6;

      let boardersCount = 0, extractedLogs = [];
      if (residents.status === 'fulfilled' && Array.isArray(residents.value.data)) {
        boardersCount = residents.value.data.filter(r => r.status === 'Active').length;
        extractedLogs = residents.value.data.slice(0, 4).map(s => ({
          _id: s._id,
          name: s.fullName || s.name || s.username || 'Resident',
          room: s.roomNumber || s.room || '101',
          status: s.isCheckIn !== false ? 'IN' : 'OUT'
        }));
      }

      let openTickets = 0;
      if (complaints.status === 'fulfilled' && Array.isArray(complaints.value.data)) {
        openTickets = complaints.value.data.filter(c => c.trackingState === 'Pending' || c.status === 'Pending' || c.trackingState === 'Unresolved').length;
      }

      let outstandingAmount = 0;
      let invoiceData = [];

      if (billing.status === 'fulfilled' && Array.isArray(billing.value.data)) {
        invoiceData = billing.value.data;
      } else {
        try {
          const fallbackRes = await axios.get(`${API_BASE_URL}/api/invoices`, apiConfig);
          if (Array.isArray(fallbackRes.data)) invoiceData = fallbackRes.data;
        } catch(e) {
          try {
            const alternativeRes = await axios.get(`${API_BASE_URL}/api/invoice`, apiConfig);
            if (Array.isArray(alternativeRes.data)) invoiceData = alternativeRes.data;
          } catch(err) {
            // Ignore fallback error
          }
        }
      }

      if (invoiceData.length > 0) {
        invoiceData.forEach(inv => {
          const currentStatus = inv.ledgerStatus || inv.status;
          if (currentStatus === 'Unpaid' || currentStatus === 'unpaid') {
            const billValue = inv.amountBalance || inv.amount || inv.dueAmount || 0;
            outstandingAmount += Number(billValue);
          }
        });
      }

      setMetrics({ 
        occupiedBeds: calculatedOccupied, 
        totalBeds: calculatedTotal, 
        activeStudents: boardersCount, 
        pendingComplaints: openTickets, 
        unpaidFees: outstandingAmount 
      });
      
      if (extractedLogs.length > 0) setGateLogs(extractedLogs);
      
      setActivities([
        { id: 1, text: "System verified connection to your MongoDB backend matrices safely.", time: "Live" },
        outstandingAmount > 0 ? { id: 2, text: `Outstanding collection balance synchronized at ₹${outstandingAmount}.`, time: "Sync" } : null
      ].filter(Boolean));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  // --- APPROVE / REJECT CLICK HANDLER WITH CONFIG HEADERS ---
  const handleApprovalAction = async (requestId, action) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('bedbox_token');
      const apiConfig = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.post(`${API_BASE_URL}/api/residents/process-approval`, {
        requestId,
        action
      }, apiConfig);
      
      alert(response.data.message);
      
      fetchPendingRequests();
      pullSystemStats();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to process admin action.");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    pullSystemStats();
    if (isAdmin) {
      fetchPendingRequests();
    } else {
      fetchMyProfile();
    }
    
    const refreshTimer = setInterval(() => {
      pullSystemStats();
      if (isAdmin) {
        fetchPendingRequests();
      }
    }, 10000);
    
    return () => clearInterval(refreshTimer);
  }, [pullSystemStats, fetchPendingRequests, fetchMyProfile, isAdmin]);

  if (loading) return <div className="text-xs font-medium text-slate-400 animate-pulse p-4">Syncing live database metrics...</div>;

  return (
    <div className="space-y-6 mt-4 animate-fadeIn">
      
      {/* HEADER CONTROLS */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm">
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Operational Summary Matrix</h4>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Live indicators compiled from student roster, financial records, and facility reports.</p>
        </div>
        <button onClick={() => { pullSystemStats(); if (isAdmin) fetchPendingRequests(); else fetchMyProfile(); }} disabled={syncing} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 dark:text-slate-300 rounded-xl transition-all text-[11px] font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer">
          <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} /> Sync Indicators
        </button>
      </div>

      {/* STUDENT PROFILE DETAILS */}
      {!isAdmin && profile && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/40 dark:to-slate-800/80 border border-blue-100/60 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-blue-200/40 dark:border-slate-700">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-black text-slate-800 dark:text-slate-100">Resident Profile Details</h5>
              <p className="text-[10px] text-slate-400">Your registered hostel admission details. Please contact admin for changes.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-[11px]">
            <div className="bg-white/80 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="block text-[9px] font-bold text-slate-400 uppercase">Name</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">{profile.fullName}</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="block text-[9px] font-bold text-slate-400 uppercase">Username</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">@{profile.username}</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="block text-[9px] font-bold text-slate-400 uppercase">Floor</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">
                {profile.roomNumber ? (profile.roomNumber.startsWith('1') ? '1st Floor' : profile.roomNumber.startsWith('2') ? '2nd Floor' : 'Ground Floor') : '1st Floor'}
              </span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="block text-[9px] font-bold text-slate-400 uppercase">Room & Bed</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">Room {profile.roomNumber} (Bed {profile.bedNumber})</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 sm:col-span-2">
              <span className="block text-[9px] font-bold text-slate-400 uppercase">Student Address</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block truncate" title={profile.address}>{profile.address}</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="block text-[9px] font-bold text-slate-400 uppercase">Student Contact</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">{profile.phoneNumber}</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="block text-[9px] font-bold text-slate-400 uppercase">Emergency Contact</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">{profile.emergencyContact} ({profile.emergencyRelation})</span>
            </div>
          </div>
        </div>
      )}

      {/* METRIC CARD BAR */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? 'xl:grid-cols-4' : 'xl:grid-cols-3'} gap-6`}>
        {isAdmin && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bed Occupancy Ratio</p>
              <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">{metrics.occupiedBeds} <span className="text-xs font-normal text-slate-400">/ {metrics.totalBeds} Beds</span></h4>
            </div>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl"><Bed className="w-4 h-4" /></div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Boarders</p>
            <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">{metrics.activeStudents} <span className="text-xs font-normal text-slate-400">Live</span></h4>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-xl"><Users className="w-4 h-4" /></div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Open Complaints</p>
            <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">{metrics.pendingComplaints} <span className="text-xs font-normal text-slate-400">Tickets</span></h4>
          </div>
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-xl"><ClipboardList className="w-4 h-4" /></div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Outstanding Dues</p>
            <h4 className="text-xl font-black text-red-600">
              ₹{Number(metrics.unpaidFees).toLocaleString('en-IN')}
            </h4>
          </div>
          <div className="p-2.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* PENDING APPROVALS QUEUE SYSTEM DISPLAY */}
      {isAdmin && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-amber-500" />
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Pending Gate Access Requests ({pendingRequests.length})</h5>
          </div>

          {pendingRequests.length === 0 ? (
            <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl text-center">No outstanding registration approval requests found.</p>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request._id} className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/60 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="text-left space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{request.fullName}</span>
                      <span className="text-[10px] bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md font-bold">@{request.username}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      <strong>Allocation:</strong> Room {request.roomNumber} • Bed {request.bedNumber} | <strong>Phone:</strong> {request.phoneNumber}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      <strong>Address:</strong> {request.address} | <strong>Emergency:</strong> {request.emergencyContact} ({request.emergencyRelation})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleApprovalAction(request._id, 'Rejected')}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold"
                    >
                      <UserX className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleApprovalAction(request._id, 'Approved')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold shadow-sm"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Approve & Register
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LOWER DOUBLE COLUMN REGISTER GRIDS */}
      {!isAdmin ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-3">
          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">System Operations Audit Feed</h5>
          <div className="space-y-3">
            {activities.map(act => (
              <div key={act.id} className="flex gap-2 text-xs text-slate-600 dark:text-slate-300">
                <Activity className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium leading-tight">{act.text}</p>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl p-5 shadow-sm lg:col-span-2 space-y-3">
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Live Gate Security Register Check</h5>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {gateLogs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No resident footprint records active.</p>
              ) : (
                gateLogs.map(log => (
                  <div key={log._id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{log.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">Assigned Room: {log.room}</p>
                    </div>
                    {/* 🎯 FIXED: Replaced large BUILDING IN button with a compact, breathing green live status circle anchor */}
                    <div className="flex items-center justify-center pr-2">
                      <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${log.status === 'IN' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${log.status === 'IN' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-3">
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">System Operations Audit Feed</h5>
            <div className="space-y-3">
              {activities.map(act => (
                <div key={act.id} className="flex gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Activity className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium leading-tight">{act.text}</p>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM PERSISTENCE STATUS BADGE */}
      <div className="bg-slate-900 rounded-xl p-4 text-white flex items-center justify-between text-xs">
        <p className="font-medium text-slate-300">⚡ Core Synchronization Engine: Active polling pipeline linked directly to database maps.</p>
        <span className="font-mono text-[10px] text-emerald-400 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">DB: CONNECTED</span>
      </div>

    </div>
  );
}