import { useEffect, useState } from 'react';

interface FlightStatus {
  altitude: number;
  speed: number;
  gForce: number;
  turbulence: number;
  phase: string;
  timestamp: number;
}

export function App() {
  const [flightStatus, setFlightStatus] = useState<FlightStatus | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Fetch initial flight status
    fetch('/api/flight/status')
      .then((res) => res.json())
      .then(setFlightStatus)
      .catch(console.error);

    // Connect to WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onopen = () => {
      setConnected(true);
      console.log('Connected to server');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'flight_update') {
        setFlightStatus(message.data);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log('Disconnected from server');
    };

    return () => ws.close();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8">PAX SIM</h1>

        <div className="mb-8 p-4 bg-gray-800 rounded">
          <p className="text-sm">
            Status: <span className={connected ? 'text-green-500' : 'text-red-500'}>
              {connected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
          </p>
        </div>

        {flightStatus && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-800 rounded">
              <div className="text-gray-400 text-sm">Altitude</div>
              <div className="text-2xl font-bold">{flightStatus.altitude.toLocaleString()} ft</div>
            </div>
            <div className="p-4 bg-gray-800 rounded">
              <div className="text-gray-400 text-sm">Speed</div>
              <div className="text-2xl font-bold">{flightStatus.speed} kts</div>
            </div>
            <div className="p-4 bg-gray-800 rounded">
              <div className="text-gray-400 text-sm">G-Force</div>
              <div className="text-2xl font-bold">{flightStatus.gForce.toFixed(2)}G</div>
            </div>
            <div className="p-4 bg-gray-800 rounded">
              <div className="text-gray-400 text-sm">Turbulence</div>
              <div className="text-2xl font-bold">{(flightStatus.turbulence * 100).toFixed(0)}%</div>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-800 rounded">
          <h2 className="text-xl font-bold mb-4">Flight Phase</h2>
          <p className="text-lg capitalize">{flightStatus?.phase || 'Loading...'}</p>
        </div>

        <div className="mt-8 p-4 bg-gray-800 rounded">
          <h2 className="text-xl font-bold mb-4">Passengers</h2>
          <p className="text-gray-400">Coming soon...</p>
        </div>
      </div>
    </div>
  );
}
