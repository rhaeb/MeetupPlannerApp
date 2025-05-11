import { supabase } from '../app/lib/supabase';
import { Message } from '../types';

export const messageController = {
  // Send a message
  async sendMessage(messageData: Omit<Message, 'message_id' | 'created_at'>): Promise<{ error: any; data: Message | null }> {
    try {
      const { data, error } = await supabase
        .from('message')
        .insert([{
          ...messageData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Send message error:', error);
      return { data: null, error };
    }
  },

  // Get messages between friends
  async getFriendMessages(friendId: string): Promise<{ error: any; data: Message[] | null }> {
    try {
      const { data, error } = await supabase
        .from('message')
        .select('*')
        .eq('friend_id', friendId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Get friend messages error:', error);
      return { data: null, error };
    }
  },

  // Get event messages
  async getEventMessages(eventId: string): Promise<{ error: any; data: Message[] | null }> {
    try {
      const { data, error } = await supabase
        .from('message')
        .select('*, sender:sender_id(prof_id, name, photo)')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Get event messages error:', error);
      return { data: null, error };
    }
  },

  // Delete a message
  async deleteMessage(messageId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('message')
        .delete()
        .eq('message_id', messageId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Delete message error:', error);
      return { error };
    }
  },

  // Set up real-time messaging
  subscribeToFriendMessages(friendId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`friend-messages-${friendId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'message',
        filter: `friend_id=eq.${friendId}`
      }, (payload) => {
        callback(payload.new as Message);
      })
      .subscribe();
  },

  // Set up real-time event messaging
  subscribeToEventMessages(eventId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`event-messages-${eventId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'message',
        filter: `event_id=eq.${eventId}`
      }, (payload) => {
        callback(payload.new as Message);
      })
      .subscribe();
  },
};