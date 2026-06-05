/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Server,
  Printer as PrinterIcon,
  TrendingUp,
  Terminal,
  Layers,
  Sparkles,
  HelpCircle,
  Clock,
  Shield,
  RefreshCw,
} from 'lucide-react';

import { Order, Printer, LogEntry, HostedFile, DispatchedAlert } from './types';
import {
  INITIAL_PRINTERS,
  INITIAL_ORDERS,
  INITIAL_LOGS,
  INITIAL_HOSTED_FILES,
  INITIAL_DISPATCHED_ALERTS,
} from './data';

import WhatsAppSimulator from './components/WhatsAppSimulator';
import BrainServerDashboard from './components/BrainServerDashboard';
import LocalBridgeSimulator from './components/LocalBridgeSimulator';
import PitchDeckROI from './components/PitchDeckROI';

export default function App() {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'whatsapp' | 'brain' | 'printers' | 'roi'>('pipeline');
  
  // Shared States across components
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [printers, setPrinters] = useState<Printer[]>(INITIAL_PRINTERS);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [hostedFiles, setHostedFiles] = useState<HostedFile[]>(INITIAL_HOSTED_FILES);
  const [dispatchedAlerts, setDispatchedAlerts] = useState<DispatchedAlert[]>(INITIAL_DISPATCHED_ALERTS);

  // Sync printer queues when orders change
  useEffect(() => {
    setPrinters((prevPrinters) =>
      prevPrinters.map((p) => {
        // Count orders that are routed or active printing on this printer
        const pendingCount = orders.filter(
          (o) => o.printerId === p.id && (o.status === 'routing' || o.status === 'printing')
        ).length;
        
        return {
          ...p,
          queueCount: pendingCount,
          status: pendingCount > 0 ? ('printing' as const) : (p.status === 'printing' ? 'idle' as const : p.status),
        };
      })
    );
  }, [orders]);

  // Central Log dispatch system
  const handleNewLog = (
    type: 'whatsapp' | 'brain' | 'routing' | 'snmp' | 'local_agent' | 'payment',
    message: string,
    details?: string
  ) => {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const newLog: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp,
      type,
      message,
      details,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Extract the actively printing order details for hardware animations
  const activePrintingOrder = orders.find((o) => o.status === 'printing');

  return (
    <div className="min-h-screen bg-indigo-50/50 text-slate-800 font-sans flex flex-col selection:bg-indigo-500/10 selection:text-indigo-900 relative">
      
      {/* Visual background atmospheric elements */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-indigo-100/40 via-indigo-50/20 to-transparent pointer-events-none"></div>

      {/* Primary Top Header Banner */}
      <header className="bg-white/80 border-b border-indigo-100/80 backdrop-blur-md sticky top-0 z-40 px-4 py-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Brand/System Metadata */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 text-white font-extrabold select-none">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v7"></path>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  PrintFlow <span className="text-indigo-600 underline decoration-indigo-200 decoration-4">AI</span>
                </h1>
                <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold tracking-wider">
                  Pitch & Simulation v2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium font-sans">Meta WhatsApp business integration with local printer diagnostic bridge</p>
            </div>
          </div>

          {/* Core System Diagnostic Banner */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3.5 py-1.5 bg-emerald-100 rounded-full flex items-center gap-2 border border-emerald-200 shadow-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest font-sans">Local Bridge: Online</span>
            </div>
            <div className="px-3.5 py-1.5 bg-white rounded-full flex items-center gap-2 border border-slate-200 shadow-sm">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">192.168.10.45</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Interaction Menu tab triggers */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 mt-6">
        <nav className="flex flex-wrap gap-2 p-1.5 bg-slate-100/80 backdrop-blur border border-slate-200/60 rounded-2xl max-w-max select-none shadow-sm">
          
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold tracking-tight transition duration-200 cursor-pointer ${
              activeTab === 'pipeline'
                ? 'bg-indigo-600 text-white shadow shadow-indigo-200'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Live End-to-End Pipeline
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold tracking-tight transition duration-200 cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'bg-indigo-600 text-white shadow shadow-indigo-200'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            1. User WhatsApp Interface
          </button>

          <button
            onClick={() => setActiveTab('brain')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold tracking-tight transition duration-200 cursor-pointer ${
              activeTab === 'brain'
                ? 'bg-indigo-600 text-white shadow shadow-indigo-200'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            2. The Central Cloud Brain
          </button>

          <button
            onClick={() => setActiveTab('printers')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold tracking-tight transition duration-200 cursor-pointer ${
              activeTab === 'printers'
                ? 'bg-indigo-600 text-white shadow shadow-indigo-200'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-white'
            }`}
          >
            <PrinterIcon className="w-3.5 h-3.5" />
            3. Local Spool Agents
          </button>

          <button
            onClick={() => setActiveTab('roi')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold tracking-tight transition duration-200 cursor-pointer ${
              activeTab === 'roi'
                ? 'bg-indigo-600 text-white shadow shadow-indigo-200'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            📊 Tech Solutions & ROI
          </button>

        </nav>
      </div>

      {/* Main Interactive Screen Frames based on selected tabs */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 min-h-0 flex flex-col justify-between">
        
        {/* TAB 1: FULL PIPELINE END-TO-END (Desktop masterpiece) */}
        {activeTab === 'pipeline' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 min-h-0">
            {/* WhatsApp Smartphone Mockup Column */}
            <div className="lg:col-span-4 flex flex-col h-[700px] lg:h-auto">
              <div className="flex items-center gap-1.5 text-[11px] uppercase font-bold text-indigo-700 mb-2 px-1 tracking-wider select-none font-sans">
                <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                I. WhatsApp Interactive Sim
              </div>
              <WhatsAppSimulator
                onOrderUpdate={(updatedOrder) => {
                  setOrders((prev) => {
                    const exists = prev.some((o) => o.id === updatedOrder.id);
                    if (exists) {
                      return prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
                    }
                    return [updatedOrder, ...prev];
                  });
                }}
                onNewLog={handleNewLog}
                printers={printers}
                hostedFiles={hostedFiles}
                setHostedFiles={setHostedFiles}
              />
            </div>

            {/* Cloud Server Monitoring Column */}
            <div className="lg:col-span-4 flex flex-col h-[700px] lg:h-auto">
              <div className="flex items-center gap-1.5 text-[11px] uppercase font-bold text-indigo-700 mb-2 px-1 tracking-wider select-none font-sans">
                <Server className="w-3.5 h-3.5 text-indigo-600" />
                II. The Central Cloud Brain
              </div>
              <BrainServerDashboard
                orders={orders}
                logs={logs}
                onSetOrders={setOrders}
                onNewLog={handleNewLog}
                hostedFiles={hostedFiles}
                setHostedFiles={setHostedFiles}
                printers={printers}
                onSetPrinters={setPrinters}
                dispatchedAlerts={dispatchedAlerts}
                setDispatchedAlerts={setDispatchedAlerts}
              />
            </div>

            {/* Local shop printer hardware monitoring column */}
            <div className="lg:col-span-4 flex flex-col h-[700px] lg:h-auto">
              <div className="flex items-center gap-1.5 text-[11px] uppercase font-bold text-indigo-700 mb-2 px-1 tracking-wider select-none font-sans">
                <PrinterIcon className="w-3.5 h-3.5 text-indigo-600" />
                III. Local Shop Hardware Spooler
              </div>
              <LocalBridgeSimulator
                printers={printers}
                onSetPrinters={setPrinters}
                onNewLog={handleNewLog}
                activeOrderProgress={activePrintingOrder?.progress}
                activeOrderPrinterId={activePrintingOrder?.printerId}
              />
            </div>
          </div>
        )}

        {/* TAB 2: INDIVIDUAL SMARTPHONE VIEW */}
        {activeTab === 'whatsapp' && (
          <div className="max-w-xl mx-auto w-full h-[620px] flex flex-col">
            <WhatsAppSimulator
              onOrderUpdate={(updatedOrder) => {
                setOrders((prev) => {
                   const exists = prev.some((o) => o.id === updatedOrder.id);
                   if (exists) {
                     return prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
                   }
                   return [updatedOrder, ...prev];
                });
              }}
              onNewLog={handleNewLog}
              printers={printers}
              hostedFiles={hostedFiles}
              setHostedFiles={setHostedFiles}
            />
          </div>
        )}

        {/* TAB 3: INDIVIDUAL SERVER DASHBOARD VIEW */}
        {activeTab === 'brain' && (
          <div className="max-w-4xl mx-auto w-full h-[620px] flex flex-col">
            <BrainServerDashboard
              orders={orders}
              logs={logs}
              onSetOrders={setOrders}
              onNewLog={handleNewLog}
              hostedFiles={hostedFiles}
              setHostedFiles={setHostedFiles}
              printers={printers}
              onSetPrinters={setPrinters}
              dispatchedAlerts={dispatchedAlerts}
              setDispatchedAlerts={setDispatchedAlerts}
            />
          </div>
        )}

        {/* TAB 4: INDIVIDUAL LOCAL SHOP PRINTERS VIEW */}
        {activeTab === 'printers' && (
          <div className="max-w-4xl mx-auto w-full h-[620px] flex flex-col">
            <LocalBridgeSimulator
              printers={printers}
              onSetPrinters={setPrinters}
              onNewLog={handleNewLog}
              activeOrderProgress={activePrintingOrder?.progress}
              activeOrderPrinterId={activePrintingOrder?.printerId}
            />
          </div>
        )}

        {/* TAB 5: PITCH ROI SLIDES AND SALES DECK */}
        {activeTab === 'roi' && (
          <div className="max-w-4xl mx-auto w-full">
            <PitchDeckROI />
          </div>
        )}

      </main>

      {/* Bottom Legal / Human credit-footer */}
      <footer className="bg-white/80 border-t border-indigo-100/80 py-5 px-4 text-center text-slate-400 text-[10px] font-mono leading-relaxed select-none shadow-inner mt-8">
        <p className="text-slate-500 font-semibold">PrintFlow Smart IoT Printing Solutions. Copyright © 2026. All Rights Reserved.</p>
        <p className="opacity-75 mt-1">Automating document dispatch via WhatsApp, SNMP telemetry, and Cloud Webhooks securely.</p>
      </footer>

    </div>
  );
}
