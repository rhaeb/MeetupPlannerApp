import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, Image } from 'react-native';
import { useFonts } from 'expo-font';
import { Bell } from 'lucide-react-native';
import { router, usePathname } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Profile } from '../../types';
import { notificationController } from '../../controllers/notificationController';
import { profileController } from '../../controllers/profileController';

interface AppHeaderProps {
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export default function AppHeader({ onNotificationPress, onProfilePress, style }: AppHeaderProps & { style?: any }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasNotifications, setHasNotifications] = useState(false);
  const pathname = usePathname();

  const [fontsLoaded] = useFonts({
    'Allison': require('../../assets/fonts/Allison-Regular.ttf'),
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        const { data } = await profileController.getProfileByUserId(session.session.user.id);
        if (data) {
          setProfile(data);
        }
      }

    // Check for notifications
    const checkNotifications = async () => {
      if (profile) {
        const { data } = await notificationController.getUserNotifications(profile.prof_id);
        setHasNotifications(data !== null && data.length > 0);
      }
    };
    };

    // Check for notifications
    const checkNotifications = async () => {
      if (profile) {
        const { data } = await notificationController.getUserNotifications(profile.prof_id);
        setHasNotifications(data !== null && data.length > 0);
      }
    };

    fetchUserProfile();
  }, []);

  if (!fontsLoaded) {
    return null; // Don't render until font is loaded
  }

  return (
    <View style={[styles.header, { marginTop: Platform.OS === "ios" ? StatusBar.currentHeight || 20 : 0 }, style]}>
      <TouchableOpacity style={styles.logoContainer}>
        <Text style={styles.logo}>Tara</Text>
      </TouchableOpacity>
      
      <View style={styles.rightContainer}>
        <TouchableOpacity onPress={onNotificationPress} style={styles.iconContainer}>
          <Bell color="#333" size={24} />
          {hasNotifications && <View style={styles.notificationDot} />}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onProfilePress} style={styles.profileContainer}>
          {profile?.photo ? (
            <Image 
              source={{ uri: profile.photo }} 
              style={styles.profileImage} 
            />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profilePlaceholderText}>
                {profile?.name ? profile.name.charAt(0).toUpperCase() : '?'}
              </Text>
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
    height: 60,
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    fontFamily: 'Allison',
    fontSize: 36,
    color: '#0B5E42',
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 16,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    borderWidth: 1,
    borderColor: '#fff',
  },
  profileContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0B5E42',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePlaceholderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});