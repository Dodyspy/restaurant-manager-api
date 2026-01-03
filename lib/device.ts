export function generateDeviceId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const stored = localStorage.getItem('casanova_device_id');
  if (stored) {
    return stored;
  }

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    screen.width,
    screen.height,
    screen.colorDepth,
  ].join('|');

  const hash = simpleHash(fingerprint);
  const deviceId = `dev_${hash}_${Date.now()}`;
  
  localStorage.setItem('casanova_device_id', deviceId);
  return deviceId;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function getDeviceId(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  return localStorage.getItem('casanova_device_id') || generateDeviceId();
}

export function hasPlayedRecently(): { played: boolean; lastPlayMs?: number } {
  if (typeof window === 'undefined') {
    return { played: false };
  }

  const lastPlayStr = localStorage.getItem('casanova_last_play');
  if (!lastPlayStr) {
    return { played: false };
  }

  const lastPlayMs = parseInt(lastPlayStr, 10);
  const now = Date.now();
  const hoursSince = (now - lastPlayMs) / (1000 * 60 * 60);

  if (hoursSince < 24) {
    return { played: true, lastPlayMs };
  }

  return { played: false };
}

export function markAsPlayed(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem('casanova_last_play', Date.now().toString());
}
