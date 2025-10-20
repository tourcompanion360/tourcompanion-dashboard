import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import { AgencyProvider } from "@/contexts/AgencyContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import DevModeBanner from "./components/DevModeBanner";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const ClientPortal = lazy(() => import("./pages/ClientPortal"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Billing = lazy(() => import("./pages/Billing"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const TestClientPortal = lazy(() => import("./pages/TestClientPortalView"));
const TestClientPortalView = lazy(() => import("./pages/TestClientPortalView"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));

// Query client is now imported from lib/queryClient.ts

// Enhanced error boundary using our robust ErrorBoundary component

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <DevModeBanner />
      <ErrorBoundary>
        <BrowserRouter>
          <AgencyProvider>
            <NotificationProvider>
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                </div>
              }>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route
                    path="/pricing"
                    element={
                      <ProtectedRoute requiredRole="creator">
                        <Pricing />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/billing"
                    element={
                      <ProtectedRoute requiredRole="creator">
                        <Billing />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/"
                    element={
                      <ErrorBoundary fallback={<div className="p-4 text-center">Dashboard Error - Please refresh the page</div>}>
                        <ProtectedRoute>
                          <Index />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ErrorBoundary fallback={<div className="p-4 text-center">Dashboard Error - Please refresh the page</div>}>
                        <ProtectedRoute>
                          <Index />
                        </ProtectedRoute>
                      </ErrorBoundary>
                    }
                  />
                  {/* Client dashboard - completely public, no authentication */}
                  <Route
                    path="/client/:projectId"
                    element={<ClientDashboard />}
                  />
                  {/* Legacy dashboard route - redirects to main client route */}
                  <Route
                    path="/client/:projectId/dashboard"
                    element={<ClientDashboard />}
                  />
                  {/* Test route for client portal - bypasses magic link requirement */}
                  <Route
                    path="/test-client/:projectId"
                    element={<TestClientPortalView />}
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
                      <ErrorBoundary fallback={<div className="p-4 text-center">Admin Panel Error - Please refresh the page</div>}>
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/portal/:projectId"
                    element={
                      <ProtectedRoute>
                        <ClientPortal />
                      </ProtectedRoute>
                    }
                  />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </NotificationProvider>
          </AgencyProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
