import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { friendController } from "../controllers/friendController";
import { useAuth } from "../hooks/useAuth";
import { Profile } from "../types";

export const FriendsContext = createContext(null);

export function FriendsProvider({ children }) {
  const { profile } = useAuth();
  const [friends, setFriends] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch friends for the current user
  const fetchFriends = useCallback(async () => {
    if (!profile) {
      setFriends([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await friendController.getFriends(profile.prof_id);
    setFriends(data?.friends || []);
    setLoading(false);
  }, [profile]);

  // Call fetchFriends on mount and when profile changes
  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  // Helper to add a friend to the list
  const addFriendToList = (newFriend: Profile) => {
    setFriends((prev) => [newFriend, ...prev]);
  };

  // Helper to remove a friend from the list
  const removeFriendFromList = (friendId: string) => {
    setFriends((prev) => prev.filter((f) => f.prof_id !== friendId));
  };

  return (
    <FriendsContext.Provider
      value={{
        friends,
        setFriends,
        loading,
        refreshFriends: fetchFriends,
        addFriendToList,
        removeFriendFromList,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
}

export function useFriends() {
  return useContext(FriendsContext);
}