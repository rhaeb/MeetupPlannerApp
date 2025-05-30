import { supabase } from '../lib/supabase';
import { Poll, Answer, Voter } from '../types';

export const pollController = {
  // Create a poll
  // In pollController.ts
async createPoll(
  pollData: {
    question: string;
    event_id: number;
    status?: string;
    date_joined?: string;
    final?: boolean | null;
  },
  answers: string[]
): Promise<{ error: any; data: any }> {
  try {
    // 1. First create the poll
    const { data: pollResult, error: pollError } = await supabase
      .from('poll')
      .insert([{
        ...pollData,
        status: pollData.status || 'active',
        date_joined: pollData.date_joined || new Date().toISOString(),
        final: pollData.final || null,
      }])
      .select()
      .single();

    if (pollError) throw pollError;

    // 2. Then create answers for this poll
    const answerObjects = answers.map((answer) => ({
      answer,
      poll_id: pollResult.poll_id,
    }));

    const { data: answerResult, error: answerError } = await supabase
      .from('answer')
      .insert(answerObjects)
      .select();

    if (answerError) throw answerError;

    return {
      data: {
        poll: pollResult,
        answers: answerResult,
      },
      error: null,
    };
  } catch (error) {
    console.error('Create poll error:', error);
    return { data: null, error };
  }
},

  // Get poll by ID with answers and vote counts
  async getPollById(
    pollId: string
  ): Promise<{
    error: any;
    data:
      | {
          poll: Poll;
          answers: Answer[];
          votes: Record<string, number>;
        }
      | null;
  }> {
    try {
      const { data: pollData, error: pollError } = await supabase
        .from('poll')
        .select('*')
        .eq('poll_id', pollId)
        .single();

      if (pollError) throw pollError;

      const { data: answerData, error: answerError } = await supabase
        .from('answer')
        .select('*')
        .eq('poll_id', pollId);

      if (answerError) throw answerError;

      const answerIds = answerData.map((a) => a.answer_id);

      const { data: voteData, error: voteError } = await supabase
        .from('voter')
        .select('answer_id');

      if (voteError) throw voteError;

      const votes: Record<string, number> = {};
      for (const id of answerIds) {
        votes[id] = voteData.filter((v) => v.answer_id === id).length;
      }

      return {
        data: {
          poll: pollData,
          answers: answerData,
          votes,
        },
        error: null,
      };
    } catch (error) {
      console.error('Get poll error:', error);
      return { data: null, error };
    }
  },

  // Get all polls for an event
  // Get all polls for an event, including their answers and vote counts
async getEventPolls(
  eventId: string
): Promise<{ error: any; data: Poll[] | null }> {
  try {
    const { data, error } = await supabase
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
      .eq('event_id', eventId)
      .order('date_joined', { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Get event polls error:', error);
    return { data: null, error };
  }
},
 /// Helper method: Fetch profiles by prof_id (voter_id = auth.users.id = prof_id)
async getProfilesByUserIds(userIds: string[]) {
  if (userIds.length === 0) return [];

  const { data, error } = await supabase
    .from('profile')
    .select('*')
    .in('user_id', userIds);   // Use user_id (UUID), not prof_id (integer)

  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
  return data;
},


  async getAnswersByPollId(
  pollId: string
): Promise<{ error: any; data: any[] | null }> {
  try {
    // 1. Get answers for this poll
    const { data: answers, error: answerError } = await supabase
      .from('answer')
      .select('answer_id, answer')
      .eq('poll_id', pollId)
      .order('answer_id', { ascending: true });

    if (answerError) throw answerError;
    if (!answers || answers.length === 0) return { data: [], error: null };

    const answerIds = answers.map(a => a.answer_id);

    // 2. Get voters who voted for these answers
    const { data: voters, error: voterError } = await supabase
      .from('voter')
      .select('answer_id, voter_id')
      .in('answer_id', answerIds);

    if (voterError) throw voterError;

    // 3. Get unique voter IDs to fetch profiles
    const uniqueUserIds = Array.from(new Set(voters.map(v => v.voter_id)));

    // 4. Fetch profiles for voters
    const profiles = await this.getProfilesByUserIds(uniqueUserIds);

    // 5. Combine answers with vote info and voter profiles
    const totalVotes = voters.length;

    const result = answers.map(answer => {
      const votersForAnswer = voters
        .filter(v => v.answer_id === answer.answer_id)
        .map(voter => {
          const profile = profiles.find(p => p.user_id === voter.voter_id);
          return {
            voter_id: voter.voter_id,
            profile: profile || null,
          };
        });

      const voteCount = votersForAnswer.length;
      const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

      return {
        ...answer,
        votes: votersForAnswer,   // <-- voters with profile info
        voteCount,
        percentage,
      };
    });

    return { data: result, error: null };
  } catch (error) {
    console.error('Get answers by poll ID error:', error);
    return { data: null, error };
  }
},




  // Vote on a poll (removes previous vote if exists)
  async voteOnPoll(
    answerId: string,
    profId: string
  ): Promise<{ error: any; data: Voter | null }> {
    try {
      // Get the poll_id of the answer
      const { data: answerData, error: answerError } = await supabase
        .from('answer')
        .select('poll_id')
        .eq('answer_id', answerId)
        .single();

      if (answerError) throw answerError;

      // Get all answer_ids for the poll
      const { data: answerIdsData, error: idsError } = await supabase
        .from('answer')
        .select('answer_id')
        .eq('poll_id', answerData.poll_id);

      if (idsError) throw idsError;

      const pollAnswerIds = answerIdsData.map((a) => a.answer_id);

      // Delete previous votes by the voter in this poll
      const { error: deleteError } = await supabase
        .from('voter')
        .delete()
        .in('answer_id', pollAnswerIds)
        .eq('voter_id', profId);

      if (deleteError) throw deleteError;

      // Insert new vote
      const { data, error } = await supabase
        .from('voter')
        .insert([
          {
            answer_id: answerId,
            voter_id: profId,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Vote on poll error:', error);
      return { data: null, error };
    }
  },

  // ✅ New method: Cast Vote (same as voteOnPoll but abstracted for clarity)
  async castVote({
    answerId,
    profileId,
  }: {
    answerId: string;
    profileId: string;
  }): Promise<{ error: any; data: Voter | null }> {
    return this.voteOnPoll(answerId, profileId);
  },

  // Close a poll
  async closePoll(
    pollId: string,
    final: boolean = true
  ): Promise<{ error: any; data: Poll | null }> {
    try {
      const { data, error } = await supabase
        .from('poll')
        .update({ status: 'closed', final })
        .eq('poll_id', pollId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Close poll error:', error);
      return { data: null, error };
    }
  },

  // Delete a poll
  async deletePoll(pollId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('poll')
        .delete()
        .eq('poll_id', pollId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Delete poll error:', error);
      return { error };
    }
  },
};
