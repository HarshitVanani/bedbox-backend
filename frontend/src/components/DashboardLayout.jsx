// frontend/src/components/DashboardLayout.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, LayoutDashboard, Bed, Users, CreditCard, 
  ClipboardList, Utensils, Settings, Info, LogOut, Menu, X, Wrench 
} from 'lucide-react';

export default function DashboardLayout({ children, activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Retrieve user data stored during login
  const userData = JSON.parse(localStorage.getItem('bedbox_user') || '{}');
  const role = userData.role || 'student'; // Fallback safely to student profile

  // Master sidebar link array matrix configuration 
  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard, roles: ['admin', 'student'] },
    { id: 'rooms', label: 'Rooms & Bed Grid', icon: Bed, roles: ['admin'] },
    { id: 'residents', label: 'Resident Directory', icon: Users, roles: ['admin'] },
    { id: 'finance', label: 'Fee & Invoices', icon: CreditCard, roles: ['admin', 'student'] },
    { id: 'complaints', label: 'Complaint Box', icon: ClipboardList, roles: ['admin', 'student'] },
    { id: 'mess', label: 'Mess Meal Menu', icon: Utensils, roles: ['admin', 'student'] },
    { id: 'maintenance', label: 'Maintenance Desk', icon: Wrench, roles: ['admin', 'student'] }, // 🎯 NEW: Maintenance Desk active across matching roles
    { id: 'settings', label: 'Settings Page', icon: Settings, roles: ['admin', 'student'] },
    { id: 'about', label: 'About BedBox', icon: Info, roles: ['admin', 'student'] }
  ];

  // Only show menu items matching the current user's role
  const filteredMenu = menuItems.filter(item => item.roles.includes(role));

  const handleLogout = () => {
    localStorage.removeItem('bedbox_token');
    localStorage.removeItem('bedbox_user');
    navigate('/login');
  };

  React.useEffect(() => {
    const handleIncomingAlert = (event) => {
      const { title, body } = event.detail;
      
      // Flash an elegant floating browser alert notification status banner
      alert(`🔔 [BedBox Alert] \n\n${title}\n${body}`);
    };

    window.addEventListener('bedbox_live_alert', handleIncomingAlert);
    return () => window.removeEventListener('bedbox_live_alert', handleIncomingAlert);
  }, []);

  return (
    // 🎯 DYNAMIC THEME CHANGE 1: Added background and text color classes for dark mode transition
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex font-sans text-slate-800 dark:text-slate-100 antialiased transition-colors duration-200">
      
      {/* Mobile Sidebar Overlay Backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Sidebar Panel */}
      <aside className={`fixed top-0 bottom-0 left-0 w-64 bg-slate-900 text-slate-200 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static`}>
        
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">bedbox_hostel</span>
          </div>
          <button className="lg:hidden p-1 text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Navigation Links */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Profile Footer Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {userData.username ? userData.username[0] : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate capitalize">{userData.username || 'User'}</p>
              <p className="text-[10px] text-slate-500 capitalize">{role} Mode</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-all cursor-pointer" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Workspace Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Navbar */}
        {/* 🎯 DYNAMIC THEME CHANGE 2: Added bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-200">
          <div className="flex items-center gap-4">
            <button className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              {menuItems.find(i => i.id === activeTab)?.label || 'Workspace'}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            {/* 🎯 DYNAMIC THEME CHANGE 3: Swapped to neutral adaptive styles for the text badge */}
            <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 px-3 py-1.5 font-semibold rounded-full border border-slate-200 dark:border-slate-600 capitalize">
              Role: {role}
            </span>
          </div>
        </header>

        {/* Dynamic Inner Workspace Panel Outlet */}
        {/* 🎯 DYNAMIC THEME CHANGE 4: Added background colors for the sub-page grid workspace */}
        <main className="flex-1 p-6 overflow-y-auto max-w-[1600px] w-full mx-auto bg-slate-50/50 dark:bg-slate-900/40 transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}