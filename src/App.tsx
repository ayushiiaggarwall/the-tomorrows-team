import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { lazy, Suspense } from "react";

// Lazy load all pages for better performance
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const JoinGD = lazy(() => import("./pages/JoinGD"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const WatchLearn = lazy(() => import("./pages/WatchLearn"));
const Resources = lazy(() => import("./pages/Resources"));
const Blog = lazy(() => import("./pages/Blog"));
const Contact = lazy(() => import("./pages/Contact"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ResetEmailSent = lazy(() => import("./pages/ResetEmailSent"));
const UserNotFound = lazy(() => import("./pages/UserNotFound"));
const CheckEmail = lazy(() => import("./pages/CheckEmail"));
const EmailVerified = lazy(() => import("./pages/EmailVerified"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings"));
const ParticipationHistory = lazy(() => import("./pages/ParticipationHistory"));
const Achievements = lazy(() => import("./pages/Achievements"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Notifications = lazy(() => import("./pages/Notifications"));
const AlreadyRegistered = lazy(() => import("./pages/AlreadyRegistered"));
const Sitemap = lazy(() => import("./components/Sitemap"));

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

import { queryClient } from '@/lib/queryClient';

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Auto-redirect authenticated users based on their role
  if (user && window.location.pathname === '/login') {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }
  
  return <>{children}</>;
};

const HomeRedirect = () => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }
  
  return <Index />;
};

const App = () => {
  // Monitor performance in production
  usePerformanceMonitor();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <AuthWrapper>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                <Route path="/" element={<HomeRedirect />} />
                <Route path="/about" element={<About />} />
                <Route path="/join-gd" element={<JoinGD />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/watch-learn" element={<WatchLearn />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<Blog />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/reset-email-sent" element={<ResetEmailSent />} />
                <Route path="/user-not-found" element={<UserNotFound />} />
                <Route path="/check-email" element={<CheckEmail />} />
                <Route path="/email-verified" element={<EmailVerified />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfileSettings />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/notifications" 
                  element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/participation-history" 
                  element={
                    <ProtectedRoute>
                      <ParticipationHistory />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/achievements" 
                  element={
                    <ProtectedRoute>
                      <Achievements />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/user/:userId" element={<UserProfile />} />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/already-registered" element={<AlreadyRegistered />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthWrapper>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
