"use client"

import React from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

// Mock data for notifications
const notifications = [
  {
    id: "1",
    type: "invite",
    title: "New Event Invitation",
    message: "Alex Smith invited you to Tech Conference 2024",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    type: "reminder",
    title: "Event Reminder",
    message: "Team Lunch is tomorrow at 12:30 PM",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "update",
    title: "Event Updated",
    message: "Project Meeting location has been changed",
    time: "Yesterday",
    read: true,
  },
  {
    id: "4",
    type: "rsvp",
    title: "New RSVP",
    message: "Jamie Lee is attending your Coffee & Code event",
    time: "2 days ago",
    read: true,
  },
  {
    id: "5",
    type: "reminder",
    title: "Event Reminder",
    message: "Networking Lunch is in 3 days",
    time: "3 days ago",
    read: true,
  },
]

export default function NotificationsScreen() {
  const router = useRouter()

  const getIconForType = (type) => {
    switch (type) {
      case "invite":
        return "mail-outline"
      case "reminder":
        return "alarm-outline"
      case "update":
        return "refresh-outline"
      case "rsvp":
        return "person-add-outline"
      default:
        return "notifications-outline"
    }
  }

  const getIconBackgroundColor = (type) => {
    switch (type) {
      case "invite":
        return "#4CAF50" // Green
      case "reminder":
        return "#FF9800" // Orange
      case "update":
        return "#2196F3" // Blue
      case "rsvp":
        return "#9C27B0" // Purple
      default:
        return "#757575" // Gray
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.notificationItem, !item.read && styles.unreadNotification]}>
            <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor(item.type) }]}>
              <Ionicons name={getIconForType(item.type)} size={20} color="#fff" />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              <Text style={styles.notificationTime}>{item.time}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.notificationsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  moreButton: {
    padding: 5,
  },
  notificationsList: {
    padding: 15,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  unreadNotification: {
    backgroundColor: "#f0f9f0", // Light green background for unread
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
    alignSelf: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#999",
  },
})
