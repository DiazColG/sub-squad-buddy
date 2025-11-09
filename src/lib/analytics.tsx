import posthog from 'posthog-js';
import { createContext, useContext, useEffect, ReactNode } from 'react';

interface AnalyticsContextType {
  track: (event: string, properties?: Record<string, any>) => void;
  identify: (userId: string, properties?: Record<string, any>) => void;
  reset: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  useEffect(() => {
    // Initialize PostHog only in production or if explicitly enabled
    const isProduction = import.meta.env.PROD;
    const analyticsEnabled = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';

    if (isProduction || analyticsEnabled) {
      const apiKey = import.meta.env.VITE_POSTHOG_KEY;
      const apiHost = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

      if (apiKey) {
        // Detect device type and screen size
        const getDeviceType = () => {
          const width = window.innerWidth;
          if (width < 768) return 'mobile';
          if (width < 1024) return 'tablet';
          return 'desktop';
        };

        posthog.init(apiKey, {
          api_host: apiHost,
          autocapture: false, // We'll manually track important events
          capture_pageview: true, // Auto-track page views
          capture_pageleave: true, // Track when users leave
          session_recording: {
            enabled: true, // Enable session replay
            recordCanvas: false, // Don't record canvas for performance
            recordCrossOriginIframes: false,
          },
          persistence: 'localStorage',
          disable_surveys: true, // Can enable later
          loaded: (posthog) => {
            // Set device properties on init
            posthog.register({
              device_type: getDeviceType(),
              screen_width: window.innerWidth,
              screen_height: window.innerHeight,
              viewport_ratio: `${window.innerWidth}x${window.innerHeight}`,
            });

            if (import.meta.env.DEV) {
              posthog.debug(); // Debug in development
            }
          }
        });

        // Track device type changes on resize (debounced)
        let resizeTimeout: NodeJS.Timeout;
        const handleResize = () => {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            if (posthog && posthog.__loaded) {
              posthog.register({
                device_type: getDeviceType(),
                screen_width: window.innerWidth,
                screen_height: window.innerHeight,
                viewport_ratio: `${window.innerWidth}x${window.innerHeight}`,
              });
            }
          }, 500);
        };
        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          clearTimeout(resizeTimeout);
        };
      }
    }

    // Cleanup on unmount
    return () => {
      if (posthog && posthog.persistence) {
        posthog.persistence.clear();
      }
    };
  }, []);

  const track = (event: string, properties?: Record<string, any>) => {
    if (posthog && posthog.__loaded) {
      posthog.capture(event, properties);
    }
  };

  const identify = (userId: string, properties?: Record<string, any>) => {
    if (posthog && posthog.__loaded) {
      posthog.identify(userId, properties);
    }
  };

  const reset = () => {
    if (posthog && posthog.__loaded) {
      posthog.reset();
    }
  };

  return (
    <AnalyticsContext.Provider value={{ track, identify, reset }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
