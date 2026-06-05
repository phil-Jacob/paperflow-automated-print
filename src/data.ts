/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Printer, Order, LogEntry, HostedFile, DispatchedAlert } from './types';

export const INITIAL_PRINTERS: Printer[] = [
  {
    id: 'p1',
    name: 'Front Office Monochrome',
    model: 'HP LaserJet Enterprise M507',
    ipAddress: '192.168.10.45',
    status: 'idle',
    tonerLevel: 82,
    paperLevel: 95,
    paperType: 'A4',
    queueCount: 0,
    totalPrintedCount: 1420,
  },
  {
    id: 'p2',
    name: 'High-Volume Color Hub',
    model: 'Epson WorkForce Pro WF-C879R',
    ipAddress: '192.168.10.46',
    status: 'idle',
    tonerLevel: 55,
    paperLevel: 80,
    paperType: 'A4',
    queueCount: 0,
    totalPrintedCount: 948,
  },
  {
    id: 'p3',
    name: 'A3 Blueprint & Display Jet',
    model: 'Canon imageRUNNER ADVANCE C3530i',
    ipAddress: '192.168.10.47',
    status: 'idle',
    tonerLevel: 18, // Low Toner alert
    paperLevel: 30,
    paperType: 'A3',
    queueCount: 0,
    totalPrintedCount: 512,
  },
  {
    id: 'p4',
    name: 'Backup Counter Desk',
    model: 'Brother HL-L5200DW',
    ipAddress: '192.168.10.112',
    status: 'offline', // Offline
    tonerLevel: 0,
    paperLevel: 0,
    paperType: 'Letter',
    queueCount: 0,
    totalPrintedCount: 3340,
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: '1081',
    customerPhone: '+91 98765 43210',
    customerName: 'Anil Sharma',
    fileName: 'Engineering_Thesis_Final.pdf',
    fileSize: '4.8 MB',
    pages: 42,
    copies: 1,
    size: 'A4',
    colorMode: 'B&W',
    simplexMode: 'Double',
    totalPrice: 84.0,
    depositPaid: 42.0,
    balancePaid: 42.0,
    status: 'completed',
    printerId: 'p1',
    printerName: 'Front Office Monochrome',
    timestamp: '09:12 AM',
  },
  {
    id: '1082',
    customerPhone: '+91 81245 99021',
    customerName: 'Sarah Jenkins',
    fileName: 'Marketing_Brochure_May.pdf',
    fileSize: '12.4 MB',
    pages: 8,
    copies: 5,
    size: 'A4',
    colorMode: 'Color',
    simplexMode: 'Single',
    totalPrice: 200.0,
    depositPaid: 100.0,
    balancePaid: 100.0,
    status: 'completed',
    printerId: 'p2',
    printerName: 'High-Volume Color Hub',
    timestamp: '09:20 AM',
  },
  {
    id: '1083',
    customerPhone: '+91 90123 45678',
    customerName: 'Rahul Verma',
    fileName: 'Building_Layout_A3_Approved.pdf',
    fileSize: '15.1 MB',
    pages: 2,
    copies: 2,
    size: 'A3',
    colorMode: 'Color',
    simplexMode: 'Single',
    totalPrice: 60.0,
    depositPaid: 30.0,
    balancePaid: 0.0,
    status: 'ready_for_pickup',
    printerId: 'p3',
    printerName: 'A3 Blueprint & Display Jet',
    timestamp: '09:28 AM',
  },
];

export const INITIAL_LOGS: LogEntry[] = [
  {
    id: 'l1',
    timestamp: '09:00:05',
    type: 'snmp',
    message: 'Polled SNMP for [HP-LaserJet@192.168.10.45]: Response Code 200 - OK',
    details: 'OID-1.3.6.1.2.1.43.11.1.1.9.1 (toner level) returned 82%',
  },
  {
    id: 'l2',
    timestamp: '09:00:10',
    type: 'local_agent',
    message: 'Local Bridge connected to Cloud Server successfully',
    details: 'WS secure connection handshake established on port 443',
  },
  {
    id: 'l3',
    timestamp: '09:12:30',
    type: 'payment',
    message: 'Razorpay webhook received for Order #1081: 50% deposit received',
    details: 'Txn ID: pay_Nks8FhWja821h. Amount: ₹42.00 INR',
  },
  {
    id: 'l4',
    timestamp: '09:12:35',
    type: 'routing',
    message: 'Smart Router calculated: Front Office Monochrome chosen for Order #1081',
    details: 'Reason: Lowest queue count (0) & match for A4 B&W specifications.',
  },
  {
    id: 'l5',
    timestamp: '09:15:12',
    type: 'brain',
    message: 'File Privacy Autopurge triggered for completed Order #1081',
    details: 'Engineering_Thesis_Final.pdf deleted permanently from AWS S3 secure bucket. Latency: 24ms',
  },
];

export const INITIAL_HOSTED_FILES: HostedFile[] = [
  {
    id: 'h1',
    fileName: 'Engineering_Thesis_Final.pdf',
    orderId: '1081',
    uploadedAt: '09:12 AM',
    fileSize: '4.8 MB',
    status: 'purged_completed',
    timeLeftHrs: 0,
  },
  {
    id: 'h2',
    fileName: 'Marketing_Brochure_May.pdf',
    orderId: '1082',
    uploadedAt: '09:20 AM',
    fileSize: '12.4 MB',
    status: 'purged_completed',
    timeLeftHrs: 0,
  },
  {
    id: 'h3',
    fileName: 'Building_Layout_A3_Approved.pdf',
    orderId: '1083',
    uploadedAt: '09:28 AM',
    fileSize: '15.1 MB',
    status: 'active',
    timeLeftHrs: 23.5,
  }
];

export const INITIAL_DISPATCHED_ALERTS: DispatchedAlert[] = [
  {
    id: 'da1',
    timestamp: '09:00:15',
    channel: 'SMS',
    recipient: '+91 98765 43210',
    message: 'ALERT: Brother HL-L5200DW at 192.168.10.112 is OFFLINE. Spindle queue was diverted.',
  }
];

