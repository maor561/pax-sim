import React from 'react';

interface PassengerStateIndicatorProps {
  state: 'relaxed' | 'comfortable' | 'anxious' | 'scared' | 'panicked';
  comfort: number;
  reaction: string;
}

export function PassengerStateIndicator({
  state,
  comfort,
  reaction,
}: PassengerStateIndicatorProps) {
  const getStateColor = (state: string) => {
    const colors: Record<string, string> = {
      relaxed: 'border-l-4 border-green-500 bg-green-500/10',
      comfortable: 'border-l-4 border-blue-500 bg-blue-500/10',
      anxious: 'border-l-4 border-yellow-500 bg-yellow-500/10',
      scared: 'border-l-4 border-orange-500 bg-orange-500/10',
      panicked: 'border-l-4 border-red-500 bg-red-500/10',
    };
    return colors[state] || 'border-l-4 border-gray-500';
  };

  const getStateEmoji = (state: string) => {
    const emojis: Record<string, string> = {
      relaxed: '😌',
      comfortable: '😊',
      anxious: '😟',
      scared: '😨',
      panicked: '😱',
    };
    return emojis[state] || '😐';
  };

  const getAnimationClass = (state: string) => {
    const animations: Record<string, string> = {
      relaxed: 'animate-pulse',
      comfortable: '',
      anxious: 'animate-pulse',
      scared: 'animate-bounce',
      panicked: 'animate-bounce',
    };
    return animations[state] || '';
  };

  return (
    <div className={`p-2 rounded transition-all duration-300 ${getStateColor(state)}`}>
      {/* State Indicator */}
      <div className="flex items-center justify-between mb-1">
        <span className={`text-lg ${getAnimationClass(state)}`}>{getStateEmoji(state)}</span>
        <span className="text-xs font-semibold capitalize text-gray-300">{state}</span>
      </div>

      {/* Reaction Text */}
      <p className="text-xs italic text-gray-400 mb-1 line-clamp-2">{reaction}</p>

      {/* Comfort Meter */}
      <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
          style={{ width: `${comfort}%` }}
        />
      </div>

      {/* Comfort Label */}
      <div className="text-xs text-gray-400 mt-1 text-right">{comfort}% comfort</div>
    </div>
  );
}
