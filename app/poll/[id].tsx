import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"

import { colors } from "@/constants/colors"
import Button from "@/components/Button"
import { Card, CardContent } from "@/components/Card"
import Badge from "@/components/Badge"
import Avatar from "@/components/Avatar"

interface PollOption {
  id: string
  text: string
  votes: number
  percentage: number
  voters: {
    id: string
    name: string
    avatar: string
  }[]
}

interface Poll {
  id: string
  question: string
  options: PollOption[]
  status: "active" | "closed"
  winner: string | null
  totalVotes: number
}

const PollScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { id } = route.params as { id: string }

  // Sample polls data
  const polls: Poll[] = [
    {
      id: "1",
      question: "What time should we leave Manila?",
      options: [
        {
          id: "1",
          text: "4:00 AM",
          votes: 2,
          percentage: 25,
          voters: [
            {
              id: "1",
              name: "Maria Santos",
              avatar: "https://via.placeholder.com/40",
            },
            {
              id: "2",
              name: "Juan Dela Cruz",
              avatar: "https://via.placeholder.com/40",
            },
          ],
        },
        {
          id: "2",
          text: "6:00 AM",
          votes: 5,
          percentage: 62.5,
          voters: [
            {
              id: "3",
              name: "Ana Reyes",
              avatar: "https://via.placeholder.com/40",
            },
            {
              id: "4",
              name: "Carlo Aquino",
              avatar: "https://via.placeholder.com/40",
            },
            {
              id: "5",
              name: "Bianca Gonzalez",
              avatar: "https://via.placeholder.com/40",
            },
            {
              id: "6",
              name: "Paolo Pascual",
              avatar: "https://via.placeholder.com/40",
            },
            {
              id: "7",
              name: "Liza Soberano",
              avatar: "https://via.placeholder.com/40",
            },
          ],
        },
        {
          id: "3",
          text: "8:00 AM",
          votes: 1,
          percentage: 12.5,
          voters: [
            {
              id: "8",
              name: "Enrique Gil",
              avatar: "https://via.placeholder.com/40",
            },
          ],
        },
      ],
      status: "closed",
      winner: "6:00 AM",
      totalVotes: 8,
    },
    {
      id: "2",
      question: "Where should we stay in La Union?",
      options: [
        {
          id: "1",
          text: "Flotsam & Jetsam Hostel",
          votes: 3,
          percentage: 37.5,
          voters: [
            {
              id: "1",
              name: "Maria Santos",
              avatar: "https://via.placeholder.com/40",
            },
            {
              id: "2",
              name: "Juan Dela Cruz",
              avatar: "https://via.placeholder.com/40",
            },
            {
              id: "3",
              name: "Ana Reyes",
              avatar: "https://via.placeholder.com/40",
            },
          ],
        },
        {
          id: "2",
          text: "Aureo Resort",
          votes: 2,
          percentage: 25,
          voters: [
            {
              id: "4",
              name: "Carlo Aquino",
              avatar: "https://via.placeholder.com/40",
            },
            {
              id: "5",
              name: "Bianca Gonzalez",
              avatar: "https://via.placeholder.com/40",
            },
          ],
        },
        {
          id: "3",
          text: "Kahuna Beach Resort",
          votes: 3,
          percentage: 37.5,
          voters: [
            {
              id: "6",
              name: "Paolo Pascual",
              avatar: "https://via.placeholder.com/40",
            },
            {
              id: "7",
              name: "Liza Soberano",
              avatar: "https://via.placeholder.com/40",
            },
            {
              id: "8",
              name: "Enrique Gil",
              avatar: "https://via.placeholder.com/40",
            },
          ],
        },
      ],
      status: "active",
      winner: null,
      totalVotes: 8,
    },
    {
      id: "3",
      question: "What activities should we do?",
      options: [
        {
          id: "1",
          text: "Surfing lessons",
          votes: 6,
          percentage: 33.3,
          voters: [],
        },
        {
          id: "2",
          text: "Beach bonfire",
          votes: 5,
          percentage: 27.8,
          voters: [],
        },
        {
          id: "3",
          text: "Food crawl",
          votes: 4,
          percentage: 22.2,
          voters: [],
        },
        {
          id: "4",
          text: "Tangadan Falls hike",
          votes: 3,
          percentage: 16.7,
          voters: [],
        },
      ],
      status: "active",
      winner: null,
      totalVotes: 18,
    },
  ]

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color={colors.gray[700]} />
            <Text style={styles.backText}>Back to Event</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Polls & Voting</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="add" size={20} color={colors.gray[700]} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {polls.map((poll) => (
            <Card key={poll.id} style={styles.pollCard}>
              <CardContent>
                <View style={styles.pollHeader}>
                  <Text style={styles.pollQuestion}>{poll.question}</Text>
                  {poll.status === "closed" ? (
                    <Badge>Finalized</Badge>
                  ) : (
                    <Badge variant="outline" color={colors.green[600]}>
                      Active
                    </Badge>
                  )}
                </View>

                <View style={styles.optionsContainer}>
                  {poll.options.map((option) => (
                    <View key={option.id} style={styles.optionContainer}>
                      <View style={styles.optionHeader}>
                        <View style={styles.optionTitleContainer}>
                          {poll.status === "closed" && poll.winner === option.text && (
                            <Ionicons name="checkmark" size={16} color={colors.green[500]} style={styles.winnerIcon} />
                          )}
                          <Text style={styles.optionText}>{option.text}</Text>
                        </View>
                        <Text style={styles.voteCount}>
                          {option.votes} votes ({option.percentage}%)
                        </Text>
                      </View>

                      <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${option.percentage}%` }]} />
                      </View>

                      <View style={styles.votersContainer}>
                        {option.voters.slice(0, 5).map((voter) => (
                          <View key={voter.id} style={styles.voterAvatar}>
                            <Avatar source={{ uri: voter.avatar }} name={voter.name} size="sm" />
                          </View>
                        ))}
                        {option.voters.length > 5 && (
                          <View style={styles.moreVoters}>
                            <Text style={styles.moreVotersText}>+{option.voters.length - 5}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>

                {poll.status === "active" ? (
                  <Button title="Cast Your Vote" onPress={() => {}} style={styles.voteButton} fullWidth />
                ) : (
                  <Text style={styles.finalizedText}>
                    This poll has been finalized with "{poll.winner}" as the winner
                  </Text>
                )}
              </CardContent>
            </Card>
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
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    fontSize: 14,
    color: colors.gray[700],
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[900],
    flex: 1,
    textAlign: "center",
  },
  iconButton: {
    padding: 8,
  },
  pollCard: {
    marginBottom: 16,
  },
  pollHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  pollQuestion: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[900],
    flex: 1,
    marginRight: 8,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionContainer: {
    marginBottom: 12,
  },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  optionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  winnerIcon: {
    marginRight: 4,
  },
  optionText: {
    fontSize: 14,
    color: colors.gray[700],
  },
  voteCount: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.gray[500],
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.green[500],
  },
  votersContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  voterAvatar: {
    marginRight: -8,
    borderWidth: 2,
    borderColor: colors.white,
    borderRadius: 16,
  },
  moreVoters: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gray[200],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  moreVotersText: {
    fontSize: 10,
    color: colors.gray[600],
  },
  voteButton: {
    marginTop: 8,
  },
  finalizedText: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: "center",
    marginTop: 8,
  },
})

export default PollScreen
