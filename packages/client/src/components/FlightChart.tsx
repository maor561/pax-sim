import React, { useState, useCallback, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FlightDataPoint {
  timestamp: number;
  altitude: number;
  speed: number;
  gForce: number;
  turbulence: number;
}

interface FlightChartProps {
  data: FlightDataPoint | null;
}

export function FlightChart({ data }: FlightChartProps) {
  const [altitudeHistory, setAltitudeHistory] = useState<any[]>([]);
  const [speedHistory, setSpeedHistory] = useState<any[]>([]);
  const [gForceHistory, setGForceHistory] = useState<any[]>([]);
  const [turbulenceHistory, setTurbulenceHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!data) return;

    const timeLabel = new Date(data.timestamp).toLocaleTimeString();

    // Keep last 60 seconds of data (roughly 10 data points at 10Hz)
    const updateHistory = (prev: any[]) => {
      const updated = [...prev, { time: timeLabel, value: 0 }];
      return updated.slice(-60);
    };

    setAltitudeHistory((prev) => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1].value = data.altitude;
      } else {
        updated.push({ time: timeLabel, value: data.altitude });
      }
      return updated.slice(-60);
    });

    setSpeedHistory((prev) => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1].value = data.speed;
      } else {
        updated.push({ time: timeLabel, value: data.speed });
      }
      return updated.slice(-60);
    });

    setGForceHistory((prev) => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1].value = data.gForce;
      } else {
        updated.push({ time: timeLabel, value: data.gForce });
      }
      return updated.slice(-60);
    });

    setTurbulenceHistory((prev) => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1].value = data.turbulence * 100;
      } else {
        updated.push({ time: timeLabel, value: data.turbulence * 100 });
      }
      return updated.slice(-60);
    });
  }, [data]);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6">Flight Metrics History</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Altitude Chart */}
        <div className="bg-gray-800 rounded p-4">
          <h3 className="text-lg font-semibold mb-4">Altitude (ft)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={altitudeHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="time" stroke="#888" style={{ fontSize: '12px' }} />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #444' }}
                formatter={(value) => `${value.toFixed(0)} ft`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                isAnimationActive={false}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Speed Chart */}
        <div className="bg-gray-800 rounded p-4">
          <h3 className="text-lg font-semibold mb-4">Speed (knots)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={speedHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="time" stroke="#888" style={{ fontSize: '12px' }} />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #444' }}
                formatter={(value) => `${value.toFixed(0)} kts`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                isAnimationActive={false}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* G-Force Chart */}
        <div className="bg-gray-800 rounded p-4">
          <h3 className="text-lg font-semibold mb-4">G-Force</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={gForceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="time" stroke="#888" style={{ fontSize: '12px' }} />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #444' }}
                formatter={(value) => `${value.toFixed(2)}G`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#f59e0b"
                isAnimationActive={false}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Turbulence Chart */}
        <div className="bg-gray-800 rounded p-4">
          <h3 className="text-lg font-semibold mb-4">Turbulence (%)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={turbulenceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="time" stroke="#888" style={{ fontSize: '12px' }} />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #444' }}
                formatter={(value) => `${value.toFixed(0)}%`}
              />
              <Bar dataKey="value" fill="#ef4444" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
