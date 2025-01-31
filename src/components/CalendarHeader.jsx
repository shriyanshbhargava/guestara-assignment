import { BiChevronLeft, BiChevronRight, BiPlus } from "react-icons/bi";
import { DatePickerButton } from "./DatePickerButton";
import PropTypes from "prop-types";

export function CalendarHeader({
  currentDate,
  navigateToDate,
  handleAddResource,
  goToToday,
}) {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between bg-white p-4 shadow-md">
      <div className="flex items-center gap-4">
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
          onClick={goToToday}
        >
          Today
        </button>
        <button
                    className="p-2 text-gray-600 bg-gray-100 hover:bg-gray-300 rounded-full "

          onClick={() => {
            const newDate = new Date(currentDate);
            newDate.setMonth(newDate.getMonth() - 1);
            navigateToDate(newDate);
          }}
        >
          <BiChevronLeft className="w-5 h-5" />
        </button>
        <DatePickerButton
          currentDate={currentDate}
          onSelect={(date) => navigateToDate(date, true)}
        />
        <button
          className="p-2 text-gray-600 bg-gray-100 hover:bg-gray-300 rounded-full "
          onClick={() => {
            const newDate = new Date(currentDate);
            newDate.setMonth(newDate.getMonth() + 1);
            navigateToDate(newDate);
          }}
        >
          <BiChevronRight className="w-5 h-5" />
        </button>
      </div>
      <button
        onClick={handleAddResource}
        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        <BiPlus className="w-5 h-5 mr-2" />
        Add Resource
      </button>
    </div>
  );
}

CalendarHeader.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
  navigateToDate: PropTypes.func.isRequired,
  handleAddResource: PropTypes.func.isRequired,
  goToToday: PropTypes.func.isRequired,
};
