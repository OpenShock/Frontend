import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/api', () => ({
  hubManagementV1Api: { devicesGetLiveControlGatewayInfo: vi.fn() },
}));

vi.mock('svelte-sonner', () => ({
  toast: { error: vi.fn() },
}));

// ---------------------------------------------------------------------------
// Mock WebSocket
// ---------------------------------------------------------------------------

class MockWebSocket {
  static instances: MockWebSocket[] = [];

  url: string;
  onopen: ((e: Event) => void) | null = null;
  onmessage: ((e: MessageEvent) => void) | null = null;
  onclose: ((e: CloseEvent) => void) | null = null;
  onerror: ((e: Event) => void) | null = null;
  send = vi.fn();
  close = vi.fn();

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  triggerOpen() {
    this.onopen?.(new Event('open'));
  }
  triggerMessage(data: unknown) {
    this.onmessage?.(new MessageEvent('message', { data: JSON.stringify(data) }));
  }
  triggerRawMessage(raw: string) {
    this.onmessage?.(new MessageEvent('message', { data: raw }));
  }
  triggerClose() {
    this.onclose?.(new CloseEvent('close'));
  }
  triggerError() {
    this.onerror?.(new Event('error'));
  }
}

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  MockWebSocket.instances = [];
  vi.stubGlobal('WebSocket', MockWebSocket);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// LiveShockerState
// ---------------------------------------------------------------------------

describe('LiveShockerState', () => {
  it('has correct default values', async () => {
    const { LiveShockerState } = await import('./live-control-state.svelte');
    const s = new LiveShockerState();
    expect(s.isDragging).toBe(false);
    expect(s.intensity).toBe(0);
    expect(s.isLive).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// LiveDeviceConnection — static state
// ---------------------------------------------------------------------------

describe('LiveDeviceConnection constructor', () => {
  it('stores deviceId and defaults to Disconnected', async () => {
    const { LiveDeviceConnection, LiveConnectionState } = await import('./live-control-state.svelte');
    const conn = new LiveDeviceConnection('dev-1');
    expect(conn.deviceId).toBe('dev-1');
    expect(conn.state).toBe(LiveConnectionState.Disconnected);
    expect(conn.gateway).toBeNull();
    expect(conn.country).toBeNull();
    expect(conn.latency).toBe(0);
  });
});

describe('LiveDeviceConnection — shocker management', () => {
  it('ensureShockerState creates a new state when absent', async () => {
    const { LiveDeviceConnection } = await import('./live-control-state.svelte');
    const conn = new LiveDeviceConnection('dev-1');
    conn.ensureShockerState('sh-1');
    expect(conn.shockers.has('sh-1')).toBe(true);
  });

  it('ensureShockerState is idempotent', async () => {
    const { LiveDeviceConnection } = await import('./live-control-state.svelte');
    const conn = new LiveDeviceConnection('dev-1');
    conn.ensureShockerState('sh-1');
    const first = conn.shockers.get('sh-1');
    conn.ensureShockerState('sh-1');
    expect(conn.shockers.get('sh-1')).toBe(first);
  });

  it('getShockerState returns undefined when not initialised', async () => {
    const { LiveDeviceConnection } = await import('./live-control-state.svelte');
    const conn = new LiveDeviceConnection('dev-1');
    expect(conn.getShockerState('unknown')).toBeUndefined();
  });

  it('getShockerState returns state after ensureShockerState', async () => {
    const { LiveDeviceConnection } = await import('./live-control-state.svelte');
    const conn = new LiveDeviceConnection('dev-1');
    conn.ensureShockerState('sh-2');
    expect(conn.getShockerState('sh-2')).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// LiveDeviceConnection — connect / disconnect
// ---------------------------------------------------------------------------

describe('LiveDeviceConnection.connect', () => {
  it('sets state to Connecting then Connected on success', async () => {
    const { LiveDeviceConnection, LiveConnectionState } = await import('./live-control-state.svelte');
    const { hubManagementV1Api } = await import('$lib/api');
    vi.mocked(hubManagementV1Api.devicesGetLiveControlGatewayInfo).mockResolvedValue({
      data: { gateway: 'gw.example.com', country: 'US' },
    });

    const conn = new LiveDeviceConnection('dev-1');
    const connectPromise = conn.connect();

    expect(conn.state).toBe(LiveConnectionState.Connecting);

    await connectPromise;
    const ws = MockWebSocket.instances[0];
    ws.triggerOpen();

    expect(conn.state).toBe(LiveConnectionState.Connected);
  });

  it('sets gateway and country from API response', async () => {
    const { LiveDeviceConnection } = await import('./live-control-state.svelte');
    const { hubManagementV1Api } = await import('$lib/api');
    vi.mocked(hubManagementV1Api.devicesGetLiveControlGatewayInfo).mockResolvedValue({
      data: { gateway: 'gw.openshock.app', country: 'DE' },
    });

    const conn = new LiveDeviceConnection('dev-1');
    await conn.connect();

    expect(conn.gateway).toBe('gw.openshock.app');
    expect(conn.country).toBe('DE');
  });

  it('constructs WebSocket with correct URL', async () => {
    const { LiveDeviceConnection } = await import('./live-control-state.svelte');
    const { hubManagementV1Api } = await import('$lib/api');
    vi.mocked(hubManagementV1Api.devicesGetLiveControlGatewayInfo).mockResolvedValue({
      data: { gateway: 'gw.example.com', country: 'US' },
    });

    const conn = new LiveDeviceConnection('dev-42');
    await conn.connect();

    expect(MockWebSocket.instances[0].url).toBe('wss://gw.example.com/1/ws/live/dev-42');
  });

  it('goes Disconnected and shows toast when API returns no data', async () => {
    const { LiveDeviceConnection, LiveConnectionState } = await import('./live-control-state.svelte');
    const { hubManagementV1Api } = await import('$lib/api');
    const { toast } = await import('svelte-sonner');
    vi.mocked(hubManagementV1Api.devicesGetLiveControlGatewayInfo).mockResolvedValue({
      data: null,
    });

    const conn = new LiveDeviceConnection('dev-1');
    await conn.connect();

    expect(conn.state).toBe(LiveConnectionState.Disconnected);
    expect(vi.mocked(toast.error)).toHaveBeenCalled();
  });

  it('goes Disconnected and shows toast when API throws', async () => {
    const { LiveDeviceConnection, LiveConnectionState } = await import('./live-control-state.svelte');
    const { hubManagementV1Api } = await import('$lib/api');
    const { toast } = await import('svelte-sonner');
    vi.mocked(hubManagementV1Api.devicesGetLiveControlGatewayInfo).mockRejectedValue(
      new Error('Network'),
    );

    const conn = new LiveDeviceConnection('dev-1');
    await conn.connect();

    expect(conn.state).toBe(LiveConnectionState.Disconnected);
    expect(vi.mocked(toast.error)).toHaveBeenCalled();
  });

  it('goes Disconnected when WebSocket fires close event', async () => {
    const { LiveDeviceConnection, LiveConnectionState } = await import('./live-control-state.svelte');
    const { hubManagementV1Api } = await import('$lib/api');
    vi.mocked(hubManagementV1Api.devicesGetLiveControlGatewayInfo).mockResolvedValue({
      data: { gateway: 'gw.example.com', country: 'US' },
    });

    const conn = new LiveDeviceConnection('dev-1');
    await conn.connect();
    MockWebSocket.instances[0].triggerOpen();
    MockWebSocket.instances[0].triggerClose();

    expect(conn.state).toBe(LiveConnectionState.Disconnected);
  });

  it('resets shocker live state on disconnect via WebSocket close', async () => {
    const { LiveDeviceConnection, LiveConnectionState } = await import('./live-control-state.svelte');
    const { hubManagementV1Api } = await import('$lib/api');
    vi.mocked(hubManagementV1Api.devicesGetLiveControlGatewayInfo).mockResolvedValue({
      data: { gateway: 'gw.example.com', country: 'US' },
    });

    const conn = new LiveDeviceConnection('dev-1');
    conn.ensureShockerState('sh-1');
    conn.shockers.get('sh-1')!.isLive = true;
    conn.shockers.get('sh-1')!.intensity = 75;

    await conn.connect();
    MockWebSocket.instances[0].triggerOpen();
    MockWebSocket.instances[0].triggerClose();

    expect(conn.state).toBe(LiveConnectionState.Disconnected);
    expect(conn.shockers.get('sh-1')?.isLive).toBe(false);
    expect(conn.shockers.get('sh-1')?.intensity).toBe(0);
  });
});

describe('LiveDeviceConnection.disconnect', () => {
  it('sets state to Disconnected and resets latency', async () => {
    const { LiveDeviceConnection, LiveConnectionState } = await import('./live-control-state.svelte');
    const conn = new LiveDeviceConnection('dev-1');
    conn.disconnect();
    expect(conn.state).toBe(LiveConnectionState.Disconnected);
    expect(conn.latency).toBe(0);
  });
});

describe('LiveDeviceConnection WebSocket messages', () => {
  it('replies with Pong on Ping message', async () => {
    const { LiveDeviceConnection } = await import('./live-control-state.svelte');
    const { hubManagementV1Api } = await import('$lib/api');
    vi.mocked(hubManagementV1Api.devicesGetLiveControlGatewayInfo).mockResolvedValue({
      data: { gateway: 'gw.example.com', country: 'US' },
    });

    const conn = new LiveDeviceConnection('dev-1');
    await conn.connect();
    const ws = MockWebSocket.instances[0];
    ws.triggerOpen();

    ws.triggerMessage({ ResponseType: 'Ping', Data: { Timestamp: 42 } });

    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify({ RequestType: 'Pong', Data: { Timestamp: 42 } }),
    );
  });

  it('updates latency on LatencyAnnounce message', async () => {
    const { LiveDeviceConnection } = await import('./live-control-state.svelte');
    const { hubManagementV1Api } = await import('$lib/api');
    vi.mocked(hubManagementV1Api.devicesGetLiveControlGatewayInfo).mockResolvedValue({
      data: { gateway: 'gw.example.com', country: 'US' },
    });

    const conn = new LiveDeviceConnection('dev-1');
    await conn.connect();
    const ws = MockWebSocket.instances[0];
    ws.triggerOpen();

    ws.triggerMessage({ ResponseType: 'LatencyAnnounce', Data: { OwnLatency: 33 } });

    expect(conn.latency).toBe(33);
  });

  it('ignores malformed JSON messages without throwing', async () => {
    const { LiveDeviceConnection } = await import('./live-control-state.svelte');
    const { hubManagementV1Api } = await import('$lib/api');
    vi.mocked(hubManagementV1Api.devicesGetLiveControlGatewayInfo).mockResolvedValue({
      data: { gateway: 'gw.example.com', country: 'US' },
    });

    const conn = new LiveDeviceConnection('dev-1');
    await conn.connect();
    const ws = MockWebSocket.instances[0];
    ws.triggerOpen();

    expect(() => ws.triggerRawMessage('NOT JSON')).not.toThrow();
  });
});

describe('LiveDeviceConnection.sendFrame', () => {
  it('sends a Frame message when connected', async () => {
    const { LiveDeviceConnection } = await import('./live-control-state.svelte');
    const { hubManagementV1Api } = await import('$lib/api');
    const { ControlType } = await import('$lib/signalr/models/ControlType');
    vi.mocked(hubManagementV1Api.devicesGetLiveControlGatewayInfo).mockResolvedValue({
      data: { gateway: 'gw.example.com', country: 'US' },
    });

    const conn = new LiveDeviceConnection('dev-1');
    await conn.connect();
    const ws = MockWebSocket.instances[0];
    ws.triggerOpen();

    conn.sendFrame('sh-1', 50, ControlType.Vibrate);

    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify({
        RequestType: 'Frame',
        Data: { Shocker: 'sh-1', Intensity: 50, Type: 'vibrate' },
      }),
    );
  });

  it('is a no-op when not connected', async () => {
    const { LiveDeviceConnection } = await import('./live-control-state.svelte');
    const { ControlType } = await import('$lib/signalr/models/ControlType');
    const conn = new LiveDeviceConnection('dev-1');
    expect(() => conn.sendFrame('sh-1', 50, ControlType.Vibrate)).not.toThrow();
    expect(MockWebSocket.instances).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Module-level helpers
// ---------------------------------------------------------------------------

describe('liveConnections / ensureLiveConnection / getLiveConnection', () => {
  it('liveConnections starts empty', async () => {
    const { liveConnections } = await import('./live-control-state.svelte');
    expect(liveConnections.size).toBe(0);
  });

  it('ensureLiveConnection creates a new connection', async () => {
    const { ensureLiveConnection, liveConnections } = await import('./live-control-state.svelte');
    ensureLiveConnection('dev-1');
    expect(liveConnections.has('dev-1')).toBe(true);
  });

  it('ensureLiveConnection is idempotent', async () => {
    const { ensureLiveConnection, liveConnections } = await import('./live-control-state.svelte');
    ensureLiveConnection('dev-1');
    const first = liveConnections.get('dev-1');
    ensureLiveConnection('dev-1');
    expect(liveConnections.get('dev-1')).toBe(first);
  });

  it('getLiveConnection returns undefined for unknown device', async () => {
    const { getLiveConnection } = await import('./live-control-state.svelte');
    expect(getLiveConnection('nonexistent')).toBeUndefined();
  });

  it('getLiveConnection returns the connection after ensureLiveConnection', async () => {
    const { ensureLiveConnection, getLiveConnection } = await import('./live-control-state.svelte');
    ensureLiveConnection('dev-2');
    expect(getLiveConnection('dev-2')).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// toggleShockerLiveControl
// ---------------------------------------------------------------------------

describe('toggleShockerLiveControl', () => {
  it('sets isLive=true and starts connect when toggling on', async () => {
    const { toggleShockerLiveControl, liveConnections } = await import('./live-control-state.svelte');
    const { hubManagementV1Api } = await import('$lib/api');
    vi.mocked(hubManagementV1Api.devicesGetLiveControlGatewayInfo).mockResolvedValue({
      data: { gateway: 'gw.example.com', country: 'US' },
    });

    await toggleShockerLiveControl('dev-1', 'sh-1');

    const conn = liveConnections.get('dev-1')!;
    expect(conn.shockers.get('sh-1')?.isLive).toBe(true);
  });

  it('sets isLive=false when toggling off (already live)', async () => {
    const { toggleShockerLiveControl, liveConnections } = await import('./live-control-state.svelte');
    const { hubManagementV1Api } = await import('$lib/api');
    vi.mocked(hubManagementV1Api.devicesGetLiveControlGatewayInfo).mockResolvedValue({
      data: { gateway: 'gw.example.com', country: 'US' },
    });

    // Toggle on
    await toggleShockerLiveControl('dev-1', 'sh-1');
    const conn = liveConnections.get('dev-1')!;

    // Toggle off
    await toggleShockerLiveControl('dev-1', 'sh-1');
    expect(conn.shockers.get('sh-1')?.isLive).toBe(false);
  });
});
