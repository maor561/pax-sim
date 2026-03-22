import React, { useState, useCallback, useMemo } from 'react';
import { PassengerCard } from './PassengerCard';

interface Passenger {
  id: string;
  name: string;
  age: number;
  personality: string;
  ticketClass: string;
  seatNumber: string;
  isFrequentFlyer: boolean;
}

interface PassengerState {
  state: 'relaxed' | 'comfortable' | 'anxious' | 'scared' | 'panicked';
  comfort: number;
  reaction: string;
}

interface PassengerListProps {
  passengers: Passenger[];
  passengerStates?: Map<string, PassengerState>;
}

const ITEMS_PER_PAGE = 50;

export function PassengerList({ passengers, passengerStates = new Map() }: PassengerListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterClass, setFilterClass] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter passengers
  const filteredPassengers = useMemo(() => {
    return passengers.filter((p) => {
      const matchesClass = filterClass === 'all' || p.ticketClass === filterClass;
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.seatNumber.includes(searchTerm);
      return matchesClass && matchesSearch;
    });
  }, [passengers, filterClass, searchTerm]);

  // Paginate
  const totalPages = Math.ceil(filteredPassengers.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const currentPassengers = filteredPassengers.slice(startIdx, endIdx);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Passengers</h2>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name or seat..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
          />

          {/* Filter */}
          <select
            value={filterClass}
            onChange={(e) => {
              setFilterClass(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Classes</option>
            <option value="economy">Economy</option>
            <option value="business">Business</option>
            <option value="first">First Class</option>
          </select>

          {/* Info */}
          <div className="flex items-center justify-end text-gray-400 text-sm">
            Showing {startIdx + 1}-{Math.min(endIdx, filteredPassengers.length)} of {filteredPassengers.length}
          </div>
        </div>
      </div>

      {/* Passenger Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
        {currentPassengers.map((passenger) => (
          <PassengerCard
            key={passenger.id}
            passenger={passenger}
            state={passengerStates.get(passenger.id)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 rounded"
          >
            Previous
          </button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const pageNum = currentPage > 3 ? currentPage - 2 + i : i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 rounded ${
                    pageNum === currentPage ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && <span className="px-2 py-2">...</span>}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 rounded"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
