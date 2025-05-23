import { supabase } from "../lib/supabase"
import type { Friend, FriendRequest, Profile } from "../types"
import { notificationController } from "./notificationController"

export const friendController = {
  // Get all friends for a profile
  async getFriends(profId: string): Promise<{ error: any; data: { friends: Profile[] } | null }> {
    try {
      // Get all friend relationships where the user is either the requester or the requested
      const { data: friendData, error: friendError } = await supabase
        .from("friend")
        .select("friend_prof_id, profile:friend_prof_id(*)")
        .eq("prof_id", profId)

      if (friendError) throw friendError

      const { data: friendData2, error: friendError2 } = await supabase
        .from("friend")
        .select("prof_id, profile:prof_id(*)")
        .eq("friend_prof_id", profId)

      if (friendError2) throw friendError2

      // Combine and extract profiles
      const friends = [...friendData.map((f) => f.profile), ...friendData2.map((f) => f.profile)]

      return { data: { friends }, error: null }
    } catch (error) {
      console.error("Get friends error:", error)
      return { data: null, error }
    }
  },

  // Check if a friend request exists between two users
  async checkFriendRequestStatus(
    userProfId: string,
    otherProfId: string,
  ): Promise<{
    error: any
    data: { status: "none" | "friends" | "pending"; requestId?: string; direction?: "sent" | "received" } | null
  }> {
    try {
      // Check if they are friends
      const { data: friendsData } = await this.getFriends(userProfId)

      if (friendsData && friendsData.friends.some((f) => f.prof_id === otherProfId)) {
        return { data: { status: "friends" }, error: null }
      }

      // Check for sent request
      const { data: sentRequest, error: sentError } = await supabase
        .from("friend_request")
        .select("*")
        .eq("requester_id", userProfId)
        .eq("requested_id", otherProfId)
        .maybeSingle()

      if (sentError) throw sentError

      if (sentRequest) {
        return {
          data: {
            status: "pending",
            requestId: sentRequest.friend_req_id,
            direction: "sent",
          },
          error: null,
        }
      }

      // Check for received request
      const { data: receivedRequest, error: receivedError } = await supabase
        .from("friend_request")
        .select("*")
        .eq("requester_id", otherProfId)
        .eq("requested_id", userProfId)
        .maybeSingle()

      if (receivedError) throw receivedError

      if (receivedRequest) {
        return {
          data: {
            status: "pending",
            requestId: receivedRequest.friend_req_id,
            direction: "received",
          },
          error: null,
        }
      }

      // No relationship
      return { data: { status: "none" }, error: null }
    } catch (error) {
      console.error("Check friend request status error:", error)
      return { data: null, error }
    }
  },

  // Send friend request
  async sendFriendRequest(
    requesterId: string,
    requestedId: string,
  ): Promise<{ error: any; data: FriendRequest | null }> {
    try {
      // First check the status to avoid duplicate requests
      const { data: statusData, error: statusError } = await this.checkFriendRequestStatus(requesterId, requestedId)

      if (statusError) throw statusError

      if (statusData.status !== "none") {
        throw new Error(`Cannot send request: current status is ${statusData.status}`)
      }

      // Create friend request
      const { data, error } = await supabase
        .from("friend_request")
        .insert([{ requester_id: requesterId, requested_id: requestedId }])
        .select()
        .single()

      if (error) throw error

      // Get requester profile for notification
      const { data: requesterProfile, error: profileError } = await supabase
        .from("profile")
        .select("name")
        .eq("prof_id", requesterId)
        .single()

      if (profileError) throw profileError

      // Create notification for the requested user
      await notificationController.createNotification({
        title: "New Friend Request",
        content: `${requesterProfile.name} sent you a friend request`,
        date: new Date().toISOString(),
        prof_id: requestedId,
        event_id: null,
      })

      return { data, error: null }
    } catch (error) {
      console.error("Send friend request error:", error)
      return { data: null, error }
    }
  },

  // Get pending friend requests
  async getPendingRequests(
    profId: string,
  ): Promise<{ error: any; data: { sent: FriendRequest[]; received: FriendRequest[] } | null }> {
    try {
      // Get sent requests
      const { data: sentData, error: sentError } = await supabase
        .from("friend_request")
        .select("*, requester:requester_id(prof_id, name, photo), requested:requested_id(prof_id, name, photo)")
        .eq("requester_id", profId)

      if (sentError) throw sentError

      // Get received requests
      const { data: receivedData, error: receivedError } = await supabase
        .from("friend_request")
        .select("*, requester:requester_id(prof_id, name, photo), requested:requested_id(prof_id, name, photo)")
        .eq("requested_id", profId)

      if (receivedError) throw receivedError

      return {
        data: {
          sent: sentData,
          received: receivedData,
        },
        error: null,
      }
    } catch (error) {
      console.error("Get pending requests error:", error)
      return { data: null, error }
    }
  },

  // Accept friend request
  async acceptFriendRequest(requestId: string): Promise<{ error: any; data: Friend | null }> {
    try {
      // Get the request
      const { data: request, error: requestError } = await supabase
        .from("friend_request")
        .select("*, requester:requester_id(name), requested:requested_id(name)")
        .eq("friend_req_id", requestId)
        .single()

      if (requestError) throw requestError

      // Create friend relationship
      const { data: friendData, error: friendError } = await supabase
        .from("friend")
        .insert([
          {
            prof_id: request.requester_id,
            friend_prof_id: request.requested_id,
          },
        ])
        .select()
        .single()

      if (friendError) throw friendError

      // Delete the request
      const { error: deleteError } = await supabase.from("friend_request").delete().eq("friend_req_id", requestId)

      if (deleteError) throw deleteError

      // Create notification for the requester
      await notificationController.createNotification({
        title: "Friend Request Accepted",
        content: `${request.requested.name} accepted your friend request`,
        date: new Date().toISOString(),
        prof_id: request.requester_id,
        event_id: null,
      })

      return { data: friendData, error: null }
    } catch (error) {
      console.error("Accept friend request error:", error)
      return { data: null, error }
    }
  },

  // Reject friend request
  async rejectFriendRequest(requestId: string): Promise<{ error: any }> {
    try {
      // Get the request first to know who to notify
      const { data: request, error: getError } = await supabase
        .from("friend_request")
        .select("*")
        .eq("friend_req_id", requestId)
        .single()

      if (getError) throw getError

      // Delete the request
      const { error } = await supabase.from("friend_request").delete().eq("friend_req_id", requestId)

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error("Reject friend request error:", error)
      return { error }
    }
  },

  // Remove friend
  async removeFriend(profId: string, friendProfId: string): Promise<{ error: any }> {
    try {
      // Delete in both directions
      const { error: error1 } = await supabase
        .from("friend")
        .delete()
        .eq("prof_id", profId)
        .eq("friend_prof_id", friendProfId)

      if (error1) throw error1

      const { error: error2 } = await supabase
        .from("friend")
        .delete()
        .eq("prof_id", friendProfId)
        .eq("friend_prof_id", profId)

      if (error2) throw error2

      return { error: null }
    } catch (error) {
      console.error("Remove friend error:", error)
      return { error }
    }
  },

  // Subscribe to friend requests
  subscribeToFriendRequests(profId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`friend-requests-${profId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friend_request",
          filter: `requested_id=eq.${profId}`,
        },
        (payload) => {
          callback(payload)
        },
      )
      .subscribe()
  },

  // Subscribe to friends list changes
  subscribeToFriendChanges(profId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`friend-changes-${profId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friend",
          filter: `prof_id=eq.${profId}`,
        },
        (payload) => {
          callback(payload)
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friend",
          filter: `friend_prof_id=eq.${profId}`,
        },
        (payload) => {
          callback(payload)
        },
      )
      .subscribe()
  },
}
