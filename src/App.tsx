import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useState, useCallback } from 'react';

// Critical pages: loaded immediately (auth flows)
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

// Core app: loaded immediately
import { Layout } from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Heavy pages: lazy loaded (reduce initial bundle by ~350 KB)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Analytics = lazy(() => import("./pages/Analytics")); // Contains Recharts (~200 KB)
const FIRE = lazy(() => import("./pages/FIRE")); // FIRE Calculator is heavy
const Settings = lazy(() => import("./pages/Settings")); // Settings tabs
const Feedback = lazy(() => import("./pages/Feedback"));
const UseCases = lazy(() => import("./pages/UseCases"));

// Medium pages: lazy loaded
const Installments = lazy(() => import("./pages/Installments").then(m => ({ default: m.Installments })));
const Subscriptions = lazy(() => import("./pages/Subscriptions"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Cards = lazy(() => import("./pages/Cards"));
const IncomeManagement = lazy(() => import("./pages/IncomeManagement"));
const ExpenseManagement = lazy(() => import("./pages/ExpenseManagement"));
const SavingsGoals = lazy(() => import("./pages/SavingsGoals"));
const BudgetManagement = lazy(() => import("./pages/BudgetManagement"));
const FinanceDashboard = lazy(() => import("./pages/FinanceDashboard"));
const DecisionMaking = lazy(() => import("./pages/DecisionMaking"));

// Dev tools: lazy loaded
const DevPanel = lazy(() => import('@/components/dev/DevPanel').then(m => ({ default: m.DevPanel })));
import { useDevPanelShortcut } from '@/components/dev/useDevPanelShortcut';

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient();

const App = () => {
  const [showDev, setShowDev] = useState(false);
  const toggleDev = useCallback(() => setShowDev(v => !v), []);
  useDevPanelShortcut(toggleDev);

  const handleRefetchAll = useCallback(() => {
    // Intencionalmente vacío por ahora: los hooks ya refrescan bajo demanda.
    // Podríamos emitir un evento custom si quisiéramos forzar refetch centralizado.
    window.dispatchEvent(new CustomEvent('devpanel:refetch'));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
          <Route path="/subscriptions" element={
            <ProtectedRoute>
              <Layout>
                <Subscriptions />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/housing-services" element={<Navigate to="/finance/expenses" replace />} />
          <Route path="/installments" element={
            <ProtectedRoute>
              <Layout>
                <Installments />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Layout>
                <Notifications />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/feedback" element={
            <ProtectedRoute>
              <Layout>
                <Feedback />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/cards" element={
            <ProtectedRoute>
              <Layout>
                <Cards />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Personal Finance Routes (Beta) */}
          <Route path="/finance" element={
            <ProtectedRoute>
              <Layout>
                <FinanceDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/finance/decisions" element={
            <ProtectedRoute>
              <Layout>
                <DecisionMaking />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/finance/income" element={
            <ProtectedRoute>
              <Layout>
                <IncomeManagement />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/finance/expenses" element={
            <ProtectedRoute>
              <Layout>
                <ExpenseManagement />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/finance/goals" element={
            <ProtectedRoute>
              <Layout>
                <SavingsGoals />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/finance/budgets" element={
            <ProtectedRoute>
              <Layout>
                <BudgetManagement />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/fire" element={
            <ProtectedRoute>
              <Layout>
                <FIRE />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/use-cases" element={
            <ProtectedRoute>
              <Layout>
                <UseCases />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          {import.meta.env.DEV && (
            <Suspense fallback={null}>
              <DevPanel
                visible={showDev}
                onClose={() => setShowDev(false)}
                onRefetchAll={handleRefetchAll}
              />
            </Suspense>
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
