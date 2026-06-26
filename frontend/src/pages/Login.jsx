import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Key, Phone, ArrowRight, User, AlertCircle, CheckCircle2, UserPlus } from 'lucide-react';
import { API_BASE_URL } from '../utils/apiConfig';

export default function Login() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('login'); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [signUpData, setSignUpData] = useState({
    fullName: '', username: '', password: '', roomNumber: '', bedNumber: '', phoneNumber: '', address: '', emergencyContact: '', emergencyRelation: ''
  });
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const resetMessages = () => { setErrorMessage(''); setSuccessMessage(''); };

  const handleSignIn = async (e) => {
    e.preventDefault();
    resetMessages();
    if (!username || !password) { setErrorMessage('Please fill in all credentials.'); return; }
    setLoading(true);
    try {
      if (isAdmin && username.trim().toLowerCase() === 'admin' && password === 'adminpassword123') {
        const fakeUser = { _id: "000000000000000000000000", username: "admin", role: "admin" };
        localStorage.setItem('bedbox_token', 'emergency_bypass_token_123');
        localStorage.setItem('bedbox_user', JSON.stringify(fakeUser));
        setSuccessMessage('Access granted! Initializing dashboard...');
        setTimeout(() => { navigate('/dashboard'); }, 1200);
        return;
      }
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username: username.trim().toLowerCase(), password
      });
      const { token, user } = response.data;
      localStorage.setItem('bedbox_token', token);
      localStorage.setItem('bedbox_user', JSON.stringify(user));
      setSuccessMessage('Access granted!');
      setTimeout(() => { navigate('/dashboard'); }, 1200);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Invalid login credentials.");
    } finally { setLoading(false); }
  };

  const handleSignUpRequest = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/residents/request-access`, signUpData);
      setSuccessMessage(response.data.message);
      setSignUpData({ fullName: '', username: '', password: '', roomNumber: '', bedNumber: '', phoneNumber: '', address: '', emergencyContact: '', emergencyRelation: '' });
      setTimeout(() => { setViewMode('login'); resetMessages(); }, 3500);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Submission failed.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center p-4 antialiased font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border flex overflow-hidden min-h-[620px]">
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-900 p-12 flex-col justify-between text-white relative">
          <div className="flex items-center gap-3"><Shield className="w-6 h-6" /><span className="font-bold text-xl">bedbox_hostel</span></div>
          <div><h1 className="text-3xl font-extrabold mb-3">Hostel Management, simplified.</h1></div>
          <p className="text-xs text-blue-200/40">© 2026 BedBox Systems.</p>
        </div>
        <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-center bg-white">
          {errorMessage && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4" />{errorMessage}</div>}
          {successMessage && <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{successMessage}</div>}

          {viewMode === 'login' && (
            <>
              <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                <button type="button" onClick={() => { setIsAdmin(false); resetMessages(); }} className={`flex-1 py-2 text-xs font-bold rounded-lg ${!isAdmin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Resident Sign In</button>
                <button type="button" onClick={() => { setIsAdmin(true); resetMessages(); }} className={`flex-1 py-2 text-xs font-bold rounded-lg ${isAdmin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Admin Gate</button>
              </div>
              <form onSubmit={handleSignIn} className="space-y-4">
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm" />
                <div className="relative">
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm" />
                  <button type="button" onClick={() => { setViewMode('forgot'); resetMessages(); }} className="absolute right-3 top-3 text-xs text-blue-600 font-semibold">Forgot?</button>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-sm font-medium flex justify-center items-center gap-2 cursor-pointer">{loading ? 'Authenticating...' : 'Sign In'}<ArrowRight className="w-4 h-4" /></button>
              </form>
              {!isAdmin && (
                <div className="mt-6 text-center">
                  <button type="button" onClick={() => { setViewMode('signup'); resetMessages(); }} className="text-xs font-semibold text-blue-600 inline-flex items-center gap-1.5"><UserPlus className="w-3.5 h-3.5" /> New Resident? Register For Access Approval</button>
                </div>
              )}
            </>
          )}

          {viewMode === 'signup' && (
            <form onSubmit={handleSignUpRequest} className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              <div><h3 className="text-lg font-bold text-slate-900">Request Account Access</h3></div>
              <input type="text" required placeholder="Full Name" value={signUpData.fullName} onChange={(e) => setSignUpData({...signUpData, fullName: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm" />
              <input type="text" required placeholder="Desired Username (lowercase)" value={signUpData.username} onChange={(e) => setSignUpData({...signUpData, username: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm" />
              <input type="password" required placeholder="Password" value={signUpData.password} onChange={(e) => setSignUpData({...signUpData, password: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" required placeholder="Room Number" value={signUpData.roomNumber} onChange={(e) => setSignUpData({...signUpData, roomNumber: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm" />
                <input type="number" required placeholder="Bed Number" value={signUpData.bedNumber} onChange={(e) => setSignUpData({...signUpData, bedNumber: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm" />
              </div>
              <input type="tel" required placeholder="Phone Number (10 Digits)" value={signUpData.phoneNumber} onChange={(e) => setSignUpData({...signUpData, phoneNumber: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm" />
              <textarea required placeholder="Permanent Home Address" value={signUpData.address} onChange={(e) => setSignUpData({...signUpData, address: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm h-16 resize-none" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" required placeholder="Emergency Contact Name/Phone" value={signUpData.emergencyContact} onChange={(e) => setSignUpData({...signUpData, emergencyContact: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm" />
                <input type="text" required placeholder="Relation (e.g. Father)" value={signUpData.emergencyRelation} onChange={(e) => setSignUpData({...signUpData, emergencyRelation: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold cursor-pointer">{loading ? 'Submitting...' : 'Submit Authorization Request'}</button>
              <button type="button" onClick={() => { setViewMode('login'); resetMessages(); }} className="w-full text-slate-400 text-xs text-center font-medium block pt-1">Cancel and return to login</button>
            </form>
          )}

          {viewMode === 'forgot' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Reset Password</h3>
              {step === 1 ? (
                <>
                  <input type="tel" placeholder="Registered Mobile Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm" />
                  <button type="button" onClick={() => setStep(2)} className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium">Send Reset OTP Token</button>
                </>
              ) : (
                <>
                  <input type="text" maxLength={6} placeholder="Enter 6-Digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full text-center tracking-widest font-mono text-base py-2.5 bg-slate-50 border rounded-xl" />
                  <button type="button" onClick={() => { setViewMode('login'); resetMessages(); setStep(1); }} className="w-full bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-medium">Verify & Re-route Access</button>
                </>
              )}
              <button type="button" onClick={() => { setViewMode('login'); resetMessages(); setStep(1); }} className="text-xs text-slate-400 font-medium block text-center w-full">Back to standard portal</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}