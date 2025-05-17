"use client";

import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Mock data for friends
const yourFriends = [
  {
    id: "1",
    name: "JLL",
    username: "@zyahQueenza13",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80"
  },
  {
    id: "2",
    name: "Samson",
    username: "@samtanuu",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80"
  },
  {
    id: "3",
    name: "Cedrick Mier",
    username: "@kimsohyun",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80"
  },
  {
    id: "4",
    name: "ㅤㅗ 애뜬 여왕",
    username: "@aehnu_",
    avatar: "https://images.unsplash.com/photo-1520810627419-35e362c5dc07?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80"
  },
  {
    id: "5",
    name: "Dalyn Chwe",
    username: "@_JYP_",
    avatar: "https://images.unsplash.com/photo-1545912452-8aea7e25a3d3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80"
  }
];

// Mock data for suggested friends
const suggestedFriends = [
  {
    id: "6",
    name: "imanengtishera halata",
    username: "@beet",
    avatar: "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "7",
    name: "GoldenRetriever",
    username: "@hhhhhhh",
    avatar: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80"
  }
];

export default function FriendsScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleMessage = (friendId: string) => {
    console.log(`Message friend with ID: ${friendId}`);
    // Navigate to chat screen or open message modal
  };

  const handleAddFriend = (friendId: string) => {
    console.log(`Add friend with ID: ${friendId}`);
    // Add friend logic
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Friends</Text>
            <Text style={styles.subtitle}>Connect with your squad</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Friends..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Friends</Text>
          
          {yourFriends.map(friend => (
            <View key={friend.id} style={styles.friendItem}>
              <View style={styles.friendInfo}>
                <Image source={{ uri: friend.avatar }} style={styles.avatar} />
                <View style={styles.friendDetails}>
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <Text style={styles.friendUsername}>{friend.username}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.messageButton}
                onPress={() => handleMessage(friend.id)}
              >
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested Friends</Text>
          
          {suggestedFriends.map(friend => (
            <View key={friend.id} style={styles.friendItem}>
              <View style={styles.friendInfo}>
                <Image source={{ uri: friend.avatar }} style={styles.avatar} />
                <View style={styles.friendDetails}>
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <Text style={styles.friendUsername}>{friend.username}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => handleAddFriend(friend.id)}
              >
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Add some space at the bottom */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 15,
    marginVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  section: {
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 2,
  },
  friendUsername: {
    fontSize: 14,
    color: "#666",
  },
  messageButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  messageButtonText: {
    fontSize: 14,
    color: "#333",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: "#8e44ad",
  },
  addButtonText: {
    fontSize: 14,
    color: "#fff",
    marginLeft: 4,
  },
});