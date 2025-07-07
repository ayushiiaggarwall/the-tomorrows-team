import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePageTracking } from '@/hooks/useAnalytics';

const PageTracker = () => {
  const location = useLocation();
  const { trackPageView } = usePageTracking();

  useEffect(() => {
    // Track page view on route change
    trackPageView(location.pathname);
  }, [location.pathname, trackPageView]);

  return null; // This component doesn't render anything
};

export default PageTracker;