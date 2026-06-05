/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Server,
  Activity,
  Trash2,
  ListOrdered,
  Settings,
  Cpu,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Database,
  CheckCircle,
  Bell,
  Mail,
  MessageSquare,
  ShieldAlert,
  AlertTriangle,
  Check,
  Shield,
} from 'lucide-react';
import { Order, LogEntry, HostedFile, Printer, DispatchedAlert } from '../types';

interface BrainServerDashboardProps {
  orders: Order[];
  logs: LogEntry[];
  onSetOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onNewLog: (type: 'whatsapp' | 'brain' | 'routing' | 'snmp' | 'local_agent' | 'payment', message: string, details?: string) => void;
  hostedFiles: HostedFile[];
  setHostedFiles: React.Dispatch<React.SetStateAction<HostedFile[]>>;
  printers: Printer[];
  onSetPrinters: React.Dispatch<React.SetStateAction<Printer[]>>;
  dispatchedAlerts: DispatchedAlert[];
  setDispatchedAlerts: React.Dispatch<React.SetStateAction<DispatchedAlert[]>>;
}

export default function BrainServerDashboard({
  orders,
  logs,
  onSetOrders,
  onNewLog,
  hostedFiles,
  setHostedFiles,
  printers,
  onSetPrinters,
  dispatchedAlerts,
  setDispatchedAlerts,
}: BrainServerDashboardProps) {
  // Internal Dashboard Configuration Options
  const [loadBalancing, setLoadBalancing] = useState(true);
  const [autoPurge, setAutoPurge] = useState(true);
  const [pricingMode, setPricingMode] = useState<'standard' | 'high_rate'>('standard');
  const [subTab, setSubTab] = useState<'orders' | 'alerts' | 'storage'>('orders');
  const [activeDispatchToast, setActiveDispatchToast] = useState<{message: string; channel: 'SMS' | 'Email'} | null>(null);

  // Reactively compute active warnings directly from the printers list!
  const activeResourceWarnings = printers.flatMap((p) => {
    const list = [];
    if (p.status === 'offline') {
      list.push({
        id: `${p.id}_offline`,
        printerName: p.name,
        type: 'OFFLINE',
        severity: 'high' as const,
        details: `Inoperable: No SNMP response. IP ${p.ipAddress} tcp/161 timeout. CUPS spool stalling.`,
        action: 'Check power connection, router LAN ports, or restart physical bridge Raspberry Pi.',
      });
    } else if (p.status === 'jammed') {
      list.push({
        id: `${p.id}_jammed`,
        printerName: p.name,
        type: 'PAPER JAMMED',
        severity: 'high' as const,
        details: `Physical blockage inside drum assembly feed roller. Sensor 402 raised.`,
        action: 'Gently open front chassis door, disconnect drum lever, and remove shredded debris.',
      });
    }
    if (p.tonerLevel <= 20 && p.status !== 'offline') {
      list.push({
        id: `${p.id}_low_toner`,
        printerName: p.name,
        type: 'LOW INK/TONER',
        severity: 'medium' as const,
        details: `Resource depletion alert: Toner capacity thin at ${p.tonerLevel}%. OID .1.3.61.11.9 warning.`,
        action: 'Acquire high-yield carbon ink cartridges and replace immediately.',
      });
    }
    if (p.paperLevel <= 20 && p.status !== 'offline') {
      list.push({
        id: `${p.id}_low_paper`,
        printerName: p.name,
        type: 'LOW PAPER FEED',
        severity: 'medium' as const,
        details: `Stock warning: Ledger paper feed deck has dropped to ${p.paperLevel}%.`,
        action: 'Replenish main bottom load deck with fresh reams of A4/A3 80gsm paper.',
      });
    }
    return list;
  });

  const handleSimulateSMSAlert = (warningType: string, printerName: string) => {
    const recipientNum = '+91 98765 43210';
    const alertMsg = `⚠️ ALERT: ${printerName} reports ${warningType}! Technical action required. CUPS server standby.`;
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const newAlert: DispatchedAlert = {
      id: `alert_${Date.now()}`,
      timestamp,
      channel: 'SMS',
      recipient: recipientNum,
      message: alertMsg,
    };
    
    setDispatchedAlerts(prev => [newAlert, ...prev]);
    onNewLog('snmp', `[SMS alert delivered to Shop Owner] on ${recipientNum}`, alertMsg);
    
    setActiveDispatchToast({ message: `SMS alert dispatched to ${recipientNum}!`, channel: 'SMS' });
    setTimeout(() => setActiveDispatchToast(null), 3500);
  };

  const handleSimulateEmailAlert = (warningType: string, printerName: string) => {
    const recipientEmail = 'owner@flowprint.in';
    const alertMsg = `⚠️ SECURITY & PRINT METRIC REPORT: ${printerName} transition state detected as ${warningType}. OID status code 400. Standard alert relay trigger active.`;
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const newAlert: DispatchedAlert = {
      id: `alert_${Date.now()}`,
      timestamp,
      channel: 'Email',
      recipient: recipientEmail,
      message: alertMsg,
    };
    
    setDispatchedAlerts(prev => [newAlert, ...prev]);
    onNewLog('snmp', `[Email alert relayed to operator] on ${recipientEmail}`, alertMsg);
    
    setActiveDispatchToast({ message: `SMTP Warning Alert emailed to ${recipientEmail}!`, channel: 'Email' });
    setTimeout(() => setActiveDispatchToast(null), 3500);
  };

  const handleTrigger24hFailsafe = () => {
    let triggeredCount = 0;
    
    setHostedFiles((prevFiles) =>
      prevFiles.map((f) => {
        if (f.status === 'active') {
          triggeredCount++;
          onNewLog(
            'brain',
            `Failsafe Timeout Purged: Deleted "${f.fileName}" from cloud server.`,
            `File expired after 24 hours without a confirmed CUPS completion handshake for Order #${f.orderId}.`
          );
          return {
            ...f,
            status: 'purged_failsafe' as const,
            timeLeftHrs: 0,
          };
        }
        return f;
      })
    );
    
    if (triggeredCount === 0) {
      onNewLog('brain', '24-Hour Policy Failsafe check executed.', 'No active un-purged PDF files encountered in cloud directory.');
      setActiveDispatchToast({ message: 'No active cloud files found to purge.', channel: 'Email' });
    } else {
      setActiveDispatchToast({ message: `Failsafe triggered! ${triggeredCount} file(s) permanently deleted.`, channel: 'SMS' });
    }
    setTimeout(() => setActiveDispatchToast(null), 3500);
  };

  const totalRevenue = orders.reduce((sum, o) => {
    if (o.status === 'completed') return sum + o.totalPrice;
    if (o.status === 'ready_for_pickup') return sum + o.depositPaid;
    if (maturedStatuses.includes(o.status)) return sum + o.depositPaid;
    return sum;
  }, 0);

  // Active or mature order statuses
  const activeStatuses = ['routing', 'printing', 'ready_for_pickup'];
  const maturedStatuses = ['paid_deposit', 'routing', 'printing', 'ready_for_pickup', 'completed'];

  const handleOrderCollect = (orderId: string) => {
    onSetOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const balance = o.totalPrice - o.depositPaid;
          onNewLog(
            'brain',
            `Order #${o.id} marked as COMPLETED (Customer pickup)`,
            `Remaining counter cash collected: ₹${balance}.00. All files cleared out of database securely.`
          );
          return {
            ...o,
            status: 'completed',
            balancePaid: balance,
          };
        }
        return o;
      })
    );
  };

  const clearAllLogs = () => {
    onNewLog('brain', 'System logs cleared physically by administrative action.');
  };  return (
    <div className="flex flex-col h-full bg-white border border-indigo-100 rounded-[2.5rem] overflow-hidden shadow-xl relative" id="brain-dashboard-card">
      
      {/* Dashboard Top Header */}
      <div className="bg-indigo-50/70 p-5 border-b border-indigo-100 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md">
            <Server className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-slate-900 font-black text-sm tracking-tight flex items-center gap-2">
              The Brain: Cloud Node Server
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
              </span>
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-sans">Cloud Run Managed • Asia-East1</p>
          </div>
        </div>

        {/* Dynamic settings flags */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-650 bg-white px-2.5 py-1.5 rounded-lg border border-indigo-100 shadow-xs">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline font-bold">Smart Router:</span>
            <button
              onClick={() => {
                setLoadBalancing(!loadBalancing);
                onNewLog('routing', `Smart Routing toggled: ${!loadBalancing ? 'AUTOMATIC LOAD BALANCING ENABLED' : 'SIMPLE PROGRESSIVE ROUTING'}`);
              }}
              className="font-black flex items-center text-indigo-700 hover:text-indigo-900 transition cursor-pointer"
            >
              {loadBalancing ? (
                <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-0.5 font-sans font-bold">Active</span>
              ) : (
                <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-0.5 font-sans font-bold">Simple</span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-650 bg-white px-2.5 py-1.5 rounded-lg border border-indigo-100 shadow-xs">
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline font-bold">Autopurge:</span>
            <button
              onClick={() => {
                setAutoPurge(!autoPurge);
                onNewLog('brain', `File secure autopurge set to: ${!autoPurge ? 'INSTANT UPON SUCCESS' : 'DISABLED'}`);
              }}
              className={`font-black uppercase tracking-wider cursor-pointer ${autoPurge ? 'text-emerald-700' : 'text-slate-400'}`}
            >
              {autoPurge ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Monitor Numbers Panel */}
      <div className="grid grid-cols-4 border-b border-indigo-100 bg-gradient-to-r from-indigo-50/20 via-white to-indigo-50/20 text-center select-none divide-x divide-indigo-100">
        <div className="p-3">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Orders Processed</span>
          <span className="text-lg font-black text-slate-800 tracking-tight flex items-center justify-center gap-1">
            <ListOrdered className="w-4 h-4 text-indigo-600 shrink-0" />
            {orders.length}
          </span>
        </div>
        <div className="p-3">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">System Revenue</span>
          <span className="text-lg font-black text-indigo-600 tracking-tight flex items-center justify-center gap-0.5 italic">
            <span className="text-indigo-500 font-extrabold pr-0.5 not-italic">₹</span>
            {totalRevenue}.00
          </span>
        </div>
        <div className="p-3">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Active Queue</span>
          <span className="text-lg font-black text-slate-800 tracking-tight flex items-center justify-center gap-1.5">
            <Activity className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
            {orders.filter((o) => activeStatuses.includes(o.status)).length}
          </span>
        </div>
        <div className="p-3">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Purged DB Files</span>
          <span className="text-lg font-black text-emerald-600 tracking-tight flex items-center justify-center gap-1">
            <Database className="w-4 h-4 text-emerald-500 shrink-0" />
            {orders.filter((o) => o.status === 'completed' || o.status === 'ready_for_pickup').length}
          </span>
        </div>
      {/* Two-part layout - Top half orders list, Bottom half terminal logs */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-50/40">
        
        {/* Dynamic Dispatch Notification Banner toast */}
        {activeDispatchToast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 animate-bounce">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white shadow-lg ${
              activeDispatchToast.channel === 'SMS' ? 'bg-indigo-600 shadow-indigo-200' : 'bg-pink-600 shadow-pink-200'
            }`}>
              <Bell className="w-3.5 h-3.5 animate-pulse" />
              {activeDispatchToast.message}
            </div>
          </div>
        )}

        {/* Sub-tab Navigation Bar */}
        <div className="bg-white border-b border-indigo-100/50 p-2.5 flex items-center justify-between shadow-xs select-none">
          <div className="flex gap-1">
            <button
              onClick={() => setSubTab('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition duration-155 cursor-pointer ${
                subTab === 'orders'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-550 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              Live Feed ({orders.length})
            </button>
            <button
              onClick={() => setSubTab('alerts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition duration-155 relative cursor-pointer ${
                subTab === 'alerts'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-550 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              Printer Alerts
              {activeResourceWarnings.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </button>
            <button
              onClick={() => setSubTab('storage')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition duration-155 cursor-pointer ${
                subTab === 'storage'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-550 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              PDF Purge Policy
            </button>
          </div>
          
          <div className="text-[9.5px] text-slate-405 font-mono hidden sm:block">
            {subTab === 'orders' && 'Webhook poller active'}
            {subTab === 'alerts' && 'SNMP Metrics daemon live'}
            {subTab === 'storage' && 'Cloud storage rules: 24h Threshold'}
          </div>
        </div>

        {/* UPPER: Dynamic scrollable container displaying selected sub-tab */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
          {subTab === 'orders' && (
            <>
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Live Orders Feed</span>
                <span className="text-[9px] text-slate-400 flex items-center gap-1 font-mono">
                  <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
                  Polling webhook payloads
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-3xl border border-indigo-50 shadow-sm">
                  <p className="text-xs text-slate-500 mb-1">No orders currently inside server queue.</p>
                  <p className="text-[10px] text-slate-400 font-black tracking-wide">Use the WhatsApp Simulator to launch mock print jobs.</p>
                </div>
              ) : (
                <div className="border border-indigo-100 rounded-[2rem] overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-indigo-50/50 border-b border-indigo-100 text-[10px] text-indigo-800 font-bold">
                        <th className="p-3">ID</th>
                        <th className="p-3">File Details</th>
                        <th className="p-3">Specs</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-50">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-indigo-50/15 transition text-slate-700">
                          
                          {/* ID / Name */}
                          <td className="p-3 font-mono text-indigo-600 font-extrabold">#{o.id}</td>
                          
                          {/* File Details */}
                          <td className="p-3 max-w-[150px]">
                            <p className="font-bold text-slate-900 truncate font-sans" title={o.fileName}>{o.fileName}</p>
                            <p className="text-[9px] text-slate-400 font-bold font-mono">{o.customerPhone}</p>
                          </td>

                          {/* Specs */}
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1 text-[9px] font-mono">
                              <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-705 rounded-md font-bold">{o.size}</span>
                              <span className={`px-1.5 py-0.5 rounded-md font-bold ${o.colorMode === 'Color' ? 'bg-indigo-100 text-indigo-707' : 'bg-slate-100 text-slate-400 border border-slate-200/50'}`}>
                                {o.colorMode}
                              </span>
                              <span className="px-1.5 py-0.5 bg-slate-50 border border-slate-200/50 text-slate-500 rounded-md font-bold">{o.pages}p</span>
                            </div>
                          </td>

                          {/* Total Price */}
                          <td className="p-3">
                            <p className="font-black text-slate-900 italic">₹{o.totalPrice}</p>
                            <p className="text-[9px] text-slate-400 font-medium">
                              Dep: <span className="text-emerald-700 font-bold">₹{o.depositPaid}</span>
                            </p>
                          </td>

                          {/* Status badge with responsive actions */}
                          <td className="p-3 whitespace-nowrap">
                            {o.status === 'chatting' && (
                              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200 text-[9px] uppercase tracking-wider">
                                Conversing
                              </span>
                            )}
                            {o.status === 'ready_to_pay' && (
                              <span className="px-2.5 py-1 rounded-full bg-amber-105 text-amber-800 font-bold border border-amber-200 text-[9px] uppercase tracking-wider animate-pulse">
                                Wait Invoice
                              </span>
                            )}
                            {o.status === 'paid_deposit' && (
                              <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-808 font-bold border border-indigo-200 text-[9px] uppercase tracking-wider">
                                Paid Deposit
                              </span>
                            )}
                            {o.status === 'routing' && (
                              <span className="px-2.5 py-1 rounded-full bg-indigo-600 text-white font-bold text-[9px] uppercase tracking-wider shadow shadow-indigo-100">
                                Routing...
                              </span>
                            )}
                            {o.status === 'printing' && (
                              <div className="space-y-1">
                                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 text-[9px] uppercase tracking-wider block w-max">
                                  Printing ({o.progress}%)
                                </span>
                                <div className="w-16 h-1.5 bg-slate-100 border border-slate-200/40 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${o.progress}%` }}></div>
                                </div>
                              </div>
                            )}
                            {o.status === 'ready_for_pickup' && (
                              <span className="px-2.5 py-1 rounded-full bg-yellow-101 text-yellow-800 font-black border border-yellow-250 text-[9px] uppercase tracking-wider">
                                Ready Counter
                              </span>
                            )}
                            {o.status === 'completed' && (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-110 text-emerald-800 font-black border border-emerald-200 text-[9px] uppercase tracking-wider flex items-center gap-1 w-max">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Collected
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-3 text-right whitespace-nowrap">
                            {o.status === 'ready_for_pickup' ? (
                              <button
                                onClick={() => handleOrderCollect(o.id)}
                                className="text-[9px] bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold py-1.5 px-3 rounded-full shadow shadow-indigo-100 transition duration-150 cursor-pointer"
                              >
                                Collect ₹{o.totalPrice - o.depositPaid} & Clear
                              </button>
                            ) : o.status === 'completed' && autoPurge ? (
                              <span className="text-[9px] text-red-650 font-bold flex items-center justify-end gap-1 font-sans">
                                <Trash2 className="w-3 h-3 text-red-650" /> Secure Purged
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-400 font-bold">Standby</span>
                            )}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {subTab === 'alerts' && (
            <div className="space-y-4 font-sans text-xs animate-fadeIn">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Printer Telemetry Warn Center</span>
                <span className="text-[9px] text-slate-400 flex items-center gap-1 font-mono bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-indigo-650 rounded-full animate-ping"></span>
                  SNMP Daemon: active
                </span>
              </div>

              {/* Warnings details */}
              <div className="space-y-2.5">
                {activeResourceWarnings.length === 0 ? (
                  <div className="text-center py-7.5 bg-emerald-50 text-emerald-800 rounded-3xl border border-emerald-100 space-y-1">
                    <CheckCircle className="w-6 h-6 text-emerald-605 mx-auto" />
                    <p className="font-bold text-xs">All Hardware Systems Healthy</p>
                    <p className="text-[9.5px] text-emerald-600 font-medium">No alerts raised. SNMP Polling community "public" reported zero faults.</p>
                  </div>
                ) : (
                  activeResourceWarnings.map((warning) => (
                    <div
                      key={warning.id}
                      className={`p-3.5 rounded-2xl border ${
                        warning.severity === 'high'
                          ? 'bg-rose-50 border-rose-100 text-rose-900 shadow-xs'
                          : 'bg-amber-50 border-amber-200 text-amber-900 shadow-xs'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2.5">
                        <div className="flex gap-2">
                          <div className={`p-1.5 rounded shrink-0 ${warning.severity === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                            {warning.severity === 'high' ? <ShieldAlert className="w-4 h-4 animate-pulse" /> : <AlertTriangle className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-mono bg-white border border-slate-200">
                                {warning.type}
                              </span>
                              <h5 className="font-extrabold text-[11px] font-mono text-slate-900">{warning.printerName}</h5>
                            </div>
                            <p className="text-[10px] mt-1.5 opacity-85 leading-relaxed font-sans">{warning.details}</p>
                            <p className="text-[9.5px] mt-1 font-bold text-slate-700 flex items-start gap-1 font-sans">
                              <span className="text-indigo-600 shrink-0">🔧 Action:</span> {warning.action}
                            </p>
                          </div>
                        </div>

                        {/* Dispatch actions */}
                        <div className="flex flex-col gap-1.5 shrink-0 select-none">
                          <button
                            onClick={() => handleSimulateSMSAlert(warning.type, warning.printerName)}
                            className="bg-indigo-650 hover:bg-indigo-755 active:scale-95 text-white font-extrabold text-[9px] py-1 px-2.5 rounded-md flex items-center justify-center gap-1 transition duration-155 shadow-xs cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3" /> Test SMS Owner
                          </button>
                          <button
                            onClick={() => handleSimulateEmailAlert(warning.type, warning.printerName)}
                            className="bg-pink-600 hover:bg-pink-700 active:scale-95 text-white font-extrabold text-[9px] py-1 px-2.5 rounded-md flex items-center justify-center gap-1 transition duration-155 shadow-xs cursor-pointer"
                          >
                            <Mail className="w-3 h-3" /> Test Email Owner
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Alert Logs header */}
              <div className="pt-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block mb-2">Dispatched Owner Message Stream ({dispatchedAlerts.length})</span>
                <div className="border border-indigo-100 rounded-xl overflow-hidden bg-white max-h-[140px] overflow-y-auto shadow-sm">
                  <table className="w-full text-left text-[10px] border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-indigo-55 text-slate-500 font-bold font-mono text-[9px]">
                        <th className="p-2">Time</th>
                        <th className="p-2">Channel</th>
                        <th className="p-2">Recipient</th>
                        <th className="p-2">Payload Notification Body</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-55 font-mono text-[9.5px] text-slate-650">
                      {dispatchedAlerts.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-405 italic text-[10px]">No alerts dispatched via Twilio/SMTP APIs yet.</td>
                        </tr>
                      ) : (
                        dispatchedAlerts.map((da) => (
                          <tr key={da.id} className="hover:bg-slate-50/50">
                            <td className="p-2 whitespace-nowrap text-slate-400 font-bold">{da.timestamp}</td>
                            <td className="p-2 whitespace-nowrap font-sans">
                              <span className={`px-1.5 py-0.5 rounded font-bold text-[8px] ${da.channel === 'SMS' ? 'bg-indigo-100 text-indigo-700' : 'bg-pink-100 text-pink-700'}`}>
                                {da.channel}
                              </span>
                            </td>
                            <td className="p-2 whitespace-nowrap font-bold text-slate-700">{da.recipient}</td>
                            <td className="p-2 truncate max-w-[200px]" title={da.message}>{da.message}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {subTab === 'storage' && (
            <div className="space-y-4 font-sans text-xs animate-fadeIn">
              {/* Privacy summary card */}
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 p-4 rounded-3xl flex items-start gap-3">
                <div className="p-2 bg-teal-600 text-white rounded-lg shadow-sm shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-[11px] text-slate-900 font-sans">Active Document Deletion Policy Rules</h4>
                  <p className="text-[10px] text-slate-600 leading-relaxed font-sans">
                    User PDFs are hosted temporarily inside secured staging directory. Upon a local printing agent's confirmation signal (CUPS spooler completed transaction), the Cloud Server triggers an <strong>immediate purge action</strong>. An automated 24-hour timeout cron serves as a protective fallback.
                  </p>
                </div>
              </div>

              {/* Trigger failsafe controller */}
              <div className="flex justify-between items-center gap-3 bg-white p-3 rounded-2xl border border-indigo-100 shadow-sm">
                <div>
                  <span className="text-[11px] font-black text-slate-905 block font-sans">Simulate Timeout Rule</span>
                  <p className="text-[9.5px] text-slate-450 leading-relaxed font-sans">Advance system runtime by 24 hours to trigger the deletion backup policy for active document streams.</p>
                </div>
                <button
                  onClick={handleTrigger24hFailsafe}
                  className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-[10px] py-2 px-3.5 rounded-xl shrink-0 shadow-sm transition duration-150 cursor-pointer"
                >
                  ⏱ Fast-Forward 24 Hours
                </button>
              </div>

              {/* Storage ledger */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block">Active Cloud Storage Inventory ({hostedFiles.filter(h=>h.status==='active').length})</span>
                <div className="border border-indigo-100 rounded-xl overflow-hidden bg-white max-h-[160px] overflow-y-auto shadow-sm">
                  <table className="w-full text-left text-[11px] border-collapse text-slate-705">
                    <thead>
                      <tr className="bg-slate-50 border-b border-indigo-55 text-[10px] text-slate-505 font-bold font-sans">
                        <th className="p-3">File Reference</th>
                        <th className="p-3">Associated Order</th>
                        <th className="p-3">Size</th>
                        <th className="p-3">Timeout Left</th>
                        <th className="p-3">Data Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-50">
                      {hostedFiles.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-400 italic font-mono text-[10px]">Cloud staging bucket is currently empty.</td>
                        </tr>
                      ) : (
                        hostedFiles.map((f) => (
                          <tr key={f.id} className="hover:bg-slate-55/40 text-[10.5px]">
                            <td className="p-3 max-w-[170px] truncate">
                              <p className={`font-mono text-xs ${f.status !== 'active' ? 'text-slate-400 line-through' : 'font-extrabold text-slate-800'}`}>{f.fileName}</p>
                              <span className="text-[9px] text-slate-400 block font-bold font-mono">Uploaded: {f.uploadedAt}</span>
                            </td>
                            <td className="p-3 font-mono text-indigo-500 font-bold">#{f.orderId}</td>
                            <td className="p-3 font-mono text-slate-400">{f.fileSize}</td>
                            <td className="p-3 font-mono font-bold text-slate-500">
                              {f.status === 'active' ? (
                                <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 text-[10px] inline-flex items-center gap-1 animate-pulse font-sans">
                                  ⏱ {f.timeLeftHrs} Hrs Left
                                </span>
                              ) : (
                                <span className="text-slate-300 font-semibold">—</span>
                              )}
                            </td>
                            <td className="p-3 text-[10px] font-sans">
                              {f.status === 'active' && (
                                <span className="px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-805 border border-indigo-100 text-[9px] uppercase tracking-wider">
                                  Active • Staged
                                </span>
                              )}
                              {f.status === 'purged_completed' && (
                                <span className="px-2 py-0.5 rounded-full font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-100 text-[9px] uppercase tracking-wider inline-flex items-center gap-1 leading-none shadow-3xs cursor-default">
                                  ✓ Clear Purged
                                </span>
                              )}
                              {f.status === 'purged_failsafe' && (
                                <span className="px-2 py-0.5 rounded-full font-extrabold bg-rose-50 border border-rose-100 text-rose-800 text-[9px] uppercase tracking-wider inline-flex items-center gap-1 leading-none shadow-3xs cursor-default">
                                  ⏱ Timeout Expired
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

        {/* LOWER: Server Terminal Logs in high-end graphite slate */}
        <div className="h-[210px] bg-slate-900 border-t border-indigo-150 flex flex-col font-mono text-[10px]">
          
          {/* Logs Tab Bar */}
          <div className="bg-slate-950/70 border-b border-slate-850 px-4 py-2.5 flex justify-between items-center text-[9px] select-none text-slate-300">
            <span className="uppercase font-extrabold tracking-widest text-indigo-350 flex items-center gap-1.5 text-indigo-300">
              <span className="inline-block w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></span>
              Orchestrator Terminal Stream
            </span>
            <button
              onClick={clearAllLogs}
              className="text-[9px] text-slate-400 hover:text-white transition font-bold uppercase tracking-wider cursor-pointer"
            >
              Clear Screen
            </button>
          </div>

          {/* Logs stream body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 text-slate-300 bg-slate-950/40">
            {logs.length === 0 ? (
              <p className="text-slate-600 italic text-[10px] text-center mt-8 font-semibold">System environment standby.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="relative pl-14 leading-relaxed group">
                  {/* Timestamp Tag */}
                  <span className="absolute left-0 top-0 text-slate-500 font-bold select-none font-mono">
                    {log.timestamp}
                  </span>

                  {/* Logs content based on type */}
                  <span className="font-bold select-none mr-2 font-mono">
                    {log.type === 'whatsapp' && <span className="text-emerald-400">[WHATSAPP]</span>}
                    {log.type === 'brain' && <span className="text-indigo-400">[ENGINE]</span>}
                    {log.type === 'payment' && <span className="text-teal-400">[PAY-GATE]</span>}
                    {log.type === 'routing' && <span className="text-sky-300">[ROUTER]</span>}
                    {log.type === 'snmp' && <span className="text-amber-400">[SNMP-AGENT]</span>}
                    {log.type === 'local_agent' && <span className="text-[#00E5FF]">[LOCAL-CUP]</span>}
                  </span>

                  {/* Log body message */}
                  <span className="text-slate-200">{log.message}</span>

                  {/* Optional log details bullet */}
                  {log.details && (
                    <p className="text-[9px] text-slate-400 italic mt-0.5 leading-tight pl-2 border-l border-indigo-650">
                      ↳ {log.details}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
