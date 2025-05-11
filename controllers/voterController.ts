import { supabase } from '../app/lib/supabase';

export async function getVotes(answerId) {
  const { data, error } = await supabase
    .from('VOTER')
    .select('*')
    .eq('ANSWER_ID', answerId);
  if (error) throw error;
  return data;
}
