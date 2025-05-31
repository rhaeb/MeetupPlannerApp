import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { notificationController } from "../controllers/notificationController";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

export const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications for the current user
  const fetchNotifications = useCallback(async () => {
    if (!profile) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await notificationController.getUserNotifications(profile.prof_id);
    setNotifications(data || []);
    setLoading(false);
  }, [profile]);

  // Call fetchNotifications on mount and when profile changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Subscribe to notification inserts and deletes for this user
  useEffect(() => {
    if (!profile) return;

    const channel = supabase
      .channel(`notifications-${profile.prof_id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notification',
        filter: `prof_id=eq.${profile.prof_id}`,
      }, (payload) => {
        // On insert or delete, refresh notifications
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, fetchNotifications]);

  // Helper to mark a notification as read and update state
  const markNotificationAsRead = async (notifId) => {
    await notificationController.markAsRead(notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.notif_id === notifId ? { ...n, read: true } : n))
    );
  };

  // Helper to remove a notification from the list
  const removeNotificationFromList = (notifId) => {
    setNotifications((prev) => prev.filter((n) => n.notif_id !== notifId));
  };

  // Expose helpers for pages to call after create/edit/delete
  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        setNotifications,
        loading,
        refreshNotifications: fetchNotifications,
        markNotificationAsRead,
        removeNotificationFromList,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}