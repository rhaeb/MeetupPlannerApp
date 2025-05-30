import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { profileController } from "../../../controllers/profileController";
import { userController } from "../../../controllers/userController";
import { Profile } from "../../../types";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from '../../../lib/supabase';
import { useProfile } from "../../../contexts/ProfileContext";

export default function EditProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { profile,loading } = useProfile();
  const [saving, setSaving] = useState(false);
  const { setProfile: setGlobalProfile } = useProfile();

  // Form state
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [address, setAddress] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !profile) return;

    // Initialize form state from profile if IDs match
    if (profile.prof_id === id) {
      setName(profile.name || "");
      setUsername(profile.username || "");
      setAddress(profile.address || "");
      setPhoto(profile.photo || null);
    } else {
      // Optionally fetch by ID if editing another profile
      (async () => {
        try {
          const { data: profileData, error: profileError } = await profileController.getProfileById(id as string);
          if (profileError) throw profileError;
          if (profileData) {
            setName(profileData.name || "");
            setUsername(profileData.username || "");
            setAddress(profileData.address || "");
            setPhoto(profileData.photo || null);
          }
        } catch (error) {
          console.error("Error in fetchProfile:", error);
          Alert.alert("Error", "An unexpected error occurred");
        }
      })();
    }
  }, [id, profile]);

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "You need to grant permission to access your photos");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);

      let updatedPhoto = profile.photo;

      // Upload photo if changed
      if (photo && photo !== profile.photo) {
        const { data: photoData, error: photoError } = await profileController.uploadProfilePhoto(
          profile.prof_id,
          photo
        );

        if (photoError) {
          console.error("Error uploading photo:", photoError);
          Alert.alert("Error", "Failed to upload profile photo");
          return;
        }

        updatedPhoto = photoData?.url || profile.photo;
      }

      const updates: Partial<Profile> = {
        name,
        username,
        address,
      };

      const { error } = await profileController.updateProfile(profile.prof_id, updates);

      if (error) {
        console.error("Error updating profile:", error);
        Alert.alert("Error", "Failed to update profile information");
        return;
      }

      // ✅ Update the global profile context
      setGlobalProfile({
        ...profile,
        ...updates,
        photo: updatedPhoto,
      });

      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error("Error in handleSave:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0B5E42" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.profileImageSection}>
            <View style={styles.profileImageWrapper}>
              <View style={styles.profileImageContainer}>
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Text style={styles.profileImageText}>
                      {name ? name.charAt(0).toUpperCase() : "?"}
                    </Text>
                  </View>
                )}
              </View>
              {/* Camera button positioned on top of the profile image */}
              <TouchableOpacity style={styles.editPhotoButton} onPress={handlePickImage}>
                <MaterialIcons name="photo-camera" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.profileName}>{name || "User"}</Text>
            <Text style={styles.username}>@{username || "username"}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.locationText}>{address || "Location"}</Text>
            </View>
          </View>

          <View style={styles.formSection}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Address:</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your location"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>

          {/* Add some space at the bottom */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  scrollView: {
    flex: 1,
  },
  profileImageSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  profileImageWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profileImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#0B5E42",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImageText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
  },
  editPhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#0B5E42",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    zIndex: 50,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  formSection: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#0B5E42",
    paddingVertical: 12,
    borderRadius: 4,
    marginHorizontal: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});