"use client";

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { eventController } from "../../controllers/eventController";
import { Event, Profile } from "../../types";
import { useAuth } from "../../hooks/useAuth";
import { useEvents } from "../../contexts/EventsContext";

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { profile } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Profile[]>([]);
  const [userStatus, setUserStatus] = useState<'going' | 'maybe' | 'not_going' | 'invited'>('invited');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        if (!id) return;

        // Fetch event details
        const { data: eventData, error: eventError } = await eventController.getEventById(id as string);
        if (eventError) {
          console.error("Error fetching event details:", eventError);
          return;
        }
        
        setEvent(eventData);

        // Fetch attendees
        const { data: attendeesData, error: attendeesError } = await eventController.getEventAttendees(id as string);
        if (attendeesError) {
          console.error("Error fetching attendees:", attendeesError);
          return;
        }

        const allAttendees = [
          ...(attendeesData?.attendees?.map(a => ({ ...a, status: 'going' })) || []),
          ...(attendeesData?.maybes?.map(a => ({ ...a, status: 'maybe' })) || []),
          ...(attendeesData?.notGoing?.map(a => ({ ...a, status: 'not_going' })) || []),
          ...(attendeesData?.invited?.map(a => ({ ...a, status: 'invited' })) || []),
        ];
        setAttendees(allAttendees);

        // Check user's attendance status
        if (profile && attendeesData) {
          const isGoing = attendeesData.attendees.some(a => a.prof_id === profile.prof_id);
          const isMaybe = attendeesData.maybes.some(a => a.prof_id === profile.prof_id);
          const isNotGoing = attendeesData.notGoing.some(a => a.prof_id === profile.prof_id);
          
          if (isGoing) setUserStatus('going');
          else if (isMaybe) setUserStatus('maybe');
          else if (isNotGoing) setUserStatus('not_going');
          else setUserStatus('invited');
        }
      } catch (error) {
        console.error("Error in fetchEventDetails:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, profile]);

  const handleAttendance = async (status: 'going' | 'maybe' | 'not_going') => {
    if (!profile || !event) return;
    
    try {
      const { error } = await eventController.respondToEvent(
        profile.prof_id,
        event.event_id,
        status
      );
      
      if (error) {
        console.error("Error updating attendance:", error);
        return;
      }
      
      setUserStatus(status);
      
      // Refresh attendees list
      const { data: attendeesData } = await eventController.getEventAttendees(event.event_id);
      if (attendeesData) {
        setAttendees(attendeesData.attendees || []);
      }
    } catch (error) {
      console.error("Error in handleAttendance:", error);
    }
  };

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
    );
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
          <TouchableOpacity 
            style={styles.goBackButton}
            onPress={() => router.back()}
          >
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Format date range
  const formatDateRange = () => {
    const startDate = new Date(event.date_start);
    const endDate = new Date(event.date_end);
    
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    
    if (event.date_start === event.date_end) {
      return startDate.toLocaleDateString('en-US', options);
    }
    
    return `${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}-${endDate.toLocaleDateString('en-US', options)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        {/* Only show edit button if current user is the host */}
        {event?.hoster_id === profile?.prof_id && (
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => router.push(`/events/edit/${id}`)}
          >
            <Ionicons name="create-outline" size={24} color="#333" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: event.picture || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhY2h8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60" }}
            style={styles.eventImage}
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.eventTitle}>{event.name}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {event.status === 'planned' ? 'Planning' : 
                 event.status === 'active' ? 'Confirmed' : 
                 event.status === 'completed' ? 'Completed' : 'Cancelled'}
              </Text>
            </View>
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
          <Text style={styles.descriptionText}>{event.description || "Weekend getaway to Lapulapu! We'll surf, chill at a hotel, and enjoy the sunset at the Beach. Don't forget to bring sunscreen and good vibes!"}</Text>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.attendeesHeader}>
            <View style={styles.attendeesTitleContainer}>
              <Ionicons name="people-outline" size={20} color="#0B5E42" />
              <Text style={styles.sectionTitle}>Attendees ({attendees.length})</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.inviteMoreText}>Invite more</Text>
            </TouchableOpacity>
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
                      router.push('/tabs/profile');
                    } else {
                      router.push(`/friends/${attendee.prof_id}`);
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
                  <View style={[
                    styles.attendeeStatus,
                    attendee.status === 'going' ? styles.statusGoing :
                    attendee.status === 'maybe' ? styles.statusMaybe :
                    attendee.status === 'invited' ? styles.statusInvited :
                    styles.statusNotGoing
                  ]}>
                    <Text style={styles.attendeeStatusText}>
                      {attendee.status}
                    </Text>
                  </View>
                </Pressable>
              ))
            ) : (
              <Text style={styles.noAttendeesText}>No attendees yet</Text>
            )}
          </ScrollView>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome5 name="poll" size={20} color="#0B5E42" />
            <Text style={styles.actionText}>Polls</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
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
            <Text style={styles.budgetValue}>₱ 28,000</Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Per person:</Text>
            <Text style={styles.budgetValue}>₱ 7,000</Text>
          </View>
          <TouchableOpacity onPress={() => router.push(`/events/${id}/budget-summary`)}>
        <Text style={styles.viewFullBudgetText}>View Full Budget</Text>
      </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={() => handleAttendance('going')}
        >
          <Text style={styles.confirmButtonText}>
            {userStatus === 'going' ? 'Update Attendance' : 'Confirm Attendance'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
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
    alignItems: 'center',
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
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
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
});