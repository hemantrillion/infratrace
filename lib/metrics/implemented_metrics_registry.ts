export interface ImplementedMetricDefinition {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  unit: string;
  description: string;
  sampleApiUrl: string;
  sampleApiName: string;
  sampleApiProvider: string;
  graphType: 'percent' | 'latency_ms' | 'memory_mb' | 'throughput_kb' | 'counter' | 'uptime_percent';
  primaryColor: string;
  secondaryColor?: string;
  expectedIntervalSeconds: number;
}

export const IMPLEMENTED_METRICS: ImplementedMetricDefinition[] = [
  {
    id: "api_oq_onboarding_verify",
    name: "#1: POST /api/onboarding/verify",
    category: "Security",
    subCategory: "Observatory authentication (own app)",
    unit: "ms",
    description: "Verifies bilingual onboarding credentials and issues signed HMAC-SHA256 JWT tokens.",
    sampleApiUrl: "http://localhost:3001/api/onboarding/verify",
    sampleApiName: "OQ Bilingual Onboarding Credential Gate",
    sampleApiProvider: "OQ Monitored Service",
    graphType: "latency_ms",
    primaryColor: "#0284c7",
    expectedIntervalSeconds: 15
  },
  {
    id: "priv_gemini_api",
    name: "#2: Google Gemini API Gateway",
    category: "Service",
    subCategory: "Dependencies (third-party)",
    unit: "ms",
    description: "Multimodal foundation model inference and structured generation gateway.",
    sampleApiUrl: "https://generativelanguage.googleapis.com/v1beta/models",
    sampleApiName: "Google Gemini Model Gateway",
    sampleApiProvider: "Google AI Studio",
    graphType: "latency_ms",
    primaryColor: "#8b5cf6",
    expectedIntervalSeconds: 15
  },
  {
    id: "api_oq_ai_translate_schema",
    name: "#3: POST /api/ai/translate-schema",
    category: "Database",
    subCategory: "Maintenance & durability",
    unit: "ms",
    description: "Translates and harmonizes heterogeneous queue schemas using AI.",
    sampleApiUrl: "http://localhost:3001/api/ai/translate-schema",
    sampleApiName: "OQ AI Schema Translation Engine",
    sampleApiProvider: "OQ Monitored Service",
    graphType: "latency_ms",
    primaryColor: "#8b5cf6",
    expectedIntervalSeconds: 15
  },
  {
    id: "api_oq_schema_migrate",
    name: "#4: POST /api/schema/migrate",
    category: "Database",
    subCategory: "Maintenance & durability",
    unit: "ms",
    description: "Applies automated schema migration DDL transformations with rollback validation.",
    sampleApiUrl: "http://localhost:3001/api/schema/migrate",
    sampleApiName: "OQ DDL Schema Migration Gateway",
    sampleApiProvider: "OQ Monitored Service",
    graphType: "latency_ms",
    primaryColor: "#0284c7",
    expectedIntervalSeconds: 15
  },
  {
    id: "api_oq_slots_allocate",
    name: "#5: POST /api/slots/allocate",
    category: "Database",
    subCategory: "Transactions",
    unit: "ms",
    description: "Enforces 3-way binding (Service + Station/Room + Time Window); measures clash-free allocation latency (ms) and slot conflict rejection rate (%).",
    sampleApiUrl: "http://localhost:3001/api/slots/allocate",
    sampleApiName: "OQ 3-Way Slot Allocation Engine",
    sampleApiProvider: "OQ Monitored Service",
    graphType: "latency_ms",
    primaryColor: "#0284c7",
    expectedIntervalSeconds: 15
  },
  {
    id: "api_oq_bookings",
    name: "#7: POST /api/bookings",
    category: "Database",
    subCategory: "Transactions",
    unit: "ms",
    description: "Executes ACID booking transactions, writes audit trails, and returns confirmed reservation IDs.",
    sampleApiUrl: "http://localhost:3001/api/bookings",
    sampleApiName: "OQ ACID Booking Transaction Engine",
    sampleApiProvider: "OQ Monitored Service",
    graphType: "latency_ms",
    primaryColor: "#0284c7",
    expectedIntervalSeconds: 15
  },
  {
    id: "api_oq_queue_token",
    name: "#8: POST /api/queue/token",
    category: "Queues",
    subCategory: "Queues & jobs (generic)",
    unit: "ms",
    description: "Generates atomic sequential queue tickets with SHA-256 digital signatures.",
    sampleApiUrl: "http://localhost:3001/api/queue/token",
    sampleApiName: "OQ Atomic Queue Ticket Generator",
    sampleApiProvider: "OQ Monitored Service",
    graphType: "latency_ms",
    primaryColor: "#0284c7",
    expectedIntervalSeconds: 15
  },
  {
    id: "api_osm_nominatim",
    name: "#10: OpenStreetMap Nominatim Geocoding API",
    category: "Synthetic",
    subCategory: "Latency",
    unit: "ms",
    description: "Resolves business and station street addresses into real latitude/longitude coordinates.",
    sampleApiUrl: "https://nominatim.openstreetmap.org/search?q=Delhi&format=json",
    sampleApiName: "OpenStreetMap Nominatim Geocoding API",
    sampleApiProvider: "OpenStreetMap Foundation",
    graphType: "latency_ms",
    primaryColor: "#16a34a",
    expectedIntervalSeconds: 15
  },
  {
    id: "api_oq_queue_stats",
    name: "#11: GET /api/queue/stats",
    category: "Queues",
    subCategory: "Queues & jobs (generic)",
    unit: "ms",
    description: "Returns live queue depth, station throughput, and estimated wait times.",
    sampleApiUrl: "http://localhost:3001/api/queue/stats",
    sampleApiName: "OQ Live Queue Backlog & Wait Stats",
    sampleApiProvider: "OQ Monitored Service",
    graphType: "latency_ms",
    primaryColor: "#0284c7",
    expectedIntervalSeconds: 15
  },
  {
    id: "api_oq_queue_call",
    name: "#12: PATCH /api/queue/token/:id/call",
    category: "Queues",
    subCategory: "Queues & jobs (generic)",
    unit: "ms",
    description: "Transitions queue tickets from WAITING to IN_SERVICE and alerts operator stations.",
    sampleApiUrl: "http://localhost:3001/api/queue/token/call",
    sampleApiName: "OQ Station Operator Ticket Call Engine",
    sampleApiProvider: "OQ Monitored Service",
    graphType: "latency_ms",
    primaryColor: "#0284c7",
    expectedIntervalSeconds: 15
  },
  {
    id: "api_notifications_send",
    name: "#16: POST /api/notifications/send",
    category: "Queues",
    subCategory: "Queues & jobs (generic)",
    unit: "ms",
    description: "Enqueues urgent booking alerts and ticket status notifications for dispatch.",
    sampleApiUrl: "http://localhost:3001/api/notifications/send",
    sampleApiName: "OQ Urgent Client Notification Dispatcher",
    sampleApiProvider: "OQ Monitored Service",
    graphType: "latency_ms",
    primaryColor: "#ea580c",
    expectedIntervalSeconds: 15
  },
  {
    id: "api_notifications_status",
    name: "#17: GET /api/notifications/status",
    category: "Queues",
    subCategory: "Queues & jobs (generic)",
    unit: "count",
    description: "Monitors outgoing notification queues, retry queues, and dispatch backlog counts.",
    sampleApiUrl: "http://localhost:3001/api/notifications/status",
    sampleApiName: "OQ Notification Queue Backlog Monitor",
    sampleApiProvider: "OQ Monitored Service",
    graphType: "counter",
    primaryColor: "#ea580c",
    expectedIntervalSeconds: 15
  },
  {
    id: "api_osm_tile_server",
    name: "#18: OpenStreetMap Online Tile Server API",
    category: "Synthetic",
    subCategory: "Payload & throughput",
    unit: "ms",
    description: "Live map tile rendering probe; measures map tile download response latency (ms).",
    sampleApiUrl: "https://tile.openstreetmap.org/0/0/0.png",
    sampleApiName: "OpenStreetMap Online Tile Server API",
    sampleApiProvider: "OpenStreetMap Foundation",
    graphType: "latency_ms",
    primaryColor: "#16a34a",
    expectedIntervalSeconds: 15
  },
  {
    id: "api_public_dns",
    name: "#23: Public DNS Resolution API",
    category: "Synthetic",
    subCategory: "DNS & domains",
    unit: "ms",
    description: "Cloudflare 1.1.1.1 Public DNS Over HTTPS query latency and domain propagation probe.",
    sampleApiUrl: "https://1.1.1.1/dns-query?name=cloudflare.com&type=A",
    sampleApiName: "Cloudflare 1.1.1.1 DNS Over HTTPS Probe",
    sampleApiProvider: "Cloudflare DNS",
    graphType: "latency_ms",
    primaryColor: "#0b57d0",
    expectedIntervalSeconds: 15
  },
  {
    id: "api_tls_socket_probe",
    name: "#24: TLS Socket Probe",
    category: "Synthetic",
    subCategory: "TLS & protocol",
    unit: "ms",
    description: "Direct SSL/TLS cryptographic handshake verifying certificate integrity and expiration.",
    sampleApiUrl: "https://cloudflare.com",
    sampleApiName: "Edge TLS Handshake & Certificate Probe",
    sampleApiProvider: "TLS Cryptographic Handshake",
    graphType: "latency_ms",
    primaryColor: "#0b57d0",
    expectedIntervalSeconds: 15
  }
];

export function getImplementedMetric(id: string): ImplementedMetricDefinition | undefined {
  return IMPLEMENTED_METRICS.find((m) => m.id === id || m.name === id);
}
