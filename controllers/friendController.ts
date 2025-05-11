import { supabase } from '../app/lib/supabase';
import { Friend, FriendRequest, Profile } from '../types';

export const friendController = {
  // Get all friends for a profile
  async getFriends(profId: string): Promise<{ error: any; data: { friends: Profile[] } | null }> {
    try {
      // Get all friend relationships where the user is either the requester or the requested
      const { data: friendData, error: friendError } = await supabase
        .from('friend')
        .select('friend_prof_id, profile:friend_prof_id(*)')
        .eq('prof_id', profId);

      if (friendError) throw friendError;

      const { data: friendData2, error: friendError2 } = await supabase
        .from('friend')
        .select('prof_id, profile:prof_id(*)')
        .eq('friend_prof_id', profId);

      if (friendError2) throw friendError2;

      // Combine and extract profiles
      const friends = [
        ...friendData.map(f => f.profile),
        ...friendData2.map(f => f.profile)
      ];

      return { data: { friends }, error: null };
    } catch (error) {
      console.error('Get friends error:', error);
      return { data: null, error };
    }
  },

  // Send friend request
  async sendFriendRequest(requesterId: string, requestedId: string): Promise<{ error: any; data: FriendRequest | null }> {
    try {
      // Check if request already exists
      const { data: existingRequest, error: checkError } = await supabase
        .from('friend_request')
        .select('*')
        .or(`requester_id.eq.${requesterId},requested_id.eq.${requesterId}`)
        .or(`requester_id.eq.${requestedId},requested_id.eq.${requestedId}`)
        .maybeSingle();

      if (checkError) throw checkError;
      
      if (existingRequest) {
        throw new Error('A friend request already exists between these users');
      }

      // Check if already friends
      const { data: existingFriend, error: checkFriendError } = await supabase
        .from('friend')
        .select('*')
        .or(`prof_id.eq.${requesterId},friend_prof_id.eq.${requesterId}`)
        .or(`prof_id.eq.${requestedId},friend_prof_id.eq.${requestedId}`)
        .maybeSingle();

      if (checkFriendError) throw checkFriendError;
      
      if (existingFriend) {
        throw new Error('These users are already friends');
      }

      // Create friend request
      const { data, error } = await supabase
        .from('friend_request')
        .insert([{ requester_id: requesterId, requested_id: requestedId }])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Send friend request error:', error);
      return { data: null, error };
    }
  },

  // Get pending friend requests
  async getPendingRequests(profId: string): Promise<{ error: any; data: { sent: FriendRequest[], received: FriendRequest[] } | null }> {
    try {
      // Get sent requests
      const { data: sentData, error: sentError } = await supabase
        .from('friend_request')
        .select('*, requester:requester_id(prof_id, name), requested:requested_id(prof_id, name)')
        .eq('requester_id', profId);

      if (sentError) throw sentError;

      // Get received requests
      const { data: receivedData, error: receivedError } = await supabase
        .from('friend_request')
        .select('*, requester:requester_id(prof_id, name), requested:requested_id(prof_id, name)')
        .eq('requested_id', profId);

      if (receivedError) throw receivedError;

      return { 
        data: { 
          sent: sentData, 
          received: receivedData 
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Get pending requests error:', error);
      return { data: null, error };
    }
  },

  // Accept friend request
  async acceptFriendRequest(requestId: string): Promise<{ error: any; data: Friend | null }> {
    try {
      // Get the request
      const { data: request, error: requestError } = await supabase
        .from('friend_request')
        .select('*')
        .eq('friend_req_id', requestId)
        .single();

      if (requestError) throw requestError;

      // Create friend relationship
      const { data: friendData, error: friendError } = await supabase
        .from('friend')
        .insert([{ 
          prof_id: request.requester_id, 
          friend_prof_id: request.requested_id 
        }])
        .select()
        .single();

      if (friendError) throw friendError;

      // Delete the request
      const { error: deleteError } = await supabase
        .from('friend_request')
        .delete()
        .eq('friend_req_id', requestId);

      if (deleteError) throw deleteError;

      return { data: friendData, error: null };
    } catch (error) {
      console.error('Accept friend request error:', error);
      return { data: null, error };
    }
  },

  // Reject friend request
  async rejectFriendRequest(requestId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('friend_request')
        .delete()
        .eq('friend_req_id', requestId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Reject friend request error:', error);
      return { error };
    }
  },

  // Remove friend
  async removeFriend(profId: string, friendProfId: string): Promise<{ error: any }> {
    try {
      // Delete in both directions
      const { error: error1 } = await supabase
        .from('friend')
        .delete()
        .eq('prof_id', profId)
        .eq('friend_prof_id', friendProfId);

      if (error1) throw error1;

      const { error: error2 } = await supabase
        .from('friend')
        .delete()
        .eq('prof_id', friendProfId)
        .eq('friend_prof_id', profId);

      if (error2) throw error2;

      return { error: null };
    } catch (error) {
      console.error('Remove friend error:', error);
      return { error };
    }
  },
};