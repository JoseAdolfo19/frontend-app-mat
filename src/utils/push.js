import { pushApi } from '../api/push';

export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Obtiene la suscripción activa actual (o null).
 */
export async function getSubscription() {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

/**
 * Suscribe al usuario con la clave pública VAPID del backend.
 */
export async function subscribeToPush() {
  if (!isPushSupported()) {
    throw new Error('push.notSupported');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('push.denied');
  }

  const config = await pushApi.getConfig();
  const { enabled, public_key: publicKey } = config.data || {};

  if (!enabled || !publicKey) {
    throw new Error('push.notConfigured');
  }

  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  let subscription = existing;

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const json = subscription.toJSON();
  await pushApi.subscribe({
    endpoint: json.endpoint,
    p256dh: json.keys?.p256dh,
    auth: json.keys?.auth,
    user_agent: navigator.userAgent,
  });

  return subscription;
}

/**
 * Da de baja la suscripción del navegador y del backend.
 */
export async function unsubscribeFromPush() {
  if (!isPushSupported()) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    const endpoint = subscription.endpoint;
    try {
      await pushApi.unsubscribe(endpoint);
    } catch (e) {
      // ignorar fallo de backend
    }
    await subscription.unsubscribe();
  }
}