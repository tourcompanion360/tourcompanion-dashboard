// PWA Service Worker Registration
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, show update notification
                  if (confirm('Nuova versione disponibile! Vuoi ricaricare per aggiornare?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });

      // Listen for controlling service worker change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    });
  }
};

// Handle install prompt
export const handleInstallPrompt = () => {
  let deferredPrompt: any;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button or notification
    showInstallButton(deferredPrompt);
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
    hideInstallButton();
  });

  return deferredPrompt;
};

// Show install button
const showInstallButton = (deferredPrompt: any) => {
  const installButton = document.createElement('button');
  installButton.textContent = '📱 Installa App';
  installButton.className = 'fixed bottom-20 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
  installButton.style.cssText = `
    background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-dark)));
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 12px;
    font-weight: 600;
    box-shadow: 0 8px 25px hsl(var(--primary) / 0.4);
    cursor: pointer;
    transition: all 0.3s ease;
  `;
  
  installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      deferredPrompt = null;
      installButton.remove();
    }
  });

  installButton.addEventListener('mouseenter', () => {
    installButton.style.transform = 'translateY(-2px) scale(1.05)';
  });

  installButton.addEventListener('mouseleave', () => {
    installButton.style.transform = 'translateY(0) scale(1)';
  });

  document.body.appendChild(installButton);

  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (installButton.parentNode) {
      installButton.remove();
    }
  }, 10000);
};

// Hide install button
const hideInstallButton = () => {
  const installButton = document.querySelector('[data-install-button]');
  if (installButton) {
    installButton.remove();
  }
};

// Check if running as PWA
export const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone ||
         document.referrer.includes('android-app://');
};

// Handle shortcut parameters
export const handleShortcuts = (onPageChange: (page: string) => void) => {
  const urlParams = new URLSearchParams(window.location.search);
  const shortcut = urlParams.get('shortcut');
  
  switch (shortcut) {
    case 'tours':
      onPageChange('tour-virtuali');
      break;
    case 'appointments':
      onPageChange('appuntamenti');
      break;
    case 'stats':
      onPageChange('statistiche');
      break;
    default:
      break;
  }
};

// Offline detection
export const setupOfflineDetection = () => {
  const updateOnlineStatus = () => {
    const status = navigator.onLine ? 'online' : 'offline';
    document.body.setAttribute('data-connection', status);
    
    if (!navigator.onLine) {
      showOfflineMessage();
    } else {
      hideOfflineMessage();
    }
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
};

const showOfflineMessage = () => {
  const existingMessage = document.querySelector('[data-offline-message]');
  if (existingMessage) return;

  const offlineMessage = document.createElement('div');
  offlineMessage.setAttribute('data-offline-message', 'true');
  offlineMessage.textContent = '📡 Modalità offline - Alcune funzioni potrebbero non essere disponibili';
  offlineMessage.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: hsl(var(--warning));
    color: hsl(var(--warning-foreground));
    text-align: center;
    padding: 8px;
    font-size: 14px;
    z-index: 9999;
    animation: slideInDown 0.3s ease;
  `;

  document.body.appendChild(offlineMessage);
};

const hideOfflineMessage = () => {
  const offlineMessage = document.querySelector('[data-offline-message]');
  if (offlineMessage) {
    offlineMessage.remove();
  }
};