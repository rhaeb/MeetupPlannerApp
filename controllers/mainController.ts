import { supabase } from '../lib/supabase';
import { eventController } from './eventController';
import { notificationController } from './notificationController';
import { messageController } from './messageController';
import { profileController } from './profileController';
import { Event, Profile } from '../types';

export const mainController = {
  // Get dashboard data for a user
  async getDashboardData(profId: string): Promise<{ 
    error: any; 
    data: { 
      upcomingEvents: Event[], 
      friendCount: number,
      notifications: any[],
      profile: Profile | null
    } | null 
  }> {
    try {
      // Get profile
      const { data: profile, error: profileError } = await profileController.getProfileById(profId);
      if (profileError) throw profileError;

      // Get upcoming events
      const { data: upcomingEvents, error: eventsError } = await eventController.getUpcomingEvents(profId);
      if (eventsError) throw eventsError;

      // Get friend count
      const { data: friendData, error: friendError } = await supabase
        .from('friend')
        .select('friend_id')
        .or(`prof_id.eq.${profId},friend_prof_id.eq.${profId}`);
      if (friendError) throw friendError;

      // Get notifications
      const { data: notifications, error: notifError } = await notificationController.getUserNotifications(profId);
      if (notifError) throw notifError;

      return { 
        data: { 
          upcomingEvents: upcomingEvents || [],
          friendCount: friendData.length,
          notifications: notifications || [],
          profile
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Get dashboard data error:', error);
      return { data: null, error };
    }
  },

  // Create an event and notify friends
  async createEventAndNotifyFriends(
    eventData: Omit<Event, 'event_id'>, 
    friendIds: string[]
  ): Promise<{ error: any; data: { event: Event | null } }> {
    try {
      // Create event
      const { data: event, error: eventError } = await eventController.createEvent(eventData);
      if (eventError) throw eventError;

      // Send notifications to friends
      for (const friendId of friendIds) {
        await notificationController.createNotification({
          title: 'New Event Invitation',
          content: `You've been invited to ${eventData.name}`,
          date: new Date().toISOString(),
          event_id: event.event_id,
          prof_id: friendId
        });
      }

      return { data: { event }, error: null };
    } catch (error) {
      console.error('Create event and notify friends error:', error);
      return { data: { event: null }, error };
    }
  },

  // Search across users, events, and messages
  async search(query: string, profId: string): Promise<{ 
    error: any; 
    data: { 
      profiles: Profile[], 
      events: Event[], 
      messages: any[] 
    } | null 
  }> {
    try {
      // Search profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profile') // Correct table name
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(5);
      if (profileError) throw profileError;

      // Search events
      const { data: events, error: eventError } = await supabase
        .from('event')
        .select('*')
        .or(`name.ilike.%${query}%, description.ilike.%${query}%`)
        .limit(5);
      if (eventError) throw eventError;

      // Search messages
      const { data: messages, error: messageError } = await supabase
        .from('message')
        .select('*, sender:sender_id(name)')
        .ilike('message', `%${query}%`)
        .limit(5);
      if (messageError) throw messageError;

      return { 
        data: { 
          profiles: profiles || [],
          events: events || [],
          messages: messages || []
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Search error:', error);
      return { data: null, error };
    }
  },

  // Set up real-time subscriptions for a user
  setupRealtimeSubscriptions(profId: string, callbacks: {
    onNotification?: (notification: any) => void,
    onFriendRequest?: (request: any) => void,
    onEventUpdate?: (event: any) => void
  }) {
    const channels = [];

    // Notifications subscription
    if (callbacks.onNotification) {
      const notificationChannel = supabase
        .channel(`notifications-${profId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notification',
          filter: `prof_id=eq.${profId}`
        }, (payload) => {
          callbacks.onNotification && callbacks.onNotification(payload.new);
        })
        .subscribe();
      
      channels.push(notificationChannel);
    }

    // Friend requests subscription
    if (callbacks.onFriendRequest) {
      const friendRequestChannel = supabase
        .channel(`friend-requests-${profId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'friend_request',
          filter: `requested_id=eq.${profId}`
        }, (payload) => {
          callbacks.onFriendRequest && callbacks.onFriendRequest(payload.new);
        })
        .subscribe();
      
      channels.push(friendRequestChannel);
    }

    // Event updates subscription
    if (callbacks.onEventUpdate) {
      const eventUpdateChannel = supabase
        .channel(`event-updates-${profId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'event'
        }, async (payload) => {
          // Check if user is attending this event
          const { data } = await supabase
            .from('attend')
            .select('*')
            .eq('prof_id', profId)
            .eq('event_id', payload.new.event_id)
            .single();
            
          if (data) {
            callbacks.onEventUpdate && callbacks.onEventUpdate(payload.new);
          }
        })
        .subscribe();
      
      channels.push(eventUpdateChannel);
    }

    // Return a function to unsubscribe from all channels
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }
};