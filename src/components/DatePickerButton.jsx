import * as React from "react";
import PropTypes from "prop-types";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";
import { BiCalendarEvent, BiChevronLeft, BiChevronRight } from "react-icons/bi";

export function DatePickerButton({ currentDate, onSelect }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(currentDate);
  const [displayMonth, setDisplayMonth] = React.useState(currentDate);
  const calendarRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleCalendar = () => setIsOpen(!isOpen);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    onSelect(date);
    setIsOpen(false);
  };

  const nextMonth = () => setDisplayMonth(addMonths(displayMonth, 1));
  const prevMonth = () => setDisplayMonth(subMonths(displayMonth, 1));

  const renderCalendar = () => {
    const start = startOfMonth(displayMonth);
    const end = endOfMonth(displayMonth);
    const days = eachDayOfInterval({ start, end });

    const startDay = start.getDay();
    const paddingDays = Array(startDay).fill(null);

    const allDays = [...paddingDays, ...days];

    return (
      <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-6 min-w-[320px] z-50">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <BiChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <h2 className="text-lg font-semibold text-gray-800 ">
            {format(displayMonth, "MMMM yyyy")}
          </h2>

          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <BiChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 p-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {allDays.map((day, index) => (
            <button
              key={day ? day.toString() : `empty-${index}`}
              onClick={() => day && handleDateSelect(day)}
              disabled={!day}
              className={`
                p-2 w-10 h-10 flex items-center justify-center text-sm rounded-full
                transition-all duration-200 relative
                ${!day ? "invisible" : "hover:bg-gray-100"}
                ${isToday(day) ? "ring-2 ring-blue-400" : ""}
                ${
                  day &&
                  format(day, "yyyy-MM-dd") ===
                    format(selectedDate, "yyyy-MM-dd")
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "text-gray-700"
                }
              `}
              aria-label={day ? format(day, "MMMM d, yyyy") : undefined}
              aria-current={day && isToday(day) ? "date" : undefined}
              aria-selected={
                day &&
                format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
              }
            >
              {day && format(day, "d")}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative inline-block" ref={calendarRef}>
      <button
        onClick={toggleCalendar}
        className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-gray-600 transition-colors duration-200"
      >
        <BiCalendarEvent className="w-5 h-5 mr-3 text-gray-400" />
        <span className="mr-1">{format(currentDate, "MMMM  yyyy")}</span>
      </button>
      {isOpen && renderCalendar()}
    </div>
  );
}

DatePickerButton.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
  onSelect: PropTypes.func.isRequired,
};
