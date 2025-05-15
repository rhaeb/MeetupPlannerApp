import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth"; // Adjust path as needed
import { supabase } from "./lib/supabase";

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
console.log(
    "ggggggg", data
);

      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, loading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
