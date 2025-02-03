import { COLORS } from "../constants/colors";
import PropTypes from "prop-types";
import { useState, useRef, useEffect } from "react";

export const CalendarEvent = ({
  event,
  calculateEventStyle,
  handleDragStart,
  handleEventClick,
  onResize,
  index,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const resizeRef = useRef(null);
  const initialPositionRef = useRef(null);
  const initialWidthRef = useRef(null);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const baseStyle = calculateEventStyle(event);
  const eventStyle = {
    ...baseStyle,
    top: `${index * 63}px`,
    left: "3px",
    height: "60px",
    marginTop: "3px",
    zIndex: isResizing ? 50 : 1,
    cursor: isResizing ? "col-resize" : "grab",
    pointerEvents: "all",
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      if (
        !resizeRef.current ||
        !initialPositionRef.current ||
        !initialWidthRef.current
      )
        return;

      const deltaX = e.clientX - initialPositionRef.current;
      const cellWidth = 80;

      if (resizeDirection === "right") {
        // Right resize - only adjust width
        const newWidth = Math.max(80, initialWidthRef.current + deltaX);
        onResize(event, newWidth, "right");
      } else if (resizeDirection === "left") {
        // Left resize - adjust both position and width
        const newWidth = Math.max(80, initialWidthRef.current - deltaX);

        // Calculate days to adjust based on the actual pixel movement
        const daysToAdjust = Math.floor(deltaX / cellWidth);

        // Only update if we've moved at least one cell width
        if (Math.abs(deltaX) >= cellWidth / 2) {
          // Calculate new start date
          const newStart = new Date(event.start);
          newStart.setDate(newStart.getDate() + daysToAdjust);

          // Ensure the new width maintains the grid alignment
          const adjustedWidth =
            initialWidthRef.current - daysToAdjust * cellWidth;
          const finalWidth = Math.max(80, adjustedWidth);

          onResize(event, finalWidth, "left", newStart);
        } else {
          // If we haven't moved enough for a day change, just update the visual width
          onResize(event, newWidth, "right");
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
      document.body.style.cursor = "default";
      initialPositionRef.current = null;
      initialWidthRef.current = null;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, event, onResize, resizeDirection]);

  const handleResizeStart = (e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    document.body.style.cursor = "col-resize";
    initialPositionRef.current = e.clientX;
    initialWidthRef.current = resizeRef.current?.offsetWidth;
  };

  return (
    <div
      ref={resizeRef}
      className={`absolute p-3 rounded-md shadow-sm 
        ${COLORS[event.color]} transition-all duration-200 ease-in-out
        hover:shadow-lg calendar-event select-none`}
      style={eventStyle}
      draggable={!isResizing}
      onDragStart={(e) => !isResizing && handleDragStart(event, e)}
      onClick={(e) => !isResizing && handleEventClick(e, event)}
    >
      <div
        className="absolute top-0 bottom-0 left-0 w-2 cursor-col-resize group
          hover:bg-black/10 transition-colors"
        onMouseDown={(e) => handleResizeStart(e, "left")}
      >
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 
          bg-white/50 rounded-full group-hover:bg-white/80 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1 pointer-events-none">
        <div className="text-[12px] font-semibold truncate">{event.title}</div>
        <div className="text-[11px] opacity-90 font-medium truncate">
          {formatTime(new Date(event.start))} -{" "}
          {formatTime(new Date(event.end))}
        </div>
      </div>

      <div
        className="absolute top-0 bottom-0 right-0 w-2 cursor-col-resize group
          hover:bg-black/10 transition-colors"
        onMouseDown={(e) => handleResizeStart(e, "right")}
      >
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 
          bg-white/50 rounded-full group-hover:bg-white/80 transition-colors"
        />
      </div>
    </div>
  );
};

CalendarEvent.propTypes = {
  event: PropTypes.shape({
    title: PropTypes.string.isRequired,
    start: PropTypes.instanceOf(Date).isRequired,
    end: PropTypes.instanceOf(Date).isRequired,
    color: PropTypes.string.isRequired,
  }).isRequired,
  calculateEventStyle: PropTypes.func.isRequired,
  handleDragStart: PropTypes.func.isRequired,
  handleEventClick: PropTypes.func.isRequired,
  onResize: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};
