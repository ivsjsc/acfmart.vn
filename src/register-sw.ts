// Service Worker Registration Script
// This script registers the service worker to fix the registration issue

export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      // Register the service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      
      // Listen for updates to the service worker
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // At this point, the updated precached content has been fetched,
                // but the previous service worker will still serve the older
                // content until all client tabs are closed.
                console.log('New content is available and will be used when all tabs for this page are closed.');
                
                // Execute callback
                if (registration.waiting) {
                  registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
              } else {
                // At this point, everything has been precached.
                // It's the perfect time to display a "Content is cached for offline use." message.
                console.log('Content is cached for offline use.');
              }
            }
          };
        }
      };
    } catch (error) {
      console.error('ServiceWorker registration failed: ', error);
    }
  } else {
    console.log('Service workers are not supported in this browser.');
  }
};

// Unregister service worker if needed
export const unregister = (): void => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
};