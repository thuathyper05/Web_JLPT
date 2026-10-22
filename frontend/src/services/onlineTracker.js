import { onlineService } from './api';

const STORAGE_KEY = 'hyper_active_tabs_registry';
const DEVICE_KEY = 'hyper_presence_device_id';
const CLOUD_TOPIC = 'hyper_jlpt_live_presence_2026';
const TAB_TIMEOUT_MS = 25000;
const CLOUD_TIMEOUT_MS = 30000;

export class OnlineTracker {
  constructor(onCountChange) {
    this.onCountChange = onCountChange;
    this.tabId = 'tab_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    this.deviceId = this.getOrCreateDeviceId();
    this.cloudDevices = new Map();
    this.backendCount = 1;
    this.eventSource = null;
    this.broadcastChannel = null;
    this.heartbeatTimer = null;
    this.isDestroyed = false;

    this.init();
  }

  getOrCreateDeviceId() {
    try {
      let id = localStorage.getItem(DEVICE_KEY);
      if (!id) {
        id = 'dev_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
        localStorage.setItem(DEVICE_KEY, id);
      }
      return id;
    } catch {
      return 'dev_' + Date.now();
    }
  }

  init() {
    // 1. Setup BroadcastChannel for 0ms cross-tab updates
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.broadcastChannel = new BroadcastChannel('hyper_presence_sync_channel');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'TAB_CHANGE') {
            this.recalculateTotal();
          }
        };
      }
    } catch {}

    // 2. Storage event listener (syncs across tabs even without BroadcastChannel)
    this.handleStorageEvent = (e) => {
      if (e.key === STORAGE_KEY) {
        this.recalculateTotal();
      }
    };
    window.addEventListener('storage', this.handleStorageEvent);

    // 3. Register self in local tab registry
    this.touchLocalTab();

    // 4. Setup Cloud SSE Presence Relay (syncs across devices without backend dependency)
    this.setupCloudPresence();

    // 5. Setup Backend Ping (syncs with local or cloud Express server)
    this.pingBackend();

    // 6. Regular heartbeats every 4 seconds
    this.heartbeatTimer = setInterval(() => {
      this.touchLocalTab();
      this.sendCloudPing();
      this.pingBackend();
      this.recalculateTotal();
    }, 4000);

    // 7. Event listeners for tab focus and visibility
    this.handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        this.touchLocalTab();
        this.sendCloudPing();
        this.pingBackend();
        this.recalculateTotal();
      }
    };
    document.addEventListener('visibilitychange', this.handleVisibility);
    window.addEventListener('focus', this.handleVisibility);

    // 8. Tab unload and departure
    this.handleUnload = () => {
      this.cleanup();
    };
    window.addEventListener('beforeunload', this.handleUnload);
    window.addEventListener('pagehide', this.handleUnload);

    // Initial calculation
    this.recalculateTotal();
  }

  touchLocalTab() {
    try {
      const now = Date.now();
      const raw = localStorage.getItem(STORAGE_KEY);
      let registry = raw ? JSON.parse(raw) : {};
      if (typeof registry !== 'object' || registry === null) registry = {};

      // Purge expired tabs
      for (const [id, time] of Object.entries(registry)) {
        if (now - Number(time) > TAB_TIMEOUT_MS) {
          delete registry[id];
        }
      }

      // Refresh current tab
      registry[this.tabId] = now;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(registry));
      this.broadcastChannel?.postMessage({ type: 'TAB_CHANGE' });
    } catch {}
  }

  removeLocalTab() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        let registry = JSON.parse(raw);
        if (typeof registry === 'object' && registry !== null) {
          delete registry[this.tabId];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(registry));
        }
      }
      this.broadcastChannel?.postMessage({ type: 'TAB_CHANGE' });
    } catch {}
  }

  getLocalTabCount() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return 1;
      const registry = JSON.parse(raw);
      if (typeof registry !== 'object' || registry === null) return 1;
      const now = Date.now();
      let count = 0;
      for (const [, time] of Object.entries(registry)) {
        if (now - Number(time) <= TAB_TIMEOUT_MS) {
          count++;
        }
      }
      return Math.max(1, count);
    } catch {
      return 1;
    }
  }

  setupCloudPresence() {
    try {
      if (typeof EventSource !== 'undefined') {
        const sseUrl = `https://ntfy.sh/${CLOUD_TOPIC}/sse`;
        this.eventSource = new EventSource(sseUrl);

        this.eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.message) {
              const payload = JSON.parse(data.message);
              if (payload.deviceId) {
                if (payload.action === 'leave') {
                  this.cloudDevices.delete(payload.deviceId);
                } else {
                  this.cloudDevices.set(payload.deviceId, Date.now());
                }
                this.recalculateTotal();
              }
            }
          } catch {}
        };

        this.eventSource.onerror = () => {
          // SSE connection silent retry
        };
      }
    } catch {}

    this.sendCloudPing();
  }

  sendCloudPing() {
    try {
      fetch(`https://ntfy.sh/${CLOUD_TOPIC}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: this.deviceId,
          action: 'ping',
          timestamp: Date.now()
        })
      }).catch(() => {});
    } catch {}
  }

  sendCloudLeave() {
    try {
      const payload = JSON.stringify({
        deviceId: this.deviceId,
        action: 'leave',
        timestamp: Date.now()
      });
      const url = `https://ntfy.sh/${CLOUD_TOPIC}`;
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon(url, payload);
      } else {
        fetch(url, { method: 'POST', body: payload, keepalive: true }).catch(() => {});
      }
    } catch {}
  }

  async pingBackend() {
    try {
      const res = await onlineService.ping(this.tabId);
      if (res?.data && typeof res.data.onlineCount === 'number') {
        this.backendCount = Math.max(1, res.data.onlineCount);
        this.recalculateTotal();
      }
    } catch {
      // Backend not reached or 404, fallback to local/cloud
    }
  }

  recalculateTotal() {
    if (this.isDestroyed) return;

    // 1. Local tabs in this browser
    const localTabs = this.getLocalTabCount();

    // 2. Cloud devices in memory
    const now = Date.now();
    for (const [devId, time] of this.cloudDevices.entries()) {
      if (now - time > CLOUD_TIMEOUT_MS) {
        this.cloudDevices.delete(devId);
      }
    }
    const cloudDevicesCount = Math.max(1, this.cloudDevices.size);

    // 3. Combined total
    const combined = Math.max(localTabs, cloudDevicesCount, this.backendCount, 1);

    if (typeof this.onCountChange === 'function') {
      this.onCountChange(combined);
    }
  }

  cleanup() {
    this.isDestroyed = true;
    this.removeLocalTab();
    this.sendCloudLeave();
    try {
      onlineService.leave(this.tabId);
    } catch {}
    try {
      this.eventSource?.close();
    } catch {}
    try {
      this.broadcastChannel?.close();
    } catch {}
    clearInterval(this.heartbeatTimer);
    window.removeEventListener('storage', this.handleStorageEvent);
    document.removeEventListener('visibilitychange', this.handleVisibility);
    window.removeEventListener('focus', this.handleVisibility);
    window.removeEventListener('beforeunload', this.handleUnload);
    window.removeEventListener('pagehide', this.handleUnload);
  }
}
