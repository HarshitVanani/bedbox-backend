// frontend/src/components/ResidentDirectory.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, LogOut, Phone, ShieldCheck, History, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export default function ResidentDirectory() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Form 1: Admission Onboarding State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [bedNumber, setBedNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Form 2: Check-Out Gate State
  const [outUsername, setOutUsername] = useState('');
  const [outPhone, setOutPhone] = useState('');
  const [outDate, setOutDate] = useState('');

  const fetchDirectoryLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('bedbox_token');
      // 🎯 UPDATED: Target production cloud route
      const response = await axios.get('https://bedbox-backend.onrender.com/api/residents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResidents(response.data);
      setError('');
    } catch (err) {
      setError('Could not establish synchronization pipeline with the resident database registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectoryLogs();
  }, []);

  // Handle Admission Register Submit Action
  const handleRegisterResident = async (e) => {
    e.preventDefault();
    if (!fullName || !username || !password || !roomNumber || !bedNumber || !phoneNumber || !emergencyContact) {
      alert('Please fully specify all student registration details.');
      return;
    }
    try {
      setActionLoading(true);
      const token = localStorage.getItem('bedbox_token');
      // 🎯 UPDATED: Target production cloud route
      await axios.post('https://bedbox-backend.onrender.com/api/residents/register', {
        fullName, username, password, roomNumber, bedNumber, phoneNumber, emergencyContact
      }, { headers: { Authorization: `Bearer ${token}` } });

      alert('Resident onboarded & bed slot marked Occupied!');
      setFullName(''); setUsername(''); setPassword(''); setRoomNumber(''); setBedNumber(''); setPhoneNumber(''); setEmergencyContact('');
      fetchDirectoryLogs();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in entry error.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Check-Out Gate Archive Action Submit
  const handleCheckOutResident = async (e) => {
    e.preventDefault();
    if (!outUsername || !outPhone || !outDate) {
      alert('Please specify username, phone number, and exit target date fields.');
      return;
    }
    try {
      setActionLoading(true);
      const token = localStorage.getItem('bedbox_token');
      // 🎯 UPDATED: Target production cloud route
      const response = await axios.post('https://bedbox-backend.onrender.com/api/residents/checkout', {
        username: outUsername,
        phoneNumber: outPhone,
        checkOutDate: outDate
      }, { headers: { Authorization: `Bearer ${token}` } });

      alert(`${response.data.message}\nFinancial Standing: ${response.data.duesStatus}`);
      setOutUsername(''); setOutPhone(''); setOutDate('');
      fetchDirectoryLogs(); // Refresh active rosters and history deck simultaneously
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out process failure.');
    } finally {
      setActionLoading(false);
    }
  };

  // Compute active roster arrays vs archived history items
  const activeResidents = residents.filter(r => r.status === 'Active');
  const archivedHistoryList = residents.filter(r => r.status === 'Checked Out');

  if (loading) return <div className="text-sm font-medium text-slate-500 animate-pulse p-4">Synchronizing database directory registers...</div>;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 3-COLUMN MASTER WORKSPACE TOP LAYER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* COLUMN 1: NEW STUDENT CHECK-IN DECK */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-600" /> New Student Check-In
            </h4>
            <form onSubmit={handleRegisterResident} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Legal Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter full name" className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Username</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Unique user link" className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Assign key" className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Room No.</label>
                  <input type="text" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="e.g., 101" className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Bed Assignment</label>
                  <input type="number" value={bedNumber} onChange={(e) => setBedNumber(e.target.value)} placeholder="e.g., 1" className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mobile Contact Phone</label>
                <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Student primary number" className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Emergency Parent Contact</label>
                <input type="tel" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} placeholder="Guardian emergency number" className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
              </div>
              <button type="submit" disabled={actionLoading} className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm mt-2">
                Check In Student
              </button>
            </form>
          </div>
        </div>

        {/* COLUMN 2: CURRENT RESIDENTS ACTIVE ROSTER ROWS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between overflow-hidden">
          <div className="w-full h-full flex flex-col">
            <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-emerald-600" /> Active Roster Matrix</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">{activeResidents.length} Live</span>
            </h4>
            
            {activeResidents.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-400 font-semibold">No active boarders linked to open rooms.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto max-h-[380px] space-y-2.5 pr-1">
                {activeResidents.map((r) => (
                  <div key={r._id} className="p-3 bg-slate-50/60 border border-slate-200/60 rounded-xl space-y-1.5 hover:border-slate-300 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-extrabold text-slate-900 text-xs capitalize">{r.fullName}</p>
                        <p className="text-[10px] text-slate-400 font-medium">@{r.username}</p>
                      </div>
                      <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {r.roomNumber} • Bed {r.bedNumber}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium flex justify-between pt-1 border-t border-slate-100">
                      <span>📱 M: {r.phoneNumber}</span>
                      <span>🚨 E: {r.emergencyContact}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: STUDENT CHECK-OUT GATE PANEL FORM */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <LogOut className="w-4 h-4 text-red-600" /> Student Check-Out Gate
            </h4>
            <form onSubmit={handleCheckOutResident} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Confirm Username</label>
                <input type="text" value={outUsername} onChange={(e) => setOutUsername(e.target.value)} placeholder="e.g., rahul123" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Registered Phone Number</label>
                <input type="tel" value={outPhone} onChange={(e) => setOutPhone(e.target.value)} placeholder="Enter primary contact" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Official Departure Date</label>
                <input type="date" value={outDate} onChange={(e) => setOutDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
              </div>
              
              <div className="p-3 bg-red-50/40 border border-red-100 rounded-xl">
                <p className="text-[10px] font-semibold text-red-600/90 leading-normal">
                  ⚠️ Action Clause: Executing checkout automatically updates bed availability grids and audits outstanding balance sheets.
                </p>
              </div>

              <button type="submit" disabled={actionLoading} className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-red-100 mt-1">
                Release & Archive Profile
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* BOTTOM ROW CARD: THE LONG COMPREHENSIVE HISTORICAL ACCOUNTING DECK */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 overflow-hidden">
        <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <History className="w-4.5 h-4.5 text-slate-700" /> Historic Archive Ledger (Alumni Register)
        </h4>

        {archivedHistoryList.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
            <p className="text-xs text-slate-400 font-medium">No archived checked-out alumni profile history logs inside our database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4">Alumni Student Context</th>
                  <th className="py-3 px-4">Last Asset Map Location</th>
                  <th className="py-3 px-4">Check-In Date</th>
                  <th className="py-3 px-4">Check-Out Date</th>
                  <th className="py-3 px-4">Financial Status Clear</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                {archivedHistoryList.map((alumni) => (
                  <tr key={alumni._id} className="hover:bg-slate-50/30 transition-all">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 capitalize">{alumni.fullName}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Contact: {alumni.phoneNumber}</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700 italic">
                      {alumni.roomNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-semibold">
                      {new Date(alumni.checkInDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-semibold">
                      {alumni.checkOutDate ? new Date(alumni.checkOutDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                        alumni.duesCleared ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {alumni.duesCleared ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {alumni.duesCleared ? 'All Bills Paid' : 'Outstanding Balances Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}