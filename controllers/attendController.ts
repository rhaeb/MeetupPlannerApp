import { supabase } from '../lib/supabase';

export async function getEventAttendees(eventId) {
  const { data, error } = await supabase
    .from('ATTEND')
    .select('*, profile:prof_id (prof_id, name, photo)')
    .eq('EVENT_ID', eventId);

  if (error) throw error;
  return data;
}
