import { useEffect, useState } from 'react';
import { CockpitMetrics } from './components/CockpitMetrics';
import { PassengerList } from './components/PassengerList';
import { FlightChart } from './components/FlightChart';
import { CabinSeatMap } from './components/CabinSeatMap';
import { CockpitLayout } from './layouts/CockpitLayout';
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
    // Connect to WebSocket (always connect to port 3000, not dev server)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//localhost:3000`;
    console.log('Connecting to WebSocket:', wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnected(true);
      console.log('✓ Connected to server');
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

  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const handleStartFlight = async () => {
    console.log('Start Flight clicked, connected:', connected);
    setIsStarting(true);
    setStartError(null);

    try {
      console.log('Sending request to /api/flight/start/short_haul');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/flight/start/short_haul', {
        method: 'POST',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      console.log('Response:', data);

      if (data.success) {
        setFlightStarted(true);
        console.log(`✓ Started flight with ${data.passengerCount} passengers`);
      } else {
        const errorMsg = data.error || 'Unknown error';
        console.error('Flight start failed:', errorMsg);
        setStartError(errorMsg);
        setIsStarting(false);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to start flight';
      console.error('❌ Failed to start flight:', error);
      setStartError(errorMsg);
      setIsStarting(false);
    }
  };

  return (
    <CockpitLayout
      connected={connected}
      flightStarted={flightStarted}
      callsign="PAX-SIM"
      route="SIMULATOR"
      destination="FLIGHT"
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Control Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '1.5rem',
            marginBottom: '1.5rem',
            padding: '1.25rem',
            background: 'rgba(26, 35, 50, 0.85)',
            border: startError ? '1px solid #ff4444' : '1px solid #1a3d4d',
            borderRadius: '4px',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#00d4ff', margin: '0 0 0.75rem 0' }}>
              Flight Control
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#7a8a9e', margin: '0 0 0.5rem 0' }}>
              {isStarting
                ? 'Initializing flight...'
                : passengers.length > 0
                  ? `${passengers.length} passengers loaded`
                  : 'Awaiting flight initialization'}
            </p>
            {startError && (
              <p style={{ fontSize: '0.85rem', color: '#ff4444', margin: 0 }}>
                Error: {startError}
              </p>
            )}
          </div>

          {!flightStarted && (
            <button
              onClick={handleStartFlight}
              disabled={!connected || isStarting}
              style={{
                padding: '0.75rem 1.5rem',
                border:
                  isStarting || !connected ? '1px solid #7a8a9e' : '1px solid #00d4ff',
                borderRadius: '3px',
                background:
                  isStarting || !connected
                    ? 'rgba(122, 138, 158, 0.1)'
                    : 'rgba(0, 212, 255, 0.1)',
                color: isStarting || !connected ? '#7a8a9e' : '#00d4ff',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: connected && !isStarting ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                fontSize: '0.875rem',
              }}
            >
              {isStarting ? 'Starting...' : 'Start Flight'}
            </button>
          )}
        </div>

        {/* Flight Metrics */}
        {flightStatus && <CockpitMetrics data={flightStatus} />}

        {/* Stats Row */}
        {passengerStats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ padding: '1.25rem', background: 'rgba(26, 35, 50, 0.85)', border: '1px solid #1a3d4d', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7a8a9e' }}>
                Economy
              </div>
              <div style={{ fontSize: '1.75rem', color: '#00d4ff', fontWeight: 600 }}>
                {passengerStats.byClass.economy}
              </div>
            </div>
            <div style={{ padding: '1.25rem', background: 'rgba(26, 35, 50, 0.85)', border: '1px solid #1a3d4d', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7a8a9e' }}>
                Business
              </div>
              <div style={{ fontSize: '1.75rem', color: '#00d4ff', fontWeight: 600 }}>
                {passengerStats.byClass.business}
              </div>
            </div>
            <div style={{ padding: '1.25rem', background: 'rgba(26, 35, 50, 0.85)', border: '1px solid #1a3d4d', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7a8a9e' }}>
                First Class
              </div>
              <div style={{ fontSize: '1.75rem', color: '#00d4ff', fontWeight: 600 }}>
                {passengerStats.byClass.first}
              </div>
            </div>
            <div style={{ padding: '1.25rem', background: 'rgba(26, 35, 50, 0.85)', border: '1px solid #1a3d4d', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7a8a9e' }}>
                Frequent Flyers
              </div>
              <div style={{ fontSize: '1.75rem', color: '#00d4ff', fontWeight: 600 }}>
                {passengerStats.frequentFlyers}
              </div>
            </div>
          </div>
        )}

        {/* Cabin Seat Map */}
        {passengers.length > 0 && (
          <CabinSeatMap passengers={passengers} passengerStates={passengerStates} />
        )}

        {/* Flight Chart */}
        {flightStatus && flightStarted && <FlightChart data={flightStatus} />}

        {/* Passengers List */}
        {passengers.length > 0 && <PassengerList passengers={passengers} passengerStates={passengerStates} />}
      </div>
    </CockpitLayout>
  );
}
