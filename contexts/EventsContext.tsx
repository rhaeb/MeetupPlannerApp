import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { eventController } from "../controllers/eventController";
import { useAuth } from "../hooks/useAuth";

export const EventsContext = createContext(null);

export function EventsProvider({ children }) {
  const { profile } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch events for the current user
  const fetchEvents = useCallback(async () => {
    if (!profile) {
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await eventController.getAttendingEvents(profile.prof_id);
    setEvents(data || []);
    setLoading(false);
  }, [profile]);

  // Call fetchEvents on mount and when profile changes
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Helper to update a single event in the list
  const updateEventInList = (updatedEvent) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.event_id === updatedEvent.event_id ? updatedEvent : ev))
    );
  };

  // Helper to remove an event from the list
  const removeEventFromList = (eventId) => {
    setEvents((prev) => prev.filter((ev) => ev.event_id !== eventId));
  };

  // Helper to add a new event to the list
  const addEventToList = (newEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
  };

  // Expose helpers for pages to call after create/edit/delete
  return (
    <EventsContext.Provider
      value={{
        events,
        setEvents,
        loading,
        refreshEvents: fetchEvents,
        updateEventInList,
        removeEventFromList,
        addEventToList,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  return useContext(EventsContext);
}