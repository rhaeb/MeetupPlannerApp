import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  Image,
  ActivityIndicator 
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { useAuth } from "../../../hooks/useAuth";
import { userController } from "../../../controllers/userController";
import { notificationController } from "../../../controllers/notificationController";
import AppHeader from "../../components/AppHeader";
import { useProfile } from "../../../contexts/ProfileContext"; // Adjust path

export default function ProfileScreen() {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const router = useRouter();
  const [stats, setStats] = useState({
    attended: 8,
    friends: 12,
    hosted: 5
  });
  
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  // console.log("Profile:", profile);

  useEffect(() => {
    if (profile) {
      fetchNotifications();
    }
  }, [profile]);

  const fetchNotifications = async () => {
    if (!profile) return;
    
    setNotificationsLoading(true);
    const { data, error } = await notificationController.getUserNotifications(profile.prof_id);
    
    if (!error && data) {
      setNotifications(data.slice(0, 3)); // Only show first 3 notifications
    } else {
      console.error("Error fetching notifications:", error);
    }
    
    setNotificationsLoading(false);
  };

  const handleEditProfile = () => {
    if (profile) {
      router.push(`/profile/edit/${profile.prof_id}`);
    }
  };

  const handleSettings = () => {
    if (profile) {
      router.push(`/profile/settings/${profile.prof_id}`);
    }
  };

  const handleLogout = async () => {
    await userController.logout();
    router.replace("/");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader />
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
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={handleSettings}>
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          
          <Text style={styles.profileName}>
            {profile?.name || user?.email?.split('@')[0] || "User"}
          </Text>
          
          <Text style={styles.username}>
            @{profile?.username?.toLowerCase().replace(/\s+/g, '') || user?.email?.split('@')[0] || "user"}
          </Text>
          
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.locationText}>
              {profile?.address || "Cebu, Philippines"}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Feather name="edit-2" size={16} color="#fff" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="calendar-outline" size={20} color="#0B5E42" />
            </View>
            <Text style={styles.statNumber}>{stats.attended}</Text>
            <Text style={styles.statLabel}>Attended</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="people-outline" size={20} color="#0B5E42" />
            </View>
            <Text style={styles.statNumber}>{stats.friends}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="gift-outline" size={20} color="#0B5E42" />
            </View>
            <Text style={styles.statNumber}>{stats.hosted}</Text>
            <Text style={styles.statLabel}>Hosted</Text>
          </View>
        </View>

        <View style={styles.notificationsSection}>
          <View style={styles.sectionHeaderWithAction}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="notifications-outline" size={20} color="#0B5E42" />
              <Text style={styles.sectionTitle}>Notifications</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/notifications')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          {notificationsLoading ? (
            <ActivityIndicator size="small" color="#0B5E42" style={styles.notificationLoader} />
          ) : notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <View key={notification.notif_id || index} style={styles.notificationItem}>
                <Text style={styles.notificationTitle}>
                  {notification.title || `${notification.count || 'New'} messages from ${notification.source || 'event'}`}
                </Text>
                <Text style={styles.notificationMessage}>{notification.content || notification.message}</Text>
                <Text style={styles.notificationDate}>
                  {new Date(notification.date).toLocaleDateString() || notification.date}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noNotificationsText}>No notifications</Text>
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
        
        {/* Add some space at the bottom */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8f9fa" 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    color: '#666'
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 50,
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: "700", 
    color: "#222" 
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconButton: {
    padding: 8,
    marginLeft: 8
  },
  scrollView: { 
    flex: 1
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginBottom: 16
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#e0e0e0',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  profileImage: {
    width: '100%',
    height: '100%'
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0B5E42',
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileImageText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff"
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    marginBottom: 4
  },
  username: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#0B5E42",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#fff',
    marginBottom: 16
  },
  statItem: {
    alignItems: 'center'
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e6f7f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: "#666"
  },
  notificationsSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16
  },
  sectionHeaderWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginLeft: 8
  },
  seeAllText: {
    color: '#0B5E42',
    fontWeight: '600',
    fontSize: 14
  },
  notificationLoader: {
    marginVertical: 20
  },
  notificationItem: {
    backgroundColor: '#f0f9f4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
    marginBottom: 4
  },
  notificationMessage: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4
  },
  notificationDate: {
    fontSize: 12,
    color: "#999"
  },
  noNotificationsText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#ff4d4f',
    borderRadius: 4,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 16
  },
  logoutButtonText: {
    color: '#ff4d4f',
    fontWeight: "600"
  }
});