-- Create message votes table
CREATE TABLE public.gd_message_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.gd_chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- Enable RLS
ALTER TABLE public.gd_message_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message votes
CREATE POLICY "Users can view votes for messages they can see"
ON public.gd_message_votes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.gd_chat_messages gcm
    JOIN public.gd_registrations gr ON gcm.gd_id = gr.gd_id
    WHERE gcm.id = gd_message_votes.message_id 
    AND gr.user_id = auth.uid()
    AND gr.cancelled_at IS NULL
  ) OR is_admin(auth.uid())
);

CREATE POLICY "Users can vote on messages in their GDs"
ON public.gd_message_votes
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.gd_chat_messages gcm
    JOIN public.gd_registrations gr ON gcm.gd_id = gr.gd_id
    WHERE gcm.id = gd_message_votes.message_id 
    AND gr.user_id = auth.uid()
    AND gr.cancelled_at IS NULL
  )
);

CREATE POLICY "Users can update their own votes"
ON public.gd_message_votes
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
ON public.gd_message_votes
FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_gd_message_votes_message_id ON public.gd_message_votes(message_id);
CREATE INDEX idx_gd_message_votes_user_id ON public.gd_message_votes(user_id);

-- Enable realtime for message votes
ALTER PUBLICATION supabase_realtime ADD TABLE public.gd_message_votes;