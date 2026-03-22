import React, { useState, useCallback, useMemo } from 'react';
import { FixedSizeList } from 'react-window';
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

export function PassengerList({ passengers, passengerStates = new Map() }: PassengerListProps) {
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

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleFilterChange = useCallback((value: string) => {
    setFilterClass(value);
  }, []);

  // Virtual list row renderer
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const passenger = filteredPassengers[index];
    const state = passengerStates.get(passenger.id);

    return (
      <div style={style} className="p-2">
        <PassengerCard passenger={passenger} state={state} />
      </div>
    );
  };

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
            onChange={(e) => handleSearch(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
          />

          {/* Filter */}
          <select
            value={filterClass}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Classes</option>
            <option value="economy">Economy</option>
            <option value="business">Business</option>
            <option value="first">First Class</option>
          </select>

          {/* Info */}
          <div className="flex items-center justify-end text-gray-400 text-sm">
            Showing {filteredPassengers.length} of {passengers.length} passengers
          </div>
        </div>
      </div>

      {/* Virtual Scrolling Grid */}
      {filteredPassengers.length > 0 ? (
        <div className="bg-gray-800 rounded border border-gray-700 overflow-hidden">
          <FixedSizeList
            height={600}
            itemCount={filteredPassengers.length}
            itemSize={150}
            width="100%"
            layout="grid"
            columnCount={5}
          >
            {Row}
          </FixedSizeList>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No passengers found</p>
        </div>
      )}
    </div>
  );
}
