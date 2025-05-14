"use client";

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase"; // Import Supabase client
import { Event } from "../../types";

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Get event_id from the route
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const { data, error } = await supabase
          .from("event")
          .select("*")
          .eq("event_id", id)
          .single();

        if (error) {
          console.error("Error fetching event details:", error);
        } else {
          setEvent(data);
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Event not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={24}
          color="#333"
          onPress={() => router.back()}
        />
        <Text style={styles.headerTitle}>Event Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={{ uri: event.picture || "https://via.placeholder.com/300x200" }}
          style={styles.eventImage}
        />
        <Text style={styles.eventTitle}>{event.name}</Text>
        <Text style={styles.eventDate}>{event.date_start}</Text>
        <Text style={styles.eventLocation}>{event.address}</Text>
        <Text style={styles.eventDescription}>{event.description}</Text>
      </ScrollView>
    </SafeAreaView>
  );
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#999",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 16,
  },
  content: {
    padding: 16,
  },
  eventImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  eventLocation: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  eventDescription: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
});
