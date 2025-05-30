import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { pollController } from '../../../controllers/pollController';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';

export default function PollScreen() {
  const { id: eventId } = useLocalSearchParams();
  const router = useRouter();

  const [polls, setPolls] = useState<any[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState(['', '']);
  const [isSubmitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (eventId) {
      fetchPolls();
    }
  }, [eventId, userId]);

  const fetchPolls = async () => {
    if (!eventId) return;

    try {
      const { data: rawPolls, error } = await pollController.getEventPolls(eventId as string);
      if (error) {
        console.error('Failed to fetch polls:', error);
        setPolls([]);
        return;
      }
      if (!rawPolls || rawPolls.length === 0) {
        setPolls([]);
        return;
      }

      const pollsWithAnswers = await Promise.all(
        rawPolls.map(async (poll: any) => {
          const answersData = poll.answer || [];

          const answersWithVotes = await Promise.all(
            answersData.map(async (answer: any) => {
              const votes = answer.voter || [];
              const voterIds = votes.map((v: any) => v.voter_id).filter(Boolean);

              let profiles = [];
              if (voterIds.length > 0) {
                const { data } = await supabase
                  .from('profile')
                  .select('user_id, name, photo')
                  .in('user_id', voterIds);
                profiles = data || [];
              }

              const votesWithProfiles = votes.map((vote: any) => {
                const profile = profiles.find((p: any) => p.user_id === vote.voter_id);
                return { 
                  ...vote, 
                  profile: profile || { name: 'Loading...', photo: null } 
                };
              });
                // Check if current user has voted for this answer
              const userVoted = userId ? votes.some((v: any) => v.voter_id === userId) : false;

              return {
                ...answer,
                votes: votesWithProfiles,
                voteCount: votesWithProfiles.length,
                userVoted,
              };
            })
          );

          return { ...poll, answers: answersWithVotes };
        })
      );

      setPolls(pollsWithAnswers);
    } catch (e) {
      console.error('Error fetching polls:', e);
      setPolls([]);
    }
  };

  const handleAddPoll = async () => {
    setSubmitting(true);
    const validAnswers = answers.filter((a) => a.trim() !== '');

    if (!question.trim() || validAnswers.length < 2) {
      Alert.alert('Incomplete', 'Please enter a question and at least two valid answers.');
      setSubmitting(false);
      return;
    }

    try {
      const eventIdNum = Number(eventId);
      if (isNaN(eventIdNum)) {
        throw new Error('Invalid event ID');
      }

      const { error } = await pollController.createPoll(
        {
          question: question.trim(),
          event_id: eventIdNum,
        },
        validAnswers
      );

      if (error) {
        throw error;
      }

      setModalVisible(false);
      setQuestion('');
      setAnswers(['', '']);
      fetchPolls();
    } catch (error) {
      console.error('Failed to create poll:', error);
      Alert.alert('Error', 'Failed to create poll. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

   const handleVote = async (answerId: string, pollId: string) => {
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to vote.');
      return;
    }

    // Check if user already voted for this answer
    const poll = polls.find(p => p.poll_id === pollId);
    const answer = poll?.answers.find((a: any) => a.answer_id === answerId);
    
    if (answer?.userVoted) {
      // Remove vote
      const { error } = await removeVote(pollId);
      if (error) {
        Alert.alert('Error', 'Failed to remove vote.');
      } else {
        fetchPolls();
      }
    } else {
      // Add vote
      const { error } = await pollController.castVote({
        answerId,
        profileId: userId,
      });
      if (error) {
        Alert.alert('Voting failed', error.message || 'Failed to vote.');
      } else {
        fetchPolls();
      }
    }
  };

  const removeVote = async (pollId: string) => {
    if (!userId) return { error: new Error('User not logged in') };

    try {
      // Get all answer IDs for this poll
      const { data: answerIdsData, error: idsError } = await supabase
        .from('answer')
        .select('answer_id')
        .eq('poll_id', pollId);

      if (idsError) throw idsError;

      const pollAnswerIds = answerIdsData.map((a: any) => a.answer_id);

      // Delete the user's vote from any answer in this poll
      const { error } = await supabase
        .from('voter')
        .delete()
        .in('answer_id', pollAnswerIds)
        .eq('voter_id', userId);

      return { error };
    } catch (error) {
      console.error('Remove vote error:', error);
      return { error };
    }
  };

  const renderPoll = (poll: any) => {
    const answers = poll.answers || [];
    const totalVotes = answers.reduce((sum: number, a: any) => sum + (a.voteCount || 0), 0);

    return (
      <View key={poll.poll_id} style={styles.pollCard}>
        <View style={styles.pollHeader}>
          <Text style={styles.pollQuestion}>{poll.question}</Text>
          <Text style={poll.status === 'closed' ? styles.closed : styles.active}>
            {poll.status === 'closed' ? 'Closed' : 'Active'}
          </Text>
        </View>

        {answers.map((answer: any) => {
          const voteCount = answer.voteCount || 0;
          const percentage = totalVotes === 0 ? 0 : (voteCount / totalVotes) * 100;
          const percentageText = percentage.toFixed(1);

          return (
            <View key={answer.answer_id} style={styles.answerContainer}>
              <TouchableOpacity
                disabled={poll.status === 'closed'}
                onPress={() => handleVote(answer.answer_id, poll.poll_id)}
                style={[
                  styles.answerRow,
                  answer.userVoted && styles.userVotedAnswer,
                ]}
              >
                <View style={styles.answerInfo}>
                  <Text style={styles.answerText}>{answer.answer}</Text>
                  <Text style={styles.voteStats}>
                    {percentageText}% ({voteCount} vote{voteCount !== 1 ? 's' : ''})
                  </Text>
                </View>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
                </View>
                {answer.userVoted && (
                  <View style={styles.votedIndicator}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>

              {answer.votes && answer.votes.length > 0 && (
                <View style={styles.votersContainer}>
                  <Text style={styles.votersLabel}>Voted by:</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.votersList}
                  >
                    {answer.votes.map((vote: any, idx: number) => (
                      <View key={vote.voter_id ?? idx} style={styles.voterBadge}>
                        {vote.profile?.photo ? (
                          <Image
                            source={{ uri: vote.profile.photo }}
                            style={styles.voterAvatar}
                          />
                        ) : (
                          <View style={[styles.voterAvatar, styles.placeholderAvatar]}>
                            <Ionicons name="person" size={16} color="white" />
                          </View>
                        )}
                        <Text style={styles.voterName} numberOfLines={1}>
                          {vote.profile?.name || 'User'}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} />
        <Text>Back to Event</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Polls & Voting</Text>

      <TouchableOpacity style={styles.newPollButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.newPollText}>+ New Poll</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.pollsContainer}>
        {polls.length === 0 ? (
          <Text style={styles.noPollsText}>No polls yet. Create one to get started!</Text>
        ) : (
          polls.map(renderPoll)
        )}
      </ScrollView>

      {/* Add Poll Modal */}
      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>Add a New Poll</Text>

          <TextInput
            style={styles.input}
            placeholder="Poll question"
            value={question}
            onChangeText={setQuestion}
          />

          {answers.map((answer, index) => (
            <TextInput
              key={index}
              style={styles.input}
              placeholder={`Answer ${index + 1}`}
              value={answer}
              onChangeText={(text) => {
                const newAnswers = [...answers];
                newAnswers[index] = text;
                setAnswers(newAnswers);
              }}
            />
          ))}

          <TouchableOpacity
            onPress={() => setAnswers([...answers, ''])}
            style={styles.addAnswerButton}
          >
            <Text style={styles.addAnswerText}>+ Add another answer</Text>
          </TouchableOpacity>

          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAddPoll}
              style={[styles.submitButton, isSubmitting && { opacity: 0.5 }]}
              disabled={isSubmitting}
            >
              <Text style={{ color: 'white' }}>Add Poll</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 5,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  newPollButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
  },
  newPollText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pollsContainer: {
    flex: 1,
  },
  noPollsText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
    fontSize: 16,
  },
  pollCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  pollHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    alignItems: 'center',
  },
  pollQuestion: {
    fontWeight: 'bold',
    fontSize: 18,
    flex: 1,
    color: '#333',
  },
  active: {
    color: 'green',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 14,
  },
  closed: {
    color: 'red',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 14,
  },
  answerContainer: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fafafa',
  },
  answerRow: {
    marginBottom: 5,
  },
  answerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  answerText: {
    fontSize: 16,
    flex: 1,
    color: '#444',
  },
  voteStats: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  progressBarBackground: {
    backgroundColor: '#e0e0e0',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    backgroundColor: '#4a90e2',
    height: '100%',
    borderRadius: 4,
  },
  votersContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  votersLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  votersList: {
    flexDirection: 'row',
    gap: 10,
  },
  voterBadge: {
    alignItems: 'center',
    maxWidth: 60,
  },
  voterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
    backgroundColor: '#ddd',
  },
  placeholderAvatar: {
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voterName: {
    fontSize: 11,
    textAlign: 'center',
    color: '#555',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  addAnswerButton: {
    marginBottom: 20,
    alignItems: 'center',
    padding: 10,
  },
  addAnswerText: {
    color: '#4a90e2',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  submitButton: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  userVotedAnswer: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  votedIndicator: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
});