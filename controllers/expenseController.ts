import { supabase } from '../app/lib/supabase';
import { Expense } from '../types';

export const expenseController = {
  // Create an expense
  async createExpense(expenseData: Omit<Expense, 'exp_id'>): Promise<{ error: any; data: Expense | null }> {
    try {
      const { data, error } = await supabase
        .from('expense')
        .insert([expenseData])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Create expense error:', error);
      return { data: null, error };
    }
  },

  // Get expense by ID
  async getExpenseById(expId: string): Promise<{ error: any; data: Expense | null }> {
    try {
      const { data, error } = await supabase
        .from('expense')
        .select('*')
        .eq('exp_id', expId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Get expense error:', error);
      return { data: null, error };
    }
  },

  // Update expense
  async updateExpense(expId: string, updates: Partial<Expense>): Promise<{ error: any; data: Expense | null }> {
    try {
      const { data, error } = await supabase
        .from('expense')
        .update(updates)
        .eq('exp_id', expId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Update expense error:', error);
      return { data: null, error };
    }
  },

  // Delete expense
  async deleteExpense(expId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('expense')
        .delete()
        .eq('exp_id', expId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Delete expense error:', error);
      return { error };
    }
  },

  // Get expenses for an event
  async getEventExpenses(eventId: string): Promise<{ error: any; data: { expenses: Expense[], total: number } | null }> {
    try {
      const { data, error } = await supabase
        .from('expense')
        .select('*')
        .eq('event_id', eventId);

      if (error) throw error;

      // Calculate total
      const total = data.reduce((sum, expense) => sum + expense.price, 0);

      return { 
        data: { 
          expenses: data, 
          total 
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Get event expenses error:', error);
      return { data: null, error };
    }
  },
};