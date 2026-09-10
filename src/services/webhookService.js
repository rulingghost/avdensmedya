// AVDENS WORK - Webhook Dağıtım Servisi
// Zapier, Make.com, n8n veya özel sunucu webhook entegrasyonu

const WEBHOOK_STORAGE_KEY = 'AVDENS_WEBHOOK_CONFIG';

export function getWebhookConfig() {
  try {
    const saved = localStorage.getItem(WEBHOOK_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {
    url: '',
    enabled: false,
    events: {
      postApproved: true,
      postRevision: true,
      taskCompleted: true,
      onboardingCompleted: true
    }
  };
}

export function saveWebhookConfig(config) {
  try {
    localStorage.setItem(WEBHOOK_STORAGE_KEY, JSON.stringify(config));
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function triggerWebhook(eventName, payload) {
  const config = getWebhookConfig();
  if (!config.enabled || !config.url) {
    return { skipped: true, reason: 'Webhook aktif değil veya URL tanımlanmamış' };
  }

  // Olay filtresi
  if (config.events && config.events[eventName] === false) {
    return { skipped: true, reason: `Etkinlik (${eventName}) devre dışı bırakılmış` };
  }

  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Avdens-Event': eventName,
        'X-Avdens-Timestamp': new Date().toISOString()
      },
      body: JSON.stringify({
        event: eventName,
        timestamp: new Date().toISOString(),
        source: 'AVDENS_WORK',
        data: payload
      })
    });

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText
    };
  } catch (err) {
    console.warn(`Webhook (${eventName}) tetikleme hatası:`, err);
    return { success: false, error: err.message };
  }
}
