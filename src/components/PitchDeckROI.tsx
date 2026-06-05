/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  Clock,
  ShieldCheck,
  Zap,
  BarChart2,
  FileCheck,
  HardDriveDownload,
  Info,
  DollarSign,
  Trash2,
} from 'lucide-react';

export default function PitchDeckROI() {
  // ROI Calculation parameters
  const [dailyOrders, setDailyOrders] = useState(60);
  const [abandonedRate, setAbandonedRate] = useState(22); // percent
  const [minutesSaved, setMinutesSaved] = useState(6); // per order

  const costPerPageAvg = 4.0; // ₹ INR
  const avgPagesPerOrder = 15;
  const avgOrderValue = costPerPageAvg * avgPagesPerOrder; // ₹60

  // Calculations
  const monthlyVolume = dailyOrders * 30; // orders
  const abandonedOrdersPerMonth = Math.round(monthlyVolume * (abandonedRate / 100));
  const paperWasteCostSaved = Math.round(abandonedOrdersPerMonth * avgOrderValue * 0.5); // paper waste is at least 50% of print cost margin
  const wagesCostHoursSaved = Math.round((monthlyVolume * minutesSaved) / 60);
  const potentialRevenueRecovered = Math.round(abandonedOrdersPerMonth * avgOrderValue);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-8 select-none" id="pitch-roi-section">
      
      {/* Pitch Header */}
      <div>
        <h2 className="text-slate-100 font-bold text-lg tracking-tight flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          PrintFlow Pitch & Business Calculator
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          How this automated system transforms a traditional local print shop into a highly profitable, high-efficiency business, solving manual friction and waste.
        </p>
      </div>

      {/* Interactive ROI Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950 p-5 rounded-xl border border-slate-850">
        
        {/* Sliders panel */}
        <div className="lg:col-span-7 space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            Shop Size & Friction Estimator
          </h3>

          {/* Daily orders slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-slate-400">
              <span>Avg. Daily Print Orders:</span>
              <span className="font-mono text-slate-200 font-bold bg-slate-900 px-2 py-0.5 rounded">
                {dailyOrders} orders/day
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              value={dailyOrders}
              onChange={(e) => setDailyOrders(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Abandoned waste slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-400" title="Customers who order file prints but never show up to pay or pick them up.">
                Abandoned / Ghost Print Rate:
                <Info className="w-3.5 h-3.5 text-slate-500" />
              </span>
              <span className="font-mono text-amber-400 font-bold bg-slate-900 px-2 py-0.5 rounded">
                {abandonedRate}% waste
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={abandonedRate}
              onChange={(e) => setAbandonedRate(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Clerk setup time saved */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-slate-400">
              <span>Setup / Check friction per order:</span>
              <span className="font-mono text-sky-400 font-bold bg-slate-900 px-2 py-0.5 rounded">
                {minutesSaved} mins saved
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="15"
              value={minutesSaved}
              onChange={(e) => setMinutesSaved(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>

        {/* ROI outputs panel */}
        <div className="lg:col-span-5 bg-slate-900/55 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between space-y-4">
          <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest text-center">Monthly ROI Forecast</h4>
          
          <div className="space-y-3.5">
            {/* Metric 1 */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-mono">Dumped Paper Waste Saved</p>
                <p className="text-base font-bold text-slate-200">✨ ₹{paperWasteCostSaved.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-mono">Clerk Counter Hours Reclaimed</p>
                <p className="text-base font-bold text-slate-200">✨ {wagesCostHoursSaved} hours</p>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 text-yellow-300 rounded-lg border border-yellow-500/20">
                <TrendingUp className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-mono">Revenue Recovered (Pre-Paid Deposit)</p>
                <p className="text-base font-bold text-emerald-400">₹{potentialRevenueRecovered.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[9.5px] text-slate-500 text-center leading-relaxed">
            *Based on generic cost of ₹4.00/page. Prepends deposit ensures 100% committed prints.
          </div>
        </div>

      </div>

      {/* The 4 Architectural Pillars Solving Key Challenges */}
      <div className="space-y-4.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-350 px-1">
          Technical Solutions to Core Printing Challenges
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Pillar 1: File Privacy */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-slate-200">1. Customer Document Privacy</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Customers worry about shop-owners keeping copies of sensitive PDFs (Taxes, IDs, Agreements). PrintFlow automatically purges uploaded documents from the Cloud storage and local spool queues the instant pickup is confirmed or after a 24-hour timeout.
            </p>
          </div>

          {/* Pillar 2: SNMP Dumb Retrofit */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 rounded">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-slate-200">2. Low-Cost Hardware Retrofitting</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Proprietary cloud printers are prohibitively expensive. We retrofitted cheap office network printers via a US$35 Raspberry Pi running an SNMP / CUPS listener bridge, making it extremely easy to monitor physical status (Ink, jams, paper count) elegantly.
            </p>
          </div>

          {/* Pillar 3: Formatting Errors */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                <FileCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-slate-200">3. Document Format Sanitization</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Sending weirdly-formatted files directly causes corrupted garbage layout prints. Our Cloud Brain converts DOCX, PPTX, or pictures into a standardized vector PDF/X format before pushing to the spooler queue.
            </p>
          </div>

          {/* Pillar 4: Smart Load-Balancing */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded">
                <HardDriveDownload className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-slate-200">4. Intelligent Load Balancing</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              If Printer A is processing 5 documents, are subsequent files delayed? No! The Smart Routing module queries other printers' SNMP, bypassing busy, jammed, low-toner, or offline units to redirect files to idle printer queues natively.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
