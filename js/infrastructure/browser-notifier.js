// @ts-check
// Notifier backed by the browser Notification API. Works only while the page is open.

/** @returns {import('../application/ports.js').Notifier} */
export function createBrowserNotifier() {
  const supported = typeof window !== 'undefined' && 'Notification' in window;
  return {
    isEnabled: () => supported && Notification.permission === 'granted',
    canAsk: () => supported && Notification.permission === 'default',
    async requestPermission() {
      if (!supported) return false;
      if (Notification.permission === 'default') {
        try { await Notification.requestPermission(); } catch { /* ignore */ }
      }
      return Notification.permission === 'granted';
    },
    show(title, body, tag) {
      if (!supported || Notification.permission !== 'granted') return;
      try { new Notification(title, { body, tag, icon: 'favicon.svg' }); } catch { /* ignore */ }
    },
  };
}
