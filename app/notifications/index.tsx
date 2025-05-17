import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { notificationController } from "../../controllers/notificationController";
import { useAuth } from "../../hooks/useAuth";
import { Notification } from "../../types";

export default function NotificationsScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [profile]);

  const fetchNotifications = async () => {
    if (!profile) return;
    
    try {
      setLoading(true);
      const { data, error } = await notificationController.getUserNotifications(profile.prof_id);
      
      if (error) {
        console.error("Error fetching notifications:", error);
        return;
      }
      
      if (data) {
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error in fetchNotifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notifId: string) => {
    try {
      // Navigate to the notification detail
      router.push(`/notifications/${notifId}`);
      
      // Update the local state to mark as read
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => 
          notif.notif_id === notifId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "invite":
        return "mail-outline";
      case "reminder":
        return "alarm-outline";
      case "update":
        return "refresh-outline";
      case "rsvp":
        return "person-add-outline";
      case "message":
        return "chatbubble-outline";
      case "event":
        return "calendar-outline";
      default:
        return "notifications-outline";
    }
  };

  const getIconBackgroundColor = (type: string) => {
    switch (type) {
      case "invite":
        return "#4CAF50"; // Green
      case "reminder":
        return "#FF9800"; // Orange
      case "update":
        return "#2196F3"; // Blue
      case "rsvp":
        return "#9C27B0"; // Purple
      case "message":
        return "#E91E63"; // Pink
      case "event":
        return "#0B5E42"; // Teal
      default:
        return "#757575"; // Gray
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return diffDay === 1 ? "Yesterday" : `${diffDay} days ago`;
    } else if (diffHour > 0) {
      return `${diffHour} ${diffHour === 1 ? "hour" : "hours"} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} ${diffMin === 1 ? "minute" : "minutes"} ago`;
    } else {
      return "Just now";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0B5E42" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.notif_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.notificationItem,
              !item.read && styles.unreadNotification,
            ]}
            onPress={() => handleMarkAsRead(item.notif_id)}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: getIconBackgroundColor(item.type || "default") },
              ]}
            >
              <Ionicons name={getIconForType(item.type || "default")} size={20} color="#fff" />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationMessage}>{item.content}</Text>
              <Text style={styles.notificationTime}>{formatTimeAgo(item.date)}</Text>
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
        refreshing={loading}
        onRefresh={fetchNotifications}
      />
    </SafeAreaView>
  );
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
    marginLeft: 10,
    flex: 1, // Add this line to push the title to the left
    textAlign: "left",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  notificationsList: {
    padding: 15,
    flexGrow: 1,
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
    flex: 1,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#999",
  },
});