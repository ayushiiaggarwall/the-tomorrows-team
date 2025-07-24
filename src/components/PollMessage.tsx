import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Vote, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PollOption {
  id: string;
  user_id: string;
  option_text: string;
  vote_count: number;
}

interface Poll {
  id: string;
  poll_type: string;
  is_active: boolean;
  expires_at: string;
}

interface PollMessageProps {
  pollId: string;
  messageId: string;
}

export const PollMessage: React.FC<PollMessageProps> = ({ pollId, messageId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Fetch poll details
  const { data: poll } = useQuery({
    queryKey: ['poll', pollId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gd_polls')
        .select('*')
        .eq('id', pollId)
        .single();
      
      if (error) throw error;
      return data as Poll;
    }
  });

  // Fetch poll options
  const { data: options = [] } = useQuery({
    queryKey: ['poll-options', pollId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gd_poll_options')
        .select('*')
        .eq('poll_id', pollId)
        .order('option_text');
      
      if (error) throw error;
      return data as PollOption[];
    }
  });

  // Fetch user's current vote
  const { data: userVote } = useQuery({
    queryKey: ['user-vote', pollId, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('gd_poll_votes')
        .select('option_id')
        .eq('poll_id', pollId)
        .eq('voter_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.option_id || null;
    },
    enabled: !!user?.id
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async (optionId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .rpc('vote_in_poll', {
          p_poll_id: pollId,
          p_option_id: optionId,
          p_voter_id: user.id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poll-options', pollId] });
      queryClient.invalidateQueries({ queryKey: ['user-vote', pollId, user?.id] });
      toast({
        title: "Vote Cast",
        description: "Your vote has been recorded successfully!",
      });
    },
    onError: (error) => {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to cast vote. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleVote = (optionId: string) => {
    if (!poll?.is_active) {
      toast({
        title: "Poll Closed",
        description: "This poll is no longer accepting votes.",
        variant: "destructive",
      });
      return;
    }

    if (new Date() > new Date(poll.expires_at)) {
      toast({
        title: "Poll Expired",
        description: "The voting period has ended.",
        variant: "destructive",
      });
      return;
    }

    voteMutation.mutate(optionId);
  };

  const totalVotes = options.reduce((sum, option) => sum + option.vote_count, 0);
  const isExpired = poll ? new Date() > new Date(poll.expires_at) : false;
  const isActive = poll?.is_active && !isExpired;

  const getTimeRemaining = () => {
    if (!poll) return '';
    const now = new Date();
    const expiry = new Date(poll.expires_at);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Vote className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-primary">Best Speaker Poll</h3>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Closed"}
          </Badge>
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{totalVotes} votes cast</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{getTimeRemaining()}</span>
          </div>
        </div>

        <div className="space-y-2">
          {options.map((option) => {
            const percentage = totalVotes > 0 ? (option.vote_count / totalVotes) * 100 : 0;
            const isSelected = userVote === option.id;
            const isCurrentSelection = selectedOption === option.id;

            return (
              <div
                key={option.id}
                className={`
                  relative p-3 rounded-lg border cursor-pointer transition-all
                  ${isSelected 
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50'
                  }
                  ${!isActive ? 'cursor-not-allowed opacity-75' : ''}
                `}
                onClick={() => isActive && handleVote(option.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{option.option_text}</span>
                    {isSelected && (
                      <Badge variant="secondary" className="text-xs">
                        Your vote
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{option.vote_count}</span>
                    <span className="text-xs text-muted-foreground">
                      ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                </div>
                
                {/* Vote percentage bar */}
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {!isActive && (
          <div className="mt-3 text-center text-sm text-muted-foreground">
            {isExpired ? 'Voting has ended' : 'Poll is closed'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};