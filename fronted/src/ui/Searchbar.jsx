import React from 'react';
import { FaSearch } from 'react-icons/fa';

/**
 * Reusable Searchbar component
 * @param {string} searchTerm - Current search term
 * @param {function} setSearchTerm - Function to update search term
 * @param {string} placeholder - Placeholder text for the search input
 * @param {string} className - Additional CSS classes
 */
function Searchbar({ searchTerm, setSearchTerm, placeholder = "Search...", className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center border rounded-full overflow-hidden bg-gray-50 hover:bg-white focus-within:ring-2 focus-within:ring-green-400 transition-all">
        <span className="text-gray-400 pl-3">
          <FaSearch />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="py-2 px-3 w-full outline-none bg-transparent"
        />
      </div>
    </div>
  );
}

export default Searchbar;
