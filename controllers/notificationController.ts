import { supabase } from '../app/lib/supabase';
import { Notification } from '../types';

export const notificationController = {
  // Create a notification
  async createNotification(notificationData: Omit<Notification, 'notif_id'>): Promise<{ error: any; data: Notification | null }> {
    try {
      const { data, error } = await supabase
        .from('notification')
        .insert([notificationData])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Create notification error:', error);
      return { data: null, error };
    }
  },

  // Get notifications for a user
  async getUserNotifications(profId: string): Promise<{ error: any; data: Notification[] | null }> {
    try {
      const { data, error } = await supabase
        .from('notification')
        .select('*')
        .eq('prof_id', profId)
        .order('date', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Get user notifications error:', error);
      return { data: null, error };
    }
  },

  // Mark notification as read (by deleting it)
  async deleteNotification(notifId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('notification')
        .delete()
        .eq('notif_id', notifId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Delete notification error:', error);
      return { error };
    }
  },

  // Create event notification for all attendees
  async notifyEventAttendees(eventId: string, title: string, content: string): Promise<{ error: any; data: { count: number } | null }> {
    try {
      // Get all attendees
      const { data: attendees, error: attendeesError } = await supabase
        .from('attend')
        .select('prof_id')
        .eq('event_id', eventId)
        .eq('status', 'going');

      if (attendeesError) throw attendeesError;

      // Create notifications for each attendee
      const notifications = attendees.map(attendee => ({
        title,
        content,
        date: new Date().toISOString(),
        event_id: eventId,
        prof_id: attendee.prof_id
      }));

      const { data, error } = await supabase
        .from('notification')
        .insert(notifications);

      if (error) throw error;

      return { data: { count: attendees.length }, error: null };
    } catch (error) {
      console.error('Notify event attendees error:', error);
      return { data: null, error };
    }
  },
};