import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import About from "./pages/About";
import JoinGD from "./pages/JoinGD";
import Leaderboard from "./pages/Leaderboard";
import WatchLearn from "./pages/WatchLearn";
import Resources from "./pages/Resources";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import AuthPage from "./pages/AuthPage";
import ResetPassword from "./pages/ResetPassword";
import ResetEmailSent from "./pages/ResetEmailSent";
import UserNotFound from "./pages/UserNotFound";
import CheckEmail from "./pages/CheckEmail";
import EmailVerified from "./pages/EmailVerified";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import ProfileSettings from "./pages/ProfileSettings";
import ParticipationHistory from "./pages/ParticipationHistory";
import Achievements from "./pages/Achievements";
import Notifications from "./pages/Notifications";

const queryClient = new QueryClient();

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <AuthWrapper>
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
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthWrapper>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
