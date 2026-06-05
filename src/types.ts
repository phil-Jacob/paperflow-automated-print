/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Message {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  file?: {
    name: string;
    size: string;
    pages: number;
    type: string;
  };
  payment?: {
    amount: number;
    paymentLink: string;
    status: 'unpaid' | 'paid';
  };
}

export type OrderStatus =
  | 'chatting'
  | 'ready_to_pay'
  | 'paid_deposit'
  | 'routing'
  | 'printing'
  | 'ready_for_pickup'
  | 'completed';

export interface Order {
  id: string;
  customerPhone: string;
  customerName: string;
  fileName: string;
  fileSize: string;
  pages: number;
  copies: number;
  size: 'A4' | 'A3' | 'Letter';
  colorMode: 'B&W' | 'Color';
  simplexMode: 'Single' | 'Double';
  totalPrice: number;
  depositPaid: number;
  balancePaid: number;
  status: OrderStatus;
  printerId?: string;
  printerName?: string;
  timestamp: string;
  progress?: number; // for active printing progress
}

export type PrinterStatus = 'idle' | 'printing' | 'low_toner' | 'offline' | 'jammed';

export interface Printer {
  id: string;
  name: string;
  model: string;
  ipAddress: string;
  status: PrinterStatus;
  tonerLevel: number; // 0 to 100
  paperLevel: number; // 0 to 100
  paperType: 'A4' | 'A3' | 'Letter';
  queueCount: number;
  totalPrintedCount: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'whatsapp' | 'brain' | 'routing' | 'snmp' | 'local_agent' | 'payment';
  message: string;
  details?: string;
}

export interface HostedFile {
  id: string;
  fileName: string;
  orderId: string;
  uploadedAt: string;
  fileSize: string;
  status: 'active' | 'purged_completed' | 'purged_failsafe';
  timeLeftHrs: number;
}

export interface DispatchedAlert {
  id: string;
  timestamp: string;
  channel: 'SMS' | 'Email';
  recipient: string;
  message: string;
}
