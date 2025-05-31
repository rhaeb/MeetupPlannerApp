import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { Notification } from "../../types";
import { notificationController } from "../../controllers/notificationController";
import { eventController } from "../../controllers/eventController";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../contexts/NotificationsContext";

export default function NotificationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { profile } = useAuth();
  const { refreshNotifications } = useNotifications();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [relatedEvent, setRelatedEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotificationDetails();
  }, [id]);

  const fetchNotificationDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Fetch the notification details
      const { data, error } = await supabase
        .from("notification")
        .select("*")
        .eq("notif_id", id)
        .single();
      
      if (error) {
        console.error("Error fetching notification:", error);
        return;
      }
      
      if (data) {
        setNotification(data);
        
        // Mark as read in the database
        await supabase
          .from("notification")
          .update({ read: true })
          .eq("notif_id", id);
        
        // If there's an event_id, fetch the related event
        if (data.event_id) {
          const { data: eventData, error: eventError } = await eventController.getEventById(data.event_id);
          
          if (!eventError && eventData) {
            setRelatedEvent(eventData);
          }
        }
      }
    } catch (error) {
      console.error("Error in fetchNotificationDetails:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async () => {
    if (!notification) return;
    
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await notificationController.deleteNotification(notification.notif_id);
              
              if (error) {
                console.error("Error deleting notification:", error);
                Alert.alert("Error", "Failed to delete notification");
                return;
              }

              // Refresh notifications context
              refreshNotifications();

              router.back();
            } catch (error) {
              console.error("Error in handleDeleteNotification:", error);
              Alert.alert("Error", "An unexpected error occurred");
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const handleActionButton = () => {
    if (notification?.event_id && relatedEvent) {
      router.push(`/event/${notification.event_id}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0B5E42" />
          <Text style={styles.loadingText}>Loading notification...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!notification) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#ccc" />
          <Text style={styles.errorText}>Notification not found</Text>
          <TouchableOpacity style={styles.backToNotificationsButton} onPress={() => router.back()}>
            <Text style={styles.backToNotificationsText}>Back to Notifications</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Notification</Text>
        <TouchableOpacity onPress={handleDeleteNotification} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={24} color="#ff4d4f" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.notificationHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getIconBackgroundColor(notification.type || "default") },
            ]}
          >
            <Ionicons name={getIconForType(notification.type || "default")} size={28} color="#fff" />
          </View>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
        </View>

        <View style={styles.notificationMeta}>
          <Text style={styles.notificationDate}>{formatDate(notification.date)}</Text>
        </View>

        <View style={styles.notificationBody}>
          <Text style={styles.notificationContent}>{notification.content}</Text>
        </View>

        {relatedEvent && (
          <View style={styles.relatedEventSection}>
            <Text style={styles.sectionTitle}>Related Event</Text>
            <View style={styles.relatedEventCard}>
              <Text style={styles.eventName}>{relatedEvent.name}</Text>
              <Text style={styles.eventDate}>
                {new Date(relatedEvent.date_start).toLocaleDateString()} - {new Date(relatedEvent.date_end).toLocaleDateString()}
              </Text>
              <Text style={styles.eventLocation}>{relatedEvent.address}</Text>
            </View>
          </View>
        )}

        {notification.event_id && (
          <TouchableOpacity style={styles.actionButton} onPress={handleActionButton}>
            <Text style={styles.actionButtonText}>View Event</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
  },
  deleteButton: {
    padding: 5,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#999",
    marginBottom: 20,
  },
  backToNotificationsButton: {
    backgroundColor: "#0B5E42",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backToNotificationsText: {
    color: "#fff",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  notificationHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  notificationTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
  },
  notificationMeta: {
    alignItems: "center",
    marginBottom: 20,
  },
  notificationDate: {
    fontSize: 14,
    color: "#666",
  },
  notificationBody: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationContent: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  relatedEventSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  relatedEventCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 14,
    color: "#666",
  },
  actionButton: {
    backgroundColor: "#0B5E42",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});