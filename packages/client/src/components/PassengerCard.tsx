import React, { CSSProperties } from 'react';
import { PassengerStateIndicator } from './PassengerStateIndicator';

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

interface PassengerCardProps {
  passenger: Passenger;
  state?: PassengerState;
  style?: CSSProperties;
}

export function PassengerCard({ passenger, state, style }: PassengerCardProps) {
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

  const defaultState: PassengerState = {
    state: 'comfortable',
    comfort: 75,
    reaction: 'Settling in',
  };

  const currentState = state || defaultState;

  return (
    <div
      style={style}
      className="p-3 bg-gray-800 rounded border border-gray-700 hover:border-gray-600 transition-all duration-300 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{passenger.name}</h3>
          <p className="text-xs text-gray-400">{passenger.seatNumber}</p>
        </div>
        <div className="text-xl ml-2">{getPersonalityIcon(passenger.personality)}</div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
        <div>
          <span className="text-gray-400">Age:</span>
          <p className="text-white">{passenger.age}</p>
        </div>
        <div>
          <span className="text-gray-400">Type:</span>
          <p className="text-white capitalize">{passenger.personality}</p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex gap-1 mb-3">
        <span className={`px-2 py-0.5 rounded text-xs font-semibold text-white ${getClassColor(passenger.ticketClass)}`}>
          {passenger.ticketClass.charAt(0).toUpperCase() + passenger.ticketClass.slice(1)}
        </span>
        {passenger.isFrequentFlyer && <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-600">⭐</span>}
      </div>

      {/* State Indicator */}
      <div className="flex-1">
        <PassengerStateIndicator
          state={currentState.state}
          comfort={currentState.comfort}
          reaction={currentState.reaction}
        />
      </div>
    </div>
  );
}
