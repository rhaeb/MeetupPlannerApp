"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  TextInput,
  Image,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../../hooks/useAuth"
import { supabase } from "../../../lib/supabase"

export default function MessagesScreen() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [reloading, setReloading] = useState(false)
  const spinAnim = useRef(new Animated.Value(0)).current

  // Move spin outside so it's accessible
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  // Move handleReload outside so it's accessible
  const handleReload = () => {
    setReloading(true)
    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      spinAnim.setValue(0)
      setReloading(false)
    })
    // Call fetchMessages directly
    fetchMessages()
  }

  // Move fetchMessages outside useEffect so handleReload can call it
  const fetchMessages = async () => {
    setLoading(true)
    try {
      // Get all latest friend messages where you are sender or friend
      const { data: messagesData, error: messagesError } = await supabase
        .from("message")
        .select("*, sender:sender_id(prof_id, name, photo), friend:friend_id(prof_id, name, photo)")
        .or(`sender_id.eq.${profile.prof_id},friend_id.eq.${profile.prof_id}`)
        .is("event_id", null)
        .order("created_at", { ascending: false })

      if (messagesError) throw messagesError

      // Group by the other user's profile
      const conversations = {}
      messagesData.forEach((msg) => {
        // Always pick the other user, never yourself
        let other = null
        if (msg.sender && msg.sender.prof_id !== profile.prof_id) {
          other = msg.sender
        }
        if (msg.friend && msg.friend.prof_id !== profile.prof_id) {
          other = msg.friend
        }
        // If no valid other user, skip
        if (!other) return
        // Only add if not already present (latest message per conversation)
        if (!conversations[other.prof_id]) {
          conversations[other.prof_id] = {
            id: other.prof_id,
            type: "friend",
            name: other.name,
            photo: other.photo,
            lastMessage: msg.message,
            timestamp: formatTimestamp(msg.created_at),
            created_at: msg.created_at,
          }
        }
      })

      // Get all events the user is attending (keep your event logic)
      const { data: eventsData, error: eventsError } = await supabase
        .from("attend")
        .select("event:event_id(*)")
        .eq("prof_id", profile.prof_id)

      if (eventsError) throw eventsError

      const eventMessages = await Promise.all(
        eventsData.map(async (eventData) => {
          const event = eventData.event
          const { data, error } = await supabase
            .from("message")
            .select("*, sender:sender_id(prof_id, name, photo)")
            .eq("event_id", event.event_id)
            .order("created_at", { ascending: false })
            .limit(1)

          if (error || !data || data.length === 0) return null

          return {
            id: event.event_id,
            type: "event",
            name: event.name,
            photo: event.picture,
            lastMessage: data[0].message,
            sender: data[0].sender?.name,
            timestamp: formatTimestamp(data[0].created_at),
            created_at: data[0].created_at,
          }
        }),
      )
      // Combine and sort all messages
      const allMessages = [
        ...Object.values(conversations),
        ...eventMessages.filter((msg) => msg !== null),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      setMessages(allMessages)
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!profile) return
    fetchMessages()

    // Set up real-time subscriptions
    const friendSubscription = supabase
      .channel("public:message")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "message",
        },
        () => {
          // Refresh messages when a new one arrives
          fetchMessages()
        },
      )
      .subscribe()

    return () => {
      friendSubscription.unsubscribe()
    }
  }, [profile])

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      // Today - show time
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      // This week - show day name
      return date.toLocaleDateString([], { weekday: "long" })
    } else {
      // Older - show date
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const filteredMessages = messages.filter(
    (message) =>
      message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (message.lastMessage && message.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.messageItem}
      onPress={() => {
        console.log("Navigating to chat", item)
        if (item.type === "friend") {
          router.push(`/chat/${item.id}?type=friend`)
        } else if (item.type === "event") {
          router.push(`/chat/${item.id}?type=event`)
        }
      }}
    >
      <Image
        source={{
          uri: item.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random`,
        }}
        style={styles.avatar}
      />
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.messageName}>{item.name}</Text>
          <Text style={styles.messageTime}>{item.timestamp}</Text>
        </View>
        <Text style={styles.messageText} numberOfLines={1} ellipsizeMode="tail">
          {item.type === "event" && item.sender ? `${item.sender}: ` : ""}
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.title}>Messages</Text>
          <TouchableOpacity onPress={handleReload} style={{ marginLeft: 10 }} disabled={reloading}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="reload" size={22} color="#4CAF50" />
            </Animated.View>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Contact your friends and groups</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : filteredMessages.length > 0 ? (
        <FlatList
          data={filteredMessages}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No messages found</Text>
          <TouchableOpacity style={styles.newChatButton} onPress={() => router.push("/tabs/friends")}>
            <Text style={styles.newChatButtonText}>Start a new chat</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#1f2937",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  messageItem: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
    justifyContent: "center",
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  messageName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  messageTime: {
    fontSize: 12,
    color: "#9ca3af",
  },
  messageText: {
    fontSize: 14,
    color: "#6b7280",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 20,
  },
  newChatButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  newChatButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
})
