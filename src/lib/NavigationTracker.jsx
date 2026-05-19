import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Notifica il cambiamento URL alla finestra padre (usato quando l'app è in iframe).
// Il logging Base44 (appLogs) è stato rimosso.
export default function NavigationTracker() {
  const location = useLocation();

  useEffect(() => {
    window.parent?.postMessage({ type: 'app_changed_url', url: window.location.href }, '*');
  }, [location]);

  return null;
}
