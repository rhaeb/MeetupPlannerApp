import { supabase } from "../lib/supabase"
import type { Message } from "../types"

export const messageController = {
  // Send a message
  async sendMessage(
    messageData: Omit<Message, "message_id" | "created_at">,
  ): Promise<{ error: any; data: Message | null }> {
    try {
      const { data, error } = await supabase
        .from("message")
        .insert([
          {
            ...messageData,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error("Send message error:", error)
      return { data: null, error }
    }
  },

  // Get messages between two friends
  async getFriendMessages(currentUserId: string, friendId: string): Promise<{ error: any; data: Message[] | null }> {
    try {
      const { data, error } = await supabase
        .from("message")
        .select("*, sender:sender_id(prof_id, name, photo)")
        .or(
          `and(sender_id.eq.${currentUserId},friend_id.eq.${friendId}),and(sender_id.eq.${friendId},friend_id.eq.${currentUserId})`,
        )
        .is("event_id", null)
        .order("created_at", { ascending: true })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error("Get friend messages error:", error)
      return { data: null, error }
    }
  },

  // Get event messages
  async getEventMessages(eventId: string): Promise<{ error: any; data: Message[] | null }> {
    try {
      const { data, error } = await supabase
        .from("message")
        .select("*, sender:sender_id(prof_id, name, photo)")
        .eq("event_id", eventId)
        .is("friend_id", null)
        .order("created_at", { ascending: true })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error("Get event messages error:", error)
      return { data: null, error }
    }
  },

  // Delete a message
  async deleteMessage(messageId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase.from("message").delete().eq("message_id", messageId)

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error("Delete message error:", error)
      return { error }
    }
  },

  // Set up real-time messaging for friend conversations
  subscribeToFriendMessages(currentUserId: string, friendId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`friend-messages-${currentUserId}-${friendId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "message",
          filter: `friend_id=eq.${friendId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          // Only trigger callback if the message is relevant to this conversation
          if (
            (newMessage.sender_id === currentUserId && newMessage.friend_id === friendId) ||
            (newMessage.sender_id === friendId && newMessage.friend_id === currentUserId)
          ) {
            callback(newMessage)
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "message",
          filter: `friend_id=eq.${currentUserId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          // Only trigger callback if the message is from the friend we're chatting with
          if (newMessage.sender_id === friendId) {
            callback(newMessage)
          }
        },
      )
      .subscribe()
  },

  // Set up real-time event messaging
  subscribeToEventMessages(eventId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`event-messages-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "message",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          callback(payload.new as Message)
        },
      )
      .subscribe()
  },

  // Get latest message for each conversation (for messages list)
  async getLatestMessages(currentUserId: string): Promise<{ error: any; data: any[] | null }> {
    try {
      // Get latest friend messages
      const { data: friendMessages, error: friendError } = await supabase
        .from("message")
        .select("*, sender:sender_id(prof_id, name, photo), friend:friend_id(prof_id, name, photo)")
        .or(`sender_id.eq.${currentUserId},friend_id.eq.${currentUserId}`)
        .is("event_id", null)
        .order("created_at", { ascending: false })

      if (friendError) throw friendError

      // Get latest event messages
      const { data: eventMessages, error: eventError } = await supabase
        .from("message")
        .select("*, sender:sender_id(prof_id, name, photo), event:event_id(event_id, name, picture)")
        .not("event_id", "is", null)
        .order("created_at", { ascending: false })

      if (eventError) throw eventError

      // Process and combine messages
      const processedFriendMessages = friendMessages?.map((msg) => ({
        ...msg,
        type: "friend",
        chat_id: msg.sender_id === currentUserId ? msg.friend_id : msg.sender_id,
        chat_name: msg.sender_id === currentUserId ? msg.friend?.name : msg.sender?.name,
        chat_photo: msg.sender_id === currentUserId ? msg.friend?.photo : msg.sender?.photo,
      }))

      const processedEventMessages = eventMessages?.map((msg) => ({
        ...msg,
        type: "event",
        chat_id: msg.event_id,
        chat_name: msg.event?.name,
        chat_photo: msg.event?.picture,
      }))

      const allMessages = [...(processedFriendMessages || []), ...(processedEventMessages || [])]

      // Group by chat and get latest message for each
      const latestMessages = allMessages.reduce(
        (acc, msg) => {
          const key = `${msg.type}-${msg.chat_id}`
          if (!acc[key] || new Date(msg.created_at) > new Date(acc[key].created_at)) {
            acc[key] = msg
          }
          return acc
        },
        {} as Record<string, any>,
      )

      return { data: Object.values(latestMessages), error: null }
    } catch (error) {
      console.error("Get latest messages error:", error)
      return { data: null, error }
    }
  },
}
