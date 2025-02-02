import { useState, useEffect } from "react";

const STORAGE_KEY = "calendar_state";

const defaultResources = [
  { id: "A", title: "Resource A" },
  { id: "B", title: "Resource B" },
  { id: "C", title: "Resource C" },
  { id: "D", title: "Resource D" },
  { id: "E", title: "Resource E" },
  { id: "F", title: "Resource F" },
  { id: "G", title: "Resource G" },
  { id: "H", title: "Resource H" },
  { id: "I", title: "Resource I" },
  { id: "J", title: "Resource J" },
  { id: "K", title: "Resource K" },
  { id: "L", title: "Resource L" },
  { id: "M", title: "Resource M" },
  { id: "N", title: "Resource N" },
  { id: "O", title: "Resource O" },
];

const initialState = {
  events: [],
  resources: defaultResources,
  currentDate: new Date(),
  targetScrollDate: null,
};

export function useCalendarState() {
  const [state, setState] = useState(() => {
    // Check if window is defined (client-side)
    if (typeof window === "undefined") return initialState;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        currentDate: new Date(parsed.currentDate),
        events: parsed.events.map((event) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        })),
        targetScrollDate: parsed.targetScrollDate
          ? new Date(parsed.targetScrollDate)
          : null,
      };
    }
    return initialState;
  });

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addEvent = (event) => {
    setState((prev) => ({
      ...prev,
      events: [...prev.events, event],
    }));
  };

  const updateEvent = (updatedEvent) => {
    setState((prev) => ({
      ...prev,
      events: prev.events.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      ),
    }));
  };

  const deleteEvent = (eventId) => {
    setState((prev) => ({
      ...prev,
      events: prev.events.filter((event) => event.id !== eventId),
    }));
  };

  const addResource = (resource) => {
    setState((prev) => ({
      ...prev,
      resources: [...prev.resources, resource],
    }));
  };

  const navigateToDate = (date, shouldScroll = false) => {
    setState((prev) => ({
      ...prev,
      currentDate: new Date(date.getFullYear(), date.getMonth(), 1),
      targetScrollDate: shouldScroll ? date : null,
    }));

    // Reset targetScrollDate after a short delay
    if (shouldScroll) {
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          targetScrollDate: null,
        }));
      }, 1000);
    }
  };

  return {
    state,
    addEvent,
    updateEvent,
    deleteEvent,
    addResource,
    navigateToDate,
  };
}
