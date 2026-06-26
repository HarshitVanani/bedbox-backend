// frontend/src/components/FeeInvoices.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';
import { CreditCard, DollarSign, Receipt, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
// 🎯 CRITICAL SYSTEM LINK: Import our preference-aware live alert engine
import { triggerAppNotification } from '../utils/notificationSystem';

export default function FeeInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Invoice Generation Form State
  const [username, setUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [billType, setBillType] = useState('Room Rent');
  const [dueDate, setDueDate] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Extract logged-in configuration sessions
  const userData = JSON.parse(localStorage.getItem('bedbox_user') || '{}');
  const isAdmin = userData.role === 'admin';

  const fetchInvoicesData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('bedbox_token');
      // 🎯 UPDATED: Target production cloud route instead of localhost
      const response = await axios.get(`${API_BASE_URL}/api/invoices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoices(response.data);
      setError('');
    } catch (err) {
      setError('Could not establish synchronization pipeline with financial data registries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoicesData();
  }, []);

  // 1. Post a brand new billing invoice to a student (Admin Action)
  const handleGenerateBill = async (e) => {
    e.preventDefault();
    if (!username || !amount || !billType || !dueDate) {
      alert('Please fully specify all bill configuration criteria input rows.');
      return;
    }

    try {
      setSubmitLoading(true);
      const token = localStorage.getItem('bedbox_token');
      // 🎯 UPDATED: Target production cloud route instead of localhost
      await axios.post(`${API_BASE_URL}/api/invoices/generate`, 
        { username, amount, billType, dueDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 🎯 PASTE TARGET REACHED: Fire alert tracking upon billing confirmation
      triggerAppNotification(
        "New Fee Invoice Dispatched", 
        `An outstanding ${billType} balance statement of ₹${amount} has been issued to student account: [${username}].`
      );

      setSuccessMsg('Invoice dispatched and recorded inside ledgers!');
      setUsername('');
      setAmount('');
      setDueDate('');
      fetchInvoicesData(); // Reload accounting grid live

      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      // 🎯 FIX INSTALLED: Only alert if the server explicitly errors out
      if (err.response) {
        alert(err.response?.data?.message || 'Error processing billing file compilation.');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // 2. Mark an Unpaid bill as Paid securely (Admin Action)
  const handleSettleInvoice = async (invoiceId) => {
    try {
      const token = localStorage.getItem('bedbox_token');
      
      // Find the localized targeted row element reference context inside our state array first
      const targetBill = invoices.find(inv => inv._id === invoiceId);
      
      // 🎯 UPDATED: Target production cloud route instead of localhost
      await axios.put(`${API_BASE_URL}/api/invoices/settle`, 
        { invoiceId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 🎯 PASTE TARGET REACHED: Dispatch transaction resolution statement
      if (targetBill) {
        triggerAppNotification(
          "Payment Confirmation Settlement", 
          `Transaction cleared! The outstanding ₹${targetBill.amount} ${targetBill.billType} invoice statement for [${targetBill.studentName || 'Resident'}] has been recorded as paid.`
        );
      }

      fetchInvoicesData(); // Instant hot reload visual tracking registers
    } catch (err) {
      alert('Error updating ledger row transaction status.');
    }
  };

  if (loading) return <div className="text-sm font-medium text-slate-500 animate-pulse p-4">Loading core hostel financial transactions...</div>;

  return (
    <div className="space-y-6">
      {/* View Title */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Fee Ledger & Invoice Sheets</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {isAdmin ? "Track hostel collection logs, generate specific student bill targets, and handle payment offsets." : "Review personal rental balance history, cafeteria charges, and outstanding dues statements."}
          </p>
        </div>
        <button onClick={fetchInvoicesData} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" /> Recalculate Dues
        </button>
      </div>

      {error && <div className="text-sm text-red-500 p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 rounded-xl">{error}</div>}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* LEFT COMPONENT: Admin Billing Generation Deck (Hidden automatically from Students) */}
        {isAdmin && (
          <div className="w-full lg:w-[350px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4 shrink-0 transition-colors duration-200">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-600" /> Create Fee Invoice
            </h4>

            {successMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleGenerateBill} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Target Student Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g., rahul123" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 transition-all" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Bill Stream Category</label>
                <select value={billType} onChange={(e) => setBillType(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 transition-all">
                  <option value="Room Rent">Room Rent Charges</option>
                  <option value="Mess Fees">Mess Boarding Fees</option>
                  <option value="Caution Deposit">Caution Deposit Security</option>
                  <option value="Miscellaneous">Miscellaneous / Penalties</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Total Due Amount (INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 4500" className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Payment Grace Due Date</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 transition-all" />
              </div>

              <button type="submit" disabled={submitLoading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer">
                <CreditCard className="w-3.5 h-3.5" /> {submitLoading ? "Generating Record..." : "Dispatch Official Bill"}
              </button>
            </form>
          </div>
        )}

        {/* RIGHT COMPONENT: Master Financial Roster Table Display */}
        <div className="flex-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm overflow-hidden transition-colors duration-200">
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">
            {isAdmin ? "Hostel Accounts Receivable Ledger" : "Your Personal Outstanding Dues Records"}
          </h4>

          {invoices.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">No financial billing logs or invoice statements found on records.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/40 dark:bg-slate-900/20">
                    <th className="py-3 px-4">Student Context</th>
                    <th className="py-3 px-4">Billing Category</th>
                    <th className="py-3 px-4">Amount Balance</th>
                    <th className="py-3 px-4">Timeline Due</th>
                    <th className="py-3 px-4">Ledger Status</th>
                    {isAdmin && <th className="py-3 px-4 text-right">Settlement Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
                  {invoices.map((bill) => {
                    const isPaid = bill.status === 'Paid';
                    return (
                      <tr key={bill._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-all font-medium text-slate-600 dark:text-slate-300">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 dark:text-slate-100 capitalize">{bill.studentName}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Room {bill.roomNumber}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-md">{bill.billType}</span>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                          ₹{bill.amount}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-semibold">
                          {new Date(bill.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                            isPaid ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/30'
                          }`}>
                            {isPaid ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {bill.status}
                          </span>
                        </td>

                        {/* Inline Admin Action Triggers Row */}
                        {isAdmin && (
                          <td className="py-3.5 px-4 text-right">
                            {!isPaid ? (
                              <button 
                                onClick={() => handleSettleInvoice(bill._id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg border border-emerald-600 shadow-sm transition-all flex items-center gap-1 ml-auto cursor-pointer"
                              >
                                <DollarSign className="w-3 h-3" /> Mark Paid
                              </button>
                            ) : (
                              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 px-2 uppercase tracking-wider italic">Cleared ✔</span>
                            )}
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