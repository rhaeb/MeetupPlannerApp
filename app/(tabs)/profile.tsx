import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import Ionicons from "react-native-vector-icons/Ionicons"

import { colors } from "@/constants/colors"
import Button from "@/components/Button"
import { Card, CardContent } from "@/components/Card"
import Avatar from "@/components/Avatar"
import Badge from "@/components/Badge"

// Define your navigation types
type RootStackParamList = {
  Settings: undefined;
  EditProfile: undefined;
  Notifications: undefined;
  // Add other screens as needed
};

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>()

  // Sample user data
  const user = {
    name: "Alex Reyes",
    username: "@alexreyes",
    avatar: "https://via.placeholder.com/100",
    location: "Manila, Philippines",
    bio: "Adventure seeker | Music lover | Food enthusiast",
    eventsHosted: 12,
    eventsAttended: 28,
    friends: 86,
  }

  // Sample stats data
  const stats = [
    {
      label: "Hosted",
      value: user.eventsHosted,
      icon: "calendar",
    },
    {
      label: "Attended",
      value: user.eventsAttended,
      icon: "location",
    },
    {
      label: "Friends",
      value: user.friends,
      icon: "people",
    },
  ]

  // Sample notifications data
  const notifications = [
    {
      id: "1",
      type: "invite",
      title: "Event Invitation",
      message: "Maria Santos invited you to La Union Beach Trip",
      time: "2 hours ago",
      read: false,
    },
    {
      id: "2",
      type: "friend",
      title: "Friend Request",
      message: "Juan Dela Cruz wants to connect with you",
      time: "5 hours ago",
      read: true,
    },
    {
      id: "3",
      type: "reminder",
      title: "Event Reminder",
      message: "Movie Night: Deadpool is tomorrow at 7:00 PM",
      time: "Yesterday",
      read: true,
    },
  ]

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("Settings")}>
              <Ionicons name="settings-outline" size={20} color={colors.gray[700]} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="log-out-outline" size={20} color={colors.gray[700]} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Avatar source={{ uri: user.avatar }} name={user.name} size="xl" borderColor={colors.white} />
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userHandle}>{user.username}</Text>

          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={12} color={colors.gray[500]} />
            <Text style={styles.locationText}>{user.location}</Text>
          </View>

          <Text style={styles.bio}>{user.bio}</Text>

          <Button
            title="Edit Profile"
            icon={<Ionicons name="create-outline" size={16} color={colors.white} />}
            onPress={() => navigation.navigate("EditProfile")}
            style={styles.editButton}
          />
        </View>

        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <Card key={index} style={styles.statCard}>
              <CardContent>
                <Ionicons name={stat.icon} size={20} color={colors.green[600]} style={styles.statIcon} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </CardContent>
            </Card>
          ))}
        </View>

        <Card style={styles.sectionCard}>
          <CardContent>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="notifications-outline" size={16} color={colors.green[600]} />
                <Text style={styles.sectionTitle}>Notifications</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.notificationsContainer}>
              {notifications.map((notification) => (
                <View
                  key={notification.id}
                  style={[styles.notification, notification.read ? styles.readNotification : styles.unreadNotification]}
                >
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                  </View>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                </View>
              ))}
            </View>
          </CardContent>
        </Card>

        <Card style={styles.sectionCard}>
          <CardContent>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="card-outline" size={16} color={colors.green[600]} />
              <Text style={styles.sectionTitle}>Payment Methods</Text>
            </View>

            <View style={styles.paymentMethod}>
              <View style={styles.paymentCard}>
                <Text style={styles.paymentCardText}>VISA</Text>
              </View>
              <Text style={styles.paymentCardNumber}>•••• 4582</Text>
              <Badge>Default</Badge>
            </View>

            <View style={styles.paymentMethod}>
              <View style={[styles.paymentCard, styles.masterCard]}>
                <Text style={styles.paymentCardText}>MC</Text>
              </View>
              <Text style={styles.paymentCardNumber}>•••• 7895</Text>
            </View>

            <Button
              title="Add Payment Method"
              variant="outline"
              size="sm"
              onPress={() => {}}
              style={styles.addPaymentButton}
              fullWidth
            />
          </CardContent>
        </Card>

        <View style={styles.logoutContainer}>
          <Button
            title="Log Out"
            variant="outline"
            onPress={() => {}}
            style={styles.logoutButton}
            textStyle={{ color: colors.red[500] }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.gray[900],
  },
  headerButtons: {
    flexDirection: "row",
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.green[600],
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.gray[900],
  },
  userHandle: {
    fontSize: 14,
    color: colors.gray[500],
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    color: colors.gray[500],
    marginLeft: 4,
  },
  bio: {
    fontSize: 14,
    color: colors.gray[700],
    textAlign: "center",
    marginTop: 8,
  },
  editButton: {
    marginTop: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    width: "31%",
  },
  statIcon: {
    alignSelf: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.gray[900],
    textAlign: "center",
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[500],
    textAlign: "center",
  },
  sectionCard: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[900],
    marginLeft: 8,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.green[600],
  },
  notificationsContainer: {
    gap: 12,
  },
  notification: {
    padding: 12,
    borderRadius: 8,
  },
  readNotification: {
    backgroundColor: colors.gray[50],
  },
  unreadNotification: {
    backgroundColor: colors.green[50],
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[900],
  },
  notificationTime: {
    fontSize: 12,
    color: colors.gray[500],
  },
  notificationMessage: {
    fontSize: 12,
    color: colors.gray[700],
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  paymentCard: {
    width: 48,
    height: 32,
    backgroundColor: colors.blue[600],
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  masterCard: {
    backgroundColor: colors.red[600],
  },
  paymentCardText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  paymentCardNumber: {
    fontSize: 14,
    color: colors.gray[700],
    flex: 1,
  },
  addPaymentButton: {
    marginTop: 12,
  },
  logoutContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoutButton: {
    borderColor: colors.red[500],
  },
})

export default ProfileScreen