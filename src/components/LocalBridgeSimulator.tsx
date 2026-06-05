/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Tv,
  CheckCircle,
  AlertTriangle,
  XOctagon,
  RefreshCw,
  FolderOpen,
  Wifi,
  Gauge,
  WifiOff,
} from 'lucide-react';
import { Printer, PrinterStatus } from '../types';

interface LocalBridgeSimulatorProps {
  printers: Printer[];
  onSetPrinters: React.Dispatch<React.SetStateAction<Printer[]>>;
  onNewLog: (type: 'whatsapp' | 'brain' | 'routing' | 'snmp' | 'local_agent' | 'payment', message: string, details?: string) => void;
  activeOrderProgress?: number;
  activeOrderPrinterId?: string;
}

export default function LocalBridgeSimulator({
  printers,
  onSetPrinters,
  onNewLog,
  activeOrderProgress,
  activeOrderPrinterId,
}: LocalBridgeSimulatorProps) {
  // Local agent daemon status simulator
  const [daemonActive, setDaemonActive] = useState(true);
  const [cpuUsage, setCpuUsage] = useState(1.4);
  const [ramUsage, setRamUsage] = useState(38); // MBs

  // Random small fluctuates to emulate real CPU usage
  useEffect(() => {
    if (!daemonActive) return;
    const t = setInterval(() => {
      setCpuUsage(Number((1.0 + Math.random() * 2).toFixed(1)));
      setRamUsage(Math.floor(37 + Math.random() * 4));
    }, 4000);
    return () => clearInterval(t);
  }, [daemonActive]);

  const handleJamTrigger = (printerId: string) => {
    onSetPrinters((prev) =>
      prev.map((p) => {
        if (p.id === printerId) {
          const isJammed = p.status === 'jammed';
          const nextStatus: PrinterStatus = isJammed ? 'idle' : 'jammed';
          onNewLog(
            'snmp',
            `SNMP Alert for ${p.name}: State modified to "${nextStatus.toUpperCase()}"`,
            isJammed
              ? 'Roller feed cleared. Status returned to normal.'
              : 'Physical paper jam detected inside tray 1. Printer offline flag raised.'
          );
          return {
            ...p,
            status: nextStatus,
          };
        }
        return p;
      })
    );
  };

  const handleRefillToner = (printerId: string) => {
    onSetPrinters((prev) =>
      prev.map((p) => {
        if (p.id === printerId) {
          onNewLog(
            'snmp',
            `Refill action triggered on ${p.name}`,
            'Refilled toner cartridge to 100%. Reloaded A3 high-grade paper deck (100%).'
          );
          return {
            ...p,
            tonerLevel: 100,
            paperLevel: 100,
            status: p.status === 'low_toner' ? 'idle' : p.status,
          };
        }
        return p;
      })
    );
  };

  const handleToggleOnline = (printerId: string) => {
    onSetPrinters((prev) =>
      prev.map((p) => {
        if (p.id === printerId) {
          const wasOffline = p.status === 'offline';
          const nextStatus: PrinterStatus = wasOffline ? 'idle' : 'offline';
          onNewLog(
            'snmp',
            `SNMP poll for ${p.name}: Connection ${wasOffline ? 'RESTORED' : 'LOST'}`,
            wasOffline
              ? `Handshake restored at IP ${p.ipAddress}. Readied spooler.`
              : `Socket error at IP ${p.ipAddress}. No response from SNMP broadcast.`
          );
          return {
            ...p,
            status: nextStatus,
            tonerLevel: wasOffline ? 75 : 0,
            paperLevel: wasOffline ? 80 : 0,
          };
        }
        return p;
      })
    );
  };

  const toggleDaemon = () => {
    const nextState = !daemonActive;
    setDaemonActive(nextState);
    if (!nextState) {
      onNewLog(
        'local_agent',
        'LOCAL PRINT DAEMON TERMINATED',
        'WS SSL connection timed out. Cloud Server can no longer route documents to local physical shop printers!'
      );
      // Turn all printers offline temporarily since bridge daemon can't read them
      onSetPrinters((prev) => prev.map((p) => ({ ...p, status: 'offline' })));
    } else {
      onNewLog(
        'local_agent',
        'LOCAL PRINT DAEMON INITIALIZED',
        'Connected to cloud running server. Dispatched local printer configurations.'
      );
      // Restore default printer healths
      onSetPrinters((prev) =>
        prev.map((p) => {
          if (p.id === 'p1') return { ...p, status: 'idle', tonerLevel: 82, paperLevel: 95 };
          if (p.id === 'p2') return { ...p, status: 'idle', tonerLevel: 55, paperLevel: 80 };
          if (p.id === 'p3') return { ...p, status: 'idle', tonerLevel: 18, paperLevel: 30 };
          return p; // keep others
        })
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-indigo-100 rounded-[2.5rem] overflow-hidden shadow-xl relative" id="cups-printers-card">
      
      {/* Top Header representing physical hardware agent */}
      <div className="bg-indigo-50/70 p-5 border-b border-indigo-100 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-slate-905 font-black text-sm tracking-tight flex items-center gap-1.5 text-slate-900">
              Local Hardware Agent Bridge
              {daemonActive ? (
                <span className="flex items-center text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-sans font-bold leading-none">
                  ONLINE
                </span>
              ) : (
                <span className="flex items-center text-[9px] bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-full font-sans font-bold leading-none animate-pulse">
                  DOWN
                </span>
              )}
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-sans">Raspberry Pi 4B Unit #01 • Local Subnet 192.168.10.*</p>
          </div>
        </div>

        {/* Local Agent metrics */}
        {daemonActive && (
          <div className="hidden sm:flex items-center gap-3.5 text-[10px] text-slate-400 font-bold font-sans">
            <div className="flex items-center gap-1 bg-white border border-indigo-50 shadow-xs rounded-lg px-2 py-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" /> CPU: <span className="text-slate-800 font-black">{cpuUsage}%</span>
            </div>
            <div className="flex items-center gap-1 bg-white border border-indigo-50 shadow-xs rounded-lg px-2 py-1">
              <Gauge className="w-3.5 h-3.5 text-indigo-600" /> RAM: <span className="text-slate-800 font-black">{ramUsage} MB</span>
            </div>
          </div>
        )}
      </div>

      {/* Control Strip for Raspberry Pi */}
      <div className="bg-white border-b border-indigo-50 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium font-sans">
          <span className="font-extrabold uppercase tracking-wider text-[9px] text-indigo-600">SNMP Port listener</span>
          <span className="text-slate-350">•</span>
          <span>Automatic polling frequency: 5s</span>
        </div>
        <button
          onClick={toggleDaemon}
          className={`text-[10px] font-bold px-4 py-1.5 rounded-full transition duration-200 border flex items-center gap-1 cursor-pointer shadow-sm ${
            daemonActive
              ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-200'
              : 'bg-indigo-600 hover:bg-indigo-750 text-white border-transparent font-black shadow shadow-indigo-150'
          }`}
        >
          {daemonActive ? 'Disable Local Agent' : 'Launch Local Agent Bridge'}
        </button>
      </div>

      {/* Main printer grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
        
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Network Printer Nodes</span>
          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 font-sans">
            <Wifi className="w-3.5 h-3.5 text-indigo-600" /> WebSockets SSL Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {printers.map((p) => {
            const isPrintingHere = activeOrderPrinterId === p.id && activeOrderProgress !== undefined && activeOrderProgress < 100;
            return (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border transition duration-200 relative overflow-hidden flex flex-col justify-between ${
                  isPrintingHere
                    ? 'bg-indigo-50/70 border-indigo-300 shadow-md shadow-indigo-100/50'
                    : p.status === 'offline'
                    ? 'bg-slate-50 border-slate-200 opacity-65'
                    : p.status === 'jammed'
                    ? 'bg-rose-50/60 border-rose-200 shadow-sm shadow-rose-100/50'
                    : 'bg-white border-indigo-100 hover:border-indigo-200 hover:shadow-md'
                }`}
              >
                
                {/* Printing Paper Visual Effect Overlay */}
                {isPrintingHere && (
                  <div className="absolute right-3 top-3 w-10 h-10 border border-indigo-300 bg-white shadow-sm rounded-xl flex items-center justify-center animate-bounce">
                    <FolderOpen className="w-5 h-5 text-indigo-600" />
                    {/* Animated laser-bar */}
                    <div className="absolute h-0.5 bg-indigo-500 left-1 right-1 top-1 animate-ping"></div>
                  </div>
                )}

                {/* Printer Header info */}
                <div>
                  <div className="flex justify-between items-start mb-2.5">
                    <div>
                      <h3 className="font-extrabold text-xs text-slate-900 leading-none mb-1">{p.name}</h3>
                      <p className="text-[9px] text-slate-400 font-bold font-mono">{p.model} • {p.ipAddress}</p>
                    </div>
                    
                    {/* Status Badge */}
                    <div>
                      {p.status === 'idle' && (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[8px] font-sans font-bold border border-emerald-250">
                          Idle
                        </span>
                      )}
                      {p.status === 'printing' && (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[8px] font-extrabold border border-indigo-750 shadow shadow-indigo-100 animate-pulse font-sans">
                          ACTIVE PRINT
                        </span>
                      )}
                      {p.status === 'low_toner' && (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-805 text-[8px] font-sans font-bold border border-amber-200">
                          Low Toner Alert
                        </span>
                      )}
                      {p.status === 'offline' && (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[8px] font-sans font-bold border border-slate-205">
                          Offline
                        </span>
                      )}
                      {p.status === 'jammed' && (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[8px] font-bold border border-rose-200 animate-bounce font-sans">
                          Paper Jam
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Printer specs */}
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-50 border border-slate-150 p-2 rounded-xl text-center font-sans font-bold text-[9px] mb-3 select-none text-slate-500">
                    <div>
                      <span className="text-slate-400 block text-[6.5px] uppercase font-bold tracking-wide">Standard Tray</span>
                      <span className="font-extrabold text-slate-800">{p.paperType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[6.5px] uppercase font-bold tracking-wide">Odometer</span>
                      <span className="font-extrabold text-slate-800">{p.totalPrintedCount} pages</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[6.5px] uppercase font-bold tracking-wide">Spindle Queue</span>
                      <span className={`font-extrabold ${isPrintingHere ? 'text-indigo-600 font-bold' : 'text-slate-800'}`}>
                        {isPrintingHere ? 1 : p.queueCount} job
                      </span>
                    </div>
                  </div>

                  {/* SNMP Meter: Toner levels */}
                  {p.status !== 'offline' ? (
                    <div className="space-y-2 mb-2">
                      {/* Toner Meter */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold text-[8.5px] text-slate-500 font-sans">
                          <span>SNMP OID-Toner Level:</span>
                          <span className={`font-black ${p.tonerLevel <= 20 ? 'text-rose-600 font-black' : 'text-slate-705'}`}>
                            {p.tonerLevel}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                          <div
                            className={`h-full transition-all duration-305 ${
                              p.tonerLevel <= 20 ? 'bg-rose-500' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${p.tonerLevel}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Paper tray meter */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold text-[8.5px] text-slate-500 font-sans">
                          <span>SNMP OID-Paper Tray 1:</span>
                          <span className="font-black text-slate-705">{p.paperLevel}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-105 rounded-full overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
                          <div
                            className="h-full bg-cyan-600 transition-all duration-305"
                            style={{ width: `${p.paperLevel}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 border border-dashed border-slate-200 rounded-2xl text-center flex flex-col items-center justify-center text-slate-400 text-[10px] mb-2 font-mono bg-slate-50/50">
                      <WifiOff className="w-5 h-5 text-slate-450 mb-1 text-slate-400" />
                      COULD NOT ACQUIRE SNMP DATA
                    </div>
                  )}
                </div>

                {/* Clerks simulation remote switches */}
                <div className="mt-3 pt-3 border-t border-indigo-50 flex gap-1.5 justify-end">
                  {p.status !== 'offline' && (
                    <>
                      <button
                        onClick={() => handleJamTrigger(p.id)}
                        className={`text-[8.5px] font-bold px-3 py-1.5 rounded-full transition border flex items-center gap-0.5 cursor-pointer ${
                          p.status === 'jammed'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-250 shadow-xs'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100'
                        }`}
                      >
                        {p.status === 'jammed' ? 'Clear Jam' : 'Trigger Jam'}
                      </button>
                      <button
                        onClick={() => handleRefillToner(p.id)}
                        className="text-[8.5px] font-bold px-3 py-1.5 bg-slate-55 hover:bg-slate-100 border border-slate-200 text-slate-650 hover:text-slate-805 rounded-full transition cursor-pointer"
                      >
                        Refill Deck
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleToggleOnline(p.id)}
                    className={`text-[8.5px] font-bold px-3 py-1.5 rounded-full transition border cursor-pointer ${
                      p.status === 'offline'
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-205 shadow-sm'
                        : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {p.status === 'offline' ? 'Force Online' : 'Kill Socket'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
