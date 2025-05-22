"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useAuth } from "../../../hooks/useAuth"
import { friendController } from "../../../controllers/friendController"
import { profileController } from "../../../controllers/profileController"
import type { Profile } from "../../../types"

export default function FriendsScreen() {
  const router = useRouter()
  const { profile: currentUserProfile } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [friends, setFriends] = useState<Profile[]>([])
  const [suggestedProfiles, setSuggestedProfiles] = useState<Profile[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (currentUserProfile) {
      fetchFriends()
      fetchPendingRequests()
      fetchSuggestedProfiles()
    }
  }, [currentUserProfile])

  useEffect(() => {
    // Debounce search to avoid too many requests
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch()
      } else {
        setSearchResults([])
        setIsSearching(false)
      }
    }, 500) // 500ms delay

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const fetchFriends = async () => {
    if (!currentUserProfile) return

    try {
      setLoading(true)
      const { data, error } = await friendController.getFriends(currentUserProfile.prof_id)

      if (error) {
        console.error("Error fetching friends:", error)
        Alert.alert("Error", "Failed to load friends")
      } else if (data) {
        setFriends(data.friends)
      }
    } catch (error) {
      console.error("Error in fetchFriends:", error)
      Alert.alert("Error", "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingRequests = async () => {
    if (!currentUserProfile) return

    try {
      const { data, error } = await friendController.getPendingRequests(currentUserProfile.prof_id)

      if (error) {
        console.error("Error fetching pending requests:", error)
      } else if (data) {
        setPendingRequests([...data.sent, ...data.received])
      }
    } catch (error) {
      console.error("Error in fetchPendingRequests:", error)
    }
  }

  const fetchSuggestedProfiles = async () => {
    if (!currentUserProfile) return

    try {
      // In a real app, you might have a specific API for suggested friends
      // For now, we'll just search for some random profiles
      const { data, error } = await profileController.searchProfiles("")

      if (error) {
        console.error("Error fetching suggested profiles:", error)
      } else if (data) {
        // Filter out current user and existing friends
        const filtered = data.filter(
          (p) =>
            p.prof_id !== currentUserProfile.prof_id &&
            !friends.some((f) => f.prof_id === p.prof_id) &&
            !pendingRequests.some((r) => r.requester_id === p.prof_id || r.requested_id === p.prof_id),
        )

        setSuggestedProfiles(filtered.slice(0, 5)) // Limit to 5 suggestions
      }
    } catch (error) {
      console.error("Error in fetchSuggestedProfiles:", error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    try {
      const { data, error } = await profileController.searchProfiles(searchQuery)

      if (error) {
        console.error("Error searching profiles:", error)
        Alert.alert("Error", "Failed to search profiles")
      } else if (data) {
        // Filter out current user
        const filtered = data.filter((p) => p.prof_id !== currentUserProfile?.prof_id)
        setSearchResults(filtered)
      }
    } catch (error) {
      console.error("Error in handleSearch:", error)
      Alert.alert("Error", "An unexpected error occurred")
    }
  }

  const handleMessage = (friendId: string) => {
    router.push(`/chat/${friendId}`)
  }

  const handleAddFriend = async (profileId: string) => {
    if (!currentUserProfile) return

    try {
      const { error } = await friendController.sendFriendRequest(currentUserProfile.prof_id, profileId)

      if (error) {
        console.error("Error sending friend request:", error)
        Alert.alert("Error", "Failed to send friend request")
      } else {
        Alert.alert("Success", "Friend request sent successfully")
        // Refresh data
        fetchPendingRequests()
        fetchSuggestedProfiles()
      }
    } catch (error) {
      console.error("Error in handleAddFriend:", error)
      Alert.alert("Error", "An unexpected error occurred")
    }
  }

  const handleRemoveFriend = async (friendId: string) => {
    if (!currentUserProfile) return

    Alert.alert("Remove Friend", "Are you sure you want to remove this friend?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await friendController.removeFriend(currentUserProfile.prof_id, friendId)

            if (error) {
              console.error("Error removing friend:", error)
              Alert.alert("Error", "Failed to remove friend")
            } else {
              // Update friends list
              setFriends(friends.filter((f) => f.prof_id !== friendId))
              Alert.alert("Success", "Friend removed successfully")
            }
          } catch (error) {
            console.error("Error in handleRemoveFriend:", error)
            Alert.alert("Error", "An unexpected error occurred")
          }
        },
      },
    ])
  }

  const handleViewProfile = (profileId: string) => {
    router.push(`/friends/${profileId}`)
  }

  const renderFriendItem = (friend: Profile) => (
    <TouchableOpacity key={friend.prof_id} style={styles.friendItem} onPress={() => handleViewProfile(friend.prof_id)}>
      <View style={styles.friendInfo}>
        <Image
          source={{
            uri:
              friend.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}&background=random`,
          }}
          style={styles.avatar}
        />
        <View style={styles.friendDetails}>
          <Text style={styles.friendName}>{friend.name}</Text>
          <Text style={styles.friendUsername}>{friend.username || `@user${friend.prof_id.substring(0, 8)}`}</Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.messageButton} onPress={() => handleMessage(friend.prof_id)}>
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveFriend(friend.prof_id)}>
          <Ionicons name="close" size={16} color="#ff4d4f" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  const renderSuggestedFriendItem = (profile: Profile) => (
    <TouchableOpacity
      key={profile.prof_id}
      style={styles.friendItem}
      onPress={() => handleViewProfile(profile.prof_id)}
    >
      <View style={styles.friendInfo}>
        <Image
          source={{
            uri:
              profile.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`,
          }}
          style={styles.avatar}
        />
        <View style={styles.friendDetails}>
          <Text style={styles.friendName}>{profile.name}</Text>
          <Text style={styles.friendUsername}>{profile.username || `@user${profile.prof_id.substring(0, 8)}`}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={() => handleAddFriend(profile.prof_id)}>
        <Ionicons name="add" size={16} color="#fff" />
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )

  const renderSearchResults = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Search Results</Text>

      {searchResults.length > 0 ? (
        searchResults.map((profile) => {
          const isFriend = friends.some((f) => f.prof_id === profile.prof_id)
          const hasPendingRequest = pendingRequests.some(
            (r) =>
              (r.requester_id === currentUserProfile?.prof_id && r.requested_id === profile.prof_id) ||
              (r.requested_id === currentUserProfile?.prof_id && r.requester_id === profile.prof_id),
          )

          return (
            <TouchableOpacity
              key={profile.prof_id}
              style={styles.friendItem}
              onPress={() => handleViewProfile(profile.prof_id)}
            >
              <View style={styles.friendInfo}>
                <Image
                  source={{
                    uri:
                      profile.photo ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`,
                  }}
                  style={styles.avatar}
                />
                <View style={styles.friendDetails}>
                  <Text style={styles.friendName}>{profile.name}</Text>
                  <Text style={styles.friendUsername}>
                    {profile.username || `@user${profile.prof_id.substring(0, 8)}`}
                  </Text>
                </View>
              </View>

              {isFriend ? (
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.messageButton} onPress={() => handleMessage(profile.prof_id)}>
                    <Text style={styles.messageButtonText}>Message</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveFriend(profile.prof_id)}>
                    <Ionicons name="close" size={16} color="#ff4d4f" />
                  </TouchableOpacity>
                </View>
              ) : hasPendingRequest ? (
                <TouchableOpacity style={styles.pendingButton} disabled>
                  <Text style={styles.pendingButtonText}>Pending</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.addButton} onPress={() => handleAddFriend(profile.prof_id)}>
                  <Ionicons name="add" size={16} color="#fff" />
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )
        })
      ) : (
        <Text style={styles.noResultsText}>No results found</Text>
      )}
    </View>
  )

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
            placeholder="Search by name or username..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>

        {loading && !isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        ) : (
          <>
            {isSearching ? (
              renderSearchResults()
            ) : (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Your Friends</Text>

                  {friends.length > 0 ? (
                    friends.map(renderFriendItem)
                  ) : (
                    <Text style={styles.noFriendsText}>You don't have any friends yet. Try adding some!</Text>
                  )}
                </View>

                {suggestedProfiles.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Suggested Friends</Text>
                    {suggestedProfiles.map(renderSuggestedFriendItem)}
                  </View>
                )}
              </>
            )}
          </>
        )}

        {/* Add some space at the bottom */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  )
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
    height: 45,
  },
  searchButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
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
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  messageButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    marginRight: 8,
  },
  messageButtonText: {
    fontSize: 14,
    color: "#333",
  },
  removeButton: {
    padding: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ffccc7",
    backgroundColor: "#fff1f0",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
  },
  addButtonText: {
    fontSize: 14,
    color: "#fff",
    marginLeft: 4,
  },
  pendingButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
  },
  pendingButtonText: {
    fontSize: 14,
    color: "#666",
  },
  noFriendsText: {
    textAlign: "center",
    color: "#666",
    padding: 20,
    fontStyle: "italic",
  },
  noResultsText: {
    textAlign: "center",
    color: "#666",
    padding: 20,
    fontStyle: "italic",
  },
})
