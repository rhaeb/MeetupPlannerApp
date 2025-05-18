"use client";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../../hooks/useAuth";
import { Event } from "../../../types";
import { useEvents } from "../../../contexts/EventsContext"; // <-- Use EventsContext

export default function EventsScreen() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const { events: allEvents, loading: eventsLoading } = useEvents(); // <-- Use events from context
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [fadeAnim] = useState(new Animated.Value(0.3));

  useEffect(() => {
    // Create the pulse animation for skeleton loading
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Filter and sort events from context
  useEffect(() => {
    if (!profile || !allEvents) {
      setUpcomingEvents([]);
      setPastEvents([]);
      return;
    }

    const now = new Date();

    // Filter and sort upcoming events
    const upcoming = allEvents
      .filter((event) => new Date(event.date_start) >= now)
      .sort(
        (a, b) =>
          new Date(a.date_start).getTime() -
          new Date(b.date_start).getTime()
      );

    // Filter and sort past events
    const past = allEvents
      .filter((event) => new Date(event.date_start) < now)
      .sort(
        (a, b) =>
          new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
      );

    setUpcomingEvents(upcoming);
    setPastEvents(past);
  }, [profile, allEvents]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getAttendeeCount = (event) => {
    return event.attendees_count ?? event.attendeesCount ?? event.attendees?.length ?? 1;
  };

  const renderSkeletonEvent = (key) => (
    <Animated.View
      key={key}
      style={[
        styles.eventCard,
        { opacity: fadeAnim }
      ]}
    >
      <View style={styles.skeletonImage} />
      <View style={styles.eventContent}>
        <View style={styles.skeletonTitle} />
        <View style={styles.eventDetails}>
          <View style={styles.eventDetailRow}>
            <View style={styles.skeletonIcon} />
            <View style={styles.skeletonText} />
          </View>
          <View style={styles.eventDetailRow}>
            <View style={styles.skeletonIcon} />
            <View style={styles.skeletonText} />
          </View>
          <View style={styles.eventDetailRow}>
            <View style={styles.skeletonIcon} />
            <View style={styles.skeletonText} />
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderLoadingState = () => (
    <View style={styles.eventsContainer}>
      {[1, 2, 3, 4].map((item) => renderSkeletonEvent(`skeleton-${item}`))}
    </View>
  );

  const renderEventCard = (event) => (
    <TouchableOpacity
      key={event.event_id}
      style={styles.eventCard}
      onPress={() => router.push(`/events/${event.event_id}`)}
    >
      <Image
        source={{
          uri: event.picture || "https://via.placeholder.com/100x100",
        }}
        style={styles.eventImage}
      />
      <View style={styles.eventContent}>
        <View style={styles.eventRow}>
          <Text style={styles.eventTitle}>{event.name}</Text>
        </View>
        <View style={styles.eventDetails}>
          <View style={styles.eventDetailRow}>
            <Ionicons name="calendar-outline" size={14} color="#888" style={styles.eventIcon} />
            <Text style={styles.eventDate}>{formatDate(event.date_start)}</Text>
          </View>
          <View style={styles.eventDetailRow}>
            <Ionicons name="location-outline" size={14} color="#888" style={styles.eventIcon} />
            <Text style={styles.eventLocation}>{event.address}</Text>
          </View>
          <View style={styles.eventDetailRow}>
            <Ionicons name="people-outline" size={14} color="#888" style={styles.eventIcon} />
            <Text style={styles.eventAttendees}>
              {getAttendeeCount(event)} people
            </Text>
          </View>
        </View>
        {/* Status badge - Updated to match home screen style */}
        {activeTab === 'upcoming' && (
          <View style={styles.statusContainer}>
            <Text
              style={[
                styles.eventStatus,
                event.status === "planned" || event.status === "Planning"
                  ? styles.statusPlanning
                  : styles.statusConfirmed,
              ]}
            >
              {event.status === "planned" || event.status === "Planning" ? "Planning" : "Confirmed"}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEvents = () => {
    const events = activeTab === 'upcoming' ? upcomingEvents : pastEvents;
    
    if (events.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="calendar-outline" size={50} color="#ccc" />
          <Text style={styles.emptyStateText}>
            No {activeTab} events found
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.eventsContainer}>
        {events.map(renderEventCard)}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["right", "left", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage your hangouts</Text>
        {/* Updated New Event button to match home screen */}
        <TouchableOpacity 
          style={styles.newEventBtn} 
          onPress={() => router.push("/events/create")}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.newEventText}>New Event</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {authLoading || eventsLoading ? renderLoadingState() : renderEvents()}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8f8f8" 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: { 
    fontSize: 16, 
    fontWeight: "500", 
    color: "#333" 
  },
  // Updated New Event button styles to match home screen
  newEventBtn: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  newEventText: { 
    color: "#fff", 
    fontWeight: "500",
    marginLeft: 4
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  activeTab: {
    backgroundColor: "#f6fff5",
  },
  tabText: {
    color: "#888",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#333",
    fontWeight: "600",
  },
  scrollView: { 
    flex: 1 
  },
  eventsContainer: {
    paddingHorizontal: 16,
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  eventImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  eventContent: { 
    flex: 1,
    justifyContent: "space-between"
  },
  eventRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventTitle: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#333",
    marginBottom: 4
  },
  eventDetails: {
    marginTop: 2,
  },
  eventDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  eventIcon: {
    marginRight: 4,
  },
  eventDate: { 
    color: "#666", 
    fontSize: 12
  },
  eventLocation: { 
    color: "#666", 
    fontSize: 12
  },
  eventAttendees: {
    color: "#666",
    fontSize: 12
  },
  // Updated status styles to match home screen
  statusContainer: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  eventStatus: {
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    overflow: "hidden",
    fontWeight: "500",
  },
  statusConfirmed: { 
    backgroundColor: "#dcedc8", 
    color: "#33691e" 
  },
  statusPlanning: { 
    backgroundColor: "#fff3e0", 
    color: "#ef6c00" 
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  // Skeleton styles
  skeletonImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    marginRight: 12,
  },
  skeletonTitle: {
    height: 16,
    width: "70%",
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  skeletonText: {
    height: 12,
    width: "60%",
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    marginBottom: 8,
  },
});