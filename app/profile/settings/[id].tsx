import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { profileController } from "../../../controllers/profileController";
import { userController } from "../../../controllers/userController";
import { supabase } from '../../../lib/supabase';
import { Profile } from "../../../types";

export default function SettingsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Auth email state
  const [userEmail, setUserEmail] = useState<string>("");

  // Password form state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const { data, error } = await profileController.getProfileById(id as string);

        if (error) {
          console.error("Error fetching profile:", error);
          Alert.alert("Error", "Failed to load profile information");
          return;
        }

        if (data) {
          setProfile(data);
        }
      } catch (error) {
        console.error("Error in fetchProfile:", error);
        Alert.alert("Error", "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  // Fetch the authenticated user's email from Supabase Auth
  useEffect(() => {
    const fetchUserEmail = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    };
    fetchUserEmail();
  }, []);

  const handleChangePassword = async () => {
    setPasswordError("");

    // Validate inputs
    if (!oldPassword) {
      setPasswordError("Please enter your current password");
      return;
    }
    if (!newPassword) {
      setPasswordError("Please enter a new password");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      setSaving(true);

      // Use the authenticated user's email for login
      const { error: loginError } = await userController.login(userEmail, oldPassword);

      if (loginError) {
        setPasswordError("Current password is incorrect");
        setSaving(false);
        return;
      }

      // Update password
      const { error: updateError } = await userController.updatePassword(newPassword);

      if (updateError) {
        setPasswordError("Failed to update password. Please try again.");
        setSaving(false);
        return;
      }

      Alert.alert("Success", "Password updated successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await userController.logout();
    router.replace("/");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0B5E42" />
          <Text style={styles.loadingText}>Loading settings...</Text>
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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {profile?.photo ? (
              <Image
                source={{ uri: profile.photo }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImageText}>
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : "?"}
                </Text>
              </View>
            )}
          </View>
          
          <Text style={styles.profileName}>
            {profile?.name || "User"}
          </Text>
          
          <Text style={styles.username}>
            @{profile?.username || "username"}
          </Text>
          
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.locationText}>
              {profile?.address || "Cebu, Philippines"}
            </Text>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Old Password</Text>
            <TextInput
              style={styles.input}
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="Enter your current password"
              secureTextEntry
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>New Password:</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              secureTextEntry
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirm New Password:</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              secureTextEntry
            />
          </View>
          
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}
          
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleChangePassword}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  contentContainer: {
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: 12,
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
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderWidth: 1, // add this
    borderColor: "#eee", // add this for a light border
    borderRadius: 8, // optional: rounded corners
    backgroundColor: "#fff", // optional: keep background white
    marginHorizontal: 8, // optional: spacing from screen edge
    marginTop: 16, // optional: spacing from above
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
  errorText: {
    color: "#ff4d4f",
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: "#0B5E42",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  actionSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    alignItems: "center",
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 40,
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  logoutButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
});