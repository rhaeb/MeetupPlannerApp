"use client"

import React,{ useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Mock data for events (using placeholder images)
const exploreEvents = [
  {
    id: "1",
    title: "Tech Conference 2024",
    date: "May 15, 2024",
    location: "Convention Center",
    image: "https://via.placeholder.com/200x120", // Use a real image URL
    attendees: 45,
  },
  {
    id: "2",
    title: "Networking Mixer",
    date: "May 20, 2024",
    location: "Downtown Lounge",
    image: "https://via.placeholder.com/200x120",
    attendees: 28,
  },
  {
    id: "3",
    title: "Startup Pitch Night",
    date: "June 5, 2024",
    location: "Innovation Hub",
    image: "https://via.placeholder.com/200x120",
    attendees: 32,
  },
  {
    id: "4",
    title: "Design Workshop",
    date: "June 12, 2024",
    location: "Creative Studio",
    image: "https://via.placeholder.com/200x120",
    attendees: 18,
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity style={[styles.filterChip, styles.activeFilterChip]}>
            <Text style={styles.activeFilterText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterText}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterText}>This Week</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterText}>This Month</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterText}>Technology</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.filterText}>Business</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={exploreEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.eventCard} onPress={() => router.push(`/events/${item.id}`)}>
            <Image source={{ uri: item.image }} style={styles.eventImage} />
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <View style={styles.eventDetails}>
                <View style={styles.eventDetailItem}>
                  <Ionicons name="calendar-outline" size={16} color="#4CAF50" />
                  <Text style={styles.eventDetailText}>{item.date}</Text>
                </View>
                <View style={styles.eventDetailItem}>
                  <Ionicons name="location-outline" size={16} color="#4CAF50" />
                  <Text style={styles.eventDetailText}>{item.location}</Text>
                </View>
                <View style={styles.eventDetailItem}>
                  <Ionicons name="people-outline" size={16} color="#4CAF50" />
                  <Text style={styles.eventDetailText}>{item.attendees} attending</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.eventsList}
      />

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/")}>
          <Ionicons name="calendar-outline" size={24} color="#666" />
          <Text style={styles.tabItemText}>Events</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, styles.activeTabItem]}>
          <Ionicons name="search" size={24} color="#4CAF50" />
          <Text style={styles.activeTabItemText}>Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/profile")}>
          <Ionicons name="person-outline" size={24} color="#666" />
          <Text style={styles.tabItemText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  searchContainer: {
    padding: 15,
    backgroundColor: "#fff",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: "#333",
  },
  filterContainer: {
    backgroundColor: "#fff",
    paddingBottom: 15,
  },
  filterScroll: {
    paddingHorizontal: 15,
  },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    marginRight: 10,
  },
  activeFilterChip: {
    backgroundColor: "#4CAF50",
  },
  filterText: {
    color: "#666",
    fontSize: 14,
  },
  activeFilterText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  eventsList: {
    padding: 15,
    paddingBottom: 80,
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  eventImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#e0e0e0",
  },
  eventInfo: {
    padding: 15,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  eventDetails: {
    gap: 5,
  },
  eventDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  eventDetailText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingVertical: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 5,
  },
  activeTabItem: {
    borderTopWidth: 2,
    borderTopColor: "#4CAF50",
  },
  tabItemText: {
    marginTop: 5,
    fontSize: 12,
    color: "#666",
  },
  activeTabItemText: {
    marginTop: 5,
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },
});