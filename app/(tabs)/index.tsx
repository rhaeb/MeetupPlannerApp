"use client"

import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { supabase } from "../lib/supabase" // Import Supabase client
import AppHeader from "../components/AppHeader"; // Import AppHeader

const upcomingEvents = [
  {
    id: "1",
    title: "Beach Party",
    status: "Confirmed",
    date: "August 10–15, 2025",
    location: "Lapu-Lapu City, Cebu",
    attendees: 4,
    image: "https://via.placeholder.com/100x60.png?text=Beach",
  },
  {
    id: "2",
    title: "Movie Night",
    status: "Planning",
    date: "August 16, 2025",
    location: "SM Cebu City",
    attendees: 3,
    image: "https://via.placeholder.com/100x60.png?text=Movie",
  },
]

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // Fetch the user from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription?.unsubscribe(); // Correctly call unsubscribe
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader /> {/* Add AppHeader here */}
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

        {upcomingEvents.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => router.push(`/events/${event.id}`)}
          >
            <Image source={{ uri: event.image }} style={styles.eventImage} />
            <View style={styles.eventContent}>
              <View style={styles.eventRow}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text
                  style={[
                    styles.eventStatus,
                    event.status === "Confirmed"
                      ? styles.statusConfirmed
                      : styles.statusPlanning,
                  ]}
                >
                  {event.status}
                </Text>
              </View>
              <Text style={styles.eventDate}>{event.date}</Text>
              <Text style={styles.eventLocation}>{event.location}</Text>
              <Text style={styles.eventPeople}>{event.attendees} people</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Past Events Placeholder */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Past Events</Text>
          <Text style={styles.seeAll}>See all</Text>
        </View>
        <View style={[styles.eventCard, { backgroundColor: "#f3f3f3" }]}>
          <Text style={{ color: "#999" }}>No past events yet.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
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
  eventPeople: { color: "#999", fontSize: 13, marginTop: 4 },
})
