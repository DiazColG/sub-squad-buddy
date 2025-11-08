import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
// Deprecated screens: temporarily redirect routes to Expenses
import { Installments } from "./pages/Installments";
import Subscriptions from "./pages/Subscriptions";
import Analytics from "./pages/Analytics";
import Notifications from "./pages/Notifications";
import Feedback from "./pages/Feedback";
import Settings from "./pages/Settings";
import Cards from "./pages/Cards";
import IncomeManagement from "./pages/IncomeManagement";
import ExpenseManagement from "./pages/ExpenseManagement";
import SavingsGoals from "./pages/SavingsGoals";
import BudgetManagement from "./pages/BudgetManagement";
import FinanceDashboard from "./pages/FinanceDashboard";
import UseCases from "./pages/UseCases";
import FIRE from "./pages/FIRE";
import DecisionMaking from "./pages/DecisionMaking";

import NotFound from "./pages/NotFound";
import { Layout } from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useState, useCallback } from 'react';
import { DevPanel } from '@/components/dev/DevPanel';
import { useDevPanelShortcut } from '@/components/dev/useDevPanelShortcut';

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
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
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
          {import.meta.env.DEV && (
            <DevPanel
              visible={showDev}
              onClose={() => setShowDev(false)}
              onRefetchAll={handleRefetchAll}
            />
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
