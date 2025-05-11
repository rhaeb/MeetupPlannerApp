import { supabase } from '../app/lib/supabase';

export async function getAnswers(pollId) {
  const { data, error } = await supabase
    .from('ANSWER')
    .select('*')
    .eq('POLL_ID', pollId);
  if (error) throw error;
  return data;
}
