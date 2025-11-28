import React from "react";
import { Search, Filter as FilterIcon, X } from "lucide-react";

/**
 * @param {string} searchQuery 
 * @param {function} onSearchChange
 * @param {string} searchPlaceholder 
 * @param {Array} filters 
 * @param {function} onClear 
 * @param {boolean} showClearButton 
 * @param {string} resultsCount 
 */
export default function Filter({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  onClear,
  showClearButton,
  resultsCount,
}) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <FilterIcon size={20} className="text-slate-500" />
        <h2 className="text-lg font-bold text-navyBlue">Filters</h2>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
        
        {/* Search Bar */}
        <div className="relative md:col-span-2">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={onSearchChange}
            className="w-full pl-10 pr-5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navyBlue/20 focus:border-navyBlue transition-all text-sm"
          />
        </div>

        {/* Dynamic Dropdowns */}
        {filters.map((filter, index) => (
          <div key={index}>
            <select
              value={filter.value}
              onChange={filter.onChange}
              className="w-full px- py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navyBlue/20 focus:border-navyBlue bg-white text-sm text-slate-700 cursor-pointer"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Footer: Count & Clear Button */}
      {(showClearButton || resultsCount) && (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {resultsCount && (
            <p className="text-xs text-slate-500 font-medium">{resultsCount}</p>
          )}
          
          {showClearButton && (
            <button
              onClick={onClear}
              className="text-xs flex items-center gap-1 text-navyBlue hover:text-red-600 font-semibold transition-colors"
            >
              <X size={14} /> Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}