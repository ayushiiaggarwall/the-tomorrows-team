import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PollTriggerParams {
  gd_id: string;
  action: 'create_poll' | 'close_poll';
}

export const usePollTrigger = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      
      // Check if the response indicates failure
      if (data && !data.success) {
        if (data.error === 'POLL_EXISTS') {
          toast({
            title: "Poll Already Active",
            description: data.message,
            variant: "destructive",
          });
        } else if (data.error === 'NO_ACTIVE_POLL') {
          toast({
            title: "No Active Poll",
            description: data.message,
            variant: "destructive",
          });
        }
        return;
      }
      
      if (action === 'create_poll') {
        // Invalidate chat messages to show the new poll
        queryClient.invalidateQueries({ queryKey: ['gd-messages'] });
        toast({
          title: "Poll Created",
          description: "Best speaker voting is now open!",
        });
      } else if (action === 'close_poll') {
        // Invalidate chat messages to show winner announcement and refresh poll status
        queryClient.invalidateQueries({ queryKey: ['gd-messages'] });
        const winnerMessage = data.winner 
          ? `Winner: ${data.winner} with ${data.votes} vote${data.votes !== 1 ? 's' : ''}!` 
          : "Poll ended with no votes.";
        toast({
          title: "Poll Closed",
          description: winnerMessage,
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