import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker, handleInstallPrompt, setupOfflineDetection } from './utils/pwaUtils'

// Initialize PWA features only in production to avoid dev caching/blank screens
if (import.meta.env.PROD) {
  registerServiceWorker();
  handleInstallPrompt();
  setupOfflineDetection();
} else {
  // In development, proactively unregister any existing service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    }).catch(() => {});
  }
}

createRoot(document.getElementById("root")!).render(<App />);
