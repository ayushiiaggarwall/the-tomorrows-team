import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PollTriggerParams {
  gd_id: string;
  action: 'create_poll' | 'close_poll';
}

export const usePollTrigger = () => {
  const { toast } = useToast();

  const triggerPollMutation = useMutation({
    mutationFn: async ({ gd_id, action }: PollTriggerParams) => {
      const { data, error } = await supabase.functions.invoke('auto-poll-trigger', {
        body: { gd_id, action }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      const { action } = variables;
      
      if (action === 'create_poll') {
        toast({
          title: "Poll Created",
          description: "Best speaker voting is now open!",
        });
      } else if (action === 'close_poll') {
        toast({
          title: "Poll Closed",
          description: data.winner ? `Winner: ${data.winner}` : "Poll ended with no votes.",
        });
      }
    },
    onError: (error) => {
      console.error('Error triggering poll:', error);
      toast({
        title: "Error",
        description: "Failed to manage poll. Please try again.",
        variant: "destructive",
      });
    }
  });

  const createPoll = (gdId: string) => {
    triggerPollMutation.mutate({ gd_id: gdId, action: 'create_poll' });
  };

  const closePoll = (gdId: string) => {
    triggerPollMutation.mutate({ gd_id: gdId, action: 'close_poll' });
  };

  return {
    createPoll,
    closePoll,
    isLoading: triggerPollMutation.isPending
  };
};