import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { Bell, HelpCircle } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { Profile } from "../../types";

interface AppHeaderProps {
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export default function AppHeader({ onNotificationPress, onProfilePress }: AppHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasNotifications, setHasNotifications] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        const { data } = await supabase
          .from("profile")
          .select("*")
          .eq("user_id", session.session.user.id)
          .single();
        if (data) {
          setProfile(data);
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      router.push("/notifications");
    }
  };

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      router.push("/profile");
    }
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <TouchableOpacity onPress={() => router.push("/tabs")} style={styles.logoContainer}>
        <Text style={styles.logo}>Tara</Text>
      </TouchableOpacity>

      <View style={styles.rightContainer}>
        <TouchableOpacity onPress={handleNotificationPress} style={styles.iconContainer}>
          <Bell color="#333" size={24} />
          {hasNotifications && <View style={styles.notificationDot} />}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleProfilePress} style={styles.profileContainer}>
          {profile?.photo ? (
            <Image
              source={{ uri: profile.photo }}
              style={styles.profileImage}
              onError={() => setProfile((prev) => (prev ? { ...prev, photo: "" } : prev))}
            />
          ) : (
            <View style={styles.profilePlaceholder}>
              <HelpCircle color="#fff" size={20} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  logoContainer: {
    flex: 1,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 16,
  },
  notificationDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "red",
  },
  profileContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profilePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
});
