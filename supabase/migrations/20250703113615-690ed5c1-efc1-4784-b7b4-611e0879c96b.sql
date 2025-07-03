-- Enable the pg_cron extension to schedule functions
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the no-show penalty function to run every hour
SELECT cron.schedule(
  'no-show-penalty-check',
  '0 * * * *', -- Run at the start of every hour
  $$
  SELECT
    net.http_post(
        url:='https://wusbwaddlufqjltabtnp.supabase.co/functions/v1/no-show-penalty',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1c2J3YWRkbHVmcWpsdGFidG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzODY5MDMsImV4cCI6MjA2NDk2MjkwM30.yd7MFH8G7FyNs-pi28SHiVRn4BVGx1xY7RQo5gHVYWU"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);