import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView } from "react-native"
import { Link } from "expo-router/"
import Ionicons from "@expo/vector-icons/Ionicons"

import { colors } from "@/constants/colors"
import Button from "@/components/Button"
import { Card, CardContent } from "@/components/Card"
import Badge from "@/components/Badge"

const EventsScreen = () => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")
  const upcomingEvents = [
    {
      id: "1",
      title: "La Union Beach Trip",
      date: "May 15-17, 2025",
      location: "San Juan, La Union",
      attendees: 8,
      image: "https://via.placeholder.com/80",
      confirmed: true,
    },
    {
      id: "2",
      title: "Eraserheads Concert",
      date: "June 5, 2025",
      location: "MOA Arena, Pasay",
      attendees: 12,
      image: "https://via.placeholder.com/80",
      confirmed: false,
    },
    {
      id: "3",
      title: "Movie Night: Deadpool",
      date: "April 25, 2025",
      location: "SM Megamall, Mandaluyong",
      attendees: 5,
      image: "https://via.placeholder.com/80",
      confirmed: true,
    },
  ]

  const pastEvents = [
    {
      id: "4",
      title: "Tagaytay Food Trip",
      date: "March 10, 2025",
      location: "Tagaytay City",
      attendees: 6,
      image: "https://via.placeholder.com/80",
    },
    {
      id: "5",
      title: "Karaoke Night",
      date: "February 28, 2025",
      location: "Centris, Quezon City",
      attendees: 7,
      image: "https://via.placeholder.com/80",
    },
  ]

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Events</Text>
            <Text style={styles.headerSubtitle}>Manage your hangouts</Text>
          </View>
          <Button
            title="New Event"
            size="sm"
            icon={<Ionicons name="add" size={16} color={colors.white} />}
            onPress={() => {}}
          />
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
            onPress={() => setActiveTab("upcoming")}
          >
            <Text style={[styles.tabText, activeTab === "upcoming" && styles.activeTabText]}>Upcoming</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "past" && styles.activeTab]}
            onPress={() => setActiveTab("past")}
          >
            <Text style={[styles.tabText, activeTab === "past" && styles.activeTabText]}>Past</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {activeTab === "upcoming" ? (
            <View style={styles.eventsList}>
              {upcomingEvents.map((event) => (
                 <Link key={event.id} href={`/event-details/${event.id}`} asChild>
                <TouchableOpacity >
                  <Card style={styles.eventCard}>
                    <CardContent padding={false}>
                      <View style={styles.eventContent}>
                        <Image source={{ uri: event.image }} style={styles.eventImage} />
                        <View style={styles.eventDetails}>
                          <View style={styles.eventTitleRow}>
                            <Text style={styles.eventTitle}>{event.title}</Text>
                            {event.confirmed ? (
                              <Badge>Confirmed</Badge>
                            ) : (
                              <Badge variant="outline" color={colors.amber[500]}>
                                Planning
                              </Badge>
                            )}
                          </View>
                          <View style={styles.eventMeta}>
                            <Ionicons name="calendar-outline" size={12} color={colors.gray[500]} />
                            <Text style={styles.eventMetaText}>{event.date}</Text>
                          </View>
                          <View style={styles.eventMeta}>
                            <Ionicons name="location-outline" size={12} color={colors.gray[500]} />
                            <Text style={styles.eventMetaText}>{event.location}</Text>
                          </View>
                          <View style={styles.eventMeta}>
                            <Ionicons name="people-outline" size={12} color={colors.gray[500]} />
                            <Text style={styles.eventMetaText}>{event.attendees} people</Text>
                          </View>
                        </View>
                      </View>
                    </CardContent>
                  </Card>
                </TouchableOpacity>
                </Link>
              ))}
            </View>
          ) : (
            <View style={styles.eventsList}>
              {pastEvents.map((event) => (
                <Link key={event.id} href={`/event-details/${event.id}`} asChild>
                <TouchableOpacity >
                  <Card style={{...styles.eventCard, ...styles.pastEventCard}}>
                    <CardContent padding={false}>
                      <View style={styles.eventContent}>
                        <Image source={{ uri: event.image }} style={{...styles.eventImage, ...styles.pastEventImage}} />
                        <View style={styles.eventDetails}>
                          <Text style={styles.pastEventTitle}>{event.title}</Text>
                          <View style={styles.eventMeta}>
                            <Ionicons name="calendar-outline" size={12} color={colors.gray[500]} />
                            <Text style={styles.eventMetaText}>{event.date}</Text>
                          </View>
                          <View style={styles.eventMeta}>
                            <Ionicons name="location-outline" size={12} color={colors.gray[500]} />
                            <Text style={styles.eventMetaText}>{event.location}</Text>
                          </View>
                          <View style={styles.eventMeta}>
                            <Ionicons name="people-outline" size={12} color={colors.gray[500]} />
                            <Text style={styles.eventMetaText}>{event.attendees} people</Text>
                          </View>
                        </View>
                      </View>
                    </CardContent>
                  </Card>
                </TouchableOpacity>
                </Link>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.gray[900],
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.gray[500],
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.white,
  },
  tabText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  activeTabText: {
    fontWeight: "600",
    color: colors.gray[900],
  },
  eventsList: {
    paddingBottom: 16,
  },
  eventCard: {
    marginBottom: 12,
  },
  pastEventCard: {
    opacity: 0.8,
  },
  eventContent: {
    flexDirection: "row",
    padding: 12,
  },
  eventImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
  },
  pastEventImage: {
    opacity: 0.7,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[900],
    flex: 1,
    marginRight: 8,
  },
  pastEventTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[700],
    marginBottom: 4,
  },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  eventMetaText: {
    fontSize: 12,
    color: colors.gray[500],
    marginLeft: 4,
  },
})

export default EventsScreen