
-- Create user_referrals table to track referral relationships
CREATE TABLE public.user_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  UNIQUE(referred_id) -- Each user can only be referred once
);

-- Add Row Level Security
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;

-- Users can view referrals they made or received
CREATE POLICY "Users can view their own referrals" 
  ON public.user_referrals 
  FOR SELECT 
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Users can insert referrals for themselves as the referred user
CREATE POLICY "Users can create referrals for themselves" 
  ON public.user_referrals 
  FOR INSERT 
  WITH CHECK (auth.uid() = referred_id);

-- Users can update referrals they made or received
CREATE POLICY "Users can update their own referrals" 
  ON public.user_referrals 
  FOR UPDATE 
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Create index for faster lookups
CREATE INDEX idx_user_referrals_referrer ON public.user_referrals(referrer_id);
CREATE INDEX idx_user_referrals_referred ON public.user_referrals(referred_id);
CREATE INDEX idx_user_referrals_code ON public.user_referrals(referral_code);
