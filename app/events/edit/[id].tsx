"use client"

import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, Image, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import * as ImagePicker from "expo-image-picker"
import { eventController } from "../../../controllers/eventController"
import { Event, Profile } from "../../../types"
import { supabase } from "../../../lib/supabase"
import { useAuth } from "../../../hooks/useAuth"
import { useEvents } from "../../../contexts/EventsContext"

// Sample event images
const sampleImages = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhY2h8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29uY2VydHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1555679486-e341a3e7b6de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXF1YXJpdW18ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
]

export default function EditEventScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { profile } = useAuth()
  const { updateEventInList, removeEventFromList, refreshEvents } = useEvents();
  
  const [event, setEvent] = useState<Event | null>(null)
  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Date and time pickers
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showStartTimePicker, setShowStartTimePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const [showEndTimePicker, setShowEndTimePicker] = useState(false)
  
  // Separate date and time states
  const [startDate, setStartDate] = useState(new Date())
  const [startTime, setStartTime] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [endTime, setEndTime] = useState(new Date())
  
  // Image selection
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [customImage, setCustomImage] = useState<string | null>(null)
  
  // Attendee management
  const [attendeeInput, setAttendeeInput] = useState("")
  const [selectedAttendees, setSelectedAttendees] = useState<Profile[]>([])
  const [loadingAttendees, setLoadingAttendees] = useState(false)
  const [existingAttendeeIds, setExistingAttendeeIds] = useState<string[]>([])

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        if (!id) {
          Alert.alert("Error", "Event ID is missing")
          router.back()
          return
        }

        setLoading(true)
        const { data, error } = await eventController.getEventById(id as string)
        
        if (error || !data) {
          console.error("Error fetching event:", error)
          Alert.alert("Error", "Failed to load event details")
          router.back()
          return
        }
        
        setEvent(data)
        setTitle(data.name || "")
        setLocation(data.address || "")
        setDescription(data.description || "")
        
        // Set dates and times if available
        if (data.date_start) {
          const startDateTime = new Date(data.date_start)
          
          // Set date (year, month, day)
          setStartDate(new Date(
            startDateTime.getFullYear(),
            startDateTime.getMonth(),
            startDateTime.getDate()
          ))
          
          // Set time (hours, minutes)
          setStartTime(startDateTime)
        }
        
        if (data.date_end) {
          const endDateTime = new Date(data.date_end)
          
          // Set date (year, month, day)
          setEndDate(new Date(
            endDateTime.getFullYear(),
            endDateTime.getMonth(),
            endDateTime.getDate()
          ))
          
          // Set time (hours, minutes)
          setEndTime(endDateTime)
        }
        
        // Set image if available
        if (data.picture) {
          if (sampleImages.includes(data.picture)) {
            setSelectedImage(data.picture)
          } else {
            setCustomImage(data.picture)
          }
        }
        
        // Fetch attendees
        fetchAttendees(data.event_id)
      } catch (error) {
        console.error("Error in fetchEventDetails:", error)
        Alert.alert("Error", "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchEventDetails()
  }, [id])
  
  const fetchAttendees = async (eventId: string) => {
    try {
      setLoadingAttendees(true)
      const { data, error } = await eventController.getEventAttendees(eventId)
      
      if (error) {
        console.error("Error fetching attendees:", error)
        return
      }
      
      if (data) {
        // Store all attendee IDs for checking duplicates later
        const allAttendeeIds = [
          ...data.attendees.map(a => a.prof_id),
          ...data.maybes.map(a => a.prof_id),
          ...data.notGoing.map(a => a.prof_id),
          ...data.invited.map(a => a.prof_id)
        ]
        setExistingAttendeeIds(allAttendeeIds)
        
        // Combine all attendees except the host and current user
        const allAttendees = [
          ...data.attendees,
          ...data.maybes,
          ...data.notGoing,
          ...data.invited
        ].filter(attendee => 
          attendee.prof_id !== profile?.prof_id && 
          attendee.prof_id !== event?.hoster_id
        )
        
        setSelectedAttendees(allAttendees)
      }
    } catch (error) {
      console.error("Error in fetchAttendees:", error)
    } finally {
      setLoadingAttendees(false)
    }
  }

  const searchAndAddAttendee = async () => {
    if (!attendeeInput.trim()) {
      return
    }

    try {
      // Search by username
      let { data: profilesByUsername, error: usernameError } = await supabase
        .from("profile")
        .select("prof_id, username, user_id")
        .ilike("username", `%${attendeeInput}%`)
        .limit(1)

      if (usernameError) throw usernameError

      // If not found by username, search by email
      if (!profilesByUsername || profilesByUsername.length === 0) {
        let { data: usersByEmail, error: emailError } = await supabase
          .from("users", { schema: "auth" })
          .select("id, email")
          .ilike("email", `%${attendeeInput}%`)
          .limit(1)

        if (emailError) throw emailError

        // If found by email, get the profile
        if (usersByEmail && usersByEmail.length > 0) {
          const { data: profileByEmail, error: profileError } = await supabase
            .from("profile")
            .select("prof_id, username, user_id")
            .eq("user_id", usersByEmail[0].id)
            .single()

          if (profileError) throw profileError

          if (profileByEmail) {
            // Add email to the profile object
            const profileWithEmail = {
              ...profileByEmail,
              users: { email: usersByEmail[0].email }
            }
            
            // Check if it's the current user or host
            if (profileWithEmail.prof_id === profile?.prof_id || profileWithEmail.prof_id === event?.hoster_id) {
              Alert.alert("Cannot add", "You cannot add yourself or the host as an attendee")
              setAttendeeInput("")
              return
            }
            
            // Check if already added to UI
            if (selectedAttendees.some(p => p.prof_id === profileWithEmail.prof_id)) {
              Alert.alert("Already added", "This attendee is already in your list")
              setAttendeeInput("")
              return
            }
            
            setSelectedAttendees(prev => [...prev, profileWithEmail])
            setAttendeeInput("")
          } else {
            Alert.alert("User not found", "No user found with that email or username")
          }
        } else {
          Alert.alert("User not found", "No user found with that email or username")
        }
      } else {
        // User found by username
        const foundProfile = profilesByUsername[0]
        
        // Check if it's the current user or host
        if (foundProfile.prof_id === profile?.prof_id || foundProfile.prof_id === event?.hoster_id) {
          Alert.alert("Cannot add", "You cannot add yourself or the host as an attendee")
          setAttendeeInput("")
          return
        }
        
        // Check if already added to UI
        if (selectedAttendees.some(p => p.prof_id === foundProfile.prof_id)) {
          Alert.alert("Already added", "This attendee is already in your list")
          setAttendeeInput("")
          return
        }
        
        setSelectedAttendees(prev => [...prev, foundProfile])
        setAttendeeInput("")
      }
    } catch (error) {
      console.error("Error searching for attendee:", error)
      Alert.alert("Error", "Failed to search for user")
    }
  }

  const removeAttendee = (profId: string) => {
    setSelectedAttendees(prev => prev.filter(p => p.prof_id !== profId))
  }

  const handleSelectImage = (imageUrl) => {
    setSelectedImage(imageUrl)
    setCustomImage(null)
  }

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "You need to grant permission to access your photos")
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCustomImage(result.assets[0].uri)
        setSelectedImage(null)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "Failed to pick image")
    }
  }

  const handleDeleteImage = () => {
    setSelectedImage(null)
    setCustomImage(null)
  }

  const handleSave = async () => {
    if (!event || !profile) return

    try {
      setSaving(true)
      
      // Combine date and time for start and end
      const combineDateTime = (date, time) => {
        const combined = new Date(date)
        combined.setHours(
          time.getHours(),
          time.getMinutes(),
          0,
          0
        )
        return combined
      }
      
      const startDateTime = combineDateTime(startDate, startTime)
      const endDateTime = combineDateTime(endDate, endTime)
      
      // Validate dates
      if (endDateTime <= startDateTime) {
        Alert.alert("Invalid dates", "End date and time must be after start date and time")
        setSaving(false)
        return
      }
      
      // Build updates object
      const updates: Partial<Event> = {
        name: title,
        address: location,
        description,
        date_start: startDateTime.toISOString(),
        date_end: endDateTime.toISOString(),
        time: startDateTime.toISOString().substring(11, 19), // "HH:mm:ss" format
      }
      
      // Update picture if selected from sample images
      if (selectedImage) {
        updates.picture = selectedImage
      }
      
      // Update event
      const { error, data: updatedEvent } = await eventController.updateEvent(event.event_id, updates)
      
      if (error) {
        console.error("Error updating event:", error)
        Alert.alert("Error", "Failed to update event")
        return
      }
      
      // Upload custom image if selected and it's a new image (not a URL)
      if (customImage && !customImage.startsWith('http')) {
        const { error: uploadError, data: imageData } = await eventController.uploadEventPicture(event.event_id, customImage)
        if (uploadError) {
          console.error("Error uploading image:", uploadError)
        }
      }
      
      // Handle attendees - only add new ones that aren't already in the database
      const newAttendees = selectedAttendees
        .map(a => a.prof_id)
        .filter(id => !existingAttendeeIds.includes(id))
      
      if (newAttendees.length > 0) {
        const { error: attendeeError } = await eventController.addAttendees(event.event_id, newAttendees)
        if (attendeeError) {
          console.error("Error adding attendees:", attendeeError)
        }
      }
      
      // Update EventsContext for instant sync
      const { data: freshEvent } = await eventController.getEventById(event.event_id);
      if (freshEvent) {
        updateEventInList(freshEvent);
      }

      Alert.alert("Success", "Event updated successfully", [
        { text: "OK", onPress: () => router.back() }
      ])
    } catch (error) {
      console.error("Error in handleSave:", error)
      Alert.alert("Error", "An unexpected error occurred")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!event) return
    
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              setSaving(true)
              const { error } = await eventController.deleteEvent(event.event_id)
              
              if (error) {
                console.error("Error deleting event:", error)
                Alert.alert("Error", "Failed to delete event")
                return
              }
              
              // Remove from EventsContext for instant sync
              removeEventFromList(event.event_id);

              Alert.alert("Success", "Event deleted successfully", [
                { text: "OK", onPress: () => router.replace("/tabs/events") }
              ])
            } catch (error) {
              console.error("Error in handleDelete:", error)
              Alert.alert("Error", "An unexpected error occurred")
            } finally {
              setSaving(false)
            }
          }
        }
      ]
    )
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }
  
  const formatTime = (time) => {
    return time.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Event</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Event</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Event Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter event title"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter event description"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Start Date - Separate from Start Time */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Start Date</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowStartDatePicker(true)}>
            <Text style={styles.dateText}>{formatDate(startDate)}</Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowStartDatePicker(false)
                if (selectedDate) setStartDate(selectedDate)
              }}
            />
          )}
        </View>
        
        {/* Start Time - Separate from Start Date */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Start Time</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowStartTimePicker(true)}>
            <Text style={styles.dateText}>{formatTime(startTime)}</Text>
            <Ionicons name="time-outline" size={20} color="#666" />
          </TouchableOpacity>
          {showStartTimePicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowStartTimePicker(false)
                if (selectedTime) setStartTime(selectedTime)
              }}
            />
          )}
        </View>

        {/* End Date - Separate from End Time */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>End Date</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowEndDatePicker(true)}>
            <Text style={styles.dateText}>{formatDate(endDate)}</Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowEndDatePicker(false)
                if (selectedDate) setEndDate(selectedDate)
              }}
              minimumDate={startDate}
            />
          )}
        </View>
        
        {/* End Time - Separate from End Date */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>End Time</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowEndTimePicker(true)}>
            <Text style={styles.dateText}>{formatTime(endTime)}</Text>
            <Ionicons name="time-outline" size={20} color="#666" />
          </TouchableOpacity>
          {showEndTimePicker && (
            <DateTimePicker
              value={endTime}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowEndTimePicker(false)
                if (selectedTime) setEndTime(selectedTime)
              }}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter location"
            placeholderTextColor="#999"
          />
        </View>
        
        {/* Invite Attendees */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Invite Attendees</Text>
          <View style={styles.attendeeInputContainer}>
            <TextInput
              style={styles.attendeeInput}
              placeholder="Enter username or email"
              value={attendeeInput}
              onChangeText={setAttendeeInput}
            />
            <TouchableOpacity style={styles.addAttendeeButton} onPress={searchAndAddAttendee}>
              <Text style={styles.addAttendeeButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          {loadingAttendees ? (
            <ActivityIndicator size="small" color="#4CAF50" style={{ marginTop: 10 }} />
          ) : selectedAttendees.length > 0 ? (
            <View style={styles.attendeeList}>
              {selectedAttendees.map((attendee) => (
                <View key={attendee.prof_id} style={styles.attendeeItem}>
                  <Text style={styles.attendeeName}>
                    {attendee.username || attendee.name} {attendee.users?.email ? `(${attendee.users.email})` : ''}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => removeAttendee(attendee.prof_id)}
                    style={styles.removeAttendeeButton}
                  >
                    <Ionicons name="close-circle" size={20} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noAttendeesText}>No attendees added yet</Text>
          )}
        </View>

        {/* Choose Picture */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Choose a picture:</Text>
          <View style={styles.imageSelectionContainer}>
            {sampleImages.map((image, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.imageOption, selectedImage === image && styles.selectedImageOption]}
                onPress={() => handleSelectImage(image)}
              >
                <Image source={{ uri: image }} style={styles.imagePreview} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.imageOption, styles.addImageOption, customImage && styles.selectedImageOption]}
              onPress={handlePickImage}
            >
              {customImage ? (
                <Image source={{ uri: customImage }} style={styles.imagePreview} />
              ) : (
                <Ionicons name="add" size={30} color="#4CAF50" />
              )}
            </TouchableOpacity>
          </View>
          {(selectedImage || customImage) && (
            <TouchableOpacity style={styles.deleteImageButton} onPress={handleDeleteImage}>
              <Text style={styles.deleteImageText}>Remove Image</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={styles.updateButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.updateButtonText}>Update Event</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={saving}
        >
          <Text style={styles.deleteButtonText}>Delete Event</Text>
        </TouchableOpacity>
      </ScrollView>
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
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "left",
    marginLeft: 10,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: 120,
  },
  dateInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  updateButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ff6b6b",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ff6b6b",
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
  // Image selection styles
  imageSelectionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  imageOption: {
    width: "23%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedImageOption: {
    borderColor: "#4CAF50",
  },
  addImageOption: {
    backgroundColor: "#e8f5e9",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  deleteImageButton: {
    alignSelf: "center",
    marginTop: 5,
  },
  deleteImageText: {
    color: "#ff6b6b",
    fontSize: 14,
    fontWeight: "500",
  },
  // Attendee management styles
  attendeeInputContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  attendeeInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
    marginRight: 8,
  },
  addAttendeeButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingHorizontal: 15,
    justifyContent: "center",
  },
  addAttendeeButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  attendeeList: {
    marginTop: 10,
  },
  attendeeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  attendeeName: {
    flex: 1,
    fontSize: 14,
  },
  removeAttendeeButton: {
    padding: 5,
  },
  noAttendeesText: {
    color: "#999",
    fontStyle: "italic",
    marginTop: 10,
    textAlign: "center",
  },
})