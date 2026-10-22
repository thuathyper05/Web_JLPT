import { onlineService } from './api';

const MACHINE_STORAGE_KEY = 'hyper_presence_machine_id';
const CLOUD_PRESENCE_URL = 'https://extendsclass.com/api/json-storage/bin/ddaebef';
const LEASE_MS = 35000; // 35 seconds active lease
const PING_INTERVAL_MS = 10000; // 10 seconds heartbeat

export class OnlineTracker {
  constructor(initialUser, onCountChange) {
    this.currentUser = initialUser || null;
    this.onCountChange = onCountChange;
    this.machineId = this.getOrCreateMachineId();
    this.currentConnectionKey = this.resolveConnectionKey();
    this.broadcastChannel = null;
    this.heartbeatTimer = null;
    this.isDestroyed = false;
    this.cloudCount = 1;
    this.backendCount = 1;

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

  resolveConnectionKey(targetUser = this.currentUser) {
    if (targetUser && targetUser.id) {
      return `user_${targetUser.id}__${this.machineId}`;
    }
    return `guest__${this.machineId}`;
  }

  updateUser(newUser) {
    const oldKey = this.currentConnectionKey;
    this.currentUser = newUser || null;
    const newKey = this.resolveConnectionKey(this.currentUser);

    if (oldKey !== newKey) {
      // Immediately remove previous identity so count does not linger
      this.syncGlobalPresence(true, oldKey);
      this.currentConnectionKey = newKey;
      this.syncGlobalPresence();
      this.pingBackend();
    }
  }

  init() {
    // 1. Cross-tab synchronization within the same machine
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.broadcastChannel = new BroadcastChannel('hyper_presence_machine_sync');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'ONLINE_COUNT' && typeof event.data.count === 'number') {
            this.notify(event.data.count);
          }
        };
      }
    } catch {}

    // 2. Perform initial synchronization
    this.syncGlobalPresence();
    this.pingBackend();

    // 3. Heartbeat loop (10-12 seconds with slight jitter)
    const jitter = Math.floor(Math.random() * 2000);
    this.heartbeatTimer = setInterval(() => {
      this.syncGlobalPresence();
      this.pingBackend();
    }, PING_INTERVAL_MS + jitter);

    // 4. Tab visibility and focus listener
    this.handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        this.syncGlobalPresence();
        this.pingBackend();
      }
    };
    document.addEventListener('visibilitychange', this.handleVisibility);
    window.addEventListener('focus', this.handleVisibility);

    // 5. Explicit departure notification on tab / browser close
    this.handleUnload = () => {
      this.cleanup();
    };
    window.addEventListener('beforeunload', this.handleUnload);
    window.addEventListener('pagehide', this.handleUnload);
  }

  async syncGlobalPresence(isLeaving = false, specificKey = this.currentConnectionKey) {
    if (this.isDestroyed && !isLeaving) return;

    try {
      const getRes = await fetch(CLOUD_PRESENCE_URL, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!getRes.ok) return;

      const data = await getRes.json();
      let registry = data?.activeRegistry || {};
      const now = Date.now();

      // Clean up entries older than 35s
      for (const [key, record] of Object.entries(registry)) {
        if (!record || typeof record !== 'object' || now - Number(record.time) > LEASE_MS) {
          delete registry[key];
        }
      }

      if (isLeaving) {
        delete registry[specificKey];
      } else {
        registry[this.currentConnectionKey] = {
          userId: this.currentUser?.id ? String(this.currentUser.id) : null,
          devId: this.machineId,
          time: now
        };
      }

      const payload = JSON.stringify({ activeRegistry: registry });

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

      // Calculate distinct users + distinct guest machines
      const validRecords = Object.values(registry).filter(
        (r) => r && typeof r === 'object' && now - Number(r.time) <= LEASE_MS
      );
      const uniqueUsers = new Set(
        validRecords.filter((r) => r.userId).map((r) => String(r.userId))
      );
      const uniqueGuests = new Set(
        validRecords.filter((r) => !r.userId).map((r) => String(r.devId))
      );

      this.cloudCount = Math.max(1, uniqueUsers.size + uniqueGuests.size);
      this.recalculateTotal();
    } catch {
      // Graceful fallback
    }
  }

  async pingBackend() {
    if (this.isDestroyed) return;
    try {
      const userId = this.currentUser?.id || null;
      const res = await onlineService.ping(this.machineId, userId);
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
        type: 'ONLINE_COUNT',
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
      onlineService.leave(this.machineId, this.currentUser?.id || null);
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
