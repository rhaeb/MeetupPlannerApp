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
import { Event } from "../../types";
import { useAuth } from "../../hooks/useAuth";
import { useEvents } from "../../contexts/EventsContext";

export default function HomeScreen() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const { events: allEvents, loading: eventsLoading } = useEvents();

  const [events, setEvents] = useState<Event[]>([]);
  const [liveEvents, setLiveEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);

  // Filter and sort events from context
  useEffect(() => {
    if (!profile || !allEvents) {
      setEvents([]);
      setLiveEvents([]);
      setPastEvents([]);
      return;
    }

    const now = new Date();

    // Filter live events (currently happening)
    const live = allEvents.filter((event) => {
      const startDate = new Date(event.date_start);
      const endDate = new Date(event.date_end);
      return startDate <= now && now <= endDate;
    });

    // Filter and sort upcoming events (excluding live events)
    const upcoming = allEvents
      .filter((event) => {
        const startDate = new Date(event.date_start);
        const endDate = new Date(event.date_end);
        return startDate > now || (startDate <= now && now <= endDate);
      })
      .filter((event) => {
        // Exclude live events from upcoming
        const startDate = new Date(event.date_start);
        const endDate = new Date(event.date_end);
        return !(startDate <= now && now <= endDate);
      })
      .sort(
        (a, b) =>
          new Date(a.date_start).getTime() -
          new Date(b.date_start).getTime()
      );

    // Filter and sort past events
    const past = allEvents
      .filter((event) => new Date(event.date_end) < now)
      .sort(
        (a, b) =>
          new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
      );

    setLiveEvents(live);
    setEvents(upcoming);
    setPastEvents(past);
  }, [profile, allEvents]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start.toDateString() === end.toDateString()) {
      return formatDate(startDate);
    }

    return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}-${end.getDate()}, ${end.getFullYear()}`;
  };

  const getAttendeeCount = (event) => {
    return event.attendees_count ?? 1;
  };

  const isEventLive = (event) => {
    const now = new Date();
    const startDate = new Date(event.date_start);
    const endDate = new Date(event.date_end);
    return startDate <= now && now <= endDate;
  };

  if (authLoading || eventsLoading) {
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
        <View>
          <Text style={styles.title}>Hangout</Text>
          <Text style={styles.subtitle}>Plan your next adventure</Text>
        </View>
        <TouchableOpacity 
          style={styles.newEventBtn} 
          onPress={() => router.push("/events/create")}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.newEventText}>New Event</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Live Events */}
        {liveEvents.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Live Events</Text>
              <TouchableOpacity onPress={() => router.push("/tabs/events")}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            {liveEvents.slice(0, 3).map((event) => (
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
                      <Text style={styles.eventDate}>
                        {formatDateRange(event.date_start, event.date_end)}
                      </Text>
                    </View>
                    <View style={styles.eventDetailRow}>
                      <Ionicons name="location-outline" size={14} color="#888" style={styles.eventIcon} />
                      <Text style={styles.eventLocation}>{event.address}</Text>
                    </View>
                    <View style={styles.eventDetailRow}>
                      <Ionicons name="people-outline" size={14} color="#888" style={styles.eventIcon} />
                      <Text style={styles.eventAttendees}>{getAttendeeCount(event)} people</Text>
                    </View>
                  </View>
                  <View style={styles.statusContainer}>
                    <Text style={[styles.eventStatus, styles.statusLive]}>
                      Live now
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Upcoming Events */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <TouchableOpacity onPress={() => router.push("/tabs/events")}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {events.length > 0 ? (
          events.slice(0, 3).map((event) => (
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
                    <Text style={styles.eventDate}>
                      {formatDateRange(event.date_start, event.date_end)}
                    </Text>
                  </View>
                  <View style={styles.eventDetailRow}>
                    <Ionicons name="location-outline" size={14} color="#888" style={styles.eventIcon} />
                    <Text style={styles.eventLocation}>{event.address}</Text>
                  </View>
                  <View style={styles.eventDetailRow}>
                    <Ionicons name="people-outline" size={14} color="#888" style={styles.eventIcon} />
                    <Text style={styles.eventAttendees}>{getAttendeeCount(event)} people</Text>
                  </View>
                </View>
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
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noEventsText}>No upcoming events found.</Text>
        )}

        {/* Past Events */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Past Events</Text>
          <TouchableOpacity onPress={() => router.push("/tabs/events?filter=past")}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {pastEvents.length > 0 ? (
          pastEvents.slice(0, 3).map((event) => (
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
                <Text style={[styles.eventTitle, styles.pastEventTitle]}>{event.name}</Text>
                <View style={styles.eventDetails}>
                  <View style={styles.eventDetailRow}>
                    <Ionicons name="calendar-outline" size={14} color="#888" style={styles.eventIcon} />
                    <Text style={styles.eventDate}>
                      {formatDate(event.date_start)}
                    </Text>
                  </View>
                  <View style={styles.eventDetailRow}>
                    <Ionicons name="location-outline" size={14} color="#888" style={styles.eventIcon} />
                    <Text style={styles.eventLocation}>{event.address}</Text>
                  </View>
                  <View style={styles.eventDetailRow}>
                    <Ionicons name="people-outline" size={14} color="#888" style={styles.eventIcon} />
                    <Text style={styles.eventAttendees}>{getAttendeeCount(event)} people</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noEventsText}>No past events found.</Text>
        )}
        
        {/* Add some space at the bottom */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: "flex-start",
  },
  title: { 
    fontSize: 24, 
    fontWeight: "700", 
    color: "#222" 
  },
  subtitle: { 
    color: "#666", 
    fontSize: 14,
    marginTop: 2
  },
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
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  quickAction: {
    backgroundColor: "#e8f5e9",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    width: "48%",
    aspectRatio: 1.5,
    justifyContent: "center",
  },
  quickActionText: { 
    marginTop: 10, 
    fontSize: 14, 
    color: "#333",
    fontWeight: "500"
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "600",
    color: "#222"
  },
  seeAll: { 
    fontSize: 14, 
    color: "#4CAF50" 
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 20,
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
    marginRight: 12 
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
  pastEventTitle: {
    color: "#666",
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
  statusLive: {
    backgroundColor: "#ff6b35",
    color: "#fff"
  },
  noEventsText: { 
    textAlign: "center", 
    color: "#999", 
    marginTop: 20,
    marginBottom: 20
  },
});