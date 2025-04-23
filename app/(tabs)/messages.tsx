import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import Ionicons from "react-native-vector-icons/Ionicons"

import { colors } from "@/constants/colors"
import { Card, CardContent } from "@/components/Card"
import Avatar from "@/components/Avatar"
import Badge from "@/components/Badge"

// Define your navigation types
type RootStackParamList = {
  Chat: { id: string };
  DirectMessage: { id: string };
};

type MessagesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MessagesScreen = () => {
  const navigation = useNavigation<MessagesScreenNavigationProp>()

  // Sample conversations data
  const conversations = [
    {
      id: "1",
      name: "La Union Beach Trip",
      avatar: "https://via.placeholder.com/40",
      lastMessage: "Carlo: Don't forget the sunscreen! I got burned last time 😅",
      timestamp: "10:55 AM",
      unread: 3,
      isGroup: true,
      participants: 8,
    },
    {
      id: "2",
      name: "Maria Santos",
      avatar: "https://via.placeholder.com/40",
      lastMessage: "Are you coming to the concert next week?",
      timestamp: "Yesterday",
      unread: 0,
      isGroup: false,
    },
    {
      id: "3",
      name: "Juan Dela Cruz",
      avatar: "https://via.placeholder.com/40",
      lastMessage: "I'll bring my camera for the trip",
      timestamp: "Yesterday",
      unread: 1,
      isGroup: false,
    },
    {
      id: "4",
      name: "Movie Night",
      avatar: "https://via.placeholder.com/40",
      lastMessage: "Ana: Let's watch the new Marvel movie!",
      timestamp: "Monday",
      unread: 0,
      isGroup: true,
      participants: 5,
    },
    {
      id: "5",
      name: "Ana Reyes",
      avatar: "https://via.placeholder.com/40",
      lastMessage: "Thanks for the birthday gift!",
      timestamp: "Sunday",
      unread: 0,
      isGroup: false,
    },
  ]

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Messages</Text>
            <Text style={styles.headerSubtitle}>Your conversations</Text>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="create-outline" size={20} color={colors.gray[700]} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={16} color={colors.gray[400]} style={styles.searchIcon} />
          <TextInput
            placeholder="Search messages..."
            style={styles.searchInput}
            placeholderTextColor={colors.gray[400]}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {conversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.id}
              onPress={() =>
                navigation.navigate(conversation.isGroup ? "Chat" : "DirectMessage", { id: conversation.id })
              }
            >
              <Card style={styles.conversationCard}>
                <CardContent padding={false}>
                  <View style={styles.conversationContent}>
                    <View style={styles.avatarContainer}>
                      <Avatar source={{ uri: conversation.avatar }} name={conversation.name} size="md" />
                      {conversation.isGroup && (
                        <View style={styles.participantsIndicator}>
                          <Text style={styles.participantsCount}>{conversation.participants}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.conversationDetails}>
                      <View style={styles.conversationHeader}>
                        <Text style={styles.conversationName}>{conversation.name}</Text>
                        <View style={styles.timestampContainer}>
                          <Text style={styles.timestamp}>{conversation.timestamp}</Text>
                          {conversation.unread > 0 && (
                            <View style={styles.unreadBadge}>
                              <Badge>{conversation.unread}</Badge>
                            </View>
                          )}
                        </View>
                      </View>
                      <Text style={styles.lastMessage} numberOfLines={1} ellipsizeMode="tail">
                        {conversation.lastMessage}
                      </Text>
                    </View>
                  </View>
                </CardContent>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
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
  headerSubtitle: {
    fontSize: 14,
    color: colors.gray[500],
  },
  iconButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: colors.gray[900],
  },
  conversationCard: {
    marginBottom: 12,
  },
  conversationContent: {
    flexDirection: "row",
    padding: 12,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  participantsIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    backgroundColor: colors.green[100],
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  participantsCount: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.green[600],
  },
  conversationDetails: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[900],
  },
  timestampContainer: {
    alignItems: "flex-end",
  },
  timestamp: {
    fontSize: 12,
    color: colors.gray[500],
  },
  unreadBadge: {
    marginTop: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.gray[700],
  },
})

export default MessagesScreen