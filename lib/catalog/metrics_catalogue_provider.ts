import rawCatalog from './excel_metrics_catalog.json';

export interface RawMetricItem {
  metric: string;
  description: string;
  parent_path: string;
  api_info: string;
  requirements: string;
  unit?: string;
  target_type?: string;
  is_api_endpoint?: boolean;
}

export interface MetricCardData {
  id: string;
  title: string;
  description: string;
  parentPath: string;
  sampleApi: string;
  requirements: string;
  hasData: boolean;
  curveType: 'spike' | 'wave' | 'dual' | 'flat' | 'empty';
  color: string;
  dualColor?: string;
  series1Name?: string;
  series2Name?: string;
  points: number[];
  dualPoints?: number[];
  unit?: string;
  targetType?: string;
  targetUrl?: string;
  isApiEndpoint?: boolean;
}

export interface MetricGroup {
  id: string;
  title: string;
  metrics: MetricCardData[];
}

export interface CategoryTab {
  id: string;
  label: string;
}

export interface CategoryMeta {
  id: string;
  title: string;
  subtitle: string;
  tabs: CategoryTab[];
}

const typedCatalog = rawCatalog as Record<string, RawMetricItem[]>;

// Helper to generate deterministic realistic curve points based on metric name
function generatePoints(name: string, type: 'spike' | 'wave' | 'dual' | 'flat' | 'empty'): { p1: number[]; p2?: number[] } {
  if (type === 'empty') {
    return { p1: [] };
  }

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash) % 100;

  const pointsCount = 40;
  const p1: number[] = [];
  const p2: number[] = [];

  const baseline = 0.08 + (seed % 10) * 0.01;
  const spikeIndex = 18 + (seed % 12);
  const spikeHeight = 0.55 + (seed % 35) * 0.01;

  for (let i = 0; i < pointsCount; i++) {
    const distToSpike = Math.abs(i - spikeIndex);
    let val1 = baseline + Math.sin(i * 0.35 + seed) * 0.02 + ((i * 13) % 7) * 0.003;
    let val2 = baseline * 0.8 + Math.cos(i * 0.3 + seed) * 0.015 + ((i * 17) % 5) * 0.002;

    if (type === 'spike' || type === 'dual') {
      if (distToSpike === 0) {
        val1 = spikeHeight;
        val2 = spikeHeight * 0.75;
      } else if (distToSpike === 1) {
        val1 = spikeHeight * 0.45;
        val2 = spikeHeight * 0.35;
      } else if (distToSpike === 2) {
        val1 = spikeHeight * 0.2;
        val2 = spikeHeight * 0.15;
      }
    } else if (type === 'wave') {
      val1 = baseline + 0.15 * Math.sin(i * 0.2 + seed) + 0.05 * Math.cos(i * 0.4);
    }

    p1.push(Math.max(0, Math.min(1, val1)));
    p2.push(Math.max(0, Math.min(1, val2)));
  }

  return { p1, p2: type === 'dual' ? p2 : undefined };
}

export function getCategoryMetadata(category: string): CategoryMeta {
  switch (category) {
    case 'Database':
      return {
        id: 'Database',
        title: 'Database & Storage Telemetry',
        subtitle: 'ACID booking transactions, slot allocation latency, and DDL schema migrations.',
        tabs: [
          { id: 'all', label: 'All Database' },
          { id: 'transactions', label: 'Transactions' },
          { id: 'durability', label: 'Maintenance & Durability' },
        ],
      };
    case 'Queues':
      return {
        id: 'Queues',
        title: 'Queue & Messaging Telemetry',
        subtitle: 'Atomic token generation, queue backlog stats, operator dispatch, and notification delivery.',
        tabs: [
          { id: 'all', label: 'All Queues' },
          { id: 'jobs', label: 'Queues & Jobs' },
        ],
      };
    case 'Security':
      return {
        id: 'Security',
        title: 'Security & Authentication Telemetry',
        subtitle: 'Application onboarding verification and HMAC-SHA256 token issuance.',
        tabs: [
          { id: 'all', label: 'All Security' },
          { id: 'auth', label: 'Observatory Authentication' },
        ],
      };
    case 'Service':
      return {
        id: 'Service',
        title: 'Service & Dependency Telemetry',
        subtitle: 'Third-party API dependencies and external foundation model gateways.',
        tabs: [
          { id: 'all', label: 'All Services' },
          { id: 'dependencies', label: 'Dependencies (Third-Party)' },
        ],
      };
    case 'Synthetic':
      return {
        id: 'Synthetic',
        title: 'Synthetic Probes & Network Infrastructure',
        subtitle: 'Geocoding lookups, map tile rendering, DNS over HTTPS, and TLS cryptographic handshakes.',
        tabs: [
          { id: 'all', label: 'All Synthetic' },
          { id: 'latency', label: 'Latency' },
          { id: 'payload', label: 'Payload & Throughput' },
          { id: 'dns', label: 'DNS & Domains' },
          { id: 'tls', label: 'TLS & Protocol' },
        ],
      };
    case 'Cloud':
      return {
        id: 'Cloud',
        title: 'Cloud Provider Telemetry',
        subtitle: 'AWS compute, storage, CloudWatch telemetry, cost explorer, and infrastructure APIs.',
        tabs: [
          { id: 'all', label: 'All Cloud' },
          { id: 'aws', label: 'AWS' },
        ],
      };
    case 'Containers':
      return {
        id: 'Containers',
        title: 'Container & Docker Telemetry',
        subtitle: 'Docker daemon container runtime, memory constraints, and Kubernetes cluster metrics.',
        tabs: [
          { id: 'all', label: 'All Containers' },
          { id: 'docker', label: 'Docker' },
          { id: 'kubernetes', label: 'Kubernetes' },
        ],
      };
    case 'Infrastructure':
      return {
        id: 'Infrastructure',
        title: 'Host & Infrastructure Telemetry',
        subtitle: 'Port 5001 host OS telemetry, simulated health states, deliberate outage injection, latency lag, and recovery.',
        tabs: [
          { id: 'all', label: 'All Infrastructure' },
          { id: 'daemon', label: 'Host Daemon & Chaos' },
        ],
      };
    default:
      return {
        id: category,
        title: `${category} Telemetry`,
        subtitle: `Real-time timeseries metrics and telemetry inspection for ${category}.`,
        tabs: [{ id: 'all', label: 'All Metrics' }],
      };
  }
}

export function getCategoryMetricGroups(category: string, activeTabId: string = 'all'): MetricGroup[] {
  const items = typedCatalog[category] || [];
  const sep = String.fromCharCode(8250); // ›

  // Filter items by active tab
  let filteredItems = items;
  const tabLower = activeTabId.toLowerCase();

  if (tabLower !== 'all') {
    if (tabLower === 'transactions') {
      filteredItems = items.filter((i) => i.parent_path.toLowerCase().includes('transaction'));
    } else if (tabLower === 'durability') {
      filteredItems = items.filter((i) => i.parent_path.toLowerCase().includes('maintenance') || i.parent_path.toLowerCase().includes('durability'));
    } else if (tabLower === 'jobs') {
      filteredItems = items.filter((i) => i.parent_path.toLowerCase().includes('queues & jobs') || i.parent_path.toLowerCase().includes('queue'));
    } else if (tabLower === 'auth') {
      filteredItems = items.filter((i) => i.parent_path.toLowerCase().includes('authentication') || i.parent_path.toLowerCase().includes('auth'));
    } else if (tabLower === 'dependencies') {
      filteredItems = items.filter((i) => i.parent_path.toLowerCase().includes('dependencies') || i.parent_path.toLowerCase().includes('third-party'));
    } else if (tabLower === 'latency') {
      filteredItems = items.filter((i) => i.parent_path.toLowerCase().includes('latency'));
    } else if (tabLower === 'payload') {
      filteredItems = items.filter((i) => i.parent_path.toLowerCase().includes('payload') || i.parent_path.toLowerCase().includes('throughput'));
    } else if (tabLower === 'dns') {
      filteredItems = items.filter((i) => i.parent_path.toLowerCase().includes('dns'));
    } else if (tabLower === 'tls') {
      filteredItems = items.filter((i) => i.parent_path.toLowerCase().includes('tls'));
    } else if (tabLower === 'aws') {
      filteredItems = items.filter((i) => i.parent_path.toLowerCase().includes('aws'));
    } else if (tabLower === 'docker') {
      filteredItems = items.filter((i) => i.parent_path.toLowerCase().includes('docker'));
    } else if (tabLower === 'kubernetes') {
      filteredItems = items.filter((i) => i.parent_path.toLowerCase().includes('kubernetes'));
    }
  }

  // Group items by subcategory in parent_path
  const groupMap = new Map<string, MetricCardData[]>();

  filteredItems.forEach((raw, idx) => {
    const parts = raw.parent_path.split(sep).map((p) => p.trim());
    const groupTitle = parts[1] || parts[0] || 'General Telemetry';

    if (!groupMap.has(groupTitle)) {
      groupMap.set(groupTitle, []);
    }

    const isApi = !!raw.is_api_endpoint;
    const isDual = !isApi && (raw.metric.toLowerCase().includes('in/out') || raw.metric.toLowerCase().includes('read/write') || raw.metric.toLowerCase().includes('received/sent'));

    // Critical Requirement: For the 34 API endpoints, until suite configuration occurs, hasData MUST be false (no fake sine waves)
    const hasData = isApi ? false : (idx % 2 === 0 || idx < 3 || isDual);
    const curveType = !hasData ? 'empty' : isDual ? 'dual' : idx % 3 === 0 ? 'spike' : 'wave';
    const color = isDual ? '#2563eb' : idx % 4 === 0 ? '#0284c7' : idx % 4 === 1 ? '#10b981' : idx % 4 === 2 ? '#6366f1' : '#0ea5e9';

    const { p1, p2 } = generatePoints(raw.metric, curveType);

    const cleanId = isApi
      ? `api-${raw.metric.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
      : `${category}-${idx}-${raw.metric.replace(/[^a-zA-Z0-9]/g, '_')}`;

    groupMap.get(groupTitle)!.push({
      id: cleanId,
      title: raw.metric,
      description: raw.description,
      parentPath: raw.parent_path,
      sampleApi: raw.api_info,
      requirements: raw.requirements,
      hasData,
      curveType,
      color,
      dualColor: isDual ? '#22d3ee' : undefined,
      series1Name: isDual ? 'Network In' : undefined,
      series2Name: isDual ? 'Network Out' : undefined,
      points: p1,
      dualPoints: p2,
      unit: raw.unit || 'ms',
      targetType: raw.target_type,
      targetUrl: raw.api_info,
      isApiEndpoint: isApi,
    });
  });

  const result: MetricGroup[] = [];
  groupMap.forEach((metrics, title) => {
    result.push({
      id: title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-'),
      title,
      metrics,
    });
  });

  return result;
}
