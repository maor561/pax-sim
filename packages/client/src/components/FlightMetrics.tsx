import React from 'react';

interface FlightMetricsProps {
  data: {
    altitude: number;
    speed: number;
    gForce: number;
    turbulence: number;
    phase: string;
    averageComfort?: number;
  };
}

export function FlightMetrics({ data }: FlightMetricsProps) {
  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      ground: 'bg-gray-600',
      takeoff: 'bg-orange-600',
      climb: 'bg-yellow-600',
      cruise: 'bg-green-600',
      descent: 'bg-blue-600',
      landing: 'bg-purple-600',
    };
    return colors[phase] || 'bg-gray-600';
  };

  const getTurbulenceColor = (turbulence: number) => {
    if (turbulence < 0.2) return 'bg-green-600';
    if (turbulence < 0.5) return 'bg-yellow-600';
    if (turbulence < 0.75) return 'bg-orange-600';
    return 'bg-red-600';
  };

  const getGForceColor = (gForce: number) => {
    if (gForce < 1.1) return 'text-green-400';
    if (gForce < 1.3) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        {/* Altitude */}
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
          <div className="text-gray-400 text-sm mb-1">Altitude</div>
          <div className="text-3xl font-bold">{Math.round(data.altitude).toLocaleString()}</div>
          <div className="text-gray-500 text-xs mt-1">ft</div>
        </div>

        {/* Speed */}
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
          <div className="text-gray-400 text-sm mb-1">Speed</div>
          <div className="text-3xl font-bold">{Math.round(data.speed)}</div>
          <div className="text-gray-500 text-xs mt-1">knots</div>
        </div>

        {/* G-Force */}
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
          <div className="text-gray-400 text-sm mb-1">G-Force</div>
          <div className={`text-3xl font-bold ${getGForceColor(data.gForce)}`}>
            {data.gForce.toFixed(2)}
          </div>
          <div className="text-gray-500 text-xs mt-1">G</div>
        </div>

        {/* Turbulence */}
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
          <div className="text-gray-400 text-sm mb-1">Turbulence</div>
          <div className="relative h-8 bg-gray-800 rounded overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getTurbulenceColor(data.turbulence)}`}
              style={{ width: `${data.turbulence * 100}%` }}
            />
          </div>
          <div className="text-gray-500 text-xs mt-1">{(data.turbulence * 100).toFixed(0)}%</div>
        </div>

        {/* Flight Phase */}
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
          <div className="text-gray-400 text-sm mb-1">Phase</div>
          <div className={`px-2 py-1 rounded text-sm font-semibold ${getPhaseColor(data.phase)}`}>
            {data.phase.toUpperCase()}
          </div>
        </div>

        {/* Comfort */}
        {data.averageComfort !== undefined && (
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
            <div className="text-gray-400 text-sm mb-1">Avg Comfort</div>
            <div className="text-3xl font-bold">{Math.round(data.averageComfort)}</div>
            <div className="text-gray-500 text-xs mt-1">%</div>
          </div>
        )}
      </div>
    </div>
  );
}
