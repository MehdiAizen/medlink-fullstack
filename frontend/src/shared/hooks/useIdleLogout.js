import { useEffect, useRef } from 'react';
import keycloak from '../keycloak.js';

const IDLE_MS = 15 * 60 * 1000;
const EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

export function useIdleLogout(enabled, onIdle) {
  const timer = useRef(null);
  const lastRefresh = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const reset = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(onIdle, IDLE_MS);

      // Utilisateur actif : on garde la session Keycloak vivante (max 1 fois/min)
      const now = Date.now();
      if (now - lastRefresh.current > 60_000) {
        lastRefresh.current = now;
        keycloak.updateToken(60).catch(onIdle); // refresh refusé = session expirée
      }
    };

    EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      clearTimeout(timer.current);
      EVENTS.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [enabled, onIdle]);
}