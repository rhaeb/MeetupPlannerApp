"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform, Image, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import * as ImagePicker from "expo-image-picker"
import { eventController } from "../../controllers/eventController"
import { useAuth } from "../../hooks/useAuth"
import { supabase } from "../../lib/supabase"
import type { Profile } from "../../types"

// Sample event images
const sampleImages = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhY2h8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29uY2VydHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1555679486-e341a3e7b6de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXF1YXJpdW18ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
]

export default function CreateEventScreen() {
  const router = useRouter()
  const { profile } = useAuth()

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [address, setAddress] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [customImage, setCustomImage] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [attendeeInput, setAttendeeInput] = useState("")
  const [selectedAttendees, setSelectedAttendees] = useState<Profile[]>([])

  // Date pickers
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const [showStartTimePicker, setShowStartTimePicker] = useState(false)
  const [showEndTimePicker, setShowEndTimePicker] = useState(false)
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date(new Date().getTime() + 60 * 60 * 1000)) // 1 hour later

  const onStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate
    setShowStartDatePicker(false)
    setStartDate(currentDate)

    // If end date is before start date, update it
    if (endDate < currentDate) {
      setEndDate(new Date(currentDate.getTime() + 60 * 60 * 1000))
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
            
            // Check if already added
            if (!selectedAttendees.some(p => p.prof_id === profileWithEmail.prof_id)) {
              setSelectedAttendees(prev => [...prev, profileWithEmail])
              setAttendeeInput("")
            } else {
              Alert.alert("Already added", "This attendee is already in your list")
            }
          } else {
            Alert.alert("User not found", "No user found with that email or username")
          }
        } else {
          Alert.alert("User not found", "No user found with that email or username")
        }
      } else {
        // User found by username
        const foundProfile = profilesByUsername[0]
        
        // Check if already added
        if (!selectedAttendees.some(p => p.prof_id === foundProfile.prof_id)) {
          setSelectedAttendees(prev => [...prev, foundProfile])
          setAttendeeInput("")
        } else {
          Alert.alert("Already added", "This attendee is already in your list")
        }
      }
    } catch (error) {
      console.error("Error searching for attendee:", error)
      Alert.alert("Error", "Failed to search for user")
    }
  }

  const removeAttendee = (profId: string) => {
    setSelectedAttendees(prev => prev.filter(p => p.prof_id !== profId))
  }

  const onEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate
    setShowEndDatePicker(false)
    setEndDate(currentDate)
  }

  const onStartTimeChange = (event, selectedTime) => {
    setShowStartTimePicker(false)
    if (selectedTime) {
      const newDate = new Date(startDate)
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes())
      setStartDate(newDate)
    }
  }

  const onEndTimeChange = (event, selectedTime) => {
    setShowEndTimePicker(false)
    if (selectedTime) {
      const newDate = new Date(endDate)
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes())
      setEndDate(newDate)
    }
  }

  const formatDate = (date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
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

  const handleCreateEvent = async () => {
    if (!profile) {
      Alert.alert("Error", "You must be logged in to create an event")
      return
    }

    if (!name.trim()) {
      Alert.alert("Error", "Please enter an event name")
      return
    }

    if (!address.trim()) {
      Alert.alert("Error", "Please enter an event location")
      return
    }

    try {
      setCreating(true)

      // Create event
      const eventData = {
        name,
        description,
        date_start: startDate.toISOString(),
        date_end: endDate.toISOString(),
        time: startDate.toISOString().substring(11, 19), // "HH:mm:ss" format
        address,
        picture: selectedImage || "",
        status: "Planning",
        rating: 0,
        hoster_id: profile.prof_id,
      }

      const { data: event, error } = await eventController.createEvent(eventData)

      if (error) throw error

      // Upload custom image if selected
      if (customImage && event) {
        const { error: uploadError } = await eventController.uploadEventPicture(event.event_id, customImage)
        if (uploadError) {
          console.error("Error uploading image:", uploadError)
        }
      }

      // Add attendees if any
      if (selectedAttendees.length > 0 && event) {
        const profIds = selectedAttendees.map((p) => p.prof_id)
        const { error: attendeeError } = await eventController.addAttendees(event.event_id, profIds)
        if (attendeeError) {
          console.error("Error adding attendees:", attendeeError)
        }
      }

      Alert.alert("Success", "Event created successfully!", [
        { text: "OK", onPress: () => router.replace("/tabs/events") },
      ])
    } catch (error) {
      console.error("Error creating event:", error)
      Alert.alert("Error", "Failed to create event. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Event</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Event Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter event name"
            placeholderTextColor="#999"
          />
        </View>

        {/* Description */}
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

        {/* Start Date & Time */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Start Date & Time</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowStartDatePicker(true)}>
            <Text style={styles.dateText}>{formatDate(startDate)}</Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode={Platform.OS === "android" ? "date" : "datetime"}
              display="default"
              onChange={onStartDateChange}
            />
          )}
          {Platform.OS === "android" && (
            <>
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowStartTimePicker(true)}>
                <Text style={styles.dateText}>
                  {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
                <Ionicons name="time-outline" size={20} color="#666" />
              </TouchableOpacity>
              {showStartTimePicker && (
                <DateTimePicker value={startDate} mode="time" display="default" onChange={onStartTimeChange} />
              )}
            </>
          )}
        </View>

        {/* End Date & Time */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>End Date & Time</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowEndDatePicker(true)}>
            <Text style={styles.dateText}>{formatDate(endDate)}</Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode={Platform.OS === "android" ? "date" : "datetime"}
              display="default"
              onChange={onEndDateChange}
              minimumDate={startDate}
            />
          )}
          {Platform.OS === "android" && (
            <>
              <TouchableOpacity style={styles.dateInput} onPress={() => setShowEndTimePicker(true)}>
                <Text style={styles.dateText}>
                  {endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
                <Ionicons name="time-outline" size={20} color="#666" />
              </TouchableOpacity>
              {showEndTimePicker && (
                <DateTimePicker value={endDate} mode="time" display="default" onChange={onEndTimeChange} />
              )}
            </>
          )}
        </View>

        {/* Location */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter location"
            placeholderTextColor="#999"
          />
        </View>

        {/* Invite Attendees - MOVED BEFORE IMAGE SELECTION */}
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
          
          {selectedAttendees.length > 0 && (
            <View style={styles.attendeeList}>
              {selectedAttendees.map((attendee) => (
                <View key={attendee.prof_id} style={styles.attendeeItem}>
                  <Text style={styles.attendeeName}>
                    {attendee.username} {attendee.users?.email ? `(${attendee.users.email})` : ''}
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
          )}
        </View>

        {/* Choose Picture - MOVED AFTER ATTENDEES */}
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
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleCreateEvent} disabled={creating}>
          <Text style={styles.saveButtonText}>Create</Text>
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
    flex: 1, // take up remaining space
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "left",
    marginLeft: 10, // add some space from the close button
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
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
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
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  // New styles for attendee management
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
})