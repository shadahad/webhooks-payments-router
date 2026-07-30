import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  RefreshCw, 
  GitFork, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Bell, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  Terminal,
  Settings,
  DollarSign
} from 'lucide-react';

// Payment Providers Metadata
const PROVIDERS = {
  paypulse: {
    id: 'paypulse',
    name: 'PayPulse (Stripe style)',
    fee: '2.9% + $0.30',
    avgSpeed: '120ms',
    color: 'bg-indigo-600',
    accent: 'text-indigo-600',
    border: 'border-indigo-200',
    badge: 'bg-indigo-50 text-indigo-700'
  },
  swiftsettle: {
    id: 'swiftsettle',
    name: 'SwiftSettle (Adyen style)',
    fee: '1.8% + $0.20',
    avgSpeed: '210ms',
    color: 'bg-emerald-600',
    accent: 'text-emerald-600',
    border: 'border-emerald-200',
    badge: 'bg-emerald-50 text-emerald-700'
  }
};

export default function App() {
  // Form State
  const [amount, setAmount] = useState('150.00');
  const [currency, setCurrency] = useState('USD');
  const [customerEmail, setCustomerEmail] = useState('alex.dev@example.com');
  const [routingMode, setRoutingMode] = useState('auto'); // 'auto' | 'paypulse' | 'swiftsettle'
  
  // App Operational State
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS.paypulse);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [webhookQueue, setWebhookQueue] = useState([]);

  // Provider Routing Logic
  useEffect(() => {
    if (routingMode === 'auto') {
      const numericAmount = parseFloat(amount) || 0;
      // Routing Rule: Route amounts >= $100 to SwiftSettle (lower % fee), lower amounts to PayPulse
      if (numericAmount >= 100) {
        setSelectedProvider(PROVIDERS.swiftsettle);
      } else {
        setSelectedProvider(PROVIDERS.paypulse);
      }
    } else {
      setSelectedProvider(PROVIDERS[routingMode]);
    }
  }, [amount, routingMode]);

  // Add Log Helper
  const addLog = (type, title, details, payload) => {
    const newLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type, // 'api_out' | 'webhook_in' | 'router'
      title,
      details,
      payload
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Simulate Third-Party API Payment Request
  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const transactionId = `txn_${Math.random().toString(36).substring(2, 10)}`;
    
    addLog(
      'router', 
      'Smart Router Decision', 
      `Routed to ${selectedProvider.name} based on rule: ${routingMode === 'auto' ? 'Volume Fee Optimization' : 'Manual Override'}`,
      { amount, currency, provider: selectedProvider.id }
    );

    // Simulate API Call Latency
    setTimeout(() => {
      addLog(
        'api_out', 
        `POST /v1/charge (${selectedProvider.name})`, 
        `HTTP 200 OK - Charge Authorized`, 
        {
          transaction_id: transactionId,
          amount: parseFloat(amount),
          currency,
          status: 'authorized',
          provider: selectedProvider.id,
          latency: selectedProvider.avgSpeed
        }
      );

      setIsProcessing(false);

      // Trigger asynchronous Webhook 3 seconds later
      triggerAsyncWebhook(transactionId, selectedProvider.id, amount, currency);
    }, 1000);
  };

  // Simulate Incoming Asynchronous Webhook from Provider
  const triggerAsyncWebhook = (txnId, providerId, amt, curr) => {
    setTimeout(() => {
      const webhookPayload = {
        event_id: `evt_${Math.random().toString(36).substring(2, 9)}`,
        event_type: 'payment_intent.succeeded',
        created_at: Math.floor(Date.now() / 1000),
        provider: providerId,
        data: {
          object: {
            id: txnId,
            amount_captured: parseFloat(amt) * 100,
            currency: curr.toLowerCase(),
            status: 'succeeded',
            payment_method: 'card_visa_4242'
          }
        }
      };

      setWebhookQueue(prev => [webhookPayload, ...prev]);
      addLog(
        'webhook_in', 
        `Webhook Received: ${webhookPayload.event_type}`, 
        `From Provider: ${providerId.toUpperCase()}`, 
        webhookPayload
      );
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900 leading-tight">OmniPay Router</h1>
              <p className="text-xs text-slate-500">API Gateway & Dynamic Webhook Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Webhook Listener Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Form & Provider Selection (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Payment Checkout Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-500" />
                Simulate Payment Dispatch
              </h2>

              <form onSubmit={handleProcessPayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Customer Email</label>
                  <input 
                    type="email" 
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required 
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Currency</label>
                    <select 
                      value={currency} 
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>

                {/* Routing Rules Selector */}
                <div className="pt-2">
                  <label className="block text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                    <GitFork className="w-3.5 h-3.5" /> Provider Routing Strategy
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'auto', label: 'Auto (Smart)' },
                      { id: 'paypulse', label: 'PayPulse' },
                      { id: 'swiftsettle', label: 'SwiftSettle' }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setRoutingMode(mode.id)}
                        className={`py-1.5 text-xs font-medium rounded-md border transition-all ${
                          routingMode === mode.id 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Routing Indicator */}
                <div className={`p-3.5 rounded-lg border ${selectedProvider.border} bg-slate-50/50 space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Selected Gateway</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${selectedProvider.badge}`}>
                      {selectedProvider.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 pt-1">
                    <span>Est. Provider Fee: <strong>{selectedProvider.fee}</strong></span>
                    <span>Latency: <strong>{selectedProvider.avgSpeed}</strong></span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Communicating with Gateway...
                    </>
                  ) : (
                    <>
                      Execute Transaction
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Smart Routing Info */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Current Routing Rule Logic
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Amount ≥ $100:</strong> Routes to <em>SwiftSettle</em> (Optimized for lower percentage fees).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Amount &lt; $100:</strong> Routes to <em>PayPulse</em> (Optimized for micro-transactions).</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Right Panel: Logs & Real-time Webhooks (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Event Stream */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[620px]">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-500" />
                  <h2 className="text-base font-semibold text-slate-900">API & Webhook Stream</h2>
                </div>
                <span className="text-xs text-slate-400">{logs.length} Events Recorded</span>
              </div>

              <div className="p-4 overflow-y-auto flex-1 space-y-3 font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 font-sans space-y-2">
                    <Activity className="w-8 h-8 stroke-1 text-slate-300" />
                    <p>No transactions initiated yet. Submit a payment to view real-time API logs.</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <div 
                      key={log.id} 
                      className="p-3.5 rounded-lg border bg-slate-50 border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between font-sans">
                        <div className="flex items-center gap-2">
                          {log.type === 'api_out' && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-700">
                              OUTBOUND API
                            </span>
                          )}
                          {log.type === 'webhook_in' && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-700">
                              INBOUND WEBHOOK
                            </span>
                          )}
                          {log.type === 'router' && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-100 text-purple-700">
                              ROUTER
                            </span>
                          )}
                          <span className="font-semibold text-slate-800">{log.title}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">{log.timestamp}</span>
                      </div>
                      
                      <p className="text-slate-600 font-sans">{log.details}</p>

                      {log.payload && (
                        <pre className="p-2.5 rounded bg-slate-900 text-slate-100 overflow-x-auto text-[11px] leading-relaxed">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}