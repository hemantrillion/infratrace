const http = require('node:http');

const PORT = 3001;
const startTime = Date.now();

// Realistic simulated response delays (15ms - 45ms) to emulate local backend execution
function simulateProcessingDelay() {
  const ms = Math.floor(18 + Math.random() * 25);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const server = http.createServer(async (req, res) => {
  // Universal CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (req.method === 'OPTIONS' || req.method === 'HEAD') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Simulate internal service execution delay
  await simulateProcessingDelay();

  const url = req.url.split('?')[0];

  // ==========================================
  // 1. VISHAL KUMAR'S ALLOCATED CORE APIS
  // ==========================================

  // #1: POST /api/onboarding/verify (Onboarding & JWT Credential Generation)
  if (url === '/api/onboarding/verify') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      service: 'POST /api/onboarding/verify',
      status: 'VERIFIED',
      jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.infratrace_session_token_sample',
      tenantId: 'tenant_delhi_salon_01',
      role: 'merchant',
      bilingualMode: 'hi-en',
      message: 'Onboarding credentials verified; JWT session active'
    }));
    return;
  }

  // #4: POST /api/schema/migrate (Database Migration Execution Duration)
  if (url === '/api/schema/migrate') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      service: 'POST /api/schema/migrate',
      status: 'MIGRATED',
      tablesProvisioned: ['tenants', 'stations', 'service_tariffs', 'slots', 'bookings', 'queues'],
      tablesCount: 16,
      ddlExecutionMs: 42,
      appliedAt: new Date().toISOString()
    }));
    return;
  }

  // #8: POST /api/queue/token (Queue Token Ingestion & Ticket Creation)
  if (url === '/api/queue/token') {
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      service: 'POST /api/queue/token',
      status: 'QUEUED',
      tokenId: 'tok_seq_042',
      ticketNumber: 'A-042',
      customerName: 'Patron 42',
      estimatedWaitMinutes: 14,
      createdAt: new Date().toISOString()
    }));
    return;
  }

  // #12: PATCH /api/queue/token/:id/call (Station Operator Turnaround & Call Next)
  if (url.startsWith('/api/queue/token/') && url.endsWith('/call') || url === '/api/queue/token/call') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      service: 'PATCH /api/queue/token/:id/call',
      status: 'IN_SERVICE',
      stationId: 'station_lane_02',
      operatorId: 'op_raghav_01',
      tokenId: 'tok_seq_042',
      turnaroundMs: 24,
      calledAt: new Date().toISOString()
    }));
    return;
  }

  // ==========================================
  // 2. HEMANT KUMAR'S ALLOCATED CORE APIS
  // ==========================================

  // #5: POST /api/slots/allocate (Clash-Free Slot Allocation Latency)
  if (url === '/api/slots/allocate') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      service: 'POST /api/slots/allocate',
      status: 'ALLOCATED_LOCKED',
      allocationId: 'alloc_lane2_1030',
      station: 'Station 2',
      slotWindow: '10:30 - 11:00',
      sanitizationBufferMarginMinutes: 5,
      mutexAcquired: true,
      allocatedAt: new Date().toISOString()
    }));
    return;
  }

  // #16: POST /api/notifications/send (Automated Delay & Token Dispatch Pipeline)
  if (url === '/api/notifications/send' || url === '/api/notifications') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      service: 'POST /api/notifications/send',
      status: 'DISPATCHED',
      messageId: 'msg_alert_8871',
      channels: ['EMAIL', 'SMS'],
      recipientsCount: 1,
      dispatchLatencyMs: 31,
      sentAt: new Date().toISOString()
    }));
    return;
  }

  // ==========================================
  // 3. AASTHA KUMARI'S ALLOCATED CORE APIS
  // ==========================================

  // #3: POST /api/ai/translate-schema (AI Schema Translation Latency)
  if (url === '/api/ai/translate-schema') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      service: 'POST /api/ai/translate-schema',
      status: 'TRANSLATED',
      astNodesCount: 14,
      dbmlSyntaxTreeGenerated: true,
      normalizationRulesApplied: ['safai_ka_time_to_buffer', 'kursi_to_station'],
      tokensGenerated: 180,
      translationLatencyMs: 48
    }));
    return;
  }

  // #7: POST /api/bookings (Final Booking Commitment Transaction)
  if (url === '/api/bookings') {
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      service: 'POST /api/bookings',
      status: 'CONFIRMED',
      bookingId: 'bk_2026_9941',
      tenantId: 'tenant_delhi_salon_01',
      stationLane: 'Station 2',
      scheduledTimestamp: '2026-11-23T11:00:00Z',
      revenueLogged: 350.00
    }));
    return;
  }

  // #11: GET /api/queue/stats (Live Queue Backlog & Wait-Time Estimator)
  if (url === '/api/queue/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      service: 'GET /api/queue/stats',
      status: 'ACTIVE',
      activeQueueDepth: 4,
      averageCustomerWaitMinutes: 12.5,
      activeStationsCount: 3,
      currentTurnoverRatePerHour: 8,
      queriedAt: new Date().toISOString()
    }));
    return;
  }

  // #17: GET /api/notifications/status (Notification Delivery Backlog Status)
  if (url === '/api/notifications/status' || url === '/api/notifications/phases') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      service: 'GET /api/notifications/status',
      status: 'OPERATIONAL',
      pipelineState: 'IDLE_HEALTHY',
      pendingQueueBacklog: 0,
      deliverySuccessRatePct: 99.98,
      averageDispatchMs: 34
    }));
    return;
  }

  // Generic fallback for any other Booking OQ operational query
  if (url === '/api/health' || url === '/health' || url === '/' || url.startsWith('/api/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      service: 'Booking OQ Backend Services Node',
      status: 'HEALTHY',
      port: PORT,
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000)
    }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint Not Found on Booking OQ Node', path: url }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Booking OQ Service Node] Listening on http://localhost:${PORT}`);
});
