"use client";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../../hooks/useAuth"; // Use the useAuth hook
import { Event } from "../../../types";

export default function EventsScreen() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth(); // Get the logged-in user's profile
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

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
          const events = userEvents?.map((item) => item.event) || [];
          setEvents(events);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchEvents();
    }
  }, [profile, authLoading]);

  if (authLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["right", "left", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Events</Text>
        <TouchableOpacity onPress={() => router.push("/create-event")}>
          <Ionicons name="add" size={24} color="#059669" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Your Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Events</Text>
          {events.length > 0 ? (
            events.map((event, index) => (
              <TouchableOpacity
                key={`event-${index}`}
                style={styles.eventCard}
                onPress={() => router.push(`/events/${event.event_id}`)}
              >
                <View style={styles.eventCardHeader}>
                  <View>
                    <Text style={styles.eventTitle}>{event.name}</Text>
                    <Text style={styles.eventTime}>{event.date_start}</Text>
                  </View>
                  <View style={styles.eventBadge}>
                    <Text style={styles.eventBadgeText}>
                      {event.hoster_id === profile.prof_id ? "Hosting" : "Attending"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.eventLocation}>{event.address}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noEventsText}>No events found.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e1e1e",
    marginBottom: 12,
  },
  eventCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e1e1e",
  },
  eventTime: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6b7280",
    marginTop: 2,
  },
  eventBadge: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  eventBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#059669",
  },
  eventLocation: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6b7280",
    marginTop: 8,
  },
  noEventsText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6b7280",
    textAlign: "center",
    marginTop: 20,
  },
});
