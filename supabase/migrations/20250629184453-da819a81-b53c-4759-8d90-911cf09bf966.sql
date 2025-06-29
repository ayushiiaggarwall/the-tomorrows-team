
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'reward', 'gd_update', 'reminder', 'announcement'
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_global BOOLEAN NOT NULL DEFAULT false, -- for admin announcements
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB -- for storing additional data like GD details, points earned, etc.
);

-- Add RLS policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications or global notifications
CREATE POLICY "Users can view their notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    (is_global = true AND (expires_at IS NULL OR expires_at > now()))
  );

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only admins can insert notifications
CREATE POLICY "Admins can insert notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (
    -- Allow system to insert user-specific notifications
    (user_id IS NOT NULL AND is_global = false) OR
    -- Allow admins to insert global notifications
    (is_global = true AND public.is_admin(auth.uid()))
  );

-- Only admins can delete notifications
CREATE POLICY "Admins can delete notifications" 
  ON public.notifications 
  FOR DELETE 
  USING (public.is_admin(auth.uid()));

-- Create index for better performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_global ON public.notifications(is_global, expires_at) WHERE is_global = true;
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_is_global BOOLEAN DEFAULT false,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    is_global,
    expires_at,
    metadata
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_is_global,
    p_expires_at,
    p_metadata
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = true, updated_at = now()
  WHERE id = p_notification_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.notifications
  SET is_read = true, updated_at = now()
  WHERE (user_id = p_user_id OR is_global = true) 
    AND user_id = auth.uid()
    AND is_read = false;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
