import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow, format } from 'date-fns';
import { Send, Pin, Trash2, Reply, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  message: string;
  user_id: string;
  parent_message_id?: string;
  is_pinned: boolean;
  is_deleted: boolean;
  created_at: string;
  user_profile?: {
    full_name?: string;
    is_admin: boolean;
  };
  replies?: ChatMessage[];
}

interface GDDetails {
  id: string;
  topic_name: string;
  scheduled_date: string;
  description?: string;
}

const GDChat = () => {
  const { gdId } = useParams<{ gdId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch GD details
  const { data: gdDetails } = useQuery({
    queryKey: ['gd-details', gdId],
    queryFn: async () => {
      if (!gdId) return null;
      const { data, error } = await supabase
        .from('group_discussions')
        .select('id, topic_name, scheduled_date, description')
        .eq('id', gdId)
        .single();
      
      if (error) throw error;
      return data as GDDetails;
    },
    enabled: !!gdId
  });

  // Check if user is registered for this GD
  const { data: isRegistered } = useQuery({
    queryKey: ['gd-registration-check', gdId, user?.id],
    queryFn: async () => {
      if (!gdId || !user?.id) return false;
      const { data } = await supabase
        .from('gd_registrations')
        .select('id')
        .eq('gd_id', gdId)
        .eq('user_id', user.id)
        .is('cancelled_at', null)
        .single();
      
      return !!data;
    },
    enabled: !!gdId && !!user?.id
  });

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ['user-admin-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      return data?.is_admin || false;
    },
    enabled: !!user?.id
  });

  // Fetch chat messages
  const { data: messages = [] } = useQuery({
    queryKey: ['gd-chat-messages', gdId],
    queryFn: async () => {
      if (!gdId) return [];
      const { data, error } = await supabase
        .from('gd_chat_messages')
        .select(`
          *,
          user_profile:profiles(full_name, is_admin)
        `)
        .eq('gd_id', gdId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });
      
      if (error) throw error;

      // Organize messages with replies
      const messageMap = new Map();
      const rootMessages: ChatMessage[] = [];

      data.forEach((msg: any) => {
        const message: ChatMessage = {
          ...msg,
          replies: []
        };
        messageMap.set(msg.id, message);

        if (msg.parent_message_id) {
          const parent = messageMap.get(msg.parent_message_id);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(message);
          }
        } else {
          rootMessages.push(message);
        }
      });

      return rootMessages;
    },
    enabled: !!gdId && (isRegistered || isAdmin)
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, parentId }: { message: string; parentId?: string }) => {
      const { error } = await supabase
        .from('gd_chat_messages')
        .insert({
          gd_id: gdId,
          user_id: user?.id,
          message,
          parent_message_id: parentId || null
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      setNewMessage('');
      setReplyingTo(null);
      queryClient.invalidateQueries({ queryKey: ['gd-chat-messages', gdId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Pin/unpin message mutation
  const togglePinMutation = useMutation({
    mutationFn: async ({ messageId, isPinned }: { messageId: string; isPinned: boolean }) => {
      const { error } = await supabase
        .from('gd_chat_messages')
        .update({ is_pinned: !isPinned })
        .eq('id', messageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gd-chat-messages', gdId] });
    }
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('gd_chat_messages')
        .update({ 
          is_deleted: true, 
          deleted_by: user?.id,
          deleted_at: new Date().toISOString()
        })
        .eq('id', messageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gd-chat-messages', gdId] });
    }
  });

  // Real-time subscription
  useEffect(() => {
    if (!gdId) return;

    const channel = supabase
      .channel(`gd-chat-${gdId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gd_chat_messages',
          filter: `gd_id=eq.${gdId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['gd-chat-messages', gdId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gdId, queryClient]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set page title
  useEffect(() => {
    document.title = `GD Chat - ${gdDetails?.topic_name || 'Group Discussion'} - The Tomorrows Team`;
  }, [gdDetails]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate({ 
      message: newMessage.trim(),
      parentId: replyingTo || undefined
    });
  };

  const MessageComponent = ({ message, isReply = false }: { message: ChatMessage; isReply?: boolean }) => (
    <div className={`flex gap-3 ${isReply ? 'ml-8 mt-2' : 'mb-4'} ${message.is_pinned ? 'bg-accent/50 p-3 rounded-lg' : ''}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className="text-xs">
          {message.user_profile?.full_name?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">
            {message.user_profile?.full_name || 'Anonymous'}
          </span>
          {message.user_profile?.is_admin && (
            <Badge variant="secondary" className="text-xs">Admin</Badge>
          )}
          {message.is_pinned && (
            <Pin className="h-3 w-3 text-muted-foreground" />
          )}
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
        </div>
        
        <p className="text-sm text-foreground mb-2 break-words">{message.message}</p>
        
        <div className="flex items-center gap-2">
          {!isReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(message.id)}
              className="h-6 px-2 text-xs"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
          
          {isAdmin && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => togglePinMutation.mutate({ 
                  messageId: message.id, 
                  isPinned: message.is_pinned 
                })}
                className="h-6 px-2 text-xs"
              >
                <Pin className="h-3 w-3 mr-1" />
                {message.is_pinned ? 'Unpin' : 'Pin'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteMessageMutation.mutate(message.id)}
                className="h-6 px-2 text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </>
          )}
        </div>
        
        {message.replies && message.replies.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.replies.map((reply) => (
              <MessageComponent key={reply.id} message={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (!gdDetails) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">Loading...</p>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isRegistered && !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
                <p className="text-muted-foreground mb-4">
                  You must be registered for this Group Discussion to access the chat room.
                </p>
                <Link to="/dashboard">
                  <Button>Return to Dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{gdDetails.topic_name}</CardTitle>
                    <p className="text-muted-foreground mt-1">
                      {format(new Date(gdDetails.scheduled_date), 'PPP p')}
                    </p>
                  </div>
                  <Badge variant="outline">Chat Room</Badge>
                </div>
                {gdDetails.description && (
                  <p className="text-sm text-muted-foreground mt-2">{gdDetails.description}</p>
                )}
              </CardHeader>
            </Card>
          </div>

          {/* Welcome Banner */}
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-sm text-foreground">
                💬 This chat is for participants of this GD. Use it to prepare, reflect, or continue the conversation anytime.
              </p>
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Discussion</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full pr-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <MessageComponent key={message.id} message={message} />
                    ))}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message Input */}
          <Card>
            <CardContent className="p-4">
              {replyingTo && (
                <div className="flex items-center gap-2 mb-3 p-2 bg-muted rounded">
                  <Reply className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Replying to message</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(null)}
                    className="ml-auto h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
              )}
              
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default GDChat;