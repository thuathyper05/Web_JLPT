import { onlineService } from './api';

const MACHINE_STORAGE_KEY = 'hyper_presence_machine_id';
const CLOUD_PRESENCE_URL = 'https://extendsclass.com/api/json-storage/bin/ddaebef';
const MACHINE_LEASE_MS = 35000; // 35 seconds active lease
const PING_INTERVAL_MS = 10000; // 10 seconds heartbeat

export class OnlineTracker {
  constructor(onCountChange) {
    this.onCountChange = onCountChange;
    this.machineId = this.getOrCreateMachineId();
    this.broadcastChannel = null;
    this.heartbeatTimer = null;
    this.isDestroyed = false;
    this.backendCount = 1;
    this.cloudCount = 1;

    this.init();
  }

  getOrCreateMachineId() {
    try {
      let id = localStorage.getItem(MACHINE_STORAGE_KEY);
      if (!id) {
        id = 'm_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
        localStorage.setItem(MACHINE_STORAGE_KEY, id);
      }
      return id;
    } catch {
      return 'm_' + Date.now();
    }
  }

  init() {
    // 1. Cross-tab synchronization within the same physical machine
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.broadcastChannel = new BroadcastChannel('hyper_presence_machine_sync');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'MACHINE_COUNT' && typeof event.data.count === 'number') {
            this.notify(event.data.count);
          }
        };
      }
    } catch {}

    // 2. Perform immediate presence ping across global cloud & backend
    this.syncGlobalPresence();
    this.pingBackend();

    // 3. Heartbeat loop (10-12s interval with slight jitter to prevent collisions)
    const jitter = Math.floor(Math.random() * 2000);
    this.heartbeatTimer = setInterval(() => {
      this.syncGlobalPresence();
      this.pingBackend();
    }, PING_INTERVAL_MS + jitter);

    // 4. Trigger sync when tab becomes visible or receives focus
    this.handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        this.syncGlobalPresence();
        this.pingBackend();
      }
    };
    document.addEventListener('visibilitychange', this.handleVisibility);
    window.addEventListener('focus', this.handleVisibility);

    // 5. Explicit departure notification on tab/browser close
    this.handleUnload = () => {
      this.cleanup();
    };
    window.addEventListener('beforeunload', this.handleUnload);
    window.addEventListener('pagehide', this.handleUnload);
  }

  async syncGlobalPresence(isLeaving = false) {
    if (this.isDestroyed && !isLeaving) return;

    try {
      const getRes = await fetch(CLOUD_PRESENCE_URL, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!getRes.ok) return;

      const data = await getRes.json();
      let clients = data?.activeClients || {};
      const now = Date.now();

      // Clean up machines that stopped pinging longer than 35s
      for (const [id, lastSeen] of Object.entries(clients)) {
        if (now - Number(lastSeen) > MACHINE_LEASE_MS) {
          delete clients[id];
        }
      }

      if (isLeaving) {
        delete clients[this.machineId];
      } else {
        clients[this.machineId] = now;
      }

      // Save updated active machines
      const payload = JSON.stringify({ activeClients: clients });

      if (isLeaving) {
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          navigator.sendBeacon(CLOUD_PRESENCE_URL, payload);
        } else {
          fetch(CLOUD_PRESENCE_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true
          }).catch(() => {});
        }
        return;
      }

      await fetch(CLOUD_PRESENCE_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });

      const uniqueMachinesCount = Math.max(1, Object.keys(clients).length);
      this.cloudCount = uniqueMachinesCount;
      this.recalculateTotal();
    } catch {
      // Cloud sync failure fallback
    }
  }

  async pingBackend() {
    if (this.isDestroyed) return;
    try {
      const res = await onlineService.ping(this.machineId);
      if (res?.data && typeof res.data.onlineCount === 'number') {
        this.backendCount = Math.max(1, res.data.onlineCount);
        this.recalculateTotal();
      }
    } catch {
      // Backend not yet redeployed or 404, gracefully handled
    }
  }

  recalculateTotal() {
    if (this.isDestroyed) return;
    const finalCount = Math.max(this.cloudCount, this.backendCount, 1);
    this.notify(finalCount);

    try {
      this.broadcastChannel?.postMessage({
        type: 'MACHINE_COUNT',
        count: finalCount
      });
    } catch {}
  }

  notify(count) {
    if (typeof this.onCountChange === 'function') {
      this.onCountChange(count);
    }
  }

  cleanup() {
    this.isDestroyed = true;
    this.syncGlobalPresence(true);
    try {
      onlineService.leave(this.machineId);
    } catch {}
    try {
      this.broadcastChannel?.close();
    } catch {}
    clearInterval(this.heartbeatTimer);
    document.removeEventListener('visibilitychange', this.handleVisibility);
    window.removeEventListener('focus', this.handleVisibility);
    window.removeEventListener('beforeunload', this.handleUnload);
    window.removeEventListener('pagehide', this.handleUnload);
  }
}
