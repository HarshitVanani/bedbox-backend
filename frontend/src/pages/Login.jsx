// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Key, Phone, ArrowRight, User, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  
  // Form State Values
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Recovery State Management
  const [showForgot, setShowForgot] = useState(false);
  const [step, setStep] = useState(1); // 1: Send Phone, 2: Verify OTP
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');

  // Notification Banner States
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear states when switching layout modes
  const handleRoleToggle = (adminMode) => {
    setIsAdmin(adminMode);
    setErrorMessage('');
    setSuccessMessage('');
    setUsername('');
    setPassword('');
  };

  // Execution call to trigger backend auth route validation
  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!username || !password) {
      setErrorMessage('Please completely fill in all authentication fields.');
      return;
    }

    setLoading(true);
    try {
// frontend/src/pages/Login.jsx (around line 46)
// 🎯 UPDATE TO YOUR LIVE BACKEND URL:
      const response = await axios.post('https://bedbox-backend.onrender.com/api/auth/login', {
        username,
        password
      });

      const { token, user } = response.data;

      // Verify that a student isn't trying to log in through the admin toggle, or vice versa
      if (user.role !== (isAdmin ? 'admin' : 'student')) {
        setLoading(false);
        setErrorMessage(`Account access mismatch. This profile is not authorized as an ${isAdmin ? 'Admin' : 'Resident'}.`);
        return;
      }

      // Securely store credentials token locally inside user profile cache
      localStorage.setItem('bedbox_token', token);
      localStorage.setItem('bedbox_user', JSON.stringify(user));

      setSuccessMessage('Access granted! Initializing secure system dashboard routing...');
      
      // Redirect cleanly to workspace dashboard page framework after 1.5 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

   } catch (error) {
      // 🎯 MODIFIED: Print the exact error object message instead of the generic text
      const detailedError = error.response?.data?.message || error.message || JSON.stringify(error);
      setErrorMessage(`Debug Log: ${detailedError}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center p-4 antialiased font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 flex overflow-hidden min-h-[600px]">
        
        {/* Left Panel: Branding Artwork */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-900 p-12 flex-col justify-between text-white relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">bedbox_hostel</span>
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold leading-tight mb-4">Smart living, effortlessly managed.</h1>
            <p className="text-blue-100/80 leading-relaxed text-sm">Access your room profile, view live meal menus, raise quick maintenance tickets, and track your dues instantly.</p>
          </div>
          <p className="text-xs text-blue-200/50 relative z-10">© 2026 BedBox Systems. All Rights Reserved.</p>
        </div>

        {/* Right Panel: Interactive Forms */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white relative">
          
          {/* Global Event Notification Badges */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-600 font-medium">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {!showForgot ? (
            <>
              {/* Role Selector Header Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-8 self-start w-full">
                <button 
                  type="button"
                  onClick={() => handleRoleToggle(false)}
                  className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${!isAdmin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Resident Login
                </button>
                <button 
                  type="button"
                  onClick={() => handleRoleToggle(true)}
                  className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${isAdmin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Management Admin
                </button>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
                <p className="text-slate-400 text-sm">Please sign in to view your dashboard update.</p>
              </div>

              {/* Standard Login Fields Form */}
              <form className="space-y-4" onSubmit={handleSignIn}>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username" 
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm text-slate-800" 
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</label>
                    {!isAdmin && (
                      <button type="button" onClick={() => { setShowForgot(true); setStep(1); setErrorMessage(''); }} className="text-xs font-medium text-blue-600 hover:underline cursor-pointer">
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Key className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm text-slate-800" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 shadow-sm text-sm cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Authenticating Profile...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            /* Forgot Password OTP Portal Section */
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Reset Your Password</h2>
                <p className="text-slate-400 text-sm">We will securely send a verification OTP code to your registered mobile device number.</p>
              </div>

              {step === 1 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                      <input 
                        type="tel" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+91 98765 43210" 
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm text-slate-800" 
                      />
                    </div>
                  </div>
                  <button type="button" onClick={() => setStep(2)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer">
                    Get Verification Code
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Enter 6-Digit OTP</label>
                    <input 
                      type="text" 
                      maxLength={6} 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="0 0 0 0 0 0" 
                      className="w-full text-center tracking-widest font-mono text-lg py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800" 
                    />
                  </div>
                  <button type="button" onClick={() => setShowForgot(false)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer">
                    Verify & Proceed
                  </button>
                </div>
              )}

              <button type="button" onClick={() => { setShowForgot(false); setErrorMessage(''); }} className="text-xs font-medium text-slate-400 hover:text-slate-600 block text-center w-full mt-2 cursor-pointer">
                Back to Sign In window
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}