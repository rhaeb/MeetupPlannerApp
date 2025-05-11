import { supabase } from '../app/lib/supabase';

export async function getEventAttendees(eventId) {
  const { data, error } = await supabase
    .from('ATTEND')
    .select('*')
    .eq('EVENT_ID', eventId);
  if (error) throw error;
  return data;
}
