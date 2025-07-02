
-- Create account_deletion_requests table
CREATE TABLE public.account_deletion_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for account_deletion_requests
CREATE POLICY "Users can create their own deletion requests" 
  ON public.account_deletion_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own deletion requests" 
  ON public.account_deletion_requests 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all deletion requests" 
  ON public.account_deletion_requests 
  FOR ALL 
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Create index for better performance
CREATE INDEX idx_account_deletion_requests_user_id ON public.account_deletion_requests(user_id);
CREATE INDEX idx_account_deletion_requests_status ON public.account_deletion_requests(status);
