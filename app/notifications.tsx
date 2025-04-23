import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from "react-native-vector-icons/Ionicons";

import { colors } from "@/constants/colors";
import Button from "@/components/Button";
import { Card, CardContent } from "@/components/Card";
import Avatar from "@/components/Avatar";
import Badge from "@/components/Badge";

type RootStackParamList = {
  EventDetails: { id: string };
  Poll: { id: string };
  Budget: { id: string };
};

type NotificationsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type NotificationType = "invite" | "friend" | "reminder" | "poll" | "payment" | "system";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  user?: {
    name: string;
    avatar: string;
  };
  eventId?: string;
  eventDate?: string;
  eventLocation?: string;
  amount?: number;
}

const NotificationsScreen = () => {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "read">("all");

  const notifications: Notification[] = [
    {
      id: "1",
      type: "invite",
      title: "Event Invitation",
      message: "Maria Santos invited you to La Union Beach Trip",
      time: "2 hours ago",
      read: false,
      user: {
        name: "Maria Santos",
        avatar: "https://via.placeholder.com/40",
      },
      eventId: "1",
      eventDate: "May 15-17, 2025",
      eventLocation: "San Juan, La Union",
    },
    // ... other notification objects
  ];

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    if (activeTab === "read") return notification.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderNotificationContent = (notification: Notification) => {
    const renderAvatar = () => {
      if (notification.user) {
        return (
          <Avatar 
            source={{ uri: notification.user.avatar }} 
            name={notification.user.name} 
            size="md" 
          />
        );
      }
      return (
        <View style={styles.defaultAvatar}>
          <Ionicons 
            name={notification.type === "system" ? "notifications" : "person"} 
            size={24} 
            color={colors.gray[500]} 
          />
        </View>
      );
    };

    switch (notification.type) {
      case "invite":
        return (
          <>
            <View style={styles.notificationContent}>
              {renderAvatar()}
              <View style={styles.notificationTextContent}>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                {notification.eventDate && (
                  <View style={styles.eventMeta}>
                    <Ionicons name="calendar-outline" size={12} color={colors.gray[500]} />
                    <Text style={styles.eventMetaText}>{notification.eventDate}</Text>
                  </View>
                )}
                {notification.eventLocation && (
                  <View style={styles.eventMeta}>
                    <Ionicons name="location-outline" size={12} color={colors.gray[500]} />
                    <Text style={styles.eventMetaText}>{notification.eventLocation}</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.actionButtons}>
              <Button title="Accept" size="sm" onPress={() => {}} />
              <Button title="Decline" variant="outline" size="sm" onPress={() => {}} />
            </View>
          </>
        );

      case "friend":
        return (
          <>
            <View style={styles.notificationContent}>
              {renderAvatar()}
              <Text style={styles.notificationMessage}>{notification.message}</Text>
            </View>
            <View style={styles.actionButtons}>
              <Button title="Accept" size="sm" onPress={() => {}} />
              <Button title="Decline" variant="outline" size="sm" onPress={() => {}} />
            </View>
          </>
        );

      case "reminder":
        return (
          <TouchableOpacity
            style={styles.notificationContent}
            onPress={() => notification.eventId && navigation.navigate("EventDetails", { id: notification.eventId })}
          >
            <Ionicons name="calendar" size={40} color={colors.green[600]} />
            <View style={styles.notificationTextContent}>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              {notification.eventLocation && (
                <View style={styles.eventMeta}>
                  <Ionicons name="location-outline" size={12} color={colors.gray[500]} />
                  <Text style={styles.eventMetaText}>{notification.eventLocation}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );

      case "poll":
        return (
          <TouchableOpacity
            style={styles.notificationContent}
            onPress={() => notification.eventId && navigation.navigate("Poll", { id: notification.eventId })}
          >
            <Ionicons name="stats-chart" size={40} color={colors.green[600]} />
            <Text style={styles.notificationMessage}>{notification.message}</Text>
          </TouchableOpacity>
        );

      case "payment":
        return (
          <>
            <View style={styles.notificationContent}>
              {renderAvatar()}
              <View style={styles.notificationTextContent}>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                {notification.amount && (
                  <Text style={styles.amountText}>Amount: ₱{notification.amount.toLocaleString()}</Text>
                )}
              </View>
            </View>
            <View style={styles.actionButtons}>
              <Button title="Pay Now" size="sm" onPress={() => {}} />
              <Button
                title="View Details"
                variant="outline"
                size="sm"
                onPress={() => notification.eventId && navigation.navigate("Budget", { id: notification.eventId })}
              />
            </View>
          </>
        );

      case "system":
        return (
          <View style={styles.notificationContent}>
            <Ionicons name="notifications" size={40} color={colors.green[600]} />
            <Text style={styles.notificationMessage}>{notification.message}</Text>
          </View>
        );

      default:
        return <Text style={styles.notificationMessage}>{notification.message}</Text>;
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "invite": return <Ionicons name="calendar" size={20} color={colors.green[600]} />;
      case "friend": return <Ionicons name="person-add" size={20} color={colors.green[600]} />;
      case "reminder": return <Ionicons name="time" size={20} color={colors.green[600]} />;
      case "poll": return <Ionicons name="stats-chart" size={20} color={colors.green[600]} />;
      case "payment": return <Ionicons name="wallet" size={20} color={colors.green[600]} />;
      case "system": return <Ionicons name="notifications" size={20} color={colors.green[600]} />;
      default: return <Ionicons name="notifications" size={20} color={colors.green[600]} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color={colors.gray[700]} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Badge>{unreadCount}</Badge>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "all" && styles.activeTab]}
            onPress={() => setActiveTab("all")}
          >
            <Text style={[styles.tabText, activeTab === "all" && styles.activeTabText]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "unread" && styles.activeTab]}
            onPress={() => setActiveTab("unread")}
          >
            <Text style={[styles.tabText, activeTab === "unread" && styles.activeTabText]}>Unread</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "read" && styles.activeTab]}
            onPress={() => setActiveTab("read")}
          >
            <Text style={[styles.tabText, activeTab === "read" && styles.activeTabText]}>Read</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              style={{
                ...styles.notificationCard,
                ...(!notification.read && styles.unreadNotificationCard)
              }}
            >
              <CardContent>
                <View style={styles.notificationHeader}>
                  <View style={styles.notificationTitleContainer}>
                    {getNotificationIcon(notification.type)}
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                  </View>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
                {renderNotificationContent(notification)}
              </CardContent>
            </Card>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Mark All as Read" variant="outline" onPress={() => {}} fullWidth />
        </View>
      </View>
    </SafeAreaView>
  );
};

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
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  backText: {
    fontSize: 14,
    color: colors.gray[700],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.gray[900],
    flex: 1,
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.white,
  },
  tabText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  activeTabText: {
    fontWeight: "600",
    color: colors.gray[900],
  },
  notificationsList: {
    flex: 1,
    marginBottom: 16,
  },
  notificationCard: {
    marginBottom: 12,
  },
  unreadNotificationCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.green[600],
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  notificationTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[900],
    marginLeft: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.gray[500],
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  notificationTextContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.gray[700],
    marginLeft: 12,
    flex: 1,
  },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  eventMetaText: {
    fontSize: 12,
    color: colors.gray[500],
    marginLeft: 4,
  },
  amountText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.gray[900],
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  footer: {
    marginTop: 16,
    marginBottom: 16,
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
});

export default NotificationsScreen;