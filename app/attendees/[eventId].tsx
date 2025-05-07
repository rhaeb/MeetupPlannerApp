"use client"

import React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

// Mock data for attendees
const attendeesList = [
  {
    id: "1",
    name: "Alex Smith",
    avatar: "/placeholder.svg?height=50&width=50",
    status: "Going",
  },
  {
    id: "2",
    name: "Jamie Lee",
    avatar: "/placeholder.svg?height=50&width=50",
    status: "Going",
  },
  {
    id: "3",
    name: "Chris Wong",
    avatar: "/placeholder.svg?height=50&width=50",
    status: "Maybe",
  },
  {
    id: "4",
    name: "Pat Taylor",
    avatar: "/placeholder.svg?height=50&width=50",
    status: "Going",
  },
  {
    id: "5",
    name: "Jordan Rivera",
    avatar: "/placeholder.svg?height=50&width=50",
    status: "Going",
  },
  {
    id: "6",
    name: "Casey Johnson",
    avatar: "/placeholder.svg?height=50&width=50",
    status: "Not Going",
  },
  {
    id: "7",
    name: "Taylor Swift",
    avatar: "/placeholder.svg?height=50&width=50",
    status: "Maybe",
  },
  {
    id: "8",
    name: "Morgan Freeman",
    avatar: "/placeholder.svg?height=50&width=50",
    status: "Going",
  },
]

export default function AttendeesScreen() {
  const router = useRouter()
  const { eventId } = useLocalSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredAttendees = attendeesList.filter((attendee) => {
    // Filter by search query
    if (searchQuery && !attendee.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Filter by tab
    if (activeTab === "going" && attendee.status !== "Going") {
      return false
    }
    if (activeTab === "maybe" && attendee.status !== "Maybe") {
      return false
    }
    if (activeTab === "notGoing" && attendee.status !== "Not Going") {
      return false
    }

    return true
  })

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendees</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search attendees"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "all" && styles.activeTab]}
          onPress={() => setActiveTab("all")}
        >
          <Text style={[styles.tabText, activeTab === "all" && styles.activeTabText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "going" && styles.activeTab]}
          onPress={() => setActiveTab("going")}
        >
          <Text style={[styles.tabText, activeTab === "going" && styles.activeTabText]}>Going</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "maybe" && styles.activeTab]}
          onPress={() => setActiveTab("maybe")}
        >
          <Text style={[styles.tabText, activeTab === "maybe" && styles.activeTabText]}>Maybe</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "notGoing" && styles.activeTab]}
          onPress={() => setActiveTab("notGoing")}
        >
          <Text style={[styles.tabText, activeTab === "notGoing" && styles.activeTabText]}>Not Going</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredAttendees}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.attendeeItem} onPress={() => router.push(`/chat/${item.id}`)}>
            <Image source={{ uri: item.avatar }} style={styles.attendeeAvatar} />
            <View style={styles.attendeeInfo}>
              <Text style={styles.attendeeName}>{item.name}</Text>
              <Text
                style={[
                  styles.attendeeStatus,
                  item.status === "Going" && styles.statusGoing,
                  item.status === "Maybe" && styles.statusMaybe,
                  item.status === "Not Going" && styles.statusNotGoing,
                ]}
              >
                {item.status}
              </Text>
            </View>
            <TouchableOpacity style={styles.messageButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#4CAF50" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.attendeesList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No attendees found</Text>
          </View>
        }
      />
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
  searchContainer: {
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "#e8f5e9",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    color: "#4CAF50",
    fontWeight: "500",
  },
  attendeesList: {
    padding: 15,
  },
  attendeeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  attendeeAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: "#e0e0e0",
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  attendeeStatus: {
    fontSize: 14,
    color: "#666",
  },
  statusGoing: {
    color: "#4CAF50",
  },
  statusMaybe: {
    color: "#FF9800",
  },
  statusNotGoing: {
    color: "#F44336",
  },
  messageButton: {
    padding: 10,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#999",
  },
})
