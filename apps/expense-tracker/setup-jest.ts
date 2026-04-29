import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

if (typeof crypto.randomUUID !== 'function') {
  Object.defineProperty(crypto, 'randomUUID', {
    value: (): string => `${Date.now().toString(36)}-${Math.random().toString(36).substring(2)}`,
    writable: true,
    configurable: true,
  });
}
