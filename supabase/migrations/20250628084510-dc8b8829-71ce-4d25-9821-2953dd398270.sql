
-- Insert expanded Interests tags (only if they don't already exist)
INSERT INTO public.predefined_tags (name, category) 
SELECT name, category FROM (VALUES
  ('Business', 'Interests'),
  ('Education', 'Interests'),
  ('Finance', 'Interests'),
  ('Healthcare', 'Interests'),
  ('Marketing', 'Interests'),
  ('Technology', 'Interests'),
  ('Politics', 'Interests'),
  ('Environment & Sustainability', 'Interests'),
  ('Arts & Culture', 'Interests'),
  ('Startups & Innovation', 'Interests'),
  ('Law & Policy', 'Interests'),
  ('Media & Journalism', 'Interests'),
  ('Psychology & Human Behavior', 'Interests'),
  ('Sports', 'Interests'),
  ('International Affairs', 'Interests'),
  ('Social Issues', 'Interests'),
  ('Entertainment', 'Interests'),
  ('Personal Development', 'Interests'),
  ('Science & Research', 'Interests'),
  ('Travel & Global Cultures', 'Interests')
) AS new_tags(name, category)
WHERE NOT EXISTS (
  SELECT 1 FROM public.predefined_tags WHERE predefined_tags.name = new_tags.name
);

-- Insert expanded Personality Traits tags (only if they don't already exist)
INSERT INTO public.predefined_tags (name, category) 
SELECT name, category FROM (VALUES
  ('Analytical', 'Personality Traits'),
  ('Creative', 'Personality Traits'),
  ('Organized', 'Personality Traits'),
  ('Team Player', 'Personality Traits'),
  ('Empathetic', 'Personality Traits'),
  ('Curious', 'Personality Traits'),
  ('Ambitious', 'Personality Traits'),
  ('Practical', 'Personality Traits'),
  ('Visionary', 'Personality Traits'),
  ('Calm under pressure', 'Personality Traits'),
  ('Detail-oriented', 'Personality Traits'),
  ('Outgoing', 'Personality Traits'),
  ('Reflective', 'Personality Traits'),
  ('Resilient', 'Personality Traits'),
  ('Strategic', 'Personality Traits'),
  ('Action-oriented', 'Personality Traits'),
  ('Humble', 'Personality Traits'),
  ('Independent', 'Personality Traits'),
  ('Adaptive', 'Personality Traits'),
  ('Supportive', 'Personality Traits')
) AS new_tags(name, category)
WHERE NOT EXISTS (
  SELECT 1 FROM public.predefined_tags WHERE predefined_tags.name = new_tags.name
);

-- Insert expanded Skills tags (only if they don't already exist)
INSERT INTO public.predefined_tags (name, category) 
SELECT name, category FROM (VALUES
  ('Communication', 'Skills'),
  ('Critical Thinking', 'Skills'),
  ('Leadership', 'Skills'),
  ('Negotiation', 'Skills'),
  ('Problem Solving', 'Skills'),
  ('Public Speaking', 'Skills'),
  ('Research', 'Skills'),
  ('Writing', 'Skills'),
  ('Active Listening', 'Skills'),
  ('Emotional Intelligence', 'Skills'),
  ('Conflict Resolution', 'Skills'),
  ('Strategic Planning', 'Skills'),
  ('Presentation Design', 'Skills'),
  ('Facilitation', 'Skills'),
  ('Time Management', 'Skills'),
  ('Debate', 'Skills'),
  ('Interviewing', 'Skills'),
  ('Collaboration', 'Skills'),
  ('Storytelling', 'Skills'),
  ('Decision Making', 'Skills')
) AS new_tags(name, category)
WHERE NOT EXISTS (
  SELECT 1 FROM public.predefined_tags WHERE predefined_tags.name = new_tags.name
);
