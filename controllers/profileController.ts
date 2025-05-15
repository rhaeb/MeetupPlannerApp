import { supabase } from '../app/lib/supabase';
import { Profile } from '../types';
import * as FileSystem from 'expo-file-system';

export const profileController = {
  // Get profile by ID
  async getProfileById(profId: string): Promise<{ error: any; data: Profile | null }> {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('prof_id', profId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Get profile error:', error);
      return { data: null, error };
    }
  },

  // Get profile by user ID
  async getProfileByUserId(userId: string): Promise<{ error: any; data: Profile | null }> {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Get profile by user ID error:', error);
      return { data: null, error };
    }
  },

  // Update profile
  async updateProfile(profId: string, updates: Partial<Profile>): Promise<{ error: any; data: Profile | null }> {
    try {
      const { data, error } = await supabase
        .from('profile')
        .update(updates)
        .eq('prof_id', profId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { data: null, error };
    }
  },

  // Upload profile photo
  async uploadProfilePhoto(profId: string, photoUri: string): Promise<{ error: any; data: { url: string } | null }> {
    try {
      const fileName = `profile-${profId}-${Date.now()}.jpg`;
      const filePath = `profiles/${fileName}`;

      // Read the file into a binary buffer
      const fileData = await FileSystem.readAsStringAsync(photoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const byteArray = Uint8Array.from(atob(fileData), (c) => c.charCodeAt(0));

      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, byteArray, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage.from('profile-photos').getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profile')
        .update({ photo: urlData.publicUrl })
        .eq('prof_id', profId);

      if (updateError) throw updateError;

      return { data: { url: urlData.publicUrl }, error: null };
    } catch (error) {
      console.error('Upload profile photo error:', error);
      return { data: null, error };
    }
  },

  // Search profiles
  async searchProfiles(query: string): Promise<{ error: any; data: Profile[] | null }> {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(20);

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Search profiles error:', error);
      return { data: null, error };
    }
  },
};