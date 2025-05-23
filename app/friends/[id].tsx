"use client"

import { useEffect, useState, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  Alert,
  ScrollView,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { profileController } from "../../controllers/profileController"
import { friendController } from "../../controllers/friendController"
import { eventController } from "../../controllers/eventController"
import { useAuth } from "../../hooks/useAuth"
import type { Profile } from "../../types"

export default function ProfileScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { profile: currentUserProfile } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    attended: 0,
    friends: 0,
    hosted: 0,
  })
  const [message, setMessage] = useState("")
  const [friendStatus, setFriendStatus] = useState<"none" | "friends" | "pending">("none")
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null)
  const [pendingDirection, setPendingDirection] = useState<"sent" | "received" | null>(null)

  // Refs for subscriptions
  const friendRequestSubscription = useRef<any>(null)
  const friendChangesSubscription = useRef<any>(null)

  // Animation value for skeleton loading effect
  const fadeAnim = useState(new Animated.Value(0.3))[0]

  useEffect(() => {
    // Create the pulse animation for skeleton loading
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]),
    ).start()

    // Reset error and set loading when starting to fetch
    if (id && currentUserProfile) {
      setError(null)
      setLoading(true)
      fetchProfileData()
      setupSubscriptions()
    }

    return () => {
      // Clean up subscriptions
      if (friendRequestSubscription.current) {
        friendRequestSubscription.current.unsubscribe()
      }
      if (friendChangesSubscription.current) {
        friendChangesSubscription.current.unsubscribe()
      }
    }
  }, [id, currentUserProfile])

  const setupSubscriptions = () => {
    if (!currentUserProfile || !id) return

    // Subscribe to friend requests
    friendRequestSubscription.current = friendController.subscribeToFriendRequests(
      currentUserProfile.prof_id,
      (payload) => {
        console.log("Friend request change:", payload)
        checkFriendshipStatus()
      },
    )

    // Subscribe to friend changes
    friendChangesSubscription.current = friendController.subscribeToFriendChanges(
      currentUserProfile.prof_id,
      (payload) => {
        console.log("Friend change:", payload)
        checkFriendshipStatus()
        fetchStats()
      },
    )
  }

  const fetchProfileData = async () => {
    // Don't set error if id or currentUserProfile is missing, just return
    if (!id || !currentUserProfile) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch profile details
      const { data: profileData, error: profileError } = await profileController.getProfileById(id as string)

      if (profileError) {
        throw new Error("Failed to load profile")
      }

      setProfile(profileData)

      // Check friendship status
      await checkFriendshipStatus()

      // Fetch stats
      await fetchStats()

      setLoading(false)
    } catch (error) {
      console.error("Error fetching profile data:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      setLoading(false)
    }
  }

  const checkFriendshipStatus = async () => {
    if (!currentUserProfile || !id) return

    try {
      const { data, error } = await friendController.checkFriendRequestStatus(currentUserProfile.prof_id, id as string)

      if (error) {
        console.error("Error checking friendship status:", error)
        return
      }

      if (data) {
        setFriendStatus(data.status)
        if (data.status === "pending") {
          setPendingRequestId(data.requestId || null)
          setPendingDirection(data.direction || null)
        } else {
          setPendingRequestId(null)
          setPendingDirection(null)
        }
      }
    } catch (error) {
      console.error("Error in checkFriendshipStatus:", error)
    }
  }

  const fetchStats = async () => {
    if (!id) return

    try {
      // Get events attended
      const { data: attendedEvents } = await eventController.getAttendingEvents(id as string)

      // Get friends count
      const { data: friendsData } = await friendController.getFriends(id as string)

      // Get hosted events
      const { data: hostedEvents } = await eventController.getHostedEvents(id as string)

      setStats({
        attended: attendedEvents?.length || 0,
        friends: friendsData?.friends.length || 0,
        hosted: hostedEvents?.length || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleSendMessage = () => {
    if (!message.trim() || !profile) return

    // Navigate to chat with initial message
    router.push({
      pathname: `/chat/${profile.prof_id}`,
      params: { initialMessage: message },
    })
  }

  const handleAddFriend = async () => {
    if (!currentUserProfile || !profile) return

    try {
      const { error } = await friendController.sendFriendRequest(currentUserProfile.prof_id, profile.prof_id)

      if (error) {
        console.error("Error sending friend request:", error)
        Alert.alert("Error", "Failed to send friend request")
      } else {
        // Update UI immediately
        setFriendStatus("pending")
        setPendingDirection("sent")
        Alert.alert("Success", "Friend request sent")
      }
    } catch (error) {
      console.error("Error in handleAddFriend:", error)
      Alert.alert("Error", "An unexpected error occurred")
    }
  }

  const handleRemoveFriend = async () => {
    if (!currentUserProfile || !profile) return

    Alert.alert("Remove Friend", `Are you sure you want to remove ${profile.name} from your friends?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await friendController.removeFriend(currentUserProfile.prof_id, profile.prof_id)

            if (error) {
              console.error("Error removing friend:", error)
              Alert.alert("Error", "Failed to remove friend")
            } else {
              // Update UI immediately
              setFriendStatus("none")
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

  const handleCancelRequest = async () => {
    if (!pendingRequestId) return

    try {
      const { error } = await friendController.rejectFriendRequest(pendingRequestId)

      if (error) {
        console.error("Error canceling friend request:", error)
        Alert.alert("Error", "Failed to cancel friend request")
      } else {
        // Update UI immediately
        setFriendStatus("none")
        setPendingRequestId(null)
        setPendingDirection(null)
        Alert.alert("Success", "Friend request canceled")
      }
    } catch (error) {
      console.error("Error in handleCancelRequest:", error)
      Alert.alert("Error", "An unexpected error occurred")
    }
  }

  const handleAcceptRequest = async () => {
    if (!pendingRequestId) return

    try {
      const { error } = await friendController.acceptFriendRequest(pendingRequestId)

      if (error) {
        console.error("Error accepting friend request:", error)
        Alert.alert("Error", "Failed to accept friend request")
      } else {
        // Update UI immediately
        setFriendStatus("friends")
        setPendingRequestId(null)
        setPendingDirection(null)
        Alert.alert("Success", "Friend request accepted")
      }
    } catch (error) {
      console.error("Error in handleAcceptRequest:", error)
      Alert.alert("Error", "An unexpected error occurred")
    }
  }

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      {/* Profile Image Skeleton */}
      <Animated.View style={[styles.profileImageSkeleton, { opacity: fadeAnim }]} />

      {/* Name Skeleton */}
      <Animated.View style={[styles.nameSkeleton, { opacity: fadeAnim }]} />

      {/* Username Skeleton */}
      <Animated.View style={[styles.usernameSkeleton, { opacity: fadeAnim }]} />

      {/* Location Skeleton */}
      <Animated.View style={[styles.locationSkeleton, { opacity: fadeAnim }]} />

      {/* Stats Skeletons */}
      <View style={styles.statsContainer}>
        <Animated.View style={[styles.statItemSkeleton, { opacity: fadeAnim }]} />
        <Animated.View style={[styles.statItemSkeleton, { opacity: fadeAnim }]} />
        <Animated.View style={[styles.statItemSkeleton, { opacity: fadeAnim }]} />
      </View>

      {/* Message Skeleton */}
      <Animated.View style={[styles.messageLabelSkeleton, { opacity: fadeAnim }]} />
      <Animated.View style={[styles.messageInputSkeleton, { opacity: fadeAnim }]} />
    </View>
  )

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={60} color="#FF6B6B" />
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchProfileData}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  )

  const renderFriendshipButton = () => {
    if (currentUserProfile?.prof_id === profile?.prof_id) {
      return null // Don't show any button for own profile
    }

    switch (friendStatus) {
      case "friends":
        return (
          <TouchableOpacity style={styles.removeFriendButton} onPress={handleRemoveFriend}>
            <Ionicons name="person-remove" size={18} color="#fff" />
            <Text style={styles.removeFriendButtonText}>Remove Friend</Text>
          </TouchableOpacity>
        )
      case "pending":
        if (pendingDirection === "sent") {
          return (
            <TouchableOpacity style={styles.pendingButton} onPress={handleCancelRequest}>
              <Ionicons name="time" size={18} color="#fff" />
              <Text style={styles.pendingButtonText}>Pending Request</Text>
            </TouchableOpacity>
          )
        } else {
          return (
            <View style={styles.requestButtonsContainer}>
              <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptRequest}>
                <Ionicons name="checkmark" size={18} color="#fff" />
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectButton} onPress={handleCancelRequest}>
                <Ionicons name="close" size={18} color="#fff" />
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )
        }
      default:
        return (
          <TouchableOpacity style={styles.addFriendButton} onPress={handleAddFriend}>
            <Ionicons name="person-add" size={18} color="#fff" />
            <Text style={styles.addFriendButtonText}>Add Friend</Text>
          </TouchableOpacity>
        )
    }
  }

  const renderProfileContent = () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.profileContainer}>
        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          {profile?.photo ? (
            <Image source={{ uri: profile.photo }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileInitial}>{profile?.name ? profile.name.charAt(0).toUpperCase() : "?"}</Text>
            </View>
          )}
        </View>

        {/* Profile Info */}
        <Text style={styles.profileName}>{profile?.name || "User"}</Text>
        <Text style={styles.username}>@{profile?.username || "username"}</Text>

        {profile?.location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.locationText}>{profile.location}</Text>
          </View>
        )}

        {/* Friendship Button */}
        {renderFriendshipButton()}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>+</Text>
            </View>
            <Text style={styles.statValue}>{stats.attended}</Text>
            <Text style={styles.statLabel}>Attended</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="people" size={20} color="#0B5E42" />
            </View>
            <Text style={styles.statValue}>{stats.friends}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="calendar" size={20} color="#0B5E42" />
            </View>
            <Text style={styles.statValue}>{stats.hosted}</Text>
            <Text style={styles.statLabel}>Hosted</Text>
          </View>
        </View>

        {/* Message Input - Only show if they are friends */}
        {friendStatus === "friends" && (
          <>
            <Text style={styles.messageLabel}>Send a message</Text>
            <View style={styles.messageInputContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder="Type a message..."
                value={message}
                onChangeText={setMessage}
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage} disabled={!message.trim()}>
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{loading ? "Loading Profile..." : profile?.name || "Profile"}</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {loading ? renderLoadingState() : error && !loading ? renderErrorState() : renderProfileContent()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  moreButton: {
    padding: 4,
  },
  // Loading state styles
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  profileImageSkeleton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
    marginBottom: 20,
  },
  nameSkeleton: {
    width: 120,
    height: 24,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
    marginBottom: 8,
  },
  usernameSkeleton: {
    width: 150,
    height: 18,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
    marginBottom: 8,
  },
  locationSkeleton: {
    width: 130,
    height: 16,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
    marginBottom: 30,
  },
  statItemSkeleton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 10,
  },
  messageLabelSkeleton: {
    width: 120,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
    marginTop: 30,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  messageInputSkeleton: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  // Error state styles
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#0B5E42",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  // Profile content styles
  profileContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profileImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#666",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  // Friendship buttons
  addFriendButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 24,
  },
  addFriendButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  removeFriendButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff4d4f",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 24,
  },
  removeFriendButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  pendingButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#faad14",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 24,
  },
  pendingButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  requestButtonsContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  acceptButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  rejectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff4d4f",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  rejectButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 30,
  },
  statItem: {
    alignItems: "center",
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e8f5e9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0B5E42",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  messageLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  messageInputContainer: {
    flexDirection: "row",
    width: "100%",
  },
  messageInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    marginRight: 8,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#6C5CE7",
    justifyContent: "center",
    alignItems: "center",
  },
})
