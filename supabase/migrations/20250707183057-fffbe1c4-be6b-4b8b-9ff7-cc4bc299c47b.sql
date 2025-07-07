-- Create analytics table to track site visits
CREATE TABLE public.site_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'page_view', 'signup', etc.
  page_path TEXT,
  user_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better performance
CREATE INDEX idx_site_analytics_event_type ON public.site_analytics(event_type);
CREATE INDEX idx_site_analytics_created_at ON public.site_analytics(created_at);
CREATE INDEX idx_site_analytics_page_path ON public.site_analytics(page_path);

-- Enable RLS
ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can insert analytics" 
ON public.site_analytics 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all analytics" 
ON public.site_analytics 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Create function to track page views
CREATE OR REPLACE FUNCTION public.track_page_view(
  p_page_path TEXT,
  p_user_id UUID DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_analytics_id UUID;
BEGIN
  INSERT INTO public.site_analytics (
    event_type,
    page_path,
    user_id,
    ip_address,
    user_agent
  ) VALUES (
    'page_view',
    p_page_path,
    p_user_id,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_analytics_id;
  
  RETURN v_analytics_id;
END;
$$;

-- Create function to get analytics summary
CREATE OR REPLACE FUNCTION public.get_analytics_summary()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_visits INTEGER;
  v_today_visits INTEGER;
  v_total_signups INTEGER;
  v_today_signups INTEGER;
  v_unique_visitors INTEGER;
BEGIN
  -- Total page views
  SELECT COUNT(*) INTO v_total_visits
  FROM public.site_analytics
  WHERE event_type = 'page_view';
  
  -- Today's page views
  SELECT COUNT(*) INTO v_today_visits
  FROM public.site_analytics
  WHERE event_type = 'page_view'
    AND created_at >= CURRENT_DATE;
  
  -- Total signups (from profiles table)
  SELECT COUNT(*) INTO v_total_signups
  FROM public.profiles;
  
  -- Today's signups
  SELECT COUNT(*) INTO v_today_signups
  FROM public.profiles
  WHERE created_at >= CURRENT_DATE;
  
  -- Unique visitors (based on IP address)
  SELECT COUNT(DISTINCT ip_address) INTO v_unique_visitors
  FROM public.site_analytics
  WHERE event_type = 'page_view'
    AND ip_address IS NOT NULL;
  
  RETURN json_build_object(
    'total_visits', v_total_visits,
    'today_visits', v_today_visits,
    'total_signups', v_total_signups,
    'today_signups', v_today_signups,
    'unique_visitors', v_unique_visitors
  );
END;
$$;