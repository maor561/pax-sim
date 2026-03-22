import React from 'react';

interface Passenger {
  id: string;
  name: string;
  age: number;
  personality: string;
  ticketClass: string;
  seatNumber: string;
  isFrequentFlyer: boolean;
}

interface PassengerCardProps {
  passenger: Passenger;
}

export function PassengerCard({ passenger }: PassengerCardProps) {
  const getClassColor = (ticketClass: string) => {
    const colors: Record<string, string> = {
      economy: 'bg-blue-600',
      business: 'bg-purple-600',
      first: 'bg-yellow-600',
    };
    return colors[ticketClass] || 'bg-gray-600';
  };

  const getPersonalityIcon = (personality: string) => {
    const icons: Record<string, string> = {
      calm: '😌',
      anxious: '😟',
      fearful: '😨',
      business: '💼',
      casual: '😊',
    };
    return icons[personality] || '😐';
  };

  return (
    <div className="p-3 bg-gray-800 rounded border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{passenger.name}</h3>
          <p className="text-xs text-gray-400">{passenger.seatNumber}</p>
        </div>
        <div className="text-2xl ml-2">{getPersonalityIcon(passenger.personality)}</div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-400">Age:</span>
          <p className="text-white">{passenger.age}</p>
        </div>
        <div>
          <span className="text-gray-400">Personality:</span>
          <p className="text-white capitalize">{passenger.personality}</p>
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${getClassColor(passenger.ticketClass)}`}>
          {passenger.ticketClass.charAt(0).toUpperCase() + passenger.ticketClass.slice(1)}
        </span>
        {passenger.isFrequentFlyer && <span className="px-2 py-1 rounded text-xs font-semibold bg-green-600">⭐ Frequent</span>}
      </div>
    </div>
  );
}
