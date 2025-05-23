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
import type { Message, Profile, Event } from "../../types"

interface ChatMessage extends Message {
  sender?: Profile
}

export default function ChatScreen() {
  const router = useRouter()
  const { id, type = "friend" } = useLocalSearchParams() // type can be 'friend' or 'event'
  const { profile: currentUserProfile } = useAuth()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [chatInfo, setChatInfo] = useState<Profile | Event | null>(null)
  const [isEventChat, setIsEventChat] = useState(false)
  const [sending, setSending] = useState(false)

  const flatListRef = useRef<FlatList>(null)
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    if (id && currentUserProfile) {
      setIsEventChat(type === "event")
      fetchChatInfo()
      fetchMessages()
      setupRealtimeSubscription()
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [id, type, currentUserProfile])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages])

  const fetchChatInfo = async () => {
    if (!id) return

    try {
      if (type === "event") {
        const { data, error } = await eventController.getEventById(id as string)
        if (error) {
          console.error("Error fetching event:", error)
          Alert.alert("Error", "Failed to load event information")
        } else {
          setChatInfo(data)
        }
      } else {
        const { data, error } = await profileController.getProfileById(id as string)
        if (error) {
          console.error("Error fetching profile:", error)
          Alert.alert("Error", "Failed to load profile information")
        } else {
          setChatInfo(data)
        }
      }
    } catch (error) {
      console.error("Error in fetchChatInfo:", error)
    }
  }

  const fetchMessages = async () => {
    if (!id || !currentUserProfile) return

    try {
      setLoading(true)
      let messagesData: ChatMessage[] = []

      if (type === "event") {
        const { data, error } = await messageController.getEventMessages(id as string)
        if (error) {
          console.error("Error fetching event messages:", error)
          Alert.alert("Error", "Failed to load messages")
        } else if (data) {
          messagesData = data
        }
      } else {
        // For friend messages, we need to get messages where either user is sender/receiver
        const { data, error } = await messageController.getFriendMessages(currentUserProfile.prof_id, id as string)
        if (error) {
          console.error("Error fetching friend messages:", error)
          Alert.alert("Error", "Failed to load messages")
        } else if (data) {
          // Filter messages between current user and the friend
          messagesData = data.filter(
            (msg) =>
              (msg.sender_id === currentUserProfile.prof_id && msg.friend_id === id) ||
              (msg.sender_id === id && msg.friend_id === currentUserProfile.prof_id),
          )
        }
      }

      setMessages(messagesData)
    } catch (error) {
      console.error("Error in fetchMessages:", error)
      Alert.alert("Error", "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    if (!id) return

    if (type === "event") {
      subscriptionRef.current = messageController.subscribeToEventMessages(id as string, (newMessage) => {
        // Fetch sender info for the new message
        fetchSenderInfo(newMessage).then((messageWithSender) => {
          setMessages((prev) => [...prev, messageWithSender])
        })
      })
    } else {
      subscriptionRef.current = messageController.subscribeToFriendMessages(id as string, (newMessage) => {
        // Only add message if it's relevant to this conversation
        if (
          (newMessage.sender_id === currentUserProfile?.prof_id && newMessage.friend_id === id) ||
          (newMessage.sender_id === id && newMessage.friend_id === currentUserProfile?.prof_id)
        ) {
          fetchSenderInfo(newMessage).then((messageWithSender) => {
            setMessages((prev) => [...prev, messageWithSender])
          })
        }
      })
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

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserProfile || !id || sending) return

    try {
      setSending(true)
      const messageData = {
        message: newMessage.trim(),
        sender_id: currentUserProfile.prof_id,
        friend_id: type === "friend" ? (id as string) : null,
        event_id: type === "event" ? (id as string) : null,
      }

      const { error } = await messageController.sendMessage(messageData)

      if (error) {
        console.error("Error sending message:", error)
        Alert.alert("Error", "Failed to send message")
      } else {
        setNewMessage("")
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
    return message.sender_id === currentUserProfile?.prof_id
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerProfile}>
          <Image source={{ uri: getChatAvatar() }} style={styles.avatar} />
          <View>
            <Text style={styles.headerName}>{getChatTitle()}</Text>
            <Text style={styles.headerStatus}>{getChatSubtitle()}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>

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
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="add-circle-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
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
  headerStatus: {
    fontSize: 12,
    color: "#4CAF50",
  },
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
