-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job to run the no-show penalty function every hour
SELECT cron.schedule(
  'no-show-penalty-check',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://wusbwaddlufqjltabtnp.supabase.co/functions/v1/no-show-penalty',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1c2J3YWRkbHVmcWpsdGFidG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzODY5MDMsImV4cCI6MjA2NDk2MjkwM30.yd7MFH8G7FyNs-pi28SHiVRn4BVGx1xY7RQo5gHVYWU"}'::jsonb,
        body:='{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);