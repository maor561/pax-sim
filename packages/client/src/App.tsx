import { useEffect, useState } from 'react';
import { FlightMetrics } from './components/FlightMetrics';
import { PassengerList } from './components/PassengerList';
import { FlightChart } from './components/FlightChart';
import { usePassengerStates } from './hooks/usePassengerStates';

interface FlightStatus {
  altitude: number;
  speed: number;
  gForce: number;
  turbulence: number;
  phase: string;
  timestamp: number;
  averageComfort?: number;
}

interface Passenger {
  id: string;
  name: string;
  age: number;
  personality: string;
  ticketClass: string;
  seatNumber: string;
  isFrequentFlyer: boolean;
}

export function App() {
  const [flightStatus, setFlightStatus] = useState<FlightStatus | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [connected, setConnected] = useState(false);
  const [flightStarted, setFlightStarted] = useState(false);
  const [passengerStats, setPassengerStats] = useState<any>(null);

  const { states: passengerStates, updateStates } = usePassengerStates(0);

  useEffect(() => {
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
      } else if (message.type === 'passenger_init') {
        setPassengers(message.data);
      } else if (message.type === 'passenger_batch_update') {
        updateStates(message.data.updates);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log('Disconnected from server');
    };

    return () => ws.close();
  }, [updateStates]);

  // Fetch passenger stats
  useEffect(() => {
    fetch('/api/passengers/stats/distribution')
      .then((res) => res.json())
      .then(setPassengerStats)
      .catch(console.error);
  }, [passengers]);

  const handleStartFlight = async () => {
    try {
      const response = await fetch('/api/flight/start/short_haul', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        setFlightStarted(true);
        console.log(`Started flight with ${data.passengerCount} passengers`);
      }
    } catch (error) {
      console.error('Failed to start flight:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2">✈️ PAX SIM</h1>
          <p className="text-gray-400">Flight Passenger Experience Simulator</p>
        </div>

        {/* Status Bar */}
        <div className="mb-8 p-4 bg-gray-900 rounded-lg border border-gray-800">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400">Server Status</p>
              <p className={`text-lg font-bold ${connected ? 'text-green-400' : 'text-red-400'}`}>
                {connected ? '🟢 Connected' : '🔴 Disconnected'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Flight Status</p>
              <p className={`text-lg font-bold ${flightStarted ? 'text-green-400' : 'text-yellow-400'}`}>
                {flightStarted ? '✈️ In Progress' : '⏸️ Ready'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Passengers</p>
              <p className="text-lg font-bold">{passengers.length}</p>
            </div>

            {!flightStarted && (
              <button
                onClick={handleStartFlight}
                disabled={!connected}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-semibold"
              >
                Start Flight
              </button>
            )}
          </div>
        </div>

        {/* Flight Metrics */}
        {flightStatus && <FlightMetrics data={flightStatus} />}

        {/* Stats Row */}
        {passengerStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="text-gray-400 text-sm">Economy</div>
              <div className="text-2xl font-bold">{passengerStats.byClass.economy}</div>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="text-gray-400 text-sm">Business</div>
              <div className="text-2xl font-bold">{passengerStats.byClass.business}</div>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="text-gray-400 text-sm">First Class</div>
              <div className="text-2xl font-bold">{passengerStats.byClass.first}</div>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="text-gray-400 text-sm">Frequent Flyers</div>
              <div className="text-2xl font-bold">{passengerStats.frequentFlyers}</div>
            </div>
          </div>
        )}

        {/* Flight Chart */}
        {flightStatus && flightStarted && <FlightChart data={flightStatus} />}

        {/* Passengers */}
        {passengers.length > 0 && <PassengerList passengers={passengers} passengerStates={passengerStates} />}
      </div>
    </div>
  );
}
