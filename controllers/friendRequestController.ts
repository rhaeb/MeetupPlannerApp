import { supabase } from '../lib/supabase';

export async function getFriendRequests(userId) {
  const { data, error } = await supabase
    .from('FRIEND_REQUEST')
    .select('*')
    .or(`REQUESTER_ID.eq.${userId},REQUESTED_ID.eq.${userId}`);
  if (error) throw error;
  return data;
}
