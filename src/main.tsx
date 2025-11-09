import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/hooks/useAuth'
import App from './App.tsx'
import './index.css'

// Lazy load analytics (PostHog ~100 KB) after initial render
setTimeout(() => {
  import('@/lib/analytics').then(({ AnalyticsProvider }) => {
    // Analytics already initialized if needed by individual components
  });
}, 2000);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster />
    </AuthProvider>
  </StrictMode>
);
