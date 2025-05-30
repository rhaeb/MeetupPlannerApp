import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useFonts } from 'expo-font';
import { Bell, HelpCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { notificationController } from '../../controllers/notificationController';
import { userController } from '../../controllers/userController';
import { useProfile } from "../../contexts/ProfileContext";
import { useAuth } from "../../hooks/useAuth";

interface AppHeaderProps {
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export default function AppHeader({ onNotificationPress, onProfilePress }: AppHeaderProps) {
  const { user } = useAuth();
  const { profile } = useProfile(); // Use profile from context
  const [hasNotifications, setHasNotifications] = useState(false);
  const [fontsLoaded] = useFonts({
    'Allison': require('../../assets/fonts/Allison-Regular.ttf'),
  });
  // console.log(profile);

  useEffect(() => {
    if (!profile) return;

    const checkNotifications = async () => {
      const { data } = await notificationController.getUserNotifications(profile.prof_id);
      // Only show red dot if there are unread notifications
      setHasNotifications(data?.some(n => !n.read));
    };

    const setupSubscription = async () => {
      checkNotifications();

      const channel = supabase
        .channel(`notifications-${profile.prof_id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notification',
          filter: `prof_id=eq.${profile.prof_id}`
        }, () => {
          setHasNotifications(true);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const unsubscribePromise = setupSubscription();

    return () => {
      unsubscribePromise.then(unsub => unsub?.());
    };
  }, [profile]);

  const handleNotificationPress = async () => {
    if (profile) {
      // Mark all notifications as read in the database
      await supabase
        .from('notification')
        .update({ read: true })
        .eq('prof_id', profile.prof_id)
        .eq('read', false);

      setHasNotifications(false);
    }
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      router.push('/tabs/profile');
    }
  };

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      router.push('/tabs/profile');
    }
  };

  const handleLogout = async () => {
    await userController.logout();
    router.replace('/');
  };

  if (!fontsLoaded) {
    return null;
  }
  

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.push('/tabs')} style={styles.logoContainer}>
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
              // No setProfile here, since profile is managed by context
              onError={() => {/* Optionally handle image error */}}
            />
          ) : (
            <View style={styles.profilePlaceholder}>
              {/* <HelpCircle color="#fff" size={20} /> */}
              <Text style={styles.profileImageText}>
                                {profile?.name ? profile.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    height: 60,
    width: '100%',
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
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#0B5E42',
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
  profileImageText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff"
  },
});
