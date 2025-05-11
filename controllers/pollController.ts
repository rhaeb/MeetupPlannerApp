import { supabase } from '../app/lib/supabase';
import { Poll, Answer, Voter } from '../types';

export const pollController = {
  // Create a poll
  async createPoll(pollData: Omit<Poll, 'poll_id'>, answers: string[]): Promise<{ error: any; data: { poll: Poll, answers: Answer[] } | null }> {
    try {
      // Insert poll
      const { data: pollResult, error: pollError } = await supabase
        .from('poll')
        .insert([pollData])
        .select()
        .single();

      if (pollError) throw pollError;

      // Insert answers
      const answerObjects = answers.map(answer => ({
        answer,
        poll_id: pollResult.poll_id
      }));

      const { data: answerResult, error: answerError } = await supabase
        .from('answer')
        .insert(answerObjects)
        .select();

      if (answerError) throw answerError;

      return { 
        data: { 
          poll: pollResult, 
          answers: answerResult 
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Create poll error:', error);
      return { data: null, error };
    }
  },

  // Get poll by ID with answers and votes
  async getPollById(pollId: string): Promise<{ error: any; data: { poll: Poll, answers: Answer[], votes: { [answerId: string]: number } } | null }> {
    try {
      // Get poll
      const { data: pollData, error: pollError } = await supabase
        .from('poll')
        .select('*')
        .eq('poll_id', pollId)
        .single();

      if (pollError) throw pollError;

      // Get answers
      const { data: answerData, error: answerError } = await supabase
        .from('answer')
        .select('*')
        .eq('poll_id', pollId);

      if (answerError) throw answerError;

      // Get votes for each answer
      const votes: { [answerId: string]: number } = {};
      
      for (const answer of answerData) {
        const { data: voterData, error: voterError } = await supabase
          .from('voter')
          .select('voter_id')
          .eq('answer_id', answer.answer_id);
          
        if (voterError) throw voterError;
        
        votes[answer.answer_id] = voterData.length;
      }

      return { 
        data: { 
          poll: pollData, 
          answers: answerData,
          votes
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Get poll error:', error);
      return { data: null, error };
    }
  },

  // Get polls for an event
  async getEventPolls(eventId: string): Promise<{ error: any; data: Poll[] | null }> {
    try {
      const { data, error } = await supabase
        .from('poll')
        .select('*')
        .eq('event_id', eventId)
        .order('date_joined', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Get event polls error:', error);
      return { data: null, error };
    }
  },

  // Vote on a poll
  async voteOnPoll(answerId: string, profId: string): Promise<{ error: any; data: Voter | null }> {
    try {
      // Get the poll ID for this answer
      const { data: answerData, error: answerError } = await supabase
        .from('answer')
        .select('poll_id')
        .eq('answer_id', answerId)
        .single();

      if (answerError) throw answerError;

      // Check if user has already voted on this poll
      const { data: existingVotes, error: checkError } = await supabase
        .from('voter')
        .select('voter_id, answer:answer_id(poll_id)')
        .eq('answer.poll_id', answerData.poll_id)
        .eq('voter_id', profId);

      if (checkError) throw checkError;

      // If already voted, remove previous vote
      if (existingVotes && existingVotes.length > 0) {
        for (const vote of existingVotes) {
          const { error: deleteError } = await supabase
            .from('voter')
            .delete()
            .eq('voter_id', vote.voter_id);
            
          if (deleteError) throw deleteError;
        }
      }

      // Add new vote
      const { data, error } = await supabase
        .from('voter')
        .insert([{
          answer_id: answerId,
          voter_id: profId
        }])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Vote on poll error:', error);
      return { data: null, error };
    }
  },

  // Close a poll
  async closePoll(pollId: string, final: boolean = true): Promise<{ error: any; data: Poll | null }> {
    try {
      const { data, error } = await supabase
        .from('poll')
        .update({ 
          status: 'closed',
          final
        })
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