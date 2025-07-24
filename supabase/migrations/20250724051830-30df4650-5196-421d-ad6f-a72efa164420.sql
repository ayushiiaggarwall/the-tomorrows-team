-- Create polls table
CREATE TABLE public.gd_polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gd_id UUID NOT NULL REFERENCES public.group_discussions(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.gd_chat_messages(id) ON DELETE CASCADE,
  poll_type TEXT NOT NULL DEFAULT 'best_speaker',
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create poll options table
CREATE TABLE public.gd_poll_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.gd_polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  option_text TEXT NOT NULL,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create poll votes table
CREATE TABLE public.gd_poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.gd_polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.gd_poll_options(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, voter_id)
);

-- Add poll_id to chat messages
ALTER TABLE public.gd_chat_messages 
ADD COLUMN poll_id UUID REFERENCES public.gd_polls(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.gd_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gd_poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gd_poll_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for polls
CREATE POLICY "Users can view polls for their GDs"
ON public.gd_polls
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.gd_registrations
    WHERE gd_id = gd_polls.gd_id 
    AND user_id = auth.uid()
    AND cancelled_at IS NULL
  ) OR is_admin(auth.uid())
);

CREATE POLICY "Admins can manage polls"
ON public.gd_polls
FOR ALL
USING (is_admin(auth.uid()));

-- RLS Policies for poll options
CREATE POLICY "Users can view poll options for their GDs"
ON public.gd_poll_options
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.gd_polls gp
    JOIN public.gd_registrations gr ON gp.gd_id = gr.gd_id
    WHERE gp.id = gd_poll_options.poll_id 
    AND gr.user_id = auth.uid()
    AND gr.cancelled_at IS NULL
  ) OR is_admin(auth.uid())
);

CREATE POLICY "Admins can manage poll options"
ON public.gd_poll_options
FOR ALL
USING (is_admin(auth.uid()));

-- RLS Policies for poll votes
CREATE POLICY "Users can view poll votes for their GDs"
ON public.gd_poll_votes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.gd_polls gp
    JOIN public.gd_registrations gr ON gp.gd_id = gr.gd_id
    WHERE gp.id = gd_poll_votes.poll_id 
    AND gr.user_id = auth.uid()
    AND gr.cancelled_at IS NULL
  ) OR is_admin(auth.uid())
);

CREATE POLICY "Users can vote in polls for their GDs"
ON public.gd_poll_votes
FOR INSERT
WITH CHECK (
  auth.uid() = voter_id AND
  EXISTS (
    SELECT 1 FROM public.gd_polls gp
    JOIN public.gd_registrations gr ON gp.gd_id = gr.gd_id
    WHERE gp.id = gd_poll_votes.poll_id 
    AND gr.user_id = auth.uid()
    AND gr.cancelled_at IS NULL
    AND gp.is_active = TRUE
    AND gp.expires_at > NOW()
  )
);

CREATE POLICY "Users can update their own votes"
ON public.gd_poll_votes
FOR UPDATE
USING (auth.uid() = voter_id);

CREATE POLICY "Admins can manage poll votes"
ON public.gd_poll_votes
FOR ALL
USING (is_admin(auth.uid()));

-- Create indexes
CREATE INDEX idx_gd_polls_gd_id ON public.gd_polls(gd_id);
CREATE INDEX idx_gd_poll_options_poll_id ON public.gd_poll_options(poll_id);
CREATE INDEX idx_gd_poll_votes_poll_id ON public.gd_poll_votes(poll_id);
CREATE INDEX idx_gd_poll_votes_voter_id ON public.gd_poll_votes(voter_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.gd_polls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gd_poll_options;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gd_poll_votes;

-- Function to create best speaker poll
CREATE OR REPLACE FUNCTION public.create_best_speaker_poll(p_gd_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_poll_id UUID;
  v_message_id UUID;
  v_attendee RECORD;
  v_gd_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get GD scheduled date
  SELECT scheduled_date INTO v_gd_date
  FROM public.group_discussions
  WHERE id = p_gd_id;
  
  -- Create poll message
  INSERT INTO public.gd_chat_messages (
    gd_id,
    user_id,
    message,
    message_type,
    is_pinned
  ) VALUES (
    p_gd_id,
    (SELECT id FROM public.profiles WHERE is_admin = true LIMIT 1),
    '🗳️ Voting is now open for the Best Speaker of this session! Please cast your vote below.',
    'text',
    true
  ) RETURNING id INTO v_message_id;
  
  -- Create poll
  INSERT INTO public.gd_polls (
    gd_id,
    message_id,
    poll_type,
    expires_at
  ) VALUES (
    p_gd_id,
    v_message_id,
    'best_speaker',
    v_gd_date + INTERVAL '24 hours'
  ) RETURNING id INTO v_poll_id;
  
  -- Update message with poll_id
  UPDATE public.gd_chat_messages
  SET poll_id = v_poll_id
  WHERE id = v_message_id;
  
  -- Create poll options for all attendees who spoke
  FOR v_attendee IN
    SELECT DISTINCT gr.user_id, p.full_name
    FROM public.gd_registrations gr
    JOIN public.profiles p ON gr.user_id = p.id
    WHERE gr.gd_id = p_gd_id 
    AND gr.attended = true
    AND gr.cancelled_at IS NULL
  LOOP
    INSERT INTO public.gd_poll_options (
      poll_id,
      user_id,
      option_text
    ) VALUES (
      v_poll_id,
      v_attendee.user_id,
      COALESCE(v_attendee.full_name, 'Anonymous User')
    );
  END LOOP;
  
  RETURN v_poll_id;
END;
$$;

-- Function to vote in poll
CREATE OR REPLACE FUNCTION public.vote_in_poll(
  p_poll_id UUID,
  p_option_id UUID,
  p_voter_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_option_id UUID;
BEGIN
  -- Check if user already voted
  SELECT option_id INTO v_old_option_id
  FROM public.gd_poll_votes
  WHERE poll_id = p_poll_id AND voter_id = p_voter_id;
  
  -- If user already voted, update their vote
  IF v_old_option_id IS NOT NULL THEN
    -- Decrease count for old option
    UPDATE public.gd_poll_options
    SET vote_count = vote_count - 1
    WHERE id = v_old_option_id;
    
    -- Update vote
    UPDATE public.gd_poll_votes
    SET option_id = p_option_id
    WHERE poll_id = p_poll_id AND voter_id = p_voter_id;
  ELSE
    -- Insert new vote
    INSERT INTO public.gd_poll_votes (poll_id, option_id, voter_id)
    VALUES (p_poll_id, p_option_id, p_voter_id);
  END IF;
  
  -- Increase count for new option
  UPDATE public.gd_poll_options
  SET vote_count = vote_count + 1
  WHERE id = p_option_id;
  
  RETURN TRUE;
END;
$$;