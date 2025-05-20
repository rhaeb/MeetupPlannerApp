import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth"; // Adjust path as needed
import { supabase } from "../lib/supabase";

export const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  let retryTimeout: NodeJS.Timeout | null = null;

  const fetchProfile = async (retry = false) => {
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
      .maybeSingle();

    // if (error && error.code !== "PGRST116") {
    //   console.error("Profile fetch error:", error);
    // }

    setProfile(data);
    setLoading(false);

    // If just signed up and profile is not found, retry after a short delay
    if (!data && !retry) {
      retryTimeout = setTimeout(() => fetchProfile(true), 1000);
    }
  };

  fetchProfile();

  const { data: authListener } = supabase.auth.onAuthStateChange(
    (event) => {
      if (event === "SIGNED_OUT") {
        setProfile(null);
      }
    }
  );

  return () => {
    authListener?.subscription?.unsubscribe?.();
    if (retryTimeout) clearTimeout(retryTimeout);
  };
}, [user]);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, loading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
