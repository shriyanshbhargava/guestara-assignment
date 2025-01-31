import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { BiPlus } from "react-icons/bi";

export function CalendarHeader({
  currentDate,
  navigateToDate,
  handleAddResource,
  goToToday,
}) {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between bg-white  p-4 shadow-md">
      <div className="flex items-center gap-3">
        <button
          className="rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
          onClick={goToToday}
        >
          Today
        </button>
        <button
          className="rounded-full  bg-gray-200 p-2 transition-colors hover:bg-gray-300"
          onClick={() => {
            const newDate = new Date(currentDate);
            newDate.setMonth(newDate.getMonth() - 1);
            navigateToDate(newDate);
          }}
        >
          <MdChevronLeft className="h-6 w-6 text-gray-500" />
        </button>
        <button
          className="rounded-full bg-gray-200 p-2 transition-colors hover:bg-gray-300 "
          onClick={() => {
            const newDate = new Date(currentDate);
            newDate.setMonth(newDate.getMonth() + 1);
            navigateToDate(newDate);
          }}
        >
          <MdChevronRight className="h-6 w-6 text-gray-500" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>
      </div>
      <button
        className="rounded-md bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600 flex items-center gap-2"
        onClick={handleAddResource}
      >
        <BiPlus className="text-white" />
        Add Resource
      </button>
    </div>
  );
}
