import { useState, useEffect } from 'react';
import { supabase } from '../app/lib/supabase';
import { User, Profile } from '../types';
import { userController } from '../controllers/userController';
import { profileController } from '../controllers/profileController';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserAndProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          fetchUserAndProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserAndProfile = async (userId: string) => {
    setLoading(true);
    try {
      // Get user data
      const { data: userData } = await userController.getCurrentUser();
      setUser(userData);

      if (userData) {
        // Get profile data
        const { data: profileData } = await profileController.getProfileByUserId(userData.user_id);
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  return { user, profile, loading };
}