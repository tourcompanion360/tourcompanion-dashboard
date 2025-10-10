import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import { AgencyProvider } from "@/contexts/AgencyContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ClientPortal from "./pages/ClientPortal";
import AdminDashboard from "./pages/AdminDashboard";
import TestClientPortal from "./pages/TestClientPortal";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

// Simple error boundary to avoid full blank screens
class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; message?: string }>{
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, message: error?.message || 'Unexpected error' };
  }
  componentDidCatch(error: any, info: any) {
    console.error('App crashed:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <p className="text-red-500 mb-2">Something went wrong</p>
            <p className="text-muted-foreground mb-4">{this.state.message}</p>
            <button className="px-4 py-2 rounded bg-primary text-primary-foreground" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children as any;
  }
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppErrorBoundary>
        <BrowserRouter>
          <AgencyProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
        <Route
          path="/client/:projectId"
          element={
            <ProtectedRoute>
              <ClientPortal />
            </ProtectedRoute>
          }
        />
        {/* Test route for client portal - bypasses magic link requirement */}
        <Route
          path="/test-client/:projectId"
          element={<ClientPortal />}
        />
        <Route
          path="/test-portal"
          element={
            <ProtectedRoute>
              <TestClientPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AgencyProvider>
        </BrowserRouter>
      </AppErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
