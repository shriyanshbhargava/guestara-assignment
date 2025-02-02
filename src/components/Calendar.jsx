import { useState, useEffect, useCallback, useRef } from "react";
import { useCalendarState } from "../hooks/useCalendarState";
import { Modal } from "./Modal";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarEvent } from "./CalendarEvent";
import { COLORS } from "../constants/colors";

export function Calendar() {
  const {
    state,
    addEvent,
    updateEvent,
    deleteEvent,
    addResource,
    navigateToDate,
  } = useCalendarState();
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [selectedEventForDeletion, setSelectedEventForDeletion] =
    useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const calendarRef = useRef(null);
  const tableRef = useRef(null);
  const sidebarRef = useRef(null);

  const daysInMonth = new Date(
    state.currentDate.getFullYear(),
    state.currentDate.getMonth() + 1,
    0
  ).getDate();

  const roundToNearestFifteen = useCallback((date) => {
    const minutes = date.getMinutes();
    const roundedMinutes = Math.round(minutes / 15) * 15;
    const newDate = new Date(date);
    newDate.setMinutes(roundedMinutes);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    return newDate;
  }, []);

  // ScrollToDate function remains the same
  const scrollToDate = useCallback((date) => {
    requestAnimationFrame(() => {
      const targetCell = tableRef.current?.querySelector(
        `[data-date="${date.toISOString().split("T")[0]}"]`
      );
      const container = calendarRef.current;
      const sidebarElement = sidebarRef.current;

      // Check if the target cell and container are found
      if (!targetCell || !container) {
        console.warn("Target cell or container not found");
        return;
      }

      const sidebarWidth = sidebarElement?.offsetWidth ?? 192;
      const containerWidth = container.clientWidth;
      const cellWidth = targetCell.offsetWidth;

      const cellLeft = targetCell.offsetLeft;
      const scrollPosition = cellLeft - sidebarWidth - cellWidth;

      const maxScroll = container.scrollWidth - containerWidth;
      const finalScrollPosition = Math.max(
        0,
        Math.min(scrollPosition, maxScroll)
      );

      container.scrollTo({
        left: finalScrollPosition,
        behavior: "smooth",
      });
    });
  }, []);

  // Add useEffect to call scrollToDate on initial load
  useEffect(() => {
    // Small delay to ensure DOM elements are properly loaded
    const timer = setTimeout(() => {
      // Scroll to today's date on initial load
      scrollToDate(new Date());
    }, 100);

    return () => clearTimeout(timer);
  }, [scrollToDate]);

  const goToToday = useCallback(() => {
    const today = new Date();
    navigateToDate(today, true);
    scrollToDate(today);
  }, [navigateToDate, scrollToDate]);

  const calculateEventStyle = useCallback((event) => {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    const daysDuration = Math.round(
      (endDate - startDate) / (1000 * 60 * 60 * 24)
    );

    return {
      width: `${Math.max(1, daysDuration) * 80}px`,
      position: "absolute",
      left: "0",
    };
  }, []);

  const handleDragStart = (event, e) => {
    setDraggedEvent(event);
    e.dataTransfer.setData("text/plain", "");
  };

  const handleDrop = (date, resourceId) => {
    if (!draggedEvent) return;

    const duration = draggedEvent.end.getTime() - draggedEvent.start.getTime();
    const newStart = new Date(date);
    newStart.setHours(
      draggedEvent.start.getHours(),
      draggedEvent.start.getMinutes()
    );
    const newEnd = new Date(newStart.getTime() + duration);

    updateEvent({
      ...draggedEvent,
      start: newStart,
      end: newEnd,
      resourceId,
    });

    setDraggedEvent(null);
  };

  const handleCellClick = (e, date, resourceId) => {
    if (
      e.target === e.currentTarget ||
      e.target.getAttribute("data-cell-area") === "true"
    ) {
      const startTime = roundToNearestFifteen(
        new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          0, // Set hour to 12 (noon)
          0 // Set minutes to 0
        )
      );

      const endTime = new Date(startTime);

      const newEvent = {
        id: Math.random().toString(36).slice(2, 11),
        title: `Event ${state.events.length + 1}`,
        start: startTime,
        end: endTime,
        resourceId,
        color:
          Object.keys(COLORS)[
            Math.floor(Math.random() * Object.keys(COLORS).length)
          ],
      };
      addEvent(newEvent);
    }
  };

  const handleEventClick = (e, event) => {
    e.stopPropagation();
    setSelectedEventForDeletion(event);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedEventForDeletion) {
      deleteEvent(selectedEventForDeletion.id);
      setSelectedEventForDeletion(null);
    }
    setShowDeleteModal(false);
  };

  const handleDeleteCancel = () => {
    setSelectedEventForDeletion(null);
    setShowDeleteModal(false);
  };

  const handleAddResource = () => {
    const newResource = {
      id: `R${state.resources.length + 1}`,
      title: `Resource ${String.fromCharCode(65 + state.resources.length)}`,
    };
    addResource(newResource);
    alert(`${newResource.title} Added !`);
  };

  const handleResize = useCallback(
    (event, newWidth, direction, newStart = null) => {
      const startDate = newStart || new Date(event.start);
      const cellWidth = 80;
      const newDuration = (newWidth / cellWidth) * 24 * 60 * 60 * 1000;

      const newEndDate = new Date(startDate.getTime() + newDuration);

      updateEvent({
        ...event,
        start: startDate,
        end: newEndDate,
      });
    },
    [updateEvent]
  );

  useEffect(() => {
    if (state.targetScrollDate) {
      scrollToDate(state.targetScrollDate);
    }
  }, [state.targetScrollDate, scrollToDate]);

  const sortEventsByTime = (events) => {
    return [...events].sort((a, b) => {
      // First sort by start time
      const timeCompare = a.start.getTime() - b.start.getTime();
      if (timeCompare !== 0) return timeCompare;

      // If start times are equal, sort by duration (shorter events first)
      const aDuration = a.end.getTime() - a.start.getTime();
      const bDuration = b.end.getTime() - b.start.getTime();
      return aDuration - bDuration;
    });
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <CalendarHeader
        currentDate={state.currentDate}
        navigateToDate={navigateToDate}
        handleAddResource={handleAddResource}
        goToToday={goToToday}
      />

      <div className="flex-1 overflow-auto scroll-smooth" ref={calendarRef}>
        <div className="relative min-w-max">
          <table className="w-full border-collapse bg-white" ref={tableRef}>
            <thead className="sticky top-0 z-10 bg-gray-50">
              <tr>
                <th
                  ref={sidebarRef}
                  className="sticky left-0 z-20 w-32 min-w-[12rem] border-b border-r border-gray-200 bg-gray-50 p-3 text-left font-semibold text-gray-700"
                >
                  Resources
                </th>
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const date = new Date(
                    state.currentDate.getFullYear(),
                    state.currentDate.getMonth(),
                    i + 1
                  );
                  const isToday =
                    date.toDateString() === new Date().toDateString();
                  return (
                    <th
                      key={i}
                      className={`max-w-sm border-b border-r border-gray-200 text-sm ${
                        isToday ? "bg-blue-200" : ""
                      }`}
                    >
                      <div className="font-semibold text-gray-700 p-2">
                        {date.toLocaleDateString("default", {
                          weekday: "short",
                          day: "numeric",
                        })}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {state.resources.map((resource) => (
                <tr key={resource.id}>
                  <td className="sticky left-0 z-10 border-b border-r border-gray-200 bg-gray-50 p-4 text-gray-700">
                    {resource.title}
                  </td>
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const date = new Date(
                      state.currentDate.getFullYear(),
                      state.currentDate.getMonth(),
                      i + 1
                    );
                    const cellEvents = sortEventsByTime(
                      state.events.filter(
                        (event) =>
                          event.resourceId === resource.id &&
                          new Date(event.start).toDateString() ===
                            date.toDateString()
                      )
                    );
                    const hasEvents = cellEvents.length > 0;

                    return (
                      <td
                        key={i}
                        className={`relative border-b border-r border-gray-200 ${
                          hasEvents ? "min-h-[120px]" : "h-20"
                        }`}
                        style={{
                          width: "80px",
                          height: hasEvents
                            ? `${Math.max(80, cellEvents.length * 70 + 5)}px`
                            : "80px",
                          padding: "6px 0px", // Added padding top and bottom
                          margin: "6px",
                        }}
                        data-date={date.toISOString().split("T")[0]}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(date, resource.id)}
                        onDoubleClick={(e) =>
                          handleCellClick(e, date, resource.id)
                        }
                      >
                        <div className="w-full" data-cell-area="true" />
                        {cellEvents.map((event, index) => (
                          <CalendarEvent
                            key={event.id}
                            event={event}
                            calculateEventStyle={calculateEventStyle}
                            handleDragStart={handleDragStart}
                            handleEventClick={handleEventClick}
                            onResize={handleResize}
                            index={index}
                            total={cellEvents.length}
                          />
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
      />
    </div>
  );
}
