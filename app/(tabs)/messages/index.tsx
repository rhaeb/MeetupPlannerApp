"use client"

import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

export default function MessagesScreen() {
  const router = useRouter()

  const messages = [
    {
      id: 1,
      name: "Sarah Johnson",
      message: "Are you coming to the event?",
      time: "2m ago",
      unread: true,
    },
    {
      id: 2,
      name: "Michael Chen",
      message: "Thanks for the invite!",
      time: "1h ago",
      unread: false,
    },
    {
      id: 3,
      name: "Jessica Williams",
      message: "Let's meet at 6pm",
      time: "3h ago",
      unread: false,
    },
    {
      id: 4,
      name: "David Kim",
      message: "I'll bring some snacks",
      time: "5h ago",
      unread: false,
    },
    {
      id: 5,
      name: "Emily Davis",
      message: "Can't wait for the meetup!",
      time: "1d ago",
      unread: false,
    },
  ]

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.messageItem}
      onPress={() =>
        router.push({
          pathname: "/chat",
          params: { name: item.name },
        })
      }
    >
      <View style={styles.avatar} />
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.messageName}>{item.name}</Text>
          <Text style={styles.messageTime}>{item.time}</Text>
        </View>
        <View style={styles.messagePreview}>
          <Text
            style={[styles.messageText, item.unread && styles.unreadMessageText]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.message}
          </Text>
          {item.unread && <View style={styles.unreadDot} />}
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "white",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: "#1e1e1e",
  },
  listContent: {
    padding: 16,
  },
  messageItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e5e7eb",
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  messageName: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: "#1e1e1e",
  },
  messageTime: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: "#6b7280",
  },
  messagePreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messageText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#6b7280",
    flex: 1,
    marginRight: 8,
  },
  unreadMessageText: {
    fontFamily: "Inter-Medium",
    color: "#1e1e1e",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#059669",
  },
})
