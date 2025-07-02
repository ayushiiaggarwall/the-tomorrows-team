import { useEffect } from 'react';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
}

export const usePerformanceMonitor = () => {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    const metrics: PerformanceMetrics = {};

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              metrics.fcp = entry.startTime;
            }
            break;
          case 'largest-contentful-paint':
            metrics.lcp = entry.startTime;
            break;
          case 'first-input':
            metrics.fid = (entry as any).processingStart - entry.startTime;
            break;
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              metrics.cls = (metrics.cls || 0) + (entry as any).value;
            }
            break;
        }
      }
    });

    // Observe different entry types
    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      console.warn('Performance observer not supported:', error);
    }

    // Log metrics after page load
    const logMetrics = () => {
      setTimeout(() => {
        console.group('🚀 Performance Metrics');
        if (metrics.fcp) console.log(`First Contentful Paint: ${Math.round(metrics.fcp)}ms`);
        if (metrics.lcp) console.log(`Largest Contentful Paint: ${Math.round(metrics.lcp)}ms`);
        if (metrics.fid) console.log(`First Input Delay: ${Math.round(metrics.fid)}ms`);
        if (metrics.cls) console.log(`Cumulative Layout Shift: ${metrics.cls.toFixed(3)}`);
        console.groupEnd();
      }, 3000);
    };

    if (document.readyState === 'complete') {
      logMetrics();
    } else {
      window.addEventListener('load', logMetrics);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('load', logMetrics);
    };
  }, []);
};