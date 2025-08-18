// Lightweight dev logging helper that only emits on local/dev
export function sendDevLog(payload: any): void {
  try {
    const host = (typeof window !== 'undefined' && window.location && window.location.hostname) || '';
    const isLocalHost = /^(localhost|127\.|10\.|192\.168\.|\[::1\]|.+\.local)$/i.test(host);
    const isDev = typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.DEV;
    if (!(isLocalHost || isDev)) return; // skip on remote/prod (e.g., lovable domain)

    const body = JSON.stringify(payload);
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([body + "\n"], { type: 'application/json' });
      navigator.sendBeacon('/__log', blob);
      return;
    }
    fetch('/__log', { method: 'POST', body, keepalive: true }).catch(() => {});
  } catch {}
}

