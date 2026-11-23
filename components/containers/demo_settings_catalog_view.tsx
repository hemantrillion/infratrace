'use client';

import React, { useState, useMemo } from 'react';
import {
  Globe,
  Radio,
  RefreshCw,
  Clock,
  Play,
  Activity,
  Layers,
  Sparkles,
  Info,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { PUBLIC_28_APIS, Public28ApiItem } from '@/lib/catalog/public_28_apis';
import { MonitoredServiceRecord } from '@/lib/database/get_all_monitored_services_query';

interface DemoSettingsCatalogViewProps {
  monitoredServices: MonitoredServiceRecord[];
  onServicesUpdated: () => void | Promise<void>;
  isConstantPollingEnabled: boolean;
  onToggleConstantPolling: (enabled: boolean) => void;
  constantPollingInterval: number;
  onChangeConstantPollingInterval: (intervalMs: number) => void;
  onTriggerManualPoll?: () => void | Promise<void>;
  isPolling?: boolean;
  onInspectService?: (serviceId: string) => void;
  searchQuery?: string;
}

const POLLING_INTERVALS = [
  { label: '5s', value: 5000 },
  { label: '8s', value: 8000 },
  { label: '10s', value: 10000 },
  { label: '15s', value: 15000 },
  { label: '30s', value: 30000 },
  { label: '60s', value: 60000 },
];

export function DemoSettingsCatalogView({
  monitoredServices,
  onServicesUpdated,
  isConstantPollingEnabled,
  onToggleConstantPolling,
  constantPollingInterval,
  onChangeConstantPollingInterval = () => {},
  searchQuery: externalSearchQuery = '',
}: DemoSettingsCatalogViewProps) {
  const [togglingServiceId, setTogglingServiceId] = useState<string | null>(null);
  const [inspectedApi, setInspectedApi] = useState<Public28ApiItem | null>(null);

  // Testing public APIs state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    status: number;
    latencyMs: number;
    sampleData?: any;
    error?: string;
    timestamp: string;
  } | null>(null);

  // Set of currently monitored service IDs in SQLite database
  const monitoredIdSet = useMemo(() => {
    return new Set(monitoredServices.map((s) => s.id));
  }, [monitoredServices]);

  // Filter 28 APIs by search query
  const filteredApis = useMemo(() => {
    const q = (externalSearchQuery || '').trim().toLowerCase();
    if (!q) return PUBLIC_28_APIS;
    return PUBLIC_28_APIS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.company.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.target_url.toLowerCase().includes(q)
    );
  }, [externalSearchQuery]);

  // Handle toggling an API in/out of the monitored dashboard
  const handleToggleService = async (item: Public28ApiItem) => {
    setTogglingServiceId(item.id);
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle',
          service: {
            id: item.id,
            name: item.name,
            target_type: item.target_type,
            target_url: item.target_url,
            check_interval_seconds: Math.round(constantPollingInterval / 1000),
          },
        }),
      });

      if (response.ok) {
        await onServicesUpdated();
      }
    } catch (err) {
      console.error('Failed to toggle monitored service:', err);
    } finally {
      setTogglingServiceId(null);
    }
  };

  // Test Endpoint execution via internal probe proxy
  const handleTestEndpoint = async (item: Public28ApiItem) => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/probe/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: item.target_url }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        status: 0,
        error: err.message || 'Probe request failed',
        latencyMs: 0,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 select-text font-sans">
      {/* Automated Polling Configuration Card (Reverted to original) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800">Automated Polling</h3>
            <p className="text-xs text-slate-500 font-medium">
              Continuous background synthetic latency and metric health probes.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onToggleConstantPolling(!isConstantPollingEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isConstantPollingEnabled ? 'bg-blue-600' : 'bg-slate-200'
              }`}
              role="switch"
              aria-checked={isConstantPollingEnabled}
            >
              <span className="sr-only">Automated Polling</span>
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isConstantPollingEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-xs font-bold text-slate-700 min-w-[55px]">
              {isConstantPollingEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-500">
            Polling Frequency Interval
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {POLLING_INTERVALS.map((intv) => {
              const isSelected = constantPollingInterval === intv.value;
              return (
                <button
                  key={intv.value}
                  type="button"
                  onClick={() => onChangeConstantPollingInterval(intv.value)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white font-bold border-slate-900 shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200/90'
                  }`}
                >
                  {intv.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. PUBLIC API SECTION */}
      <section className="space-y-4">
        <div className="pb-1 border-b border-slate-200/80">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Public API
          </h2>
        </div>

        {/* 28 APIs Grid: Arranged in 4 Columns and 7 Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filteredApis.map((item) => {
            const isMonitored = monitoredIdSet.has(item.id);
            const isToggling = togglingServiceId === item.id;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border bg-white flex flex-col justify-between gap-3 transition-all duration-150 ${
                  isMonitored
                    ? 'border-blue-500 ring-1 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200/90 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Top: Name & Company (No dots, No ticks) */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                    {item.company}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug" title={item.name}>
                    {item.name}
                  </h4>
                </div>

                {/* Bottom: Options (Plain text Added / Add to Dashboard, No ticks, No icons in add button) */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleToggleService(item)}
                    disabled={isToggling}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center cursor-pointer border ${
                      isMonitored
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 shadow-2xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-2xs hover:border-slate-400'
                    }`}
                  >
                    {isToggling ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : isMonitored ? (
                      <span>Added</span>
                    ) : (
                      <span>Add to Dashboard</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInspectedApi(item);
                      setTestResult(null);
                    }}
                    title="Inspect Endpoint Details"
                    className="py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors flex items-center gap-1 cursor-pointer shrink-0 border border-blue-200/60"
                  >
                    <Info className="w-3 h-3" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. INSPECT DETAIL MODAL (MATCHING IMAGE 2 EXACTLY)       */}
      {/* ======================================================== */}
      {inspectedApi && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-5 space-y-4 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setInspectedApi(null);
                setTestResult(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Badges: Category & Unit */}
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                {inspectedApi.category} &bull; {inspectedApi.subCategory}
              </span>
              <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Unit: {inspectedApi.unit}
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {inspectedApi.name}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {inspectedApi.description}
              </p>
            </div>

            {/* Target URL Box (Like Image 2) */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>{inspectedApi.company}</span>
                <span className="font-mono text-[10px] text-slate-400">{inspectedApi.cadence}</span>
              </div>
              <div className="font-mono text-xs text-blue-700 break-all select-all font-medium">
                {inspectedApi.target_url}
              </div>
            </div>

            {/* Test Endpoint Action & Results */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleTestEndpoint(inspectedApi)}
                  disabled={isTesting}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
                >
                  {isTesting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-slate-800" />
                  )}
                  <span>Test Endpoint</span>
                </button>

                {testResult && (
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        testResult.status >= 200 && testResult.status < 400
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {testResult.status > 0 ? `${testResult.status} ${testResult.status === 200 ? 'OK' : ''}` : 'Failed'}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-500">
                      {testResult.latencyMs}ms
                    </span>
                  </div>
                )}
              </div>

              {testResult && (
                <div className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[10px] space-y-1 overflow-x-auto max-h-48 scrollbar-thin">
                  <div className="text-slate-400">Response Payload / Details:</div>
                  <pre className="text-emerald-400 whitespace-pre-wrap">
                    {testResult.sampleData
                      ? JSON.stringify(testResult.sampleData, null, 2)
                      : testResult.error || 'No body returned'}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer: Add to Dashboard toggle */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {monitoredIdSet.has(inspectedApi.id) ? 'Currently monitored on Dashboard' : 'Not added to Dashboard'}
              </span>
              <button
                type="button"
                onClick={() => handleToggleService(inspectedApi)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  monitoredIdSet.has(inspectedApi.id)
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    : 'bg-black text-white hover:bg-slate-800 shadow-xs'
                }`}
              >
                {monitoredIdSet.has(inspectedApi.id) ? 'Remove from Dashboard' : 'Add to Dashboard'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
