import { supabase } from '../app/lib/supabase';
import { Event, Attend, Profile } from '../types';

export const eventController = {
  // Create a new event
  async createEvent(eventData: Omit<Event, 'event_id'>): Promise<{ error: any; data: Event | null }> {
    try {
      const { data, error } = await supabase
        .from('event')
        .insert([eventData])
        .select()
        .single();

      if (error) throw error;

      // Automatically add the host as an attendee
      await supabase
        .from('attend')
        .insert([{
          prof_id: eventData.hoster_id,
          event_id: data.event_id,
          status: 'going'
        }]);

      return { data, error: null };
    } catch (error) {
      console.error('Create event error:', error);
      return { data: null, error };
    }
  },

  // Get event by ID
  async getEventById(eventId: string): Promise<{ error: any; data: Event | null }> {
    try {
      const { data, error } = await supabase
        .from('event')
        .select('*, profile:hoster_id(*)')
        .eq('event_id', eventId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Get event error:', error);
      return { data: null, error };
    }
  },

  // Update event
  async updateEvent(eventId: string, updates: Partial<Event>): Promise<{ error: any; data: Event | null }> {
    try {
      const { data, error } = await supabase
        .from('event')
        .update(updates)
        .eq('event_id', eventId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Update event error:', error);
      return { data: null, error };
    }
  },

  // Delete event
  async deleteEvent(eventId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('event')
        .delete()
        .eq('event_id', eventId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Delete event error:', error);
      return { error };
    }
  },

  // Get events hosted by a user
  async getHostedEvents(profId: string): Promise<{ error: any; data: Event[] | null }> {
    try {
      const { data, error } = await supabase
        .from('event')
        .select('*')
        .eq('hoster_id', profId)
        .order('date_start', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Get hosted events error:', error);
      return { data: null, error };
    }
  },

  // Get events a user is attending
  async getAttendingEvents(profId: string): Promise<{ error: any; data: Event[] | null }> {
    try {
      const { data, error } = await supabase
        .from('attend')
        .select(`
          event:event_id (
            *,
            date_start
          )
        `)
        .eq('prof_id', profId);

      if (error) throw error;

      const events = data.map(item => item.event).sort((a, b) => {
        return new Date(a.date_start).getTime() - new Date(b.date_start).getTime();
      });

      return { data: events, error: null };
    } catch (error) {
      console.error('Get attending events error:', error);
      return { data: null, error };
    }
  },

  // Get upcoming events
  async getUpcomingEvents(profId: string): Promise<{ error: any; data: Event[] | null }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('attend')
        .select('event:event_id(*)')
        .eq('prof_id', profId)
        .eq('status', 'going')
        .gte('event.date_start', today)
        .order('event.date_start', { ascending: true });

      if (error) throw error;

      // Extract events from the nested structure
      const events = data.map(item => item.event);

      return { data: events, error: null };
    } catch (error) {
      console.error('Get upcoming events error:', error);
      return { data: null, error };
    }
  },

  // Upload event picture
  async uploadEventPicture(eventId: string, pictureUri: string): Promise<{ error: any; data: { url: string } | null }> {
    try {
      // Convert URI to blob
      const response = await fetch(pictureUri);
      const blob = await response.blob();
      
      const fileName = `event-${eventId}-${Date.now()}`;
      const filePath = `events/${fileName}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('event-pictures')
        .upload(filePath, blob);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase
        .storage
        .from('event-pictures')
        .getPublicUrl(filePath);
      
      // Update event with new picture URL
      const { error: updateError } = await supabase
        .from('event')
        .update({ picture: urlData.publicUrl })
        .eq('event_id', eventId);
      
      if (updateError) throw updateError;
      
      return { data: { url: urlData.publicUrl }, error: null };
    } catch (error) {
      console.error('Upload event picture error:', error);
      return { data: null, error };
    }
  },

  // RSVP to an event
  async respondToEvent(profId: string, eventId: string, status: 'going' | 'maybe' | 'not_going'): Promise<{ error: any; data: Attend | null }> {
    try {
      // Check if already responded
      const { data: existingResponse, error: checkError } = await supabase
        .from('attend')
        .select('*')
        .eq('prof_id', profId)
        .eq('event_id', eventId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingResponse) {
        // Update existing response
        const { data, error } = await supabase
          .from('attend')
          .update({ status })
          .eq('prof_id', profId)
          .eq('event_id', eventId)
          .select()
          .single();

        if (error) throw error;
        return { data, error: null };
      } else {
        // Create new response
        const { data, error } = await supabase
          .from('attend')
          .insert([{
            prof_id: profId,
            event_id: eventId,
            status
          }])
          .select()
          .single();

        if (error) throw error;
        return { data, error: null };
      }
    } catch (error) {
      console.error('Respond to event error:', error);
      return { data: null, error };
    }
  },

  // Get attendees for an event
  async getEventAttendees(eventId: string): Promise<{ error: any; data: { attendees: Profile[], maybes: Profile[], notGoing: Profile[] } | null }> {
    try {
      const { data, error } = await supabase
        .from('attend')
        .select('status, profile:prof_id(*)')
        .eq('event_id', eventId);

      if (error) throw error;

      // Group by status
      const attendees = data.filter(a => a.status === 'going').map(a => a.profile);
      const maybes = data.filter(a => a.status === 'maybe').map(a => a.profile);
      const notGoing = data.filter(a => a.status === 'not_going').map(a => a.profile);

      return { 
        data: { 
          attendees, 
          maybes, 
          notGoing 
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Get event attendees error:', error);
      return { data: null, error };
    }
  },

  // Rate an event
  async rateEvent(eventId: string, rating: number): Promise<{ error: any; data: Event | null }> {
    try {
      const { data, error } = await supabase
        .from('event')
        .update({ rating })
        .eq('event_id', eventId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Rate event error:', error);
      return { data: null, error };
    }
  },
};