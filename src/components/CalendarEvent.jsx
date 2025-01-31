import { COLORS } from "../constants/colors"

export const CalendarEvent = ({ event, calculateEventStyle, handleDragStart, handleEventClick, handleResizeStart }) => {
  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div
      className={`relative p-3 rounded-md shadow-md cursor-pointer 
        ${COLORS[event.color]} transition-all duration-200 ease-in-out
        hover:shadow-lg`}
      style={calculateEventStyle(event)}
      draggable
      onDragStart={(e) => handleDragStart(event, e)}
      onClick={(e) => handleEventClick(e, event)}
    >
      <div className="text-sm font-semibold truncate">{event.title}</div>
      <div className="text-xs opacity-90">
        {formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}
      </div>
      <div
        className="absolute top-0 bottom-0 right-0 w-4 cursor-e-resize group
          hover:bg-black/10 transition-colors"
        onMouseDown={(e) => {
          e.stopPropagation()
          handleResizeStart(event, "end", e)
        }}
      >
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 
          bg-white/50 rounded-full group-hover:bg-white/80 transition-colors"
        />
      </div>
      <div
        className="absolute top-0 bottom-0 left-0 w-4 cursor-w-resize group
          hover:bg-black/10 transition-colors"
        onMouseDown={(e) => {
          e.stopPropagation()
          handleResizeStart(event, "start", e)
        }}
      >
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 
          bg-white/50 rounded-full group-hover:bg-white/80 transition-colors"
        />
      </div>
    </div>
  )
}

