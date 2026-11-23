'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  XCircle,
  Cloud,
  Upload,
  Server,
  CheckCircle2,
  Check,
  Trash2,
} from 'lucide-react';
import { getActiveAccount } from '@/lib/auth/accounts_manager';
import { IMPLEMENTED_METRICS } from '@/lib/metrics/implemented_metrics_registry';

function PrivateApiSetupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const suiteIdParam = searchParams.get('suiteId');

  const [mounted, setMounted] = useState(false);
  const [activeUser, setActiveUser] = useState<any>({ email: 'jai18hemant334@gmail.com', role: 'Super Admin' });

  useEffect(() => {
    setMounted(true);
    const acc = getActiveAccount();
    if (acc) setActiveUser(acc);
  }, []);

  const [isEditMode, setIsEditMode] = useState(false);
  const [suiteName, setSuiteName] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [metricEndpoints, setMetricEndpoints] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // If suiteIdParam is present, fetch existing suite details for editing
  useEffect(() => {
    if (!suiteIdParam) return;
    setIsEditMode(true);

    async function loadSuite() {
      try {
        const res = await fetch(`/api/private-api?suiteId=${encodeURIComponent(suiteIdParam!)}`);
        const data = await res.json();
        if (data.success && data.suite) {
          const s = data.suite;
          setSuiteName(s.name);
          try {
            const endpoints = JSON.parse(s.endpoints_json);
            if (Array.isArray(endpoints)) {
              const epMap: Record<string, string> = {};
              const sel: string[] = [];
              endpoints.forEach((ep: any) => {
                if (ep.id && ep.endpoint) {
                  epMap[ep.id] = ep.endpoint;
                  sel.push(ep.id);
                }
              });
              setMetricEndpoints(epMap);
              setSelectedMetrics(sel);
            }
          } catch {
            // ignore JSON parse error
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to load existing suite.');
      }
    }

    loadSuite();
  }, [suiteIdParam]);

  const toggleMetric = (id: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!suiteName.trim()) {
      setErrorMessage('Please enter a name for this private API suite.');
      return;
    }

    // Collect endpoints: only metrics where the user has checked the box and provided an endpoint URL
    const activeEndpoints: any[] = [];
    for (const m of IMPLEMENTED_METRICS) {
      const isChecked = selectedMetrics.includes(m.id);
      if (isChecked) {
        const rawUrl = (metricEndpoints[m.id] || '').trim();
        if (!rawUrl) {
          setErrorMessage(`Please enter an API URL for "${m.name}" or uncheck it.`);
          return;
        }

        // Clean up URL: strip leading method if user typed 'POST https://...' or 'GET https://...'
        let cleanUrl = rawUrl;
        let method = 'GET';
        if (cleanUrl.toUpperCase().startsWith('POST ')) {
          method = 'POST';
          cleanUrl = cleanUrl.substring(5).trim();
        } else if (cleanUrl.toUpperCase().startsWith('GET ')) {
          method = 'GET';
          cleanUrl = cleanUrl.substring(4).trim();
        } else if (m.id.startsWith('api_oq_') || m.name.includes('POST')) {
          method = 'POST';
        }

        activeEndpoints.push({
          id: m.id,
          name: m.name,
          category: m.category,
          subCategory: m.subCategory,
          unit: m.unit,
          endpoint: cleanUrl,
          httpMethod: method,
          region: 'global',
          intervalSeconds: m.expectedIntervalSeconds || 15,
        });
      }
    }

    if (activeEndpoints.length === 0) {
      setErrorMessage('Please enter an API URL in the box for at least one metric to create this suite.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const method = isEditMode ? 'PUT' : 'POST';
      const payload: any = {
        suiteId: suiteIdParam,
        userEmail: activeUser.email,
        name: suiteName,
        suiteType: 'cloud_aws',
        cspProvider: 'Private Microservices',
        serviceCategory: 'Private API Test Suite',
        endpoints: activeEndpoints,
      };

      const res = await fetch('/api/private-api', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(
          isEditMode
            ? 'Private API suite updated successfully!'
            : 'Private API suite successfully registered and monitoring initiated!'
        );
        setTimeout(() => {
          router.push('/console');
        }, 1200);
      } else {
        setErrorMessage(data.error || 'Failed to save suite.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSuite = async () => {
    if (!suiteIdParam) return;
    if (!window.confirm('Are you sure you want to delete this private API suite?')) return;

    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/private-api?suiteId=${encodeURIComponent(suiteIdParam)}&email=${encodeURIComponent(
          activeUser.email
        )}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Private API suite successfully removed.');
        setTimeout(() => {
          router.push('/console');
        }, 1000);
      } else {
        setErrorMessage(data.error || 'Failed to delete suite.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Delete operation failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafd] text-slate-900 font-sans antialiased flex flex-col select-none">
      {/* Top Bar: Left Logo only, Right Create button + Circular (X) close */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="w-full px-6 sm:px-10 h-16 flex items-center justify-between">
          {/* Top Left: Logo only */}
          <div className="flex items-center gap-2.5">
            <img src="/infra_trace_logo.png" alt="InfraTrace" className="w-8 h-8 object-contain" />
          </div>

          {/* Top Right: Delete (if edit mode) + Simple Blue Create Button (No icon) + Circular (X) */}
          <div className="flex items-center gap-3">
            {isEditMode && (
              <button
                type="button"
                onClick={handleDeleteSuite}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (isEditMode ? 'Saving...' : 'Creating...') : 'Create'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/console')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close and Return to Console"
            >
              <XCircle className="w-6 h-6 stroke-[1.75]" />
            </button>
          </div>
        </div>
      </header>

      {/* Full Page Width Content */}
      <main className="w-full px-6 sm:px-10 py-8 flex-1 space-y-6">
        {/* Page Title written on the page above all */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isEditMode ? 'Edit Private API Suite' : 'Add New Private API Suite'}
          </h1>
        </div>

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-3 animate-in fade-in shadow-2xs">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold shadow-2xs">
            {errorMessage}
          </div>
        )}

        {/* Full-width Form Card */}
        <div className="w-full bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-8">
          {/* Section 1: Suite Name (Above Integration Method) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Suite Name *
            </label>
            <input
              type="text"
              value={suiteName}
              onChange={(e) => setSuiteName(e.target.value)}
              placeholder="e.g. AWS Production EC2 & Telemetry Suite"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              required
            />
          </div>

          {/* Section 2: Integration Method (Upload File and Custom Endpoint disabled for clicking) */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Integration Method</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose how health endpoints and telemetry feeds are ingested into InfraTrace.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Practical Metrics Suite: Active */}
              <div
                className="p-4 rounded-xl border-2 border-blue-600 bg-blue-50/50 text-blue-900 flex flex-col justify-between shadow-xs select-none"
              >
                <div className="flex items-center justify-between mb-3">
                  <Cloud className="w-5 h-5 text-blue-600" />
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-bold">Practical Metrics Suite</span>
                <span className="text-xs text-slate-500 mt-1">
                  Select from shared practical metrics across Cloud, Containers, DB &amp; Host.
                </span>
              </div>

              {/* Upload Health File: Disabled for clicking */}
              <div
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-400 opacity-60 cursor-not-allowed flex flex-col justify-between select-none"
                title="Bulk file upload is disabled for this suite tier"
              >
                <div className="flex items-center justify-between mb-3">
                  <Upload className="w-5 h-5 text-slate-400" />
                </div>
                <span className="text-sm font-bold text-slate-500">Upload Health File</span>
                <span className="text-xs text-slate-400 mt-1">
                  Import bulk endpoints via JSON or CSV manifest. (Disabled)
                </span>
              </div>

              {/* Custom Endpoint: Disabled for clicking */}
              <div
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-400 opacity-60 cursor-not-allowed flex flex-col justify-between select-none"
                title="Direct custom endpoint configuration is disabled"
              >
                <div className="flex items-center justify-between mb-3">
                  <Server className="w-5 h-5 text-slate-400" />
                </div>
                <span className="text-sm font-bold text-slate-500">Custom Endpoint</span>
                <span className="text-xs text-slate-400 mt-1">
                  Directly monitor a specific URL or health path. (Disabled)
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Select Metrics */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Select Metrics ({Object.values(metricEndpoints).filter((v) => Boolean(v?.trim())).length} configured)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  select metrics to create private suite to monitor in infratrace
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const emptyMap: Record<string, string> = {};
                    setMetricEndpoints(emptyMap);
                    setSelectedMetrics([]);
                  }}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* List the 15 project APIs ONE BELOW THE OTHER: Left: ONLY name, Right: WIDE INPUT BOX */}
            <div className="space-y-2.5 pt-2">
              {IMPLEMENTED_METRICS.map((metric) => {
                const isChecked = selectedMetrics.includes(metric.id);
                const hasValue = Boolean(metricEndpoints[metric.id]?.trim());

                return (
                  <div
                    key={metric.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isChecked
                        ? 'border-blue-400 bg-blue-50/20 shadow-2xs'
                        : 'border-slate-200/90 bg-white hover:border-slate-300'
                    }`}
                  >
                    {/* Left: ONLY the name of the API + unit with clean fixed width */}
                    <div className="flex items-center gap-2.5 sm:w-80 shrink-0 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleMetric(metric.id)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer shrink-0"
                      />
                      <span className="text-xs font-bold text-slate-900 truncate" title={metric.name}>
                        {metric.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                        {metric.unit}
                      </span>
                    </div>

                    {/* Right: Text box stretching across all available remaining space */}
                    <div className="w-full sm:flex-1 flex items-center gap-2 min-w-0">
                      <input
                        type="text"
                        disabled={!isChecked}
                        value={metricEndpoints[metric.id] || ''}
                        onChange={(e) => {
                          if (!isChecked) return;
                          const val = e.target.value;
                          setMetricEndpoints((prev) => ({ ...prev, [metric.id]: val }));
                        }}
                        placeholder={isChecked ? "Enter API URL / endpoint..." : "Select checkbox on left to enable URL input"}
                        className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono transition-all ${
                          isChecked
                            ? 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs'
                            : 'border-slate-200 bg-slate-50 text-slate-400 placeholder:text-slate-400/60 cursor-not-allowed select-none'
                        }`}
                      />
                      {isChecked && hasValue && (
                        <button
                          type="button"
                          onClick={() => {
                            setMetricEndpoints((prev) => {
                              const copy = { ...prev };
                              delete copy[metric.id];
                              return copy;
                            });
                          }}
                          className="text-slate-400 hover:text-slate-700 p-1.5 rounded cursor-pointer shrink-0 text-sm font-bold"
                          title="Clear input"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PrivateApiSetupPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-sans">Loading Suite Editor...</div>}>
      <PrivateApiSetupForm />
    </Suspense>
  );
}
