/**
 * In-browser mock of the Komari HTTP API + JSON-RPC used by the GitHub Pages demo.
 * Only bundled when VITE_DEMO=1. All servers, IPs and numbers are fictional
 * (IPs come from the RFC 5737 / RFC 3849 documentation ranges).
 */

const GIB = 1024 ** 3
const TIB = 1024 ** 4
const START = Date.now()

interface DemoServer {
  name: string
  region: string
  cpu: string
  cores: number
  mem: number
  disk: number
  os: string
  group: string
  tags: string
  price: number
  cycle: number
  currency: string
  expiresInDays: number
  trafficLimit: number
  load: number
  online?: boolean
  gpu?: string
}

const SERVERS: DemoServer[] = [
  { name: 'Tokyo · Schale HQ', region: 'JP', cpu: 'AMD EPYC 7B13 64-Core Processor', cores: 4, mem: 8, disk: 120, os: 'Debian GNU/Linux 13 (trixie)', group: 'Production', tags: 'core<blue>;ipv6<jade>', price: 12, cycle: 30, currency: '$', expiresInDays: 210, trafficLimit: 4, load: 18 },
  { name: 'Osaka · Edge', region: 'JP', cpu: 'Intel Xeon Platinum 8370C', cores: 2, mem: 4, disk: 60, os: 'Ubuntu 24.04.1 LTS', group: 'Production', tags: 'edge<orange>', price: 6, cycle: 30, currency: '$', expiresInDays: 96, trafficLimit: 2, load: 9 },
  { name: 'Singapore · Relay', region: 'SG', cpu: 'AMD EPYC 9654 96-Core Processor', cores: 2, mem: 4, disk: 80, os: 'Debian GNU/Linux 12 (bookworm)', group: 'Production', tags: 'relay<blue>', price: 72, cycle: 365, currency: '$', expiresInDays: 300, trafficLimit: 3, load: 26 },
  { name: 'Hong Kong · CN2', region: 'HK', cpu: 'Intel Xeon Gold 6338', cores: 2, mem: 2, disk: 40, os: 'Debian GNU/Linux 12 (bookworm)', group: 'Production', tags: 'cn2<red>', price: 98, cycle: 90, currency: '¥', expiresInDays: 12, trafficLimit: 1, load: 34 },
  { name: 'Seoul · Gaming', region: 'KR', cpu: 'AMD Ryzen 9 7950X 16-Core Processor', cores: 4, mem: 16, disk: 200, os: 'Ubuntu 24.04.1 LTS', group: 'Lab', tags: 'game<purple>', price: 25, cycle: 30, currency: '$', expiresInDays: 45, trafficLimit: 5, load: 92 },
  { name: 'Los Angeles · Storage', region: 'US', cpu: 'Intel Xeon E5-2680 v4', cores: 8, mem: 32, disk: 4000, os: 'Rocky Linux 9.4', group: 'Storage', tags: 'nas<jade>;backup', price: 199, cycle: 365, currency: '$', expiresInDays: 160, trafficLimit: 20, load: 12 },
  { name: 'Frankfurt · Mirror', region: 'DE', cpu: 'AMD EPYC 7763 64-Core Processor', cores: 4, mem: 8, disk: 160, os: 'Debian GNU/Linux 13 (trixie)', group: 'Storage', tags: 'mirror', price: 8.5, cycle: 30, currency: '€', expiresInDays: 75, trafficLimit: 10, load: 21 },
  { name: 'London · Archive', region: 'GB', cpu: 'Intel N100', cores: 4, mem: 8, disk: 1000, os: 'Alpine Linux v3.20', group: 'Storage', tags: 'cold<orange>', price: 0, cycle: 30, currency: '£', expiresInDays: -1, trafficLimit: 2, load: 0, online: false },
  { name: 'Sydney · IPv6', region: 'AU', cpu: 'Ampere Altra Max M128-30', cores: 4, mem: 24, disk: 200, os: 'Ubuntu 22.04.5 LTS', group: 'Lab', tags: 'arm<blue>;ipv6<jade>', price: -1, cycle: 30, currency: '$', expiresInDays: 0, trafficLimit: 10, load: 7 },
  { name: 'Toronto · GPU', region: 'CA', cpu: 'AMD EPYC 9354 32-Core Processor', cores: 8, mem: 64, disk: 500, os: 'Ubuntu 24.04.1 LTS', group: 'Lab', tags: 'gpu<purple>', price: 1.2, cycle: 1, currency: '$', expiresInDays: 30, trafficLimit: 10, load: 63, gpu: 'NVIDIA L40S' },
]

const PING_TASKS = [
  { id: 1, name: '电信·上海', interval: 60, loss: 0, weight: 0 },
  { id: 2, name: '联通·上海', interval: 60, loss: 0, weight: 1 },
  { id: 3, name: '移动·上海', interval: 60, loss: 0, weight: 2 },
]

const PING_BASE: Record<string, number> = { JP: 48, SG: 72, HK: 28, KR: 56, US: 150, DE: 210, GB: 220, AU: 160, CA: 190 }

function uuidFor(index: number): string {
  return `5c4a1e00-0000-4000-8000-${String(index + 1).padStart(12, '0')}`
}

function iso(ms: number): string {
  return new Date(ms).toISOString()
}

// Deterministic noise so charts look natural but stay stable between polls.
function wave(seed: number, t: number, period = 90_000): number {
  return Math.sin(t / period + seed * 1.7) * 0.6 + Math.sin(t / (period / 3.1) + seed) * 0.4
}

function expiresAt(days: number): string {
  if (days === 0)
    return '0001-01-01T00:00:00Z'
  return iso(START + days * 86_400_000)
}

const clients = Object.fromEntries(SERVERS.map((s, i) => {
  const uuid = uuidFor(i)
  return [uuid, {
    uuid,
    name: s.name,
    cpu_name: s.cpu,
    virtualization: i % 3 === 0 ? 'kvm' : i % 3 === 1 ? 'docker' : 'kvm',
    arch: s.cpu.startsWith('Ampere') ? 'aarch64' : 'x86_64',
    cpu_cores: s.cores,
    cpu_physical_cores: Math.max(1, s.cores / 2),
    os: s.os,
    kernel_version: '6.12.0-demo',
    gpu_name: s.gpu ?? '',
    ipv4: `192.0.2.${10 + i}`,
    ipv6: `2001:db8:5c4a:${i + 1}::1`,
    region: s.region,
    public_remark: '',
    mem_total: s.mem * GIB,
    swap_total: i % 2 === 0 ? 2 * GIB : 0,
    disk_total: s.disk * GIB,
    version: '1.5.11-demo',
    weight: i,
    price: s.price,
    billing_cycle: s.cycle,
    auto_renewal: i % 2 === 0,
    currency: s.currency,
    expired_at: expiresAt(s.expiresInDays),
    group: s.group,
    tags: s.tags,
    hidden: false,
    traffic_limit: s.trafficLimit * TIB,
    traffic_limit_type: 'sum',
    created_at: iso(START - 400 * 86_400_000),
    updated_at: iso(START),
  }]
}))

function statusFor(index: number, t = Date.now()) {
  const s = SERVERS[index]!
  const uuid = uuidFor(index)
  const online = s.online !== false
  const w = wave(index, t)
  const cpu = online ? Math.min(99, Math.max(0.3, s.load + w * Math.max(3, s.load * 0.15))) : 0
  const memTotal = s.mem * GIB
  const diskTotal = s.disk * GIB
  const rxBase = 40_000 + index * 55_000
  const uptimeDays = 18 + index * 7
  return {
    client: uuid,
    time: iso(t),
    cpu,
    gpu: s.gpu ? 55 + w * 20 : 0,
    gpu_count: s.gpu ? 1 : 0,
    gpu_average_usage: s.gpu ? 55 + w * 20 : 0,
    gpu_detailed_info: s.gpu ? [{ name: s.gpu, utilization: 55 + w * 20, memory_total: 48 * GIB, memory_used: 30 * GIB, temperature: 64 }] : [],
    ram: online ? Math.round(memTotal * (0.22 + index * 0.05 + w * 0.02)) : 0,
    ram_total: memTotal,
    swap: index % 2 === 0 ? 180 * 1024 ** 2 : 0,
    swap_total: index % 2 === 0 ? 2 * GIB : 0,
    load: online ? (cpu / 100) * s.cores * 1.1 : 0,
    load5: online ? (cpu / 100) * s.cores : 0,
    load15: online ? (cpu / 100) * s.cores * 0.9 : 0,
    temp: online ? 38 + cpu * 0.3 : 0,
    disk: Math.round(diskTotal * (0.14 + index * 0.06)),
    disk_total: diskTotal,
    net_in: online ? Math.max(0, rxBase * (1 + w)) : 0,
    net_out: online ? Math.max(0, rxBase * 0.6 * (1 + w * 0.8)) : 0,
    net_total_up: (index + 2) * 38 * GIB + (t - START) * 40,
    net_total_down: (index + 2) * 61 * GIB + (t - START) * 70,
    traffic_up: (index + 1) * 3 * GIB,
    traffic_down: (index + 1) * 5 * GIB,
    process: online ? 80 + index * 9 : 0,
    connections: online ? 60 + index * 23 : 0,
    connections_udp: online ? 4 + index : 0,
    online,
    uptime: online ? uptimeDays * 86_400 + Math.floor((t - START) / 1000) : 0,
    message: '',
    updated_at: iso(t),
    ping: {},
  }
}

function allStatuses() {
  return Object.fromEntries(SERVERS.map((_, i) => [uuidFor(i), statusFor(i)]))
}

function indexOf(uuid: unknown): number {
  const i = SERVERS.findIndex((_, idx) => uuidFor(idx) === uuid)
  return i < 0 ? 0 : i
}

function records(uuid: unknown, count = 90, step = 60_000) {
  const i = indexOf(uuid)
  const now = Date.now()
  return Array.from({ length: count }, (_, k) => statusFor(i, now - (count - 1 - k) * step))
}

function latencyFor(i: number, task: number, t: number): number {
  const base = PING_BASE[SERVERS[i]!.region] ?? 120
  return Math.round(base + task * 9 + wave(i * 3 + task, t, 50_000) * base * 0.12)
}

function pingRecords(uuid: unknown, count = 120) {
  const i = indexOf(uuid)
  const online = SERVERS[i]!.online !== false
  const now = Date.now()
  return PING_TASKS.flatMap(task => Array.from({ length: count }, (_, k) => {
    const t = now - (count - 1 - k) * 60_000
    const lost = !online || (k * 7 + task.id * 13 + i) % 37 === 0
    return { task_id: task.id, client: uuidFor(i), time: iso(t), value: lost ? -1 : latencyFor(i, task.id, t) }
  }))
}

const METRIC_KEYS = [
  'cpu.usage', 'load.average', 'memory.used', 'memory.total', 'swap.used', 'swap.total', 'temperature',
  'disk.used', 'disk.total', 'net.in.rate', 'net.out.rate', 'net.total.down', 'net.total.up',
  'traffic.down', 'traffic.up', 'process.count', 'connections.tcp', 'connections.udp',
  'gpu.usage', 'gpu.device.usage', 'gpu.memory.used', 'gpu.memory.total', 'gpu.temperature',
  'ping.latency_ms', 'ping.loss',
]

function metricFrom(status: ReturnType<typeof statusFor>, key: string): number {
  const map: Record<string, number> = {
    'cpu.usage': status.cpu,
    'load.average': status.load,
    'memory.used': status.ram,
    'memory.total': status.ram_total,
    'swap.used': status.swap,
    'swap.total': status.swap_total,
    'temperature': status.temp,
    'disk.used': status.disk,
    'disk.total': status.disk_total,
    'net.in.rate': status.net_in,
    'net.out.rate': status.net_out,
    'net.total.down': status.net_total_down,
    'net.total.up': status.net_total_up,
    'traffic.down': status.traffic_down,
    'traffic.up': status.traffic_up,
    'process.count': status.process,
    'connections.tcp': status.connections,
    'connections.udp': status.connections_udp,
    'gpu.usage': status.gpu,
    'gpu.device.usage': status.gpu,
    'gpu.memory.used': status.gpu_count ? 30 * GIB : 0,
    'gpu.memory.total': status.gpu_count ? 48 * GIB : 0,
    'gpu.temperature': status.gpu_count ? 64 : 0,
  }
  return map[key] ?? 0
}

function parseTime(value: unknown, fallback: number): number {
  const ms = typeof value === 'string' ? Date.parse(value) : typeof value === 'number' ? value : Number.NaN
  return Number.isFinite(ms) ? ms : fallback
}

function queryMetrics(params: Record<string, unknown>) {
  const uuid = params.entity_id
  const i = indexOf(uuid)
  const now = Date.now()
  const end = Math.min(now, parseTime(params.end, now))
  const start = parseTime(params.start, end - 3_600_000)
  const span = Math.max(60_000, end - start)
  const count = 120
  const step = span / (count - 1)
  const keys = Array.isArray(params.metric_keys) ? params.metric_keys.map(String) : METRIC_KEYS
  const times = Array.from({ length: count }, (_, k) => start + k * step)
  const series = keys.flatMap((key) => {
    if (key.startsWith('ping.')) {
      return PING_TASKS.map(task => ({
        metric_key: key,
        entity_id: uuidFor(i),
        type: 'gauge',
        tags: { task_id: String(task.id), task_name: task.name },
        points: times.map(t => ({
          time: iso(t),
          value: key === 'ping.loss' ? Math.max(0, 1.5 + wave(i + task.id, t, 40_000) * 2) : latencyFor(i, task.id, t),
        })),
      }))
    }
    return [{
      metric_key: key,
      entity_id: uuidFor(i),
      type: 'gauge',
      tags: {},
      points: times.map(t => ({ time: iso(t), value: metricFrom(statusFor(i, t), key) })),
    }]
  })
  return { start: iso(start), end: iso(end), series, count: series.length }
}

function pingStats(params: Record<string, unknown>) {
  const now = Date.now()
  const uuids = Array.isArray(params.entity_ids) ? params.entity_ids : params.entity_id ? [params.entity_id] : SERVERS.map((_, i) => uuidFor(i))
  const stats = uuids.flatMap((uuid) => {
    const i = indexOf(uuid)
    const online = SERVERS[i]!.online !== false
    return PING_TASKS.map((task) => {
      const samples = Array.from({ length: 60 }, (_, k) => latencyFor(i, task.id, now - k * 60_000))
      return {
        entity_id: uuidFor(i),
        task_id: String(task.id),
        name: task.name,
        interval: task.interval,
        tags: { task_id: String(task.id), task_name: task.name },
        total: 60,
        valid: online ? 59 : 0,
        loss: online ? 1.7 + (i % 3) : 100,
        loss_approximate: false,
        min: Math.min(...samples),
        max: Math.max(...samples),
        avg: samples.reduce((a, b) => a + b, 0) / samples.length,
        latest: online ? samples[0] : -1,
      }
    })
  })
  return { start: iso(now - 3_600_000), end: iso(now), interval_seconds: 60, stats, count: stats.length }
}

function handleRpc(method: string, params: Record<string, unknown> = {}): unknown {
  switch (method) {
    case 'rpc.ping': return 'pong'
    case 'common:getNodes': return clients
    case 'common:getNodesLatestStatus': return allStatuses()
    case 'common:getNodeRecentStatus': return { count: 90, records: records(params.uuid) }
    case 'common:getRecords':
      return params.type === 'ping'
        ? { count: 120, records: pingRecords(params.uuid), tasks: PING_TASKS }
        : { count: 90, records: records(params.uuid) }
    case 'public:getClientRecentRecords': return records(params.uuid)
    case 'public:getRecordsByUUID': return { count: 90, records: records(params.uuid), load_type: 'all', has_gpu_data: false }
    case 'public:getPingRecords': return { count: 120, records: pingRecords(params.uuid), tasks: PING_TASKS }
    case 'public:getPublicPingTasks': return PING_TASKS
    case 'public:listMetricDefinitions': return METRIC_KEYS.map(name => ({ name, description: name, type: 'gauge', retention_days: 30 }))
    case 'public:queryMetrics': return queryMetrics(params)
    case 'public:getPingMetricStats': return pingStats(params)
    case 'public:getNodesInformation': return Object.values(clients)
    case 'public:getMe': return { logged_in: false }
    case 'public:getVersion':
    case 'common:getBackendVersion':
    case 'rpc.getVersion': return { version: '1.6.1-demo', hash: 'demo' }
    default: return null
  }
}

const THEME_SETTINGS = {
  themeMode: 'light',
  dataUpdateInterval: 3,
  rpcTransportMode: 'http',
  defaultViewMode: 'card',
  nodeCardSize: 'compact',
  hideAdminEntryWhenLoggedOut: true,
  visitorInfoEnabled: false,
  homeToolsEnabled: false,
  homeQuickControlsEnabled: true,
  homeQuickControlPreset: '完整',
  fanLabelsEnabled: true,
  generalCardPreset: '自定义',
  generalCardKeys: 'memory\nremainingValue\nuploadSpeed\ndisk\ntotalTraffic\ndownloadSpeed',
}

const PUBLIC_SETTINGS = {
  allow_cors: true,
  custom_body: '',
  custom_head: '',
  description: 'Schale Kivotos theme demo',
  disable_password_login: false,
  oauth_enable: false,
  oauth_provider: null,
  private_site: false,
  record_enabled: true,
  record_preserve_time: 720,
  ping_record_preserve_time: 720,
  sitename: 'Kivotos Demo',
  theme: 'SchaleKivotos',
  theme_settings: THEME_SETTINGS,
  visitor_audit_enabled: false,
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function ok(data: unknown): Response {
  return json({ status: 'success', message: 'ok', data })
}

// Fictional geo answers so the demo never calls real IP-geolocation services.
const CITY_GEO: Record<string, [number, number, string]> = {
  JP: [35.68, 139.69, 'Tokyo'],
  SG: [1.35, 103.82, 'Singapore'],
  HK: [22.32, 114.17, 'Hong Kong'],
  KR: [37.57, 126.98, 'Seoul'],
  US: [34.05, -118.24, 'Los Angeles'],
  DE: [50.11, 8.68, 'Frankfurt'],
  GB: [51.51, -0.13, 'London'],
  AU: [-33.87, 151.21, 'Sydney'],
  CA: [43.65, -79.38, 'Toronto'],
}
const GEO_HOSTS = new Set(['api.ip.sb', 'ipinfo.io', 'ipapi.co', 'ipwho.is'])

function geoFor(url: URL): Response {
  const ip = decodeURIComponent(url.pathname.split('/').filter(Boolean).find(part => /[\d:.]{3,}/.test(part)) ?? '')
  const i = SERVERS.findIndex((_, idx) => ip === `192.0.2.${10 + idx}` || ip.startsWith(`2001:db8:5c4a:${idx + 1}:`))
  const region = SERVERS[i < 0 ? 0 : i]!.region
  const second = SERVERS.slice(0, i < 0 ? 0 : i).filter(s => s.region === region).length
  const [lat, lng, city] = CITY_GEO[region] ?? CITY_GEO.JP!
  const latitude = lat + second * 0.9
  const longitude = lng + second * 1.4
  return json({
    success: true,
    ip,
    latitude,
    longitude,
    loc: `${latitude},${longitude}`,
    city,
    country_code: region,
    country: region,
    org: 'AS64500 Kivotos Demo Network',
    connection: { org: 'Kivotos Demo Network', isp: 'Kivotos Demo Network', asn: 64500 },
  })
}

const nativeFetch = window.fetch.bind(window)

window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, location.href)
  const path = url.pathname
  if (GEO_HOSTS.has(url.hostname))
    return geoFor(url)
  if (url.origin === location.origin) {
    if (path.endsWith('/rpc2')) {
      const raw = init?.body ?? (input instanceof Request ? await input.clone().text() : '')
      const payload = JSON.parse(typeof raw === 'string' ? raw : '{}') as { id: unknown, method: string, params?: Record<string, unknown> }
      return json({ jsonrpc: '2.0', id: payload.id, result: handleRpc(payload.method, payload.params) })
    }
    if (path.endsWith('/api/public'))
      return ok(PUBLIC_SETTINGS)
    if (path.endsWith('/api/me'))
      return json({ logged_in: false, username: 'guest' })
    if (path.endsWith('/api/version'))
      return ok({ version: '1.6.1-demo', hash: 'demo' })
    if (path.includes('/api/'))
      return json({ status: 'error', message: 'Not available in demo', data: null }, 404)
  }
  return nativeFetch(input, init)
}
