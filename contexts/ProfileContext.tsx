import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth"; // Adjust path as needed
import { supabase } from "../lib/supabase";

export const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (!error) setProfile(data);
      setLoading(false);
    };
    fetchProfile();

    // Listen for auth state changes to clear profile on logout
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_OUT") {
          setProfile(null);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, [user]);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, loading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
