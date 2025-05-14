import { useState, useEffect } from 'react';
import { supabase } from '../app/lib/supabase';
import { Profile } from '../types';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);

        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error fetching session:', error);
          return;
        }

        if (session && session.user) {
          setUser(session.user);

          // Fetch the profile using the user's ID
          const { data: profileData, error: profileError } = await supabase
            .from('profile')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
          } else {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Error fetching session or profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);

          // Fetch the profile again on sign-in
          const { data: profileData, error: profileError } = await supabase
            .from('profile')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
          } else {
            setProfile(profileData);
          }
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

  const fetchUserAndProfile = async () => {
    try {
      setLoading(true);

      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Error fetching session:', sessionError);
        throw sessionError;
      }

      if (!session || !session.user) {
        setUser(null);
        setProfile(null);
        return;
      }

      // Set the user
      setUser(session.user);

      // Fetch the profile using the user's ID
      const { data: profileData, error: profileError } = await supabase
        .from('profile')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching user or profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return { user, profile, loading };
}
