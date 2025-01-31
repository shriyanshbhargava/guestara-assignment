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
  const [resizingEvent, setResizingEvent] = useState(null);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [resizePreview, setResizePreview] = useState(null);
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

  const scrollToDate = useCallback((date) => {
    requestAnimationFrame(() => {
      const targetCell = tableRef.current?.querySelector(
        `[data-date="${date.toISOString().split("T")[0]}"]`
      );
      const container = calendarRef.current;
      const sidebarElement = sidebarRef.current;

      if (!targetCell || !container) {
        console.warn("Target cell or container not found");
        return;
      }

      // Get sidebar width dynamically
      const sidebarWidth = sidebarElement?.offsetWidth ?? 192;
      const containerWidth = container.clientWidth;
      const cellRect = targetCell.getBoundingClientRect();

      // Check if horizontal scrolling is supported
      if (container.scrollWidth <= container.clientWidth) {
        return;
      }

      const scrollPosition =
        targetCell.offsetLeft -
        sidebarWidth -
        (containerWidth - cellRect.width) / 2 +
        container.scrollLeft;

      container.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: "smooth",
      });
    });
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    navigateToDate(today, true);
    scrollToDate(today);
  }, [navigateToDate, scrollToDate]);

  const snapToDay = useCallback((date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }, []);

  const calculateEventStyle = useCallback(
    (event) => {
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);
      const daysDuration = Math.round(
        (endDate - startDate) / (1000 * 60 * 60 * 24)
      );

      if (resizePreview && event.id === resizingEvent?.id) {
        return {
          width: `${resizePreview.duration * 100}%`,
          transform: `translateX(${resizePreview.offset * 100}%)`,
        };
      }

      return {
        width: `${Math.max(1, daysDuration) * 100}%`,
      };
    },
    [resizePreview, resizingEvent]
  );

  const handleDragStart = (event, e) => {
    setDraggedEvent(event);
    e.dataTransfer.setData("text/plain", "");
  };

  const handleResizeStart = (event, direction, e) => {
    e.stopPropagation();
    setResizingEvent(event);
    setResizeDirection(direction);
    setResizePreview({
      duration: Math.ceil((event.end - event.start) / (1000 * 60 * 60 * 24)),
      offset: 0,
    });
  };

  const handleResizeMove = useCallback(
    (date) => {
      if (!resizingEvent) return;

      const currentDate = snapToDay(date);
      const eventStart = snapToDay(resizingEvent.start);
      const eventEnd = snapToDay(resizingEvent.end);

      const diffDays = Math.round(
        (currentDate - eventStart) / (1000 * 60 * 60 * 24)
      );

      if (resizeDirection === "end") {
        const newDuration = Math.max(1, diffDays);
        setResizePreview({
          duration: newDuration,
          offset: 0,
        });
      } else {
        const totalDays = Math.round(
          (eventEnd - eventStart) / (1000 * 60 * 60 * 24)
        );
        const newOffset = Math.round(
          (currentDate - eventStart) / (1000 * 60 * 60 * 24)
        );
        const newDuration = totalDays - newOffset;

        if (newDuration >= 1) {
          setResizePreview({
            duration: newDuration,
            offset: newOffset,
          });
        }
      }
    },
    [resizingEvent, resizeDirection, snapToDay]
  );

  const handleResizeEnd = useCallback(() => {
    if (!resizingEvent || !resizePreview) return;

    const newEvent = { ...resizingEvent };
    const eventStart = snapToDay(resizingEvent.start);
    const eventEnd = snapToDay(resizingEvent.end);

    if (resizeDirection === "end") {
      newEvent.end = new Date(
        eventStart.getTime() + resizePreview.duration * 24 * 60 * 60 * 1000
      );
    } else {
      newEvent.start = new Date(
        eventEnd.getTime() - resizePreview.duration * 24 * 60 * 60 * 1000
      );
    }

    newEvent.start.setHours(
      resizingEvent.start.getHours(),
      resizingEvent.start.getMinutes()
    );
    newEvent.end.setHours(
      resizingEvent.end.getHours(),
      resizingEvent.end.getMinutes()
    );

    updateEvent(newEvent);
    setResizingEvent(null);
    setResizeDirection(null);
    setResizePreview(null);
  }, [resizingEvent, resizePreview, resizeDirection, updateEvent, snapToDay]);

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
      const defaultDuration = 60;
      const newEvent = {
        id: Math.random().toString(36).substr(2, 9),
        title: `Event ${state.events.length + 1}`,
        start: date,
        end: new Date(date.getTime() + defaultDuration * 60 * 1000),
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

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizingEvent) return;
      const cell = document.elementFromPoint(e.clientX, e.clientY);
      if (!cell?.hasAttribute("data-date")) return;

      const date = new Date(cell.getAttribute("data-date"));
      handleResizeMove(date);
    };

    const handleMouseUp = () => {
      if (resizingEvent) {
        handleResizeEnd();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingEvent, handleResizeMove, handleResizeEnd]);

  useEffect(() => {
    if (state.targetScrollDate) {
      scrollToDate(state.targetScrollDate);
    }
  }, [state.targetScrollDate, scrollToDate]);

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
                  className="sticky left-0 z-20 w-48 min-w-[12rem] border-b border-r border-gray-200 bg-gray-50 p-3 text-left font-semibold text-gray-700"
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
                      className={`min-w-[120px] border-b border-r border-gray-200 p-2 text-sm ${
                        isToday ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="font-semibold text-gray-700">
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
                    const cellEvents = state.events.filter(
                      (event) =>
                        event.resourceId === resource.id &&
                        new Date(event.start).toDateString() ===
                          date.toDateString()
                    );
                    const hasMultipleEvents = cellEvents.length > 1;

                    return (
                      <td
                        key={i}
                        className={`relative pb-3 border-b border-r border-gray-200 ${
                          hasMultipleEvents ? "min-h-[200px]" : "h-20"
                        }`}
                        data-date={date.toISOString().split("T")[0]}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(date, resource.id)}
                        onClick={(e) => handleCellClick(e, date, resource.id)}
                      >
                        <div
                          className={`flex h-full flex-col gap-1 p-1 ${
                            hasMultipleEvents ? "min-h-[120px]" : ""
                          }`}
                          data-cell-area="true"
                        >
                          {cellEvents.map((event) => (
                            <CalendarEvent
                              key={event.id}
                              event={event}
                              calculateEventStyle={calculateEventStyle}
                              handleDragStart={handleDragStart}
                              handleEventClick={handleEventClick}
                              handleResizeStart={handleResizeStart}
                              colors={COLORS}
                            />
                          ))}
                        </div>
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
