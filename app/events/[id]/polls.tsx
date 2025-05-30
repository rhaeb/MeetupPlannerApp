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
  Dimensions,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { pollController } from '../../../controllers/pollController';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive breakpoints
const isTablet = screenWidth >= 768;
const isLargeScreen = screenWidth >= 1024;

// Dynamic spacing based on screen size
const spacing = {
  xs: isTablet ? 6 : 4,
  sm: isTablet ? 10 : 8,
  md: isTablet ? 16 : 12,
  lg: isTablet ? 24 : 16,
  xl: isTablet ? 32 : 20,
  xxl: isTablet ? 48 : 24,
};

// Dynamic font sizes
const fontSize = {
  xs: isTablet ? 12 : 11,
  sm: isTablet ? 14 : 12,
  md: isTablet ? 16 : 14,
  lg: isTablet ? 18 : 16,
  xl: isTablet ? 22 : 18,
  xxl: isTablet ? 28 : 24,
};

export default function PollScreen() {
  const { id: eventId } = useLocalSearchParams();
  const router = useRouter();

  const [polls, setPolls] = useState<any[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState(['', '']);
  const [isSubmitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<any>(null);

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
                  profile: profile || { name: 'User', photo: null } 
                };
              });

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

    const poll = polls.find(p => p.poll_id === pollId);
    const answer = poll?.answers.find((a: any) => a.answer_id === answerId);
    
    if (answer?.userVoted) {
      const { error } = await removeVote(pollId);
      if (error) {
        Alert.alert('Error', 'Failed to remove vote.');
      } else {
        fetchPolls();
      }
    } else {
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
      const { data: answerIdsData, error: idsError } = await supabase
        .from('answer')
        .select('answer_id')
        .eq('poll_id', pollId);

      if (idsError) throw idsError;

      const pollAnswerIds = answerIdsData.map((a: any) => a.answer_id);

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

  const finalizePoll = async (pollId: string) => {
    try {
      // Get the poll with answers and votes
      const { data: pollData, error: pollError } = await supabase
        .from('poll')
        .select(`
          *,
          answer (
            *,
            voter (
              voter_id
            )
          )
        `)
        .eq('poll_id', pollId)
        .single();

      if (pollError) throw pollError;

      // Find the answer with most votes
      let winningAnswer = null;
      let maxVotes = 0;

      pollData.answer.forEach((answer: any) => {
        const voteCount = answer.voter.length;
        if (voteCount > maxVotes) {
          maxVotes = voteCount;
          winningAnswer = answer.answer;
        } else if (voteCount === maxVotes) {
          // In case of tie, append the answer
          winningAnswer = `${winningAnswer} or ${answer.answer}`;
        }
      });

      // Update the poll to finalized status and store the winning answer
      const { data, error } = await supabase
        .from('poll')
        .update({ 
          status: 'finalized',
          final: true,
        })
        .eq('poll_id', pollId)
        .select()
        .single();

      if (error) throw error;

      // Refresh the polls list
      fetchPolls();
      setActionSheetVisible(false);
    } catch (error) {
      console.error('Error finalizing poll:', error);
      Alert.alert('Error', 'Failed to finalize poll. Please try again.');
    }
  };

  const showPollOptions = (poll: any) => {
    setSelectedPoll(poll);
    setActionSheetVisible(true);
  };
const getWinningAnswer = (answers: any[]) => {
  let maxVotes = 0;
  let winners: string[] = [];

  answers.forEach((a: any) => {
    if (a.voteCount > maxVotes) {
      maxVotes = a.voteCount;
      winners = [a.answer];
    } else if (a.voteCount === maxVotes) {
      winners.push(a.answer);
    }
  });

  return winners.join(' or ');
};

  const renderPoll = (poll: any) => {
    const answers = poll.answers || [];
    const totalVotes = answers.reduce((sum: number, a: any) => sum + (a.voteCount || 0), 0);
    const isFinalized = poll.status === 'finalized';

    return (
      <View key={poll.poll_id} style={styles.pollCard}>
        <View style={styles.pollHeader}>
          <View style={styles.pollTitleContainer}>
            {poll.status === 'active' && (
              <TouchableOpacity 
                onPress={() => showPollOptions(poll)}
                style={styles.pollOptionsButton}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
            <Text style={styles.pollQuestion} numberOfLines={3}>
              {poll.question}
            </Text>
          </View>
          <View style={[
            styles.statusBadge,
            isFinalized ? styles.finalizedBadge : 
            poll.status === 'closed' ? styles.closedBadge : styles.activeBadge
          ]}>
            <Text style={[
              styles.statusText,
              isFinalized ? styles.finalizedText :
              poll.status === 'closed' ? styles.closedText : styles.activeText
            ]}>
              {isFinalized ? 'Finalized' : poll.status === 'closed' ? 'Closed' : 'Active'}
            </Text>
          </View>
        </View>

        <View style={styles.answersContainer}>
          {answers.map((answer: any, index: number) => {
            const voteCount = answer.voteCount || 0;
            const percentage = totalVotes === 0 ? 0 : (voteCount / totalVotes) * 100;
            const percentageText = percentage.toFixed(1);

            return (
              <View key={answer.answer_id} style={styles.answerContainer}>
                <TouchableOpacity
                  disabled={poll.status !== 'active'}
                  onPress={() => handleVote(answer.answer_id, poll.poll_id)}
                  style={[
                    styles.answerButton,
                    answer.userVoted && styles.userVotedAnswer,
                    poll.status !== 'active' && styles.disabledAnswer,
                    isFinalized && poll.final === answer.answer && styles.winningAnswer,
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={styles.answerContent}>
                    <View style={styles.answerTextContainer}>
                      <Text style={[
                        styles.answerText,
                        answer.userVoted && styles.votedAnswerText,
                        isFinalized && poll.final === answer.answer && styles.winningAnswerText
                      ]}>
                        {answer.answer}
                      </Text>
                      {answer.userVoted && (
                        <Ionicons 
                          name="checkmark-circle" 
                          size={isTablet ? 24 : 20} 
                          color="#10B981" 
                          style={styles.checkIcon}
                        />
                      )}
                      {isFinalized && poll.final === answer.answer && (
                        <Ionicons 
                          name="trophy" 
                          size={isTablet ? 24 : 20} 
                          color="#F59E0B" 
                          style={styles.trophyIcon}
                        />
                      )}
                    </View>
                    
                    <View style={styles.voteInfo}>
                      <Text style={[
                        styles.voteStats,
                        isFinalized && poll.final === answer.answer && styles.winningVoteStats
                      ]}>
                        {percentageText}% • {voteCount} vote{voteCount !== 1 ? 's' : ''}
                      </Text>
                    </View>

                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBarBackground}>
                        <View 
                          style={[
                            styles.progressBarFill, 
                            { width: `${percentage}%` },
                            answer.userVoted && styles.votedProgressBar,
                            isFinalized && poll.final === answer.answer && styles.winningProgressBar
                          ]} 
                        />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                {answer.votes && answer.votes.length > 0 && (
                  <View style={styles.votersContainer}>
                    <Text style={styles.votersLabel}>
                      Voted by {answer.votes.length} {answer.votes.length === 1 ? 'person' : 'people'}:
                    </Text>
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
                              <Ionicons 
                                name="person" 
                                size={isTablet ? 20 : 16} 
                                color="white" 
                              />
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

        {poll.final && (
  <View style={styles.finalizedContainer}>
    <Text style={styles.finalizedText}>
      This poll has been finalized with "{getWinningAnswer(poll.answers)}" as the winner.
    </Text>
  </View>
)}
      </View>
    );
  };

  // Sort polls with finalized ones first
  const sortedPolls = [...polls].sort((a, b) => {
    if (a.status === 'finalized') return -1;
    if (b.status === 'finalized') return 1;
    return 0;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={isTablet ? 28 : 24} color="#374151" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Polls & Voting</Text>
        </View>

        {/* New Poll Button */}
        <TouchableOpacity 
          style={styles.newPollButton} 
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={isTablet ? 24 : 20} color="white" />
          <Text style={styles.newPollText}>Create New Poll</Text>
        </TouchableOpacity>

        {/* Polls List */}
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={styles.pollsContainer}
          contentContainerStyle={styles.pollsContent}
        >
          {sortedPolls.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="bar-chart-outline" size={isTablet ? 80 : 64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No polls yet</Text>
              <Text style={styles.emptySubtitle}>
                Create your first poll to start gathering opinions from your event attendees
              </Text>
            </View>
          ) : (
            sortedPolls.map(renderPoll)
          )}
        </ScrollView>

        {/* Poll Options Action Sheet */}
        <Modal
          visible={actionSheetVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setActionSheetVisible(false)}
        >
          <TouchableOpacity
            style={styles.actionSheetOverlay}
            activeOpacity={1}
            onPress={() => setActionSheetVisible(false)}
          >
            <View style={styles.actionSheetContainer}>
              <View style={styles.actionSheetContent}>
                <TouchableOpacity
                  style={styles.actionSheetButton}
                  onPress={() => {
                    setActionSheetVisible(false);
                    finalizePoll(selectedPoll.poll_id);
                  }}
                >
                  <Ionicons name="checkmark-done" size={24} color="#3B82F6" />
                  <Text style={styles.actionSheetButtonText}>Finalize Poll</Text>
                </TouchableOpacity>
                <View style={styles.actionSheetDivider} />
                <TouchableOpacity
                  style={styles.actionSheetButton}
                  onPress={() => setActionSheetVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#EF4444" />
                  <Text style={[styles.actionSheetButtonText, { color: '#EF4444' }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Add Poll Modal */}
        <Modal 
          visible={isModalVisible} 
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={isTablet ? 28 : 24} color="#6B7280" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Create New Poll</Text>
                <View style={styles.modalHeaderSpacer} />
              </View>

              <ScrollView style={styles.modalContent}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Poll Question</Text>
                  <TextInput
                    style={styles.questionInput}
                    placeholder="What would you like to ask?"
                    value={question}
                    onChangeText={setQuestion}
                    multiline
                    maxLength={200}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Answer Options</Text>
                  {answers.map((answer, index) => (
                    <View key={index} style={styles.answerInputContainer}>
                      <TextInput
                        style={styles.answerInput}
                        placeholder={`Option ${index + 1}`}
                        value={answer}
                        onChangeText={(text) => {
                          const newAnswers = [...answers];
                          newAnswers[index] = text;
                          setAnswers(newAnswers);
                        }}
                        maxLength={100}
                      />
                      {answers.length > 2 && (
                        <TouchableOpacity
                          onPress={() => {
                            const newAnswers = answers.filter((_, i) => i !== index);
                            setAnswers(newAnswers);
                          }}
                          style={styles.removeAnswerButton}
                        >
                          <Ionicons name="close-circle" size={20} color="#EF4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}

                  {answers.length < 6 && (
                    <TouchableOpacity
                      onPress={() => setAnswers([...answers, ''])}
                      style={styles.addAnswerButton}
                    >
                      <Ionicons name="add" size={isTablet ? 20 : 18} color="#3B82F6" />
                      <Text style={styles.addAnswerText}>Add another option</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)} 
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAddPoll}
                  style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                  disabled={isSubmitting}
                >
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? 'Creating...' : 'Create Poll'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    marginTop: 12,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingRight: spacing.md,
  },
  backText: {
    fontSize: fontSize.md,
    color: '#374151',
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
    marginRight: spacing.xxl,
  },
  newPollButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: isTablet ? 14 : 12,
    marginBottom: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  newPollText: {
    color: 'white',
    fontWeight: '600',
    fontSize: fontSize.md,
    marginLeft: spacing.xs,
  },
  pollsContainer: {
    flex: 1,
  },
  pollsContent: {
    paddingBottom: spacing.xxl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: '#374151',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: fontSize.md * 1.5,
  },
  pollCard: {
    backgroundColor: 'white',
    borderRadius: isTablet ? 16 : 12,
    marginBottom: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  pollHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  pollTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pollOptionsButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  pollQuestion: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: spacing.md,
    lineHeight: fontSize.lg * 1.3,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: isTablet ? 8 : 6,
    minWidth: isTablet ? 70 : 60,
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: '#DCFCE7',
  },
  closedBadge: {
    backgroundColor: '#FEE2E2',
  },
  finalizedBadge: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  activeText: {
    color: '#166534',
  },
  closedText: {
    color: '#DC2626',
  },
  answersContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  answerContainer: {
    marginBottom: spacing.md,
  },
  answerButton: {
    borderRadius: isTablet ? 12 : 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  userVotedAnswer: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  disabledAnswer: {
    opacity: 0.6,
  },
  winningAnswer: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  answerContent: {
    padding: spacing.md,
  },
  answerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  answerText: {
    fontSize: fontSize.md,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
    lineHeight: fontSize.md * 1.3,
  },
  votedAnswerText: {
    color: '#065F46',
    fontWeight: '600',
  },
  winningAnswerText: {
    color: '#B45309',
    fontWeight: '700',
  },
  checkIcon: {
    marginLeft: spacing.sm,
  },
  trophyIcon: {
    marginLeft: spacing.sm,
  },
  voteInfo: {
    marginBottom: spacing.sm,
  },
  voteStats: {
    fontSize: fontSize.sm,
    color: '#6B7280',
    fontWeight: '500',
  },
  winningVoteStats: {
    color: '#B45309',
    fontWeight: '600',
  },
  progressBarContainer: {
    marginTop: spacing.xs,
  },
  progressBarBackground: {
    backgroundColor: '#E5E7EB',
    height: isTablet ? 8 : 6,
    borderRadius: isTablet ? 4 : 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    backgroundColor: '#3B82F6',
    height: '100%',
    borderRadius: isTablet ? 4 : 3,
  },
  votedProgressBar: {
    backgroundColor: '#10B981',
  },
  winningProgressBar: {
    backgroundColor: '#F59E0B',
  },
  votersContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  votersLabel: {
    fontSize: fontSize.sm,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  votersList: {
    paddingRight: spacing.md,
  },
  voterBadge: {
    alignItems: 'center',
    marginRight: spacing.md,
    maxWidth: isTablet ? 80 : 60,
  },
  voterAvatar: {
    width: isTablet ? 48 : 40,
    height: isTablet ? 48 : 40,
    borderRadius: isTablet ? 24 : 20,
    marginBottom: spacing.xs,
  },
  placeholderAvatar: {
    backgroundColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voterName: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    color: '#374151',
    fontWeight: '500',
  },
  finalizedContainer: {
    padding: spacing.md,
    backgroundColor: '#FFFBEB',
    borderTopWidth: 1,
    borderTopColor: '#FEF3C7',
    borderBottomLeftRadius: isTablet ? 16 : 12,
    borderBottomRightRadius: isTablet ? 16 : 12,
  },
  finalizedText: {
    color: '#B45309',
    fontWeight: '500',
    textAlign: 'center',
  },
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionSheetContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  actionSheetContent: {
    backgroundColor: 'white',
    borderRadius: isTablet ? 16 : 12,
    overflow: 'hidden',
  },
  actionSheetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  actionSheetButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginLeft: spacing.md,
    color: '#374151',
  },
  actionSheetDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: '#111827',
  },
  modalHeaderSpacer: {
    width: isTablet ? 36 : 32,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#374151',
    marginBottom: spacing.sm,
  },
  questionInput: {
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: isTablet ? 12 : 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: '#111827',
    minHeight: isTablet ? 100 : 80,
    textAlignVertical: 'top',
  },
  answerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  answerInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: isTablet ? 10 : 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: '#111827',
  },
  removeAnswerButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  addAnswerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    borderRadius: isTablet ? 10 : 8,
    marginTop: spacing.sm,
  },
  addAnswerText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: fontSize.md,
    marginLeft: spacing.xs,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: isTablet ? 12 : 10,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: spacing.md,
    borderRadius: isTablet ? 12 : 10,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});