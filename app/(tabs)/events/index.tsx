"use client"

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import AppHeader from "../../components/AppHeader"

export default function EventsScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
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
          {[
            { title: "Beach Cleanup", date: "Saturday, 9:00 AM", attendees: 18, isHosting: true },
            { title: "Hiking Trip", date: "Sunday, 7:30 AM", attendees: 12, isHosting: true },
          ].map((event, index) => (
            <TouchableOpacity
              key={`your-${index}`}
              style={styles.eventCard}
              onPress={() => router.push("/event-detail")}
            >
              <View style={styles.eventCardHeader}>
                <View>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventTime}>{event.date}</Text>
                </View>
                <View style={styles.eventBadge}>
                  <Text style={styles.eventBadgeText}>{event.isHosting ? "Hosting" : "Going"}</Text>
                </View>
              </View>
              <View style={styles.attendeesContainer}>
                <View style={styles.avatarGroup}>
                  {[1, 2, 3].map((avatar) => (
                    <View key={`avatar-${avatar}`} style={styles.attendeeAvatar} />
                  ))}
                </View>
                <Text style={styles.attendeesText}>+{event.attendees} going</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          {[
            { title: "Community Meetup", date: "Next Friday, 6:00 PM", attendees: 24, isHosting: false },
            { title: "Charity Run", date: "Next Saturday, 8:00 AM", attendees: 42, isHosting: false },
            { title: "Tech Workshop", date: "Next Sunday, 2:00 PM", attendees: 16, isHosting: false },
          ].map((event, index) => (
            <TouchableOpacity
              key={`upcoming-${index}`}
              style={styles.eventCard}
              onPress={() => router.push("/event-detail")}
            >
              <View style={styles.eventCardHeader}>
                <View>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventTime}>{event.date}</Text>
                </View>
                <View style={styles.eventBadge}>
                  <Text style={styles.eventBadgeText}>{event.isHosting ? "Hosting" : "Going"}</Text>
                </View>
              </View>
              <View style={styles.attendeesContainer}>
                <View style={styles.avatarGroup}>
                  {[1, 2, 3].map((avatar) => (
                    <View key={`avatar-${avatar}`} style={styles.attendeeAvatar} />
                  ))}
                </View>
                <Text style={styles.attendeesText}>+{event.attendees} going</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  attendeesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarGroup: {
    flexDirection: "row",
    marginRight: 8,
  },
  attendeeAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
    borderWidth: 2,
    borderColor: "white",
    marginLeft: -8,
  },
  attendeesText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#6b7280",
  },
})