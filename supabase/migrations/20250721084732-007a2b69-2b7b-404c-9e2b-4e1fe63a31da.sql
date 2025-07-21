-- Create GD chat messages table
CREATE TABLE public.gd_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gd_id UUID NOT NULL REFERENCES public.group_discussions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  parent_message_id UUID REFERENCES public.gd_chat_messages(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.gd_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat messages
CREATE POLICY "Registered users can view messages for their GDs"
ON public.gd_chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.gd_registrations
    WHERE gd_id = gd_chat_messages.gd_id 
    AND user_id = auth.uid()
    AND cancelled_at IS NULL
  ) OR is_admin(auth.uid())
);

CREATE POLICY "Registered users can send messages to their GDs"
ON public.gd_chat_messages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.gd_registrations
    WHERE gd_id = gd_chat_messages.gd_id 
    AND user_id = auth.uid()
    AND cancelled_at IS NULL
  )
);

CREATE POLICY "Users can update their own messages"
ON public.gd_chat_messages
FOR UPDATE
USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Admins can delete any message"
ON public.gd_chat_messages
FOR UPDATE
USING (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_gd_chat_messages_gd_id ON public.gd_chat_messages(gd_id);
CREATE INDEX idx_gd_chat_messages_parent ON public.gd_chat_messages(parent_message_id);
CREATE INDEX idx_gd_chat_messages_created_at ON public.gd_chat_messages(created_at);

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.gd_chat_messages;