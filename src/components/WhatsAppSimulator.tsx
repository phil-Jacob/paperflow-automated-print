/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  CheckCheck,
  FileText,
  Phone,
  Video,
  MoreVertical,
  ChevronRight,
  Sparkles,
  CreditCard,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { HostedFile, Message, Order, Printer } from '../types';

interface WhatsAppSimulatorProps {
  onOrderUpdate: (order: Order) => void;
  onNewLog: (type: 'whatsapp' | 'brain' | 'routing' | 'snmp' | 'local_agent' | 'payment', message: string, details?: string) => void;
  printers: Printer[];
  hostedFiles: HostedFile[];
  setHostedFiles: React.Dispatch<React.SetStateAction<HostedFile[]>>;
}

export default function WhatsAppSimulator({
  onOrderUpdate,
  onNewLog,
  printers,
  hostedFiles,
  setHostedFiles,
}: WhatsAppSimulatorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: "👋 Welcome to PrintFlow AutoShop!\n\nI am your automated 24/7 self-service printing assistant.\n\nSend me any PDF, Word, or Image file to get started, or simply reply with 'Hi' to start your order!",
      timestamp: '09:30 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Modal State for Payment Gateway
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addBotMessage = (text: string, delay = 1000, attachments?: any) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const newBotMsg: Message = {
        id: `m_${Date.now()}`,
        sender: 'bot',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...attachments,
      };
      setMessages((prev) => [...prev, newBotMsg]);
      onNewLog('whatsapp', `Bot sent: "${text.substring(0, 45)}..."`);
    }, delay);
  };

  const calculateCost = (pages: number, copies: number, size: string, color: string): number => {
    const basePageCost = color === 'Color' ? 10.0 : 2.0; // INR / generic units
    const sizeMultiplier = size === 'A3' ? 1.5 : 1.0;
    return pages * copies * basePageCost * sizeMultiplier;
  };

  // Pre-configured Guided Demo Actions
  const runDemoStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: // Say Hello
        const userMsg1: Message = {
          id: `u_${Date.now()}`,
          sender: 'user',
          text: 'Hi! I need to print some reports.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, userMsg1]);
        onNewLog('whatsapp', 'User sent: "Hi! I need to print some reports."');

        addBotMessage(
          "Great! I can help you print that right away. 🖨️\n\nPlease upload or send your document file (PDF, DOCX, or JPEG) to generate a pricing quote.",
          1200
        );
        setCurrentStep(2);
        break;

      case 2: // Upload Document
        const testFile = {
          name: 'Annual_Report_2026.pdf',
          size: '3.4 MB',
          pages: 12,
          type: 'application/pdf',
        };

        const userMsg2: Message = {
          id: `u_${Date.now()}`,
          sender: 'user',
          text: 'Sent: Annual_Report_2026.pdf',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          file: testFile,
        };
        setMessages((prev) => [...prev, userMsg2]);
        onNewLog('whatsapp', 'User uploaded document: Annual_Report_2026.pdf (12 pages)');
        onNewLog('brain', 'Cloud Server received PDF: Annual_Report_2026.pdf. Analyzing pages...');

        // Create temporary order on backend
        const initialCost = calculateCost(12, 1, 'A4', 'B&W');
        const generatedId = (1080 + Math.floor(Math.random() * 900)).toString();
        const newOrder: Order = {
          id: generatedId,
          customerPhone: '+91 94452 88124',
          customerName: 'Pitch Investor',
          fileName: testFile.name,
          fileSize: testFile.size,
          pages: testFile.pages,
          copies: 1,
          size: 'A4',
          colorMode: 'B&W',
          simplexMode: 'Double',
          totalPrice: initialCost,
          depositPaid: 0,
          balancePaid: 0,
          status: 'chatting',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setCurrentOrder(newOrder);
        onOrderUpdate(newOrder);

        // Also add to cloud hosted files tracker
        setHostedFiles((prev) => [
          ...prev,
          {
            id: `h_${generatedId}`,
            fileName: testFile.name,
            orderId: generatedId,
            uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            fileSize: testFile.size,
            status: 'active',
            timeLeftHrs: 24,
          },
        ]);

        addBotMessage(
          `📄 *Document Analyzed!* \nFile: _${testFile.name}_\nPages: *${testFile.pages}*\n\nLet's set your printing properties. Reply with numbers or select below: \n\n1️⃣ **Page Size**: A4\n2️⃣ **Color Mode**: Black & White\n3️⃣ **Layout**: Double-Sided\n4️⃣ **Copies**: 1\n\n*Current Price Summary*:\n₹2.00 per page × 12 pages = *₹24.00 total*\n\nReply 'CONFIRM' to get payment invoice, or use quick tools below to customize!`,
          1500
        );
        setCurrentStep(3);
        break;

      case 3: // Change printer specs to Color/A4 Double
        if (!currentOrder) return;
        const updatedOrder: Order = {
          ...currentOrder,
          colorMode: 'Color',
          copies: 2,
          totalPrice: calculateCost(12, 2, 'A4', 'Color'),
        };
        setCurrentOrder(updatedOrder);
        onOrderUpdate(updatedOrder);

        const userMsg3: Message = {
          id: `u_${Date.now()}`,
          sender: 'user',
          text: 'Make it COLOR, and I need 2 copies please!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, userMsg3]);
        onNewLog('whatsapp', 'User changed requirements: Color Mode -> Color, Copies -> 2');
        onNewLog('brain', 'Cloud Server recalculated pricing based on updated criteria: Color, 2 copies.');

        addBotMessage(
          `📝 *Specs Updated!* \n1️⃣ **Page Size**: A4\n2️⃣ **Color Mode**: ✨ Color\n3️⃣ **Layout**: Double-Sided\n4️⃣ **Copies**: *2*\n\n*New Recalculated Price*:\n₹10.00 per Color page × 12 pages × 2 copies = *₹240.00 total.*\n\nReply 'PAY' to initiate your 50% booking deposit of *₹120.00*.`,
          1400
        );
        setCurrentStep(4);
        break;

      case 4: // Generate Payment invoice link
        if (!currentOrder) return;
        const bookingOrder: Order = {
          ...currentOrder,
          status: 'ready_to_pay',
        };
        setCurrentOrder(bookingOrder);
        onOrderUpdate(bookingOrder);

        const userMsg4: Message = {
          id: `u_${Date.now()}`,
          sender: 'user',
          text: 'PAY',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, userMsg4]);
        onNewLog('whatsapp', 'User requested payment instructions');

        const deposit = Math.round(bookingOrder.totalPrice / 2);
        addBotMessage(
          `🔒 *Payment Invoice Generated!*\n\nTo lock your print slot and avoid abandoned paper waste, we require a *50% booking deposit*.\n\n💵 *Deposit Amount*: ₹${deposit}.00 INR\n💵 *Counter Cash Balance*: ₹${bookingOrder.totalPrice - deposit}.00 INR\n\nClick the link below to securely pay via Razorpay/Stripe:`,
          1000,
          {
            payment: {
              amount: deposit,
              paymentLink: `https://checkout.sandbox.flow/pay/${bookingOrder.id}`,
              status: 'unpaid',
            },
          }
        );
        setCurrentStep(5);
        break;

      case 5: // Trigger Payment Gateway Modal
        setShowPaymentModal(true);
        onNewLog('payment', 'Opening Razorpay/Stripe checkout mockup framework natively...');
        break;

      default:
        break;
    }
  };

  const handleCustomSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    onNewLog('whatsapp', `User typed custom message: "${inputText}"`);
    setInputText('');

    // Responsive Sim chatbot engine
    const query = inputText.toLowerCase();
    if (query.includes('hi') || query.includes('hello')) {
      addBotMessage(
        "Hello again! I am listening. If you have an active print job, send me a PDF file or reply with 'PAY' to generate your invoice.",
        1000
      );
    } else if (query.includes('status') || query.includes('ready')) {
      if (currentOrder) {
        addBotMessage(
          `ℹ️ *Order Status Update*\nOrder ID: *#${currentOrder.id}*\nFile: _${currentOrder.fileName}_\nCurrent Status: *${currentOrder.status.replace('_', ' ').toUpperCase()}*`,
          1000
        );
      } else {
        addBotMessage("You don't have an active order yet. Simply send me a PDF to start!", 1000);
      }
    } else if (query.includes('pay') && currentOrder) {
      runDemoStep(4);
    } else {
      addBotMessage(
        "I'm on custom standby. To run the full demonstration smoothly, please use the numbered *'Guided Path Step-by-Step' console* above!",
        1100
      );
    }
  };

  const completePayment = () => {
    if (!currentOrder) return;
    const deposit = Math.round(currentOrder.totalPrice / 2);

    // Update locally
    const paidOrder: Order = {
      ...currentOrder,
      status: 'paid_deposit',
      depositPaid: deposit,
    };
    setCurrentOrder(paidOrder);
    onOrderUpdate(paidOrder);

    // Update messages to reflect paid status
    setMessages((prev) =>
      prev.map((m) =>
        m.payment
          ? { ...m, payment: { ...m.payment, status: 'paid' as const } }
          : m
      )
    );

    // Simulated Webhook from Razorpay
    onNewLog(
      'payment',
      'WEBHOOK DISPATCHED: razorpay.payment.captured',
      `Deposit payment validated for ₹${deposit}.00 INR. User details verified.`
    );

    addBotMessage(
      `✅ *Payment Confirmed!*\nReceived ₹${deposit}.00 INR. \n\n*Smart Print Routing Engine Active...*\nWe are checking our live SNMP network for the healthiest shop printer with matching metrics. Standby for routing data.`,
      1200
    );

    setShowPaymentModal(false);
    setCurrentStep(6);

    // Simulate Server routing and printing chain
    setTimeout(() => {
      onNewLog(
        'routing',
        'Initiating smart printer scan...',
        'Checking offline constraints, SNMP queue counts, and ink levels.'
      );

      // Select healthiest printer
      const eligiblePrinters = printers.filter((p) => p.status !== 'offline');
      const chosenPrinter =
        eligiblePrinters.find((p) => p.tonerLevel > 20) || eligiblePrinters[0];

      onNewLog(
        'routing',
        `MATCH FOUND! Routing Order #${paidOrder.id} to physical printer [${chosenPrinter.name}]`,
        `Selection reasons: Status is "${chosenPrinter.status}", SNMP paper count is healthy, toner is ${chosenPrinter.tonerLevel}%.`
      );

      const routedOrder: Order = {
        ...paidOrder,
        status: 'routing',
        printerId: chosenPrinter.id,
        printerName: chosenPrinter.name,
      };
      setCurrentOrder(routedOrder);
      onOrderUpdate(routedOrder);

      // Sinking to printing animation
      setTimeout(() => {
        const printingOrder: Order = {
          ...routedOrder,
          status: 'printing',
          progress: 5,
        };
        setCurrentOrder(printingOrder);
        onOrderUpdate(printingOrder);
        onNewLog(
          'local_agent',
          `Local Bridge connected to ${chosenPrinter.ipAddress} received print command for file ${printingOrder.fileName}.`
        );
        
        addBotMessage(
          `🚀 *Job Routed & Queued!*\nRouted to: *${chosenPrinter.name}*\n\nDocument conversion safe... [Converted to raw PDF/x-1a grid]\n\nOur local Raspberry Pi agent has signaled the spooler. Printing has commenced. You can watch the real-time progress bar move in the 'Printers' console!`,
          1000
        );

        // Progress countdown
        let pct = 0;
        const interval = setInterval(() => {
          pct += 25;
          if (pct <= 100) {
            onOrderUpdate({
              ...printingOrder,
              status: 'printing',
              progress: pct,
            });
          }

          if (pct >= 100) {
            clearInterval(interval);
            // Completed printing
            onNewLog(
              'local_agent',
              `CUPS/Spooler report: Print job completed successfully for Order #${printingOrder.id}.`
            );

            // Trigger cloud S3/Server secure PDF file deletion immediately!
            setHostedFiles((prevFiles) =>
              prevFiles.map((hf) =>
                hf.orderId === printingOrder.id
                  ? { ...hf, status: 'purged_completed' as const, timeLeftHrs: 0 }
                  : hf
              )
            );

            onNewLog(
              'brain',
              `File Privacy Autopurge triggered for completed Order #${printingOrder.id}`,
              `Successfully deleted "${printingOrder.fileName}" permanently from Cloud server storage after CUPS confirmation.`
            );

            const finishedOrder: Order = {
              ...printingOrder,
              status: 'ready_for_pickup',
              progress: 100,
            };
            setCurrentOrder(finishedOrder);
            onOrderUpdate(finishedOrder);

            addBotMessage(
              `🎉 *Document is Ready for Pickup!* \n\nYour prints are waiting at our secure pick-up counter. Come collect them at your convenience.\n\n📍 *Shop Printer*: ${chosenPrinter.name}\n🔑 *Pickup Order ID*: #${finishedOrder.id}\n🧾 *Remaining Cash to Pay*: ₹${finishedOrder.totalPrice - finishedOrder.depositPaid}.00 INR.\n\nThank you for printing with PrintFlow! Tap the order in the shop monitor to mark it as completely collected.`,
              1200
            );
            setCurrentStep(7);
          }
        }, 1500);
      }, 2000);
    }, 2500);
  };

  const resetAllDemo = () => {
    setCurrentOrder(null);
    setCurrentStep(1);
    setMessages([
      {
        id: 'm1',
        sender: 'bot',
        text: "👋 Welcome to PrintFlow AutoShop!\n\nI am your automated 24/7 self-service printing assistant.\n\nSend me any PDF, Word, or Image file to get started, or simply reply with 'Hi' to start your order!",
        timestamp: '09:30 AM',
      },
    ]);
    onNewLog('brain', 'Sandbox simulation environments have been reset completely.', 'Active sessions cleared');
  };

  return (
    <div className="flex flex-col h-full bg-white border border-indigo-100 rounded-[2.5rem] overflow-hidden shadow-xl relative" id="whatsapp-sim-card">
      
      {/* Simulation Helper Sidebar/Top section for Guided Steps */}
      <div className="bg-indigo-50/70 p-5 border-b border-indigo-100 text-xs">
        <div className="flex justify-between items-center mb-2.5">
          <span className="font-black text-indigo-700 uppercase tracking-widest text-[10px] flex items-center gap-1.5 font-sans">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 fill-indigo-200" />
            Guided Pitch Walkthrough
          </span>
          <button
            onClick={resetAllDemo}
            className="text-[10px] bg-white border border-indigo-200 hover:bg-slate-50 text-indigo-700 font-bold py-1 px-3 rounded-full transition duration-150 shadow-sm"
          >
            Reset Demo Flow
          </button>
        </div>
 
        {/* Step list guides in Vibrant Theme style */}
        <div className="grid grid-cols-5 gap-1.5 text-center font-bold">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`py-1 rounded-lg text-[9px] transition-all ${
                currentStep === s
                  ? 'bg-indigo-600 text-white shadow shadow-indigo-100'
                  : currentStep > s
                  ? 'bg-emerald-100 text-emerald-800 line-through opacity-85'
                  : 'bg-slate-100 text-slate-400 border border-slate-200/50'
              }`}
            >
              Step {s}
            </div>
          ))}
        </div>
 
        <div className="mt-3.5 flex items-center justify-between bg-white p-3.5 rounded-2xl border border-indigo-100 shadow-sm">
          <p className="text-slate-600 leading-relaxed pr-3 text-[11px] font-medium font-sans">
            {currentStep === 1 && "👋 Start dialogue by greeting the printing automated assistant."}
            {currentStep === 2 && "📎 Drag or generate modern document attachment mock files."}
            {currentStep === 3 && "🎨 Customize selection specs (Set 2 copies in Color) to view cost calculation."}
            {currentStep === 4 && "🏦 Generate secure deposit checkout invoice from Chat Bot directly."}
            {currentStep === 5 && "💳 Authorize 50% down-payment using the mock gateway modal."}
            {currentStep >= 6 && "⚡ Watch the Brain scan printer health, SNMP queues, and print document!"}
          </p>
 
          {currentStep <= 5 && (
            <button
              onClick={() => runDemoStep(currentStep)}
              className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold px-3.5 py-2 rounded-full flex items-center gap-1 shrink-0 text-[11px] transition duration-200 shadow shadow-indigo-200"
            >
              Run Step {currentStep} <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
 
      {/* Realistic WhatsApp Chat Frame */}
      <div className="flex-1 flex flex-col bg-slate-50 relative">
        {/* Phone Mockup Header in vibrant indigo theme */}
        <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            {/* Round Avatar with printer symbol */}
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-indigo-600 font-bold text-sm shadow">
              🖨️
            </div>
            <div>
              <div className="font-extrabold text-white text-sm flex items-center gap-1.5">
                PrintFlow Bot
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              </div>
              <p className="text-[10px] text-indigo-100 font-medium">Shop Automated Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-white/80">
            <Video className="w-4 h-4 cursor-pointer hover:text-white" />
            <Phone className="w-4 h-4 cursor-pointer hover:text-white" />
            <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white" />
          </div>
        </div>
 
        {/* Chat History Area (Soft Indigo Slate tint and standard whatsapp background aspect) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 flex flex-col bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-opacity-5">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            const isSystem = m.sender === 'system';
            return (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-[1.25rem] p-3.5 text-xs shadow-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white self-end rounded-tr-none border border-indigo-700'
                    : isSystem
                    ? 'bg-white text-slate-500 self-center text-center rounded-2xl border border-slate-200 px-4 py-1.5 font-bold uppercase tracking-wider text-[9px]'
                    : 'bg-white text-slate-800 self-start rounded-tl-none border border-indigo-50/80'
                }`}
              >
                {/* Document representation if any */}
                {m.file && (
                  <div className={`flex items-center gap-3 p-2.5 rounded-xl mb-2.5-2 border ${
                    isUser
                      ? 'bg-indigo-700/60 border-indigo-500'
                      : 'bg-indigo-50/70 border-indigo-100'
                  }`}>
                    <div className="p-2 bg-red-100 rounded text-red-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-bold truncate text-[11px] ${isUser ? 'text-white' : 'text-slate-850'}`}>
                        {m.file.name}
                      </p>
                      <p className={`text-[9px] font-mono ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {m.file.size} • {m.file.pages} pages
                      </p>
                    </div>
                  </div>
                )}
 
                {/* Message text */}
                <p className={`whitespace-pre-line text-[11px] font-medium leading-relaxed ${isUser ? 'text-white' : 'text-slate-750'}`}>
                  {m.text}
                </p>
 
                {/* Payment Request block if any */}
                {m.payment && (
                  <div className="mt-3.5 p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-indigo-700 font-bold uppercase">Booking Deposit (₹)</span>
                      <span
                        className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          m.payment.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {m.payment.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    <div className="text-base font-black text-slate-855 mb-3 italic">
                      ₹{m.payment.amount}.00
                    </div>
                    {m.payment.status === 'unpaid' ? (
                      <button
                        onClick={() => runDemoStep(5)}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-full text-center transition duration-200 flex items-center justify-center gap-1.5 shadow shadow-indigo-100"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Pay Deposit (₹{m.payment.amount}.00)
                      </button>
                    ) : (
                      <div className="text-[10px] text-emerald-700 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-100/60 rounded-full border border-emerald-200 font-bold">
                        ✓ Webhook Capture Success
                      </div>
                    )}
                  </div>
                )}
 
                {/* Timestamp */}
                <div className={`text-[8px] text-right mt-2 flex items-center justify-end gap-1 font-mono ${
                  isUser ? 'text-indigo-200' : 'text-slate-400'
                }`}>
                  {m.timestamp}
                  {!isUser && !isSystem && <CheckCheck className="w-3.5 h-3.5 text-indigo-500" />}
                  {isUser && <CheckCheck className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
            );
          })}
 
          {isTyping && (
            <div className="bg-white border border-indigo-50 text-slate-800 max-w-[85%] rounded-[1.25rem] rounded-tl-none p-3.5 self-start text-xs flex items-center gap-1 shadow-sm">
              <span className="text-[10px] text-slate-500 animate-pulse font-medium">Processing specs...</span>
              <span className="flex gap-1 items-center ml-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
              </span>
            </div>
          )}
 
          <div ref={messagesEndRef} />
        </div>

        {/* Quick customization helper pills (Active on step 3) */}
        {currentStep === 3 && currentOrder && (
          <div className="bg-white border-t border-indigo-100/80 p-2.5 flex gap-1.5 overflow-x-auto select-none">
            <button
              onClick={() => {
                const o = { ...currentOrder, colorMode: 'Color' as const, totalPrice: calculateCost(currentOrder.pages, currentOrder.copies, currentOrder.size, 'Color') };
                setCurrentOrder(o);
                onOrderUpdate(o);
                onNewLog('whatsapp', "Changed properties: Color mode forced");
              }}
              className={`text-[10px] shrink-0 px-3 py-1 rounded-full font-bold transition duration-150 cursor-pointer ${
                currentOrder.colorMode === 'Color'
                  ? 'bg-indigo-600 text-white shadow shadow-indigo-100'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-250 hover:text-slate-900 border border-slate-200'
              }`}
            >
              🎨 Color Mode
            </button>
            <button
              onClick={() => {
                const o = { ...currentOrder, copies: currentOrder.copies + 1, totalPrice: calculateCost(currentOrder.pages, currentOrder.copies + 1, currentOrder.size, currentOrder.colorMode) };
                setCurrentOrder(o);
                onOrderUpdate(o);
                onNewLog('whatsapp', `Changed properties: Copies incremented to ${o.copies}`);
              }}
              className="text-[10px] shrink-0 px-3 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 font-bold transition cursor-pointer"
            >
              ➕ Add Copies ({currentOrder.copies})
            </button>
            <button
              onClick={() => {
                const o = { ...currentOrder, size: 'A3' as const, totalPrice: calculateCost(currentOrder.pages, currentOrder.copies, 'A3', currentOrder.colorMode) };
                setCurrentOrder(o);
                onOrderUpdate(o);
                onNewLog('whatsapp', "Changed properties: Page size upgraded to A3");
              }}
              className={`text-[10px] shrink-0 px-3 py-1 rounded-full font-bold transition duration-150 cursor-pointer ${
                currentOrder.size === 'A3'
                  ? 'bg-indigo-600 text-white shadow shadow-indigo-100'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-250 hover:text-slate-900 border border-slate-200'
              }`}
            >
              📄 Upgrade to A3
            </button>
          </div>
        )}
 
        {/* Chat input box */}
        <form onSubmit={handleCustomSend} className="bg-white p-3 flex items-center gap-2 border-t border-indigo-100/80">
          <button
            type="button"
            title="Attach a PDF document"
            onClick={() => runDemoStep(2)}
            className="p-2 hover:bg-indigo-50 rounded-full text-indigo-600 hover:text-indigo-800 transition duration-155"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type 'hi', upload doc, or reply..."
            className="flex-1 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-full py-2 px-4 text-slate-850 placeholder-slate-400 outline-none transition duration-150"
          />
          <button
            type="submit"
            className="p-2 bg-indigo-650 hover:bg-indigo-700 active:scale-95 text-white rounded-full transition shadow shadow-indigo-200 bg-indigo-600"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
 
      {/* SECURE CHECKOUT IFRAME / MODAL SIMULATOR */}
      {showPaymentModal && currentOrder && (
        <div className="absolute inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-indigo-100 rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-indigo-650 p-4 text-white flex items-center justify-between bg-indigo-650 shadow-md bg-indigo-600">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 font-bold text-indigo-200" />
                <div>
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-white">Razorpay Checkout</h3>
                  <p className="text-[9px] opacity-80 text-indigo-150">PrintFlow Order #{currentOrder.id}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="hover:bg-indigo-700 p-1.5 rounded-full text-[11px] font-bold text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>
 
            {/* Modal Content */}
            <div className="p-5 space-y-4 text-slate-650">
              <div className="flex justify-between items-center text-xs pb-3.5 border-b border-indigo-100">
                <div>
                  <p className="font-black text-slate-900">{currentOrder.fileName}</p>
                  <p className="text-[9px] text-slate-500 font-medium">2 copies • Color • A4 • Double-Sided</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500">Total: ₹{currentOrder.totalPrice}.00</p>
                  <p className="font-black text-indigo-600 italic">Deposit: ₹{Math.round(currentOrder.totalPrice / 2)}.00</p>
                </div>
              </div>
 
              {/* Dummy Credit Card Details */}
              <div className="bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100/60 space-y-2.5 font-mono text-[10px]">
                <div className="flex justify-between text-indigo-800 text-[9px] uppercase font-bold">
                  <span>Demo Credit Card</span>
                  <span className="text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded-full">Valid Mock</span>
                </div>
                <div className="p-2.5 bg-white border border-indigo-100 rounded-xl tracking-widest text-indigo-600 text-center text-xs font-bold shadow-sm">
                  4242 • 4242 • 4242 • 4242
                </div>
                <div className="grid grid-cols-2 gap-2 text-[9px]">
                  <div className="bg-white border border-indigo-50 p-1.5 rounded-lg shadow-xs">
                    <span className="text-slate-400 block text-[7.5px] font-bold">EXPIRY</span>
                    <span className="text-slate-700 font-bold">12 / 29</span>
                  </div>
                  <div className="bg-white border border-indigo-50 p-1.5 rounded-lg shadow-xs">
                    <span className="text-slate-400 block text-[7.5px] font-bold">CVV SECRET</span>
                    <span className="text-slate-700 font-bold">***</span>
                  </div>
                </div>
              </div>
 
              {/* Tech details explanation */}
              <div className="text-[10px] text-slate-500 space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-slate-800 font-bold flex items-center gap-1.5 mb-1 text-[10px]">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  What happens next on success?
                </p>
                <p>1. Secure Stripe/Razorpay captures funds.</p>
                <p>2. Instant Webhook fires to Brain Print Node server.</p>
                <p>3. Document gets compiled and routed immediately.</p>
              </div>
            </div>
 
            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="py-2 text-xs bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-full border border-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={completePayment}
                className="py-2 text-xs bg-indigo-600 hover:bg-indigo-750 text-white font-black rounded-full shadow shadow-indigo-200 transition cursor-pointer"
              >
                Authorize Deposit
              </button>
            </div>
 
          </div>
        </div>
      )}

    </div>
  );
}
