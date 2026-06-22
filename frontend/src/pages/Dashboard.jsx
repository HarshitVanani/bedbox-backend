// frontend/src/pages/Dashboard.jsx
import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import OverviewMetrics from '../components/OverviewMetrics'; 
import RoomsGrid from '../components/RoomsGrid';
import ResidentDirectory from '../components/ResidentDirectory';
import FeeInvoices from '../components/FeeInvoices'; 
import ComplaintBox from '../components/ComplaintBox';
import MessMenu from '../components/MessMenu';
import AboutBedBox from '../components/AboutBedBox';
import SettingsPanel from '../components/SettingsPanel'; // 🎯 Bridges your settings file directly!
import MaintenancePage from '../components/MaintenancePage'; // 🎯 NEW: Import Maintenance Page Component

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {/* Dynamic Central Photo-Slot Switcher Panel */}
      {activeTab === 'overview' && <OverviewMetrics />}
      {activeTab === 'rooms' && <RoomsGrid />}
      {activeTab === 'residents' && <ResidentDirectory />}
      {activeTab === 'finance' && <FeeInvoices />}
      {activeTab === 'complaints' && <ComplaintBox />}
      {activeTab === 'mess' && <MessMenu />}
      {activeTab === 'maintenance' && <MaintenancePage />} {/* 🎯 NEW: Render slot for Maintenance Desk */}
      {activeTab === 'settings' && <SettingsPanel />}
      {activeTab === 'about' && <AboutBedBox />}
    </DashboardLayout>
  );
}