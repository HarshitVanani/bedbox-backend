// frontend/src/components/FeeInvoices.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';
import { CreditCard, DollarSign, Receipt, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { triggerAppNotification } from '../utils/notificationSystem';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // 🎯 FIXED: Explicit ES Module Import

const generateInvoicePDF = (studentData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // --- BRANDING HEADER LAYER ---
  doc.setFillColor(30, 41, 59); // Slate 800 theme color accent
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('BEDBOX HOSTEL PLATFORM', 15, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Official Accounts Receivable & Utilities Ledger', 15, 28);

  // --- METADATA & INVOICE TRACKING MATRIX ---
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('INVOICE / RECEIPT STATEMENT', 15, 50);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const invoiceNum = `INV-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  
  doc.text(`Invoice Reference: ${invoiceNum}`, 15, 57);
  doc.text(`Date of Issue: ${dateStr}`, 15, 63);
  doc.text(`Payment Status: Verified / Settled`, 15, 69);

  // --- STUDENT / CLIENT PARTICULARS GRID ---
  doc.setDrawColor(226, 232, 240);
  doc.line(15, 75, 195, 75);

  doc.setFont('helvetica', 'bold');
  doc.text('BILLED TO:', 15, 83);
  doc.setFont('helvetica', 'normal');
  doc.text(`Resident Name: ${studentData.studentName || 'Harshit Vanani'}`, 15, 89);
  doc.text(`User Directory ID: ${studentData.username || 'harshit101'}`, 15, 95);
  doc.text(`Assigned Housing: Room ${studentData.roomNumber || '101'}`, 15, 101);

  // --- ITEMIZATION TRANSITION TABLE MATRIX ---
  const tableColumns = ["Billing Stream Category Description", "Amount Balance (INR)"];
  const tableRows = [
    [studentData.category || "Room Rent Charges", `Rs. ${Number(studentData.amount || 12400).toLocaleString('en-IN')}`]
  ];

  // 🎯 FIXED: Direct standard function call format handles bundling pipelines perfectly
  autoTable(doc, {
    startY: 110,
    head: [tableColumns],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235], fontSize: 10, fontStyle: 'bold' }, // Blue 600 UI accent
    bodyStyles: { fontSize: 9, textColor: [51, 65, 85] },
    margin: { left: 15, right: 15 }
  });

  // --- FINANCIAL SUMMARY MATRIX BLOCK ---
  const finalY = doc.lastAutoTable.finalY + 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Total Settled Account Valuation:`, 110, finalY);
  doc.setFontSize(14);
  doc.setTextColor(220, 38, 38); // Red 600 indicator accent
  doc.text(`Rs. ${Number(studentData.amount || 12400).toLocaleString('en-IN')}/-`, 110, finalY + 7);

  // --- AUTHORIZED SIGNATURE FOOTER TRACK ---
  doc.setDrawColor(241, 245, 249);
  doc.line(15, finalY + 30, 195, finalY + 30);
  
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('This document serves as an official electronic confirmation of system registration database entries.', 15, finalY + 37);
  doc.text('BedBox Operational Core Node Hub • Render Cloud Service Platform', 15, finalY + 42);

  // Save File Event Trigger
  doc.save(`BedBox_${invoiceNum}_Room_${studentData.roomNumber || '101'}.pdf`);
};

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

  const processInvoiceCreationSuccess = (targetUser, targetAmount, targetType) => {
    triggerAppNotification(
      "New Fee Invoice Dispatched", 
      `An outstanding ${targetType} balance statement of ₹${targetAmount} has been issued to student account: [${targetUser}].`
    );

    const targetMatch = invoices.find(inv => inv.username === targetUser);

    generateInvoicePDF({
      studentName: targetMatch?.studentName || targetUser,
      username: targetUser,
      roomNumber: targetMatch?.roomNumber || "Pending",
      category: targetType,
      amount: targetAmount
    });

    setSuccessMsg('Invoice dispatched and recorded inside ledgers!');
    setUsername('');
    setAmount('');
    setDueDate('');
    fetchInvoicesData();

    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    if (!username || !amount || !billType || !dueDate) {
      alert('Please fully specify all bill configuration criteria input rows.');
      return;
    }

    try {
      setSubmitLoading(true);
      const token = localStorage.getItem('bedbox_token');
      
      await axios.post(`${API_BASE_URL}/api/invoices/generate`, 
        { username, amount, billType, dueDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      processInvoiceCreationSuccess(username, amount, billType);
    } catch (err) {
      const serverStatus = err.response?.status || err.request?.status;
      if (serverStatus === 200 || serverStatus === 201) {
        processInvoiceCreationSuccess(username, amount, billType);
      } else {
        alert(err.response?.data?.message || 'Error processing billing file compilation.');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const processInvoiceSettlementSuccess = (targetBill) => {
    if (targetBill) {
      triggerAppNotification(
        "Payment Confirmation Settlement", 
        `Transaction cleared! The outstanding ₹${targetBill.amount} ${targetBill.billType} invoice statement for [${targetBill.studentName || 'Resident'}] has been recorded as paid.`
      );

      generateInvoicePDF({
        studentName: targetBill.studentName,
        username: targetBill.username,
        roomNumber: targetBill.roomNumber,
        category: targetBill.billType,
        amount: targetBill.amount
      });
    }
    fetchInvoicesData();
  };

  const handleSettleInvoice = async (invoiceId) => {
    const targetBill = invoices.find(inv => inv._id === invoiceId);

    try {
      const token = localStorage.getItem('bedbox_token');
      
      await axios.put(`${API_BASE_URL}/api/invoices/settle`, 
        { invoiceId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      processInvoiceSettlementSuccess(targetBill);
    } catch (err) {
      const serverStatus = err.response?.status || err.request?.status;
      if (serverStatus === 200 || serverStatus === 201) {
        processInvoiceSettlementSuccess(targetBill);
      } else {
        alert('Error updating ledger row transaction status.');
      }
    }
  };

  if (loading) return <div className="text-sm font-medium text-slate-500 animate-pulse p-4">Loading core hostel financial transactions...</div>;

  return (
    <div className="space-y-6">
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
                          ₹{Number(bill.amount).toLocaleString('en-IN')}
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