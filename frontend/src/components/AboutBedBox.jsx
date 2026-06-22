// frontend/src/components/AboutBedBox.jsx
import React from 'react';
import { Shield, Sparkles, Building2, HardDrive, CheckCircle2 } from 'lucide-react';

export default function AboutBedBox() {
  // Read current local environment context timestamps
  const currentYear = "2026";

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Title Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">About BedBox Platform</h3>
        <p className="text-xs text-slate-400">Review system framework parameters, engineering metrics, and operational guidelines.</p>
      </div>

      {/* Main Presentation Layout Display Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden transition-colors duration-200">
        <div className="absolute top-0 right-0 p-8 text-slate-50/40 pointer-events-none select-none">
          <Shield className="w-48 h-48 -mr-12 -mt-12 text-slate-100 dark:text-slate-700/30" />
        </div>

        {/* Brand Summary Row */}
        <div className="flex flex-col sm:flex-row items-start gap-4 relative z-10">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-2xl text-white shadow-md shadow-blue-500/20 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              BedBox Core Engine <span className="text-[10px] bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">v2.1 Enterprise</span>
            </h4>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mt-1 max-w-2xl">
              BedBox is a high-performance, full-stack hostel property management platform architected on the robust MERN paradigm. Engineered to completely eliminate manual paperwork overheads, it streamlines room allocation matrices, simplifies resident complaint tracking logs, and synchronizes catering meal schedules across a unified database port.
            </p>
          </div>
        </div>

        {/* Core System Architectural Metrics Sub-Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 relative z-10">
          <div className="bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <Sparkles className="w-4 h-4 text-amber-500 mb-1" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Frontend Interface</p>
            </div>
            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-2">React 18 + Tailwind v4</p>
          </div>

          <div className="bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <HardDrive className="w-4 h-4 text-blue-500 mb-1" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Backend Gateway</p>
            </div>
            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-2">NodeJS + Express Runtime</p>
          </div>

          <div className="bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <Shield className="w-4 h-4 text-emerald-500 mb-1" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Database Storage</p>
            </div>
            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-2">MongoDB Cluster Collection</p>
          </div>
        </div>

        {/* System Rules Checkbox Logs Row */}
        <div className="border-t border-slate-100 dark:border-slate-700 pt-5 relative z-10">
          <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Operational Compliance Checks</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Full cryptographic password hashing enabled using BcryptJS.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>State isolation maps active across structural sidebar menus.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Dynamic grid capacity scaling enabled (+/- Bed array hooks).</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Polymorphic account visibility layers strictly enforced.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Corporate Footprint Info */}
      {/* 🎯 REPAIRED TEXT STRING: Matches your live active Render hosting ecosystem metrics */}
      <p className="text-center text-[11px] text-slate-400 font-medium">
        BedBox Operational Core Node Hub • Running on Render Cloud Service Platform • Licensed {currentYear}
      </p>
    </div>
  );
}