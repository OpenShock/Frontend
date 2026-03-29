import { hubManagementV1Api } from '$lib/api';
import { ControlType } from '$lib/signalr/models/ControlType';
import { SvelteMap } from 'svelte/reactivity';
import { toast } from 'svelte-sonner';

const TICK_INTERVAL_MS = 100;

export enum LiveConnectionState {
  Disconnected = 0,
  Connecting = 1,
  Connected = 2,
}

export class LiveShockerState {
  isDragging = $state(false);
  intensity = $state(0);
  type = $state<ControlType>(ControlType.Vibrate);
}

export class LiveDeviceConnection {
  deviceId: string;
  state = $state<LiveConnectionState>(LiveConnectionState.Disconnected);
  gateway = $state<string | null>(null);
  country = $state<string | null>(null);
  latency = $state(0);

  shockers = new SvelteMap<string, LiveShockerState>();

  private ws: WebSocket | null = null;
  private tickTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(deviceId: string) {
    this.deviceId = deviceId;
  }

  /**
   * Ensure a LiveShockerState exists. Call from $effect or event handler, not template.
   */
  ensureShockerState(shockerId: string): void {
    if (!this.shockers.has(shockerId)) {
      this.shockers.set(shockerId, new LiveShockerState());
    }
  }

  /**
   * Read-only getter, safe for templates. Returns undefined if not yet initialised.
   */
  getShockerState(shockerId: string): LiveShockerState | undefined {
    return this.shockers.get(shockerId);
  }

  async connect() {
    this.disconnect();
    this.state = LiveConnectionState.Connecting;

    try {
      const res = await hubManagementV1Api.devicesGetLiveControlGatewayInfo(this.deviceId);
      if (!res.data) {
        throw new Error('No LCG data returned');
      }

      this.gateway = res.data.gateway;
      this.country = res.data.country;

      const ws = new WebSocket(`wss://${this.gateway}/1/ws/live/${this.deviceId}`);
      this.ws = ws;

      ws.onopen = () => {
        this.state = LiveConnectionState.Connected;
        this.startTickLoop();
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          switch (msg.ResponseType) {
            case 'Ping':
              ws.send(
                JSON.stringify({
                  RequestType: 'Pong',
                  Data: { Timestamp: msg.Data.Timestamp },
                }),
              );
              break;
            case 'LatencyAnnounce':
              this.latency = msg.Data.OwnLatency;
              break;
          }
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        this.handleDisconnect();
      };

      ws.onerror = () => {
        this.handleDisconnect();
      };
    } catch (error) {
      console.error('Failed to connect to LCG:', error);
      toast.error('Failed to connect to live control gateway');
      this.handleDisconnect();
    }
  }

  disconnect() {
    this.stopTickLoop();
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.close();
      this.ws = null;
    }
    this.state = LiveConnectionState.Disconnected;
    this.latency = 0;
  }

  private handleDisconnect() {
    this.stopTickLoop();
    this.ws = null;
    this.state = LiveConnectionState.Disconnected;
    this.latency = 0;
  }

  private startTickLoop() {
    this.stopTickLoop();
    const tick = () => {
      if (this.state !== LiveConnectionState.Connected || !this.ws) return;

      for (const [shockerId, shocker] of this.shockers) {
        if (!shocker.isDragging) continue;

        this.ws.send(
          JSON.stringify({
            RequestType: 'Frame',
            Data: {
              Shocker: shockerId,
              Intensity: Math.round(shocker.intensity),
              Type: ControlType[shocker.type].toLowerCase(),
            },
          }),
        );
      }

      this.tickTimer = setTimeout(tick, TICK_INTERVAL_MS);
    };
    tick();
  }

  private stopTickLoop() {
    if (this.tickTimer !== null) {
      clearTimeout(this.tickTimer);
      this.tickTimer = null;
    }
  }
}

/** Map of deviceId → LiveDeviceConnection */
export const liveConnections = new SvelteMap<string, LiveDeviceConnection>();

/**
 * Ensure a LiveDeviceConnection exists for the given device.
 * Call this from an $effect or event handler — NOT from a template expression or $derived.
 */
export function ensureLiveConnection(deviceId: string): void {
  if (!liveConnections.has(deviceId)) {
    liveConnections.set(deviceId, new LiveDeviceConnection(deviceId));
  }
}

/**
 * Get an existing LiveDeviceConnection. Returns undefined if not yet initialised.
 * Safe to call from template expressions since it never mutates.
 */
export function getLiveConnection(deviceId: string): LiveDeviceConnection | undefined {
  return liveConnections.get(deviceId);
}

export async function toggleLiveControl(deviceId: string) {
  ensureLiveConnection(deviceId);
  const conn = liveConnections.get(deviceId)!;
  if (conn.state !== LiveConnectionState.Disconnected) {
    conn.disconnect();
  } else {
    await conn.connect();
  }
}
