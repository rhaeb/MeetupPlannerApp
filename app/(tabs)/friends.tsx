import { View, Text, StyleSheet, ScrollView, SafeAreaView, TextInput } from "react-native"
import { Link } from "expo-router/"
import Ionicons from "@expo/vector-icons/Ionicons"

import { colors } from "@/constants/colors"
import Button from "@/components/Button"
import { Card, CardContent } from "@/components/Card"
import Avatar from "@/components/Avatar"

const FriendsScreen = () => {
  // Sample friends data
  const friends = [
    {
      id: "1",
      name: "Maria Santos",
      username: "@mariasantos",
      avatar: "https://via.placeholder.com/40",
      mutualFriends: 12,
      status: "online",
    },
    {
      id: "2",
      name: "Juan Dela Cruz",
      username: "@juandelacruz",
      avatar: "https://via.placeholder.com/40",
      mutualFriends: 8,
      status: "offline",
    },
    {
      id: "3",
      name: "Ana Reyes",
      username: "@anareyes",
      avatar: "https://via.placeholder.com/40",
      mutualFriends: 15,
      status: "online",
    },
    {
      id: "4",
      name: "Carlo Aquino",
      username: "@carloaquino",
      avatar: "https://via.placeholder.com/40",
      mutualFriends: 5,
      status: "offline",
    },
    {
      id: "5",
      name: "Bianca Gonzalez",
      username: "@biancagonzalez",
      avatar: "https://via.placeholder.com/40",
      mutualFriends: 10,
      status: "online",
    },
  ]

  // Sample friend suggestions
  const suggestions = [
    {
      id: "6",
      name: "Paolo Pascual",
      username: "@paolopascual",
      avatar: "https://via.placeholder.com/40",
      mutualFriends: 7,
    },
    {
      id: "7",
      name: "Liza Soberano",
      username: "@lizasoberano",
      avatar: "https://via.placeholder.com/40",
      mutualFriends: 3,
    },
  ]

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Friends</Text>
            <Text style={styles.headerSubtitle}>Connect with your squad</Text>
          </View>
          <Button
            title="Add Friend"
            size="sm"
            icon={<Ionicons name="person-add" size={16} color={colors.white} />}
            onPress={() => {}}
          />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={16} color={colors.gray[400]} style={styles.searchIcon} />
          <TextInput
            placeholder="Search friends..."
            style={styles.searchInput}
            placeholderTextColor={colors.gray[400]}
          />
        </View>

        {/* Friends List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Friends</Text>
          <View style={styles.friendsList}>
            {friends.map((friend) => (
              <Card key={friend.id} style={styles.friendCard}>
                <CardContent>
                  <View style={styles.friendContent}>
                    <View style={styles.avatarContainer}>
                      <Avatar source={{ uri: friend.avatar }} name={friend.name} size="md" />
                      {friend.status === "online" && <View style={styles.onlineIndicator} />}
                    </View>
                    <View style={styles.friendInfo}>
                      <View style={styles.friendHeader}>
                        <View>
                          <Text style={styles.friendName}>{friend.name}</Text>
                          <Text style={styles.friendUsername}>{friend.username}</Text>
                        </View>
                        <Link href={`/messages/${friend.id}`} asChild>
                        <Button
                            title="Message"
                            variant="outline"
                            size="sm"
                            onPress={() => {
                                console.log('Message button pressed');
                                // You can add navigation or other logic here
                            }}
                            />
                        </Link>
                      </View>
                      <View style={styles.mutualFriends}>
                        <Ionicons name="people-outline" size={12} color={colors.gray[500]} />
                        <Text style={styles.mutualFriendsText}>{friend.mutualFriends} mutual friends</Text>
                      </View>
                    </View>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        </View>

        {/* Suggested Friends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested Friends</Text>
          <View style={styles.friendsList}>
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id} style={styles.friendCard}>
                <CardContent>
                  <View style={styles.friendContent}>
                    <Avatar source={{ uri: suggestion.avatar }} name={suggestion.name} size="md" />
                    <View style={styles.friendInfo}>
                      <View style={styles.friendHeader}>
                        <View>
                          <Text style={styles.friendName}>{suggestion.name}</Text>
                          <Text style={styles.friendUsername}>{suggestion.username}</Text>
                        </View>
                        <Button
                          title="Add"
                          size="sm"
                          icon={<Ionicons name="person-add" size={12} color={colors.white} />}
                          onPress={() => {}}
                        />
                      </View>
                      <View style={styles.mutualFriends}>
                        <Ionicons name="people-outline" size={12} color={colors.gray[500]} />
                        <Text style={styles.mutualFriendsText}>{suggestion.mutualFriends} mutual friends</Text>
                      </View>
                    </View>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
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
  headerSubtitle: {
    fontSize: 14,
    color: colors.gray[500],
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 24,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[900],
    marginBottom: 16,
  },
  friendsList: {
    gap: 12,
  },
  friendCard: {
    marginBottom: 0,
  },
  friendContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    backgroundColor: colors.green[500],
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.white,
  },
  friendInfo: {
    flex: 1,
  },
  friendHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[900],
  },
  friendUsername: {
    fontSize: 12,
    color: colors.gray[500],
  },
  mutualFriends: {
    flexDirection: "row",
    alignItems: "center",
  },
  mutualFriendsText: {
    fontSize: 12,
    color: colors.gray[500],
    marginLeft: 4,
  },
})

export default FriendsScreen
