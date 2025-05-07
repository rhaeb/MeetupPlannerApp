"use client"

import React from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

// Mock data for event details
const eventDetails = {
  id: "1",
  title: "Team Lunch",
  date: "Today, 12:30 PM",
  endDate: "Today, 2:00 PM",
  location: "Central Park",
  description:
    "Join us for a team lunch at Central Park. We'll be discussing the upcoming project and enjoying some delicious food.",
  organizer: {
    name: "Tara Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  attendees: [
    { id: "1", name: "Alex Smith", avatar: "/placeholder.svg?height=40&width=40" },
    { id: "2", name: "Jamie Lee", avatar: "/placeholder.svg?height=40&width=40" },
    { id: "3", name: "Chris Wong", avatar: "/placeholder.svg?height=40&width=40" },
    { id: "4", name: "Pat Taylor", avatar: "/placeholder.svg?height=40&width=40" },
  ],
}

export default function EventDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        <TouchableOpacity style={styles.moreButton} onPress={() => router.push(`/events/edit/${id}`)}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{eventDetails.title}</Text>

          <View style={styles.eventInfoItem}>
            <Ionicons name="calendar-outline" size={20} color="#4CAF50" style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Date & Time</Text>
              <Text style={styles.infoText}>
                {eventDetails.date} - {eventDetails.endDate}
              </Text>
            </View>
          </View>

          <View style={styles.eventInfoItem}>
            <Ionicons name="location-outline" size={20} color="#4CAF50" style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoText}>{eventDetails.location}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{eventDetails.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Organizer</Text>
          <View style={styles.organizerContainer}>
            <Image source={{ uri: eventDetails.organizer.avatar }} style={styles.organizerAvatar} />
            <Text style={styles.organizerName}>{eventDetails.organizer.name}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.attendeeHeader}>
            <Text style={styles.sectionTitle}>Attendees ({eventDetails.attendees.length})</Text>
            <TouchableOpacity onPress={() => router.push(`/attendees/${id}`)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.attendeesList}>
            {eventDetails.attendees.map((attendee) => (
              <View key={attendee.id} style={styles.attendeeItem}>
                <Image source={{ uri: attendee.avatar }} style={styles.attendeeAvatar} />
                <Text style={styles.attendeeName}>{attendee.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.rsvpButton}>
          <Text style={styles.rsvpButtonText}>RSVP</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    paddingBottom: 100,
  },
  eventHeader: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 15,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  eventInfoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  infoIcon: {
    marginRight: 15,
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    color: "#333",
  },
  section: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  organizerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  organizerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
    backgroundColor: "#e0e0e0",
  },
  organizerName: {
    fontSize: 16,
    color: "#333",
  },
  attendeeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: "#4CAF50",
  },
  attendeesList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  attendeeItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  attendeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#e0e0e0",
  },
  attendeeName: {
    fontSize: 16,
    color: "#333",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  rsvpButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },
  rsvpButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
})
