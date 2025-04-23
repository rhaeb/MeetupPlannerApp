import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import { Link } from "expo-router/";
import Ionicons from "react-native-vector-icons/Ionicons";

import { colors } from "@/constants/colors";
import Button from "@/components/Button";
import { Card, CardContent } from "@/components/Card";
import Badge from "@/components/Badge";

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
];

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
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Image source={require("@/assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.subtitle}>Plan your next adventure</Text>
        </View>
        <Link href="/events/new" asChild>
          <Button
            title="New Event"
            size="sm"
            icon={<Ionicons name="add" size={16} color={colors.white} />}
            onPress={() => {
                // your navigation or handler code here
              }}
          />
        </Link>
      </View>

      <View style={styles.quickLinks}>
        <Link href="/(tabs)/events" asChild>
          <TouchableOpacity style={[styles.quickLink, styles.quickLinkBg]}>
            <Ionicons name="calendar" size={32} color={colors.green[600]} />
            <Text style={styles.quickLinkText}>All Events</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/(tabs)/friends" asChild>
          <TouchableOpacity style={[styles.quickLink, styles.quickLinkBg]}>
            <Ionicons name="people" size={32} color={colors.green[600]} />
            <Text style={styles.quickLinkText}>Friends</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <Link href="/(tabs)/events" asChild>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {upcomingEvents.map((event) => (
          <Link href={`/event-details/${event.id}`} key={event.id} asChild>
            <TouchableOpacity>
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

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Past Events</Text>
          <Link href="/(tabs)/events?filter=past" asChild>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {pastEvents.map((event) => (
          <Link href={`/event-details/${event.id}`} key={event.id} asChild>
            <TouchableOpacity>
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
    </ScrollView>
  );
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
  logo: {
    width: 150,
    height: 75,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 4,
  },
  quickLinks: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  quickLink: {
    width: "48%",
    height: 100,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLinkBg: {
    backgroundColor: colors.green[100],
  },
  quickLinkText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[900],
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[900],
  },
  seeAll: {
    fontSize: 14,
    color: colors.green[600],
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
});