import { supabase } from '../app/lib/supabase';
import { User, Profile } from '../types';

export const userController = {
  // Create a new user and profile
  async register(email: string, password: string, username: string, name: string): Promise<{ error: any; data: any }> {
    try {
      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      // Create user record
      const { data: userData, error: userError } = await supabase
        .from('user')
        .insert([{ user_id: authData.user.id, email, username }])
        .select()
        .single();

      if (userError) throw userError;

      // Create profile record
      const { data: profileData, error: profileError } = await supabase
        .from('profile')
        .insert([{ name, user_id: authData.user.id }])
        .select()
        .single();

      if (profileError) throw profileError;

      return { data: { user: userData, profile: profileData }, error: null };
    } catch (error) {
      console.error('Registration error:', error);
      return { data: null, error };
    }
  },

  // Login user
  async login(email: string, password: string): Promise<{ error: any; data: any }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { data: null, error };
    }
  },

  // Logout user
  async logout(): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Logout error:', error);
      return { error };
    }
  },

  // Reset password (send reset email)
  async resetPassword(email: string): Promise<{ error: any; data: any }> {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'tara://reset-password-confirm',
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { data: null, error };
    }
  },

  // Update password after reset
  async updatePassword(newPassword: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Update password error:', error);
      return { error };
    }
  },

  // Get current user
  async getCurrentUser(): Promise<{ error: any; data: User | null }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      if (!authData.user) {
        return { data: null, error: null };
      }

      const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Get current user error:', error);
      return { data: null, error };
    }
  },

  // Update user
  async updateUser(userId: string, updates: Partial<User>): Promise<{ error: any; data: User | null }> {
    try {
      const { data, error } = await supabase
        .from('user')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Update user error:', error);
      return { data: null, error };
    }
  },

  // Delete user
  async deleteUser(userId: string): Promise<{ error: any }> {
    try {
      // Delete user from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;

      // User record will be deleted by cascade

      return { error: null };
    } catch (error) {
      console.error('Delete user error:', error);
      return { error };
    }
  },
};