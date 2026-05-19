import { hubManagementV1Api } from '$lib/api';
import { ControlType } from '$lib/signalr/models/ControlType';
import { toast } from 'svelte-sonner';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';

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
  isLive = $state(false);
  isPaused = $state(false);
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
  private connectAttempt = 0;

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
   * Register the full set of shockers belonging to this hub. Updates pause state for
   * existing entries, creates missing ones, and removes entries no longer present.
   * Call from $effect or event handler.
   */
  registerHubShockers(shockers: { id: string; isPaused: boolean }[]): void {
    const ids = new SvelteSet(shockers.map((s) => s.id));
    for (const s of shockers) {
      let state = this.shockers.get(s.id);
      if (!state) {
        state = new LiveShockerState();
        this.shockers.set(s.id, state);
      }
      state.isPaused = s.isPaused;
    }
    let removedLive = false;
    for (const [id, state] of this.shockers) {
      if (ids.has(id)) continue;
      if (state.isLive) removedLive = true;
      state.isLive = false;
      state.isDragging = false;
      state.intensity = 0;
      this.shockers.delete(id);
    }
    if (removedLive) {
      const anyLive = [...this.shockers.values()].some((s) => s.isLive);
      if (!anyLive && this.state !== LiveConnectionState.Disconnected) {
        this.disconnect();
      }
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
    const attempt = ++this.connectAttempt;

    try {
      const res = await hubManagementV1Api.devicesGetLiveControlGatewayInfo(this.deviceId);
      if (attempt !== this.connectAttempt) return; // Stale attempt
      if (!res.data) {
        throw new Error('No LCG data returned');
      }

      this.gateway = res.data.gateway;
      this.country = res.data.country;

      const ws = new WebSocket(`wss://${this.gateway}/1/ws/live/${this.deviceId}`);
      this.ws = ws;

      ws.onopen = () => {
        if (attempt !== this.connectAttempt) return;
        this.state = LiveConnectionState.Connected;
        this.startTickLoop();
      };

      ws.onmessage = (event) => {
        if (attempt !== this.connectAttempt) return;
        try {
          const msg = JSON.parse(event.data);
          switch (msg.ResponseType) {
            case 'Ping':
              ws.send(
                JSON.stringify({
                  RequestType: 'Pong',
                  Data: { Timestamp: msg.Data.Timestamp },
                })
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
        if (attempt !== this.connectAttempt) return;
        this.handleDisconnect();
      };

      ws.onerror = () => {
        if (attempt !== this.connectAttempt) return;
        this.handleDisconnect();
      };
    } catch (error) {
      if (attempt !== this.connectAttempt) return;
      console.error('Failed to connect to LCG:', error);
      toast.error('Failed to connect to live control gateway');
      this.handleDisconnect();
    }
  }

  disconnect() {
    this.connectAttempt++;
    this.stopTickLoop();
    this.cleanupWebSocket();
    this.state = LiveConnectionState.Disconnected;
    this.latency = 0;
  }

  private cleanupWebSocket() {
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.close();
      this.ws = null;
    }
  }

  private handleDisconnect() {
    this.stopTickLoop();
    this.cleanupWebSocket();
    this.state = LiveConnectionState.Disconnected;
    this.latency = 0;
    for (const shocker of this.shockers.values()) {
      shocker.isLive = false;
      shocker.isDragging = false;
      shocker.intensity = 0;
    }
  }

  /**
   * Send a single control frame immediately (used for the final zero-intensity on release).
   */
  sendFrame(shockerId: string, intensity: number, type: ControlType) {
    if (this.state !== LiveConnectionState.Connected || !this.ws) return;
    this.ws.send(
      JSON.stringify({
        RequestType: 'Frame',
        Data: {
          Shocker: shockerId,
          Intensity: Math.round(intensity),
          Type: ControlType[type].toLowerCase(),
        },
      })
    );
  }

  private startTickLoop() {
    this.stopTickLoop();
    const tick = () => {
      if (this.state !== LiveConnectionState.Connected || !this.ws) return;

      for (const [shockerId, shocker] of this.shockers) {
        if (!shocker.isLive || !shocker.isDragging) continue;

        this.ws.send(
          JSON.stringify({
            RequestType: 'Frame',
            Data: {
              Shocker: shockerId,
              Intensity: Math.round(shocker.intensity),
              Type: ControlType[shocker.type].toLowerCase(),
            },
          })
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

/**
 * Register a hub's shockers with the live-control state store. Idempotent.
 */
export function registerHubShockers(
  deviceId: string,
  shockers: { id: string; isPaused: boolean }[]
): void {
  ensureLiveConnection(deviceId);
  liveConnections.get(deviceId)!.registerHubShockers(shockers);
}

/**
 * Start or stop live control for every registered shocker in the hub at once.
 * When starting, paused shockers are skipped. When stopping, every shocker is stopped.
 */
export async function setHubLiveControl(deviceId: string, isLive: boolean) {
  const conn = liveConnections.get(deviceId);
  if (!conn) return;

  if (isLive) {
    for (const state of conn.shockers.values()) {
      if (!state.isPaused) state.isLive = true;
    }
    const anyLive = [...conn.shockers.values()].some((x) => x.isLive);
    if (anyLive && conn.state === LiveConnectionState.Disconnected) {
      await conn.connect();
    }
  } else {
    for (const state of conn.shockers.values()) {
      state.isLive = false;
    }
    if (conn.state !== LiveConnectionState.Disconnected) {
      conn.disconnect();
    }
  }
}

export async function toggleShockerLiveControl(deviceId: string, shockerId: string) {
  ensureLiveConnection(deviceId);
  const conn = liveConnections.get(deviceId)!;
  conn.ensureShockerState(shockerId);
  const shockerState = conn.shockers.get(shockerId)!;

  if (shockerState.isLive) {
    shockerState.isLive = false;
    const anyLive = [...conn.shockers.values()].some((s) => s.isLive);
    if (!anyLive && conn.state !== LiveConnectionState.Disconnected) {
      conn.disconnect();
    }
  } else {
    shockerState.isLive = true;
    if (conn.state === LiveConnectionState.Disconnected) {
      await conn.connect();
    }
  }
}
