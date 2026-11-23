'use client';

import React, { useState } from 'react';
import {
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Mail,
  Radio,
  RefreshCw,
  Server,
  Zap,
} from 'lucide-react';

export function DeliveryView() {
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    isError?: boolean;
  } | null>(null);
  const [isExecutingChaos, setIsExecutingChaos] = useState(false);

  const handleSendTestEmail = async () => {
    setIsSendingTest(true);
    setFeedbackMessage(null);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: 'DOWN',
          serviceName: 'Local Controlled Node Service',
          serviceId: 'local_controlled_service',
          targetUrl: 'http://localhost:5001/metrics',
          recipient: 'jai18hemant334@gmail.com',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage({
          text: `Test notification successfully dispatched to ${data.recipient} via ${data.provider}. (View in Mail tab under Alerts/Incidents)`,
          isError: false,
        });
      } else {
        setFeedbackMessage({
          text: `Delivery error: ${data.error || 'Failed to dispatch'}`,
          isError: true,
        });
      }
    } catch (err: any) {
      setFeedbackMessage({
        text: `Dispatch exception: ${err.message}`,
        isError: true,
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleTriggerChaos = async (action: 'down' | 'recover' | 'lag') => {
    setIsExecutingChaos(true);
    setFeedbackMessage(null);
    try {
      const res = await fetch('/api/chaos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, runPoller: true, port: 5001 }),
      });
      const data = await res.json();
      if (data.success) {
        if (action === 'down') {
          setFeedbackMessage({
            text: 'Local service crash injected (HTTP 503). Two poll cycles executed: state confirmed DOWN. Outage email dispatched.',
            isError: false,
          });
        } else if (action === 'recover') {
          setFeedbackMessage({
            text: 'Local service restored to healthy (HTTP 200). Two poll cycles executed: state confirmed UP. Recovery email dispatched.',
            isError: false,
          });
        } else if (action === 'lag') {
          setFeedbackMessage({
            text: 'Artificial 2500ms lag injected. Poll cycle executed: state confirmed DEGRADED.',
            isError: false,
          });
        }
      } else {
        setFeedbackMessage({
          text: `Action failed: ${data.error}`,
          isError: true,
        });
      }
    } catch (err: any) {
      setFeedbackMessage({
        text: `Request failed: ${err.message}`,
        isError: true,
      });
    } finally {
      setIsExecutingChaos(false);
    }
  };

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-[#f8fafd] p-6 sm:p-10 text-slate-900 font-sans select-text">
      <div className="w-full space-y-6 max-w-7xl mx-auto">
        {/* Document Header */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Notification Pipeline
                </h1>
              </div>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                Operational alerting architecture, delivery routing, and state transition suppression controls.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Pipeline Active
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Pipeline Routing & Credentials */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Pipeline Routing &amp; Credentials
            </h2>
            <span className="text-xs text-slate-400 font-mono">Dual Delivery (Internal &amp; External)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Primary Delivery Channel
              </span>
              <span className="text-sm font-bold text-slate-800 block">
                Resend Outbound REST API
              </span>
              <span className="text-[11px] text-slate-500 block">
                External SMTP/REST fallback to Platform Mailbox
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Active Destination Recipient
              </span>
              <span className="text-sm font-mono font-bold text-blue-700 block truncate">
                jai18hemant334@gmail.com
              </span>
              <span className="text-[11px] text-slate-500 block">
                Receives immediate down/up alerts &amp; digests
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Target Monitored Endpoint
              </span>
              <span className="text-sm font-mono font-bold text-slate-800 block truncate">
                http://localhost:5001/metrics
              </span>
              <span className="text-[11px] text-slate-500 block">
                Controlled Node Service (Chaos Target)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Sender Identity
              </span>
              <span className="text-sm font-medium text-slate-800 block truncate">
                InfraTrace Alerts &lt;onboarding@resend.dev&gt;
              </span>
              <span className="text-[11px] text-slate-500 block">
                Authenticated DKIM sender envelope
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                API Key Configuration
              </span>
              <span className="text-sm font-mono font-semibold text-slate-700 block">
                re_WGLqb••••••••9DM2
              </span>
              <span className="text-[11px] text-slate-500 block">
                Configured via .env.local RESEND_API_KEY
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Platform Mailbox Mirror
              </span>
              <span className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Live Ingestion Active
              </span>
              <span className="text-[11px] text-slate-500 block">
                All alerts visible in Mail tab
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Policy & Suppression Rules */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Alert Triggering &amp; Suppression Policy
            </h2>
            <span className="text-xs text-slate-400 font-mono">Phase Engine</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
              <span className="font-bold text-slate-900 text-sm block">
                Phase 1 (Bootstrap Cycle)
              </span>
              <p className="text-slate-600">
                Initial DOWN or DEGRADED event dispatches an alert email immediately. Subsequent recovery to UP dispatches a recovery email immediately. Upon completing this bootstrap cycle, the system transitions to Phase 2 observation windows.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
              <span className="font-bold text-slate-900 text-sm block">
                Phase 2+ (Observation Windows)
              </span>
              <p className="text-slate-600">
                Subsequent state changes enter silent observation windows (20m, 40m, 60m...). Zero emails are dispatched during the window. All probe transitions are logged silently.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
              <span className="font-bold text-slate-900 text-sm block">
                Unstable Evaluation at Window Expiration
              </span>
              <p className="text-slate-600">
                At the conclusion of duration D = n × 20 minutes, Unstable is declared if (UP ≥ 2n and DOWN/DEGRADED ≥ 1n) OR (DOWN/DEGRADED ≥ 2n and UP ≥ 1n). When satisfied, an UNSTABLE notification email is dispatched to jai18hemant334@gmail.com.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
              <span className="font-bold text-slate-900 text-sm block">
                Dynamic Window Scaling &amp; Outage Banner Separation
              </span>
              <p className="text-slate-600">
                If the last two completed notification outcomes match, the window duration expands additively (20m → 40m → 60m). If outcomes differ, the window resets to 20 minutes. UNSTABLE is strictly an observational email event and is never displayed on the ongoing Outage Notifications banner.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Verification & Operational Controls */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              3. Pipeline Verification Controls
            </h2>
            <span className="text-xs text-slate-400 font-mono">Live Dispatch &amp; Chaos Harness</span>
          </div>

          <p className="text-xs text-slate-500 leading-normal">
            Execute manual test dispatch or trigger controlled chaos against the local Node service (port 5001) to verify end-to-end delivery to jai18hemant334@gmail.com.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={isSendingTest}
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSendingTest ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Notification</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTriggerChaos('down')}
              disabled={isExecutingChaos}
              className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Simulate Outage (Down)</span>
            </button>

            <button
              type="button"
              onClick={() => handleTriggerChaos('recover')}
              disabled={isExecutingChaos}
              className="py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Simulate Recovery (Up)</span>
            </button>

            <button
              type="button"
              onClick={() => handleTriggerChaos('lag')}
              disabled={isExecutingChaos}
              className="py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Simulate Latency (Degraded)</span>
            </button>
          </div>

          {/* Feedback Area */}
          {feedbackMessage && (
            <div
              className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2.5 animate-in fade-in shadow-2xs ${
                feedbackMessage.isError
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              {feedbackMessage.isError ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
