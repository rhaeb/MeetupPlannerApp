"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons"
import { eventController } from "../../controllers/eventController"
import { expenseController } from "../../controllers/expenseController"
import type { Event, Profile } from "../../types"
import { useAuth } from "../../hooks/useAuth"

export default function EventDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { profile } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [attendees, setAttendees] = useState<Profile[]>([])
  const [userStatus, setUserStatus] = useState<"going" | "maybe" | "not_going" | "invited">("invited")
  const [loading, setLoading] = useState(true)
  const [budget, setBudget] = useState<{ total: number; perPerson: number }>({ total: 0, perPerson: 0 })
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [userRating, setUserRating] = useState<number | null>(null)
  const [hasRated, setHasRated] = useState(false)
  const [averageRating, setAverageRating] = useState<number | null>(null)

  const fetchEventDetails = async () => {
    try {
      setLoading(true)
      if (!id) return

      // Fetch event details
      const { data: eventData, error: eventError } = await eventController.getEventById(id as string)
      if (eventError) {
        console.error("Error fetching event details:", eventError)
        return
      }

      setEvent(eventData)

      // Fetch attendees
      const { data: attendeesData, error: attendeesError } = await eventController.getEventAttendees(id as string)
      if (attendeesError) {
        console.error("Error fetching attendees:", attendeesError)
        return
      }

      const allAttendees = [
        ...(attendeesData?.attendees?.map((a) => ({ ...a, status: "going" })) || []),
        ...(attendeesData?.maybes?.map((a) => ({ ...a, status: "maybe" })) || []),
        ...(attendeesData?.notGoing?.map((a) => ({ ...a, status: "not_going" })) || []),
        ...(attendeesData?.invited?.map((a) => ({ ...a, status: "invited" })) || []),
      ]
      setAttendees(allAttendees)

      // Check user's attendance status
      if (profile && attendeesData) {
        const isGoing = attendeesData.attendees.some((a) => a.prof_id === profile.prof_id)
        const isMaybe = attendeesData.maybes.some((a) => a.prof_id === profile.prof_id)
        const isNotGoing = attendeesData.notGoing.some((a) => a.prof_id === profile.prof_id)

        if (isGoing) setUserStatus("going")
        else if (isMaybe) setUserStatus("maybe")
        else if (isNotGoing) setUserStatus("not_going")
        else setUserStatus("invited")
      }

      // Fetch budget summary
      if (eventData) {
        const { data: expenseData, error: expenseError } = await expenseController.getEventExpenses(eventData.event_id)
        if (!expenseError && expenseData) {
          const total = expenseData.total || 0
          // Avoid division by zero
          const attendeeCount = attendeesData?.attendees?.length || 1
          setBudget({
            total,
            perPerson: attendeeCount > 0 ? Math.round(total / attendeeCount) : 0,
          })
        }
      }
    } catch (error) {
      console.error("Error in fetchEventDetails:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEventDetails()
  }, [id, profile])

  const handleAttendance = async (status: "going" | "maybe" | "not_going") => {
    if (!profile || !event) return

    try {
      const { error } = await eventController.respondToEvent(profile.prof_id, event.event_id, status)

      if (error) {
        console.error("Error updating attendance:", error)
        return
      }

      await fetchEventDetails()
      setUserStatus(status)
    } catch (error) {
      console.error("Error in handleAttendance:", error)
    }
  }

  const isEventLive = (event) => {
    const now = new Date()
    const startDate = new Date(event.date_start)
    const endDate = new Date(event.date_end)
    return startDate <= now && now <= endDate
  }

  const handleRateEvent = async (rating: number) => {
    try {
      const { error } = await eventController.rateEvent(event.event_id, rating)
      if (error) {
        Alert.alert("Error", "Failed to submit rating. Please try again.")
        return
      }

      setUserRating(rating)
      setHasRated(true)
      setAverageRating(rating)

      // Update the local event object with the new rating
      setEvent({
        ...event,
        rating: rating,
      })

      Alert.alert("Success", "Thank you for rating this event!")
    } catch (error) {
      console.error("Error rating event:", error)
      Alert.alert("Error", "Something went wrong. Please try again.")
    }
  }

  // Add this function to check if an event is in the past
  const isEventPast = (event) => {
    if (!event) return false
    const now = new Date()
    const endDate = new Date(event.date_end)
    return endDate < now
  }

  // Add this function to render stars for rating
  const renderStars = (rating: number, interactive = false) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            disabled={!interactive || hasRated}
            onPress={() => interactive && handleRateEvent(star)}
          >
            <Ionicons
              name={star <= Math.round(rating) ? "star" : "star-outline"}
              size={24}
              color={star <= Math.round(rating) ? "#FFD700" : "#FFD700"}
              style={styles.starIcon}
            />
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  // Add this useEffect to check if the event already has a rating
  useEffect(() => {
    if (event && event.rating) {
      setAverageRating(event.rating)
      setHasRated(true)
    }
  }, [event])

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0B5E42" />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
          <View style={styles.shareButton} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Event not found.</Text>
          <TouchableOpacity style={styles.goBackButton} onPress={() => router.back()}>
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // Format date range
  const formatDateRange = () => {
    const startDate = new Date(event.date_start)
    const endDate = new Date(event.date_end)

    const options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" }

    if (event.date_start === event.date_end) {
      return startDate.toLocaleDateString("en-US", options)
    }

    return `${startDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}-${endDate.toLocaleDateString("en-US", options)}`
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        {/* Only show edit button if current user is the host */}
        {event?.hoster_id === profile?.prof_id && (
          <TouchableOpacity style={styles.shareButton} onPress={() => router.push(`/events/edit/${id}`)}>
            <Ionicons name="create-outline" size={24} color="#333" />
          </TouchableOpacity>
        )}
      </View>
      {showAttendanceModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Attendance Status</Text>
            {["going", "maybe", "not_going"].map((status) => (
              <TouchableOpacity
                key={status}
                style={styles.modalOption}
                onPress={async () => {
                  await handleAttendance(status as "going" | "maybe" | "not_going")
                  setShowAttendanceModal(false)
                }}
              >
                <Text style={styles.modalOptionText}>{status.replace("_", " ")}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowAttendanceModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.bannerContainer}>
          <Image
            source={{
              uri:
                event.picture ||
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhY2h8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
            }}
            style={styles.eventImage}
          />
          <View style={styles.gradientLayer1} />
          <View style={styles.gradientLayer2} />
          <View style={styles.gradientLayer3} />
          <View style={styles.gradientLayer4} />
          <View style={styles.gradientLayer5} />
          {/* Your actual content goes here */}

          <View style={styles.bannerOverlay}>
            <Text style={styles.eventTitle}>{event.name}</Text>
            {isEventLive(event) ? (
              <View style={[styles.statusBadge, { backgroundColor: "#ff9800" }]}>
                <Text style={[styles.statusText, { color: "#fff" }]}>Live now</Text>
              </View>
            ) : (
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {event.status === "planned"
                    ? "Planning"
                    : event.status === "active"
                      ? "Confirmed"
                      : event.status === "completed"
                        ? "Completed"
                        : "Cancelled"}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={20} color="#0B5E42" style={styles.detailIcon} />
            <Text style={styles.detailText}>{formatDateRange()}</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={20} color="#0B5E42" style={styles.detailIcon} />
            <Text style={styles.detailText}>{event.time || "6:00 AM Departure"}</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={20} color="#0B5E42" style={styles.detailIcon} />
            <Text style={styles.detailText}>{event.address}</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            {event.description ||
              "Weekend getaway to Lapulapu! We'll surf, chill at a hotel, and enjoy the sunset at the Beach. Don't forget to bring sunscreen and good vibes!"}
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.attendeesHeader}>
            <View style={styles.attendeesTitleContainer}>
              <Ionicons name="people-outline" size={20} color="#0B5E42" />
              <Text style={styles.sectionTitle}>Attendees ({attendees.length})</Text>
            </View>
            {/* <TouchableOpacity>
              <Text style={styles.inviteMoreText}>Invite more</Text>
            </TouchableOpacity> */}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.attendeesContainer}
          >
            {attendees.length > 0 ? (
              attendees.slice(0, 4).map((attendee, index) => (
                <Pressable
                  key={attendee.prof_id || index}
                  style={styles.attendeeItem}
                  onPress={() => {
                    if (attendee.prof_id === profile?.prof_id) {
                      router.push("/tabs/profile")
                    } else {
                      router.push(`/friends/${attendee.prof_id}`)
                    }
                  }}
                >
                  <View style={styles.attendeeImageContainer}>
                    {attendee.photo ? (
                      <Image source={{ uri: attendee.photo }} style={styles.attendeeImage} />
                    ) : (
                      <View style={styles.attendeeImagePlaceholder}>
                        <Text style={styles.attendeeInitial}>
                          {attendee.name ? attendee.name.charAt(0).toUpperCase() : "?"}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.attendeeName}>{attendee.name}</Text>
                  <View
                    style={[
                      styles.attendeeStatus,
                      attendee.status === "going"
                        ? styles.statusGoing
                        : attendee.status === "maybe"
                          ? styles.statusMaybe
                          : attendee.status === "invited"
                            ? styles.statusInvited
                            : styles.statusNotGoing,
                    ]}
                  >
                    <Text style={styles.attendeeStatusText}>{attendee.status}</Text>
                  </View>
                </Pressable>
              ))
            ) : (
              <Text style={styles.noAttendeesText}>No attendees yet</Text>
            )}
          </ScrollView>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={() => router.push(`/events/${id}/polls`)} style={styles.actionButton}>
            <FontAwesome5 name="poll" size={20} color="#0B5E42" />
            <Text style={styles.actionText}>Polls</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push(`/events/${id}/budget-summary`)} style={styles.actionButton}>
            <MaterialIcons name="attach-money" size={24} color="#0B5E42" />
            <Text style={styles.actionText}>Budget</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#0B5E42" />
            <Text style={styles.actionText}>Chat</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Budget Summary</Text>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Total expenses:</Text>
            <Text style={styles.budgetValue}>₱ {budget.total.toLocaleString()}</Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Per person:</Text>
            <Text style={styles.budgetValue}>₱ {budget.perPerson.toLocaleString()}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push(`/events/${id}/budget-summary`)}>
            <Text style={styles.viewFullBudgetText}>View Full Budget</Text>
          </TouchableOpacity>
        </View>

        {isEventPast(event) && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Overall Rating</Text>

            {hasRated || event.rating ? (
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingNumber}>{averageRating || event.rating || 0}</Text>
                {renderStars(averageRating || event.rating || 0)}
              </View>
            ) : (
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingPrompt}>Rate this event:</Text>
                {renderStars(userRating || 0, true)}
              </View>
            )}
          </View>
        )}

        {event.hoster_id !== profile?.prof_id && (
          <TouchableOpacity style={styles.confirmButton} onPress={() => setShowAttendanceModal(true)}>
            <Text style={styles.confirmButtonText}>
              {userStatus === "invited" ? "Confirm Attendance" : "Change Attendance"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  goBackButton: {
    backgroundColor: "#0B5E42",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  goBackButtonText: {
    color: "#fff",
    fontWeight: "600",
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
    flex: 1, // take up remaining space
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "left",
    marginLeft: 10, // add some space from the close button
  },
  shareButton: {
    padding: 4,
    width: 32,
    alignItems: "center",
  },
  content: {
    paddingBottom: 30,
  },
  bannerContainer: {
    position: "relative",
    width: "100%",
    height: 200,
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 16,
    right: 16,
    paddingVertical: 15,
  },
  gradientLayer1: {
    position: "absolute",
    top: "60%",
    left: 0,
    right: 0,
    height: "60%",
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    opacity: 0.7,
    elevation: 20,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    shadowRadius: 10.84,
  },
  gradientLayer2: {
    position: "absolute",
    top: "63%",
    left: 0,
    right: 0,
    height: "60%",
    backgroundColor: "rgba(0, 0, 0, 0.28)",
    opacity: 0.6,
    elevation: 5,
  },
  gradientLayer3: {
    position: "absolute",
    top: "68%",
    left: 0,
    right: 0,
    height: "60%",
    backgroundColor: "rgba(0, 0, 0, 0.32)",
    opacity: 0.6,
    elevation: 50,
  },
  gradientLayer4: {
    position: "absolute",
    top: "70%",
    left: 0,
    right: 0,
    height: "30%",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    shadowOpacity: 0.25,
  },

  gradientLayer5: {
    position: "absolute",
    top: "65%",
    left: 0,
    right: 0,
    height: "60%",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    shadowOpacity: 0.25,
  },

  eventTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: "#4CAF50",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  detailsContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailIcon: {
    marginRight: 12,
  },
  detailText: {
    fontSize: 16,
    color: "#333",
  },
  sectionContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  attendeesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  attendeesTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  inviteMoreText: {
    color: "#0B5E42",
    fontWeight: "600",
  },
  attendeesContainer: {
    paddingBottom: 8,
  },
  attendeeItem: {
    alignItems: "center",
    marginRight: 20,
    width: 70,
  },
  attendeeImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: 8,
  },
  attendeeImage: {
    width: "100%",
    height: "100%",
  },
  attendeeImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  attendeeInitial: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#666",
  },
  attendeeName: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    textAlign: "center",
  },
  attendeeStatus: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#e0f2f1",
  },
  statusGoing: {
    backgroundColor: "#e8f5e9",
  },
  statusMaybe: {
    backgroundColor: "#fff3e0",
  },
  statusInvited: {
    backgroundColor: "#e0f7fa",
  },
  statusNotGoing: {
    backgroundColor: "#ffebee",
  },
  attendeeStatusText: {
    fontSize: 12,
    color: "#0B5E42",
  },
  noAttendeesText: {
    color: "#999",
    fontStyle: "italic",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e8f5e9",
    paddingVertical: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionText: {
    marginTop: 8,
    color: "#0B5E42",
    fontWeight: "600",
  },
  budgetItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 16,
    color: "#333",
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  viewFullBudgetText: {
    color: "#0B5E42",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 12,
  },
  confirmButton: {
    backgroundColor: "#0B5E42",
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalOption: {
    paddingVertical: 10,
  },
  modalOptionText: {
    fontSize: 16,
    textAlign: "center",
  },
  modalCancel: {
    marginTop: 10,
    color: "red",
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  starIcon: {
    marginHorizontal: 2,
  },
  ratingContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ratingNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  ratingPrompt: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
})
