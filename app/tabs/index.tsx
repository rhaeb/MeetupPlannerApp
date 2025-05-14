import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase"; // Import Supabase client
import { Event } from "../../types";
import { useAuth } from "../../hooks/useAuth"; // Import useAuth hook

export default function HomeScreen() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth(); // Use useAuth hook
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch events for the logged-in user
  useEffect(() => {
    const fetchEvents = async () => {
      if (!profile) {
        setLoading(false);
        return;
      }

      try {
        // Fetch events for the logged-in user's profile
        const { data: userEvents, error } = await supabase
          .from("attend")
          .select("event:event_id(*)")
          .eq("prof_id", profile.prof_id)
          .order("event.date_start", { ascending: true });

        if (error) {
          console.error("Error fetching events:", error);
        } else {
          // Extract events from the nested structure
          const events = userEvents.map((item) => item.event);
          setEvents(events);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [profile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (authLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Hangout</Text>
        {user ? (
          <TouchableOpacity style={styles.newEventBtn} onPress={handleLogout}>
            <Text style={styles.newEventText}>Log out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.newEventBtn}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.newEventText}>Log in</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.subtitle}>Plan your next adventure</Text>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction}>
          <Ionicons name="calendar-outline" size={30} color="#4CAF50" />
          <Text style={styles.quickActionText}>All Events</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <Ionicons name="people-outline" size={30} color="#4CAF50" />
          <Text style={styles.quickActionText}>All Friends</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollSection}>
        {/* Upcoming Events */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <Text style={styles.seeAll}>See all</Text>
        </View>

        {events.length > 0 ? (
          events.map((event) => (
            <TouchableOpacity
              key={event.event_id}
              style={styles.eventCard}
              onPress={() => router.push(`/events/${event.event_id}`)}
            >
              <Image
                source={{
                  uri: event.picture || "https://via.placeholder.com/100x60",
                }}
                style={styles.eventImage}
              />
              <View style={styles.eventContent}>
                <View style={styles.eventRow}>
                  <Text style={styles.eventTitle}>{event.name}</Text>
                  <Text
                    style={[
                      styles.eventStatus,
                      event.status === "planned"
                        ? styles.statusPlanning
                        : styles.statusConfirmed,
                    ]}
                  >
                    {event.status}
                  </Text>
                </View>
                <Text style={styles.eventDate}>{event.date_start}</Text>
                <Text style={styles.eventLocation}>{event.address}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noEventsText}>No upcoming events found.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "700", color: "#222" },
  subtitle: { paddingHorizontal: 20, color: "#666", fontSize: 14 },
  newEventBtn: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newEventText: { color: "#fff", fontWeight: "500" },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  quickAction: {
    backgroundColor: "#e8f5e9",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    width: 140,
  },
  quickActionText: { marginTop: 8, fontSize: 14, color: "#333" },
  scrollSection: { paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  seeAll: { fontSize: 14, color: "#4CAF50" },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  eventImage: { width: 100, height: 70, borderRadius: 10, marginRight: 10 },
  eventContent: { flex: 1 },
  eventRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  eventStatus: {
    fontSize: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  statusConfirmed: { backgroundColor: "#dcedc8", color: "#33691e" },
  statusPlanning: { backgroundColor: "#fff3e0", color: "#ef6c00" },
  eventDate: { color: "#555", fontSize: 13, marginTop: 4 },
  eventLocation: { color: "#777", fontSize: 13 },
  noEventsText: { textAlign: "center", color: "#999", marginTop: 20 },
});
