"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../hooks/useAuth"
import { messageController } from "../../controllers/messageController"
import { profileController } from "../../controllers/profileController"
import { eventController } from "../../controllers/eventController"
import { useProfile } from "../../contexts/ProfileContext"
import type { Message, Profile, Event } from "../../types"

interface ChatMessage extends Message {
  sender?: Profile
}

export default function ChatScreen() {
  const router = useRouter()
  const { id, type = "friend" } = useLocalSearchParams() // type can be 'friend' or 'event'
  const { profile, loading } = useProfile() // <-- use ProfileContext

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [chatInfo, setChatInfo] = useState<Profile | Event | null>(null)
  const [isEventChat, setIsEventChat] = useState(false)
  const [sending, setSending] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const [eventInfo, setEventInfo] = useState(null)

  const flatListRef = useRef<FlatList>(null)
  const subscriptionRef = useRef<any>(null)

  // Add a safety timeout to prevent infinite loading
  useEffect(() => {
    if (loading && !loadingTimeout) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true)
        if (loading) {
          Alert.alert("Timeout", "Failed to load chat. Please check your connection and try again.")
        }
      }, 10000) // 10 seconds timeout

      return () => clearTimeout(timer)
    }
  }, [loading, loadingTimeout])

  useEffect(() => {
    const stringId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : null

    if (!stringId) {
      return
    }

    if (!profile) {
      console.error("ChatScreen: No currentUserProfile found from useAuth.")
      return
    }

    console.log("Setting up chat with ID:", stringId, "Type:", type)
    setIsEventChat(type === "event")
    fetchChatInfo(stringId)
    fetchMessages(stringId)
    setupRealtimeSubscription(stringId)

    // Fix: Proper cleanup function that doesn't try to call methods directly
    return () => {
      if (subscriptionRef.current) {
        try {
          // Try to unsubscribe if the method exists
          if (typeof subscriptionRef.current.unsubscribe === "function") {
            subscriptionRef.current.unsubscribe()
          }
          // Don't try to call destroy() as it doesn't exist
        } catch (error) {
          console.error("Error cleaning up subscription:", error)
        }
      }
    }
  }, [id, type, profile])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages])

  useEffect(() => {
    if (type === "event" && id) {
      eventController.getEventById(id).then(({ data }) => {
        setEventInfo(data)
      })
    }
  }, [type, id])

  // --- Fetch chat info (event or friend) ---
  const fetchChatInfo = async (chatId: string) => {
    try {
      if (type === "event") {
        console.log("Fetching event info for event_id:", chatId)
        const { data, error } = await eventController.getEventById(chatId)
        if (error) {
          console.error("Error fetching event:", error)
          Alert.alert("Error", "Failed to load event information")
        } else {
          console.log("Fetched event info:", data)
          setChatInfo(data)
        }
      } else {
        console.log("Fetching friend profile for prof_id:", chatId)
        const { data, error } = await profileController.getProfileById(chatId)
        if (error) {
          console.error("Error fetching profile:", error)
          Alert.alert("Error", "Failed to load profile information")
        } else {
          console.log("Fetched friend profile:", data)
          setChatInfo(data)
        }
      }
    } catch (error) {
      console.error("Error in fetchChatInfo:", error)
    } finally {
      setLoading(false)
    }
  }

  // --- Fetch messages ---
  const fetchMessages = async (chatId: string) => {
    if (!profile) {
      console.warn("No profile loaded, skipping fetchMessages")
      return
    }

    try {
      let messagesData: ChatMessage[] = []

      if (type === "event") {
        console.log("Fetching event messages for event_id:", chatId)
        const { data, error } = await messageController.getEventMessages(chatId)
        if (error) {
          console.error("Error fetching event messages:", error)
        } else if (data) {
          console.log("Fetched event messages:", data)
          messagesData = data
        }
      } else {
        const friendId = Number(chatId)
        const myId = Number(profile.prof_id)
        console.log("Fetching friend messages for", myId, friendId)
        const { data, error } = await messageController.getFriendMessages(myId, friendId)
        if (error && error.code !== "PGRST116" && error.message !== "No messages found") {
          console.error("Error fetching friend messages:", error)
        } else if (data) {
          console.log("Fetched friend messages:", data)
          messagesData = data
        }
      }

      const messagesWithSenders = await Promise.all(
        messagesData.map(async (msg) => {
          if (msg.sender) return msg
          return await fetchSenderInfo(msg)
        }),
      )

      setMessages(messagesWithSenders)
    } catch (error) {
      console.error("Error in fetchMessages:", error)
      Alert.alert("Error", "An unexpected error occurred")
    }
  }

  const setupRealtimeSubscription = (chatId: string | number) => {
    if (type === "event") {
      subscriptionRef.current = messageController.subscribeToEventMessages(chatId, (newMessage) => {
        fetchSenderInfo(newMessage).then((messageWithSender) => {
          setMessages((prev) => [...prev, messageWithSender])
        })
      })
    } else {
      subscriptionRef.current = messageController.subscribeToFriendMessages(
        profile.prof_id,
        chatId,
        (newMessage) => {
          if (
            (newMessage.sender_id == profile.prof_id && newMessage.friend_id == chatId) ||
            (newMessage.sender_id == chatId && newMessage.friend_id == profile.prof_id)
          ) {
            fetchSenderInfo(newMessage).then((messageWithSender) => {
              setMessages((prev) => [...prev, messageWithSender])
            })
          }
        }
      )
    }
  }

  const fetchSenderInfo = async (message: Message): Promise<ChatMessage> => {
    try {
      const { data: senderProfile } = await profileController.getProfileById(message.sender_id)
      return {
        ...message,
        sender: senderProfile,
      }
    } catch (error) {
      console.error("Error fetching sender info:", error)
      return message
    }
  }

  // --- Send message ---
  const sendMessage = async () => {
    const stringId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : null

    if (!newMessage.trim() || !profile || !stringId || sending) {
      return
    }

    try {
      setSending(true)
      const messageData = {
        message: newMessage.trim(),
        sender_id: profile.prof_id,
        friend_id: type === "friend" ? stringId : null,
        event_id: type === "event" ? stringId : null,
      }
      console.log("Sending message:", messageData)
      const { data, error } = await messageController.sendMessage(messageData)

      if (error) {
        console.error("Error sending message:", error)
        Alert.alert("Error", "Failed to send message: " + (error.message || JSON.stringify(error)))
      } else {
        console.log("Message sent:", data)
        setNewMessage("")
        setMessages((prev) => [
          ...prev,
          {
            ...messageData,
            message_id: data?.message_id || Math.random().toString(),
            created_at: new Date().toISOString(),
            sender: profile,
          },
        ])
      }
    } catch (error) {
      console.error("Error in sendMessage:", error)
      Alert.alert("Error", "An unexpected error occurred")
    } finally {
      setSending(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  }

  const isMyMessage = (message: ChatMessage) => {
    return message.sender_id === profile?.prof_id
  }

  const getMessageSenderName = (message: ChatMessage) => {
    if (isMyMessage(message)) return "You"
    return message.sender?.name || "Unknown"
  }

  const getAvatarUri = (profile?: Profile) => {
    return (
      profile?.photo ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || "User")}&background=random`
    )
  }

  const getChatTitle = () => {
    if (type === "event" && chatInfo) {
      return (chatInfo as Event).name
    } else if (type === "friend" && chatInfo) {
      return (chatInfo as Profile).name
    }
    return "Chat"
  }

  const getChatSubtitle = () => {
    if (type === "event" && chatInfo) {
      // Get attendee count or show "Event Chat"
      return "Event Chat"
    } else if (type === "friend" && chatInfo) {
      return "Online" // You could implement online status later
    }
    return ""
  }

  const getChatAvatar = () => {
    if (type === "event" && chatInfo) {
      return (chatInfo as Event).picture || "/placeholder.svg?height=40&width=40"
    } else if (type === "friend" && chatInfo) {
      return getAvatarUri(chatInfo as Profile)
    }
    return "/placeholder.svg?height=40&width=40"
  }

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = isMyMessage(item)
    const showSenderName = type === "event" && !isMe

    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.otherMessage]}>
        {!isMe && type === "event" && (
          <Image source={{ uri: getAvatarUri(item.sender) }} style={styles.messageAvatar} />
        )}
        <View style={[styles.messageBubble, isMe ? styles.myMessageBubble : styles.otherMessageBubble]}>
          {showSenderName && <Text style={styles.senderName}>{getMessageSenderName(item)}</Text>}
          <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
            {item.message}
          </Text>
          <Text style={[styles.messageTime, isMe ? styles.myMessageTime : styles.otherMessageTime]}>
            {formatTimestamp(item.created_at)}
          </Text>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </SafeAreaView>
    )
  }

  console.log("chatInfo in header:", chatInfo)

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerProfile}>
          <Image
            source={{
              uri:
                type === "event"
                  ? (chatInfo as Event)?.picture || "https://ui-avatars.com/api/?name=Event&background=random"
                  : getAvatarUri(chatInfo as Profile),
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.headerName}>
              {type === "event"
                ? (chatInfo as Event)?.name || "Event Chat"
                : (chatInfo as Profile)?.name || "Chat"}
            </Text>
          </View>
        </View>
      </View>

      {type === "event" && eventInfo && (
        <View style={{ flexDirection: "row", alignItems: "center", padding: 15 }}>
          <Image
            source={{
              uri: eventInfo.picture || "https://ui-avatars.com/api/?name=Event&background=random",
            }}
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
          />
          <Text style={{ fontWeight: "bold", fontSize: 18 }}>{eventInfo.name}</Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.message_id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        style={styles.inputContainer}
      >
        {/* <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="add-circle-outline" size={24} color="#4CAF50" />
        </TouchableOpacity> */}
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={20} color="#fff" />}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 5,
  },
  headerProfile: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#e0e0e0",
  },
  headerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  // headerStatus: {
  //   fontSize: 12,
  //   color: "#4CAF50",
  // },
  moreButton: {
    padding: 5,
  },
  messagesList: {
    padding: 15,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 15,
    maxWidth: "85%",
    flexDirection: "row",
    alignItems: "flex-end",
  },
  myMessage: {
    alignSelf: "flex-end",
  },
  otherMessage: {
    alignSelf: "flex-start",
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 2,
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flex: 1,
  },
  myMessageBubble: {
    backgroundColor: "#4CAF50",
  },
  otherMessageBubble: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 5,
  },
  myMessageText: {
    color: "#fff",
  },
  otherMessageText: {
    color: "#333",
  },
  messageTime: {
    fontSize: 11,
    alignSelf: "flex-end",
  },
  myMessageTime: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  otherMessageTime: {
    color: "#999",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  attachButton: {
    padding: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  input: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    color: "#333",
    textAlignVertical: "center",
  },
  sendButton: {
    backgroundColor: "#4CAF50",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
})
