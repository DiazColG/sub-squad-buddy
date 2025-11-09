import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/hooks/useAuth'
import { AnalyticsProvider } from '@/lib/analytics'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AnalyticsProvider>
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </AnalyticsProvider>
  </StrictMode>
);
