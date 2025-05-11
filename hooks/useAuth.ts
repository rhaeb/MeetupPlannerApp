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
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.user) {
        // Type cast session.user to User explicitly
        const userData = session.user as User;
        await fetchUserAndProfile(userData.id);
        setUser(userData);  // Set user state
      }
      setLoading(false);  // Set loading to false after session is fetched
    };

    fetchSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Type cast session.user to User explicitly
          const userData = session.user as User;
          await fetchUserAndProfile(userData.id);
          setUser(userData);  // Set user on sign-in
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
    try {
      setLoading(true);

      // Get user data
      const { data: userData, error: userError } = await userController.getCurrentUser();
      if (userError) throw userError;
      setUser(userData);

      // Get profile data
      if (userData) {
        const { data: profileData, error: profileError } = await profileController.getProfileByUserId(userData.user_id);
        if (profileError) throw profileError;
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching user or profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  return { user, profile, loading };
}
