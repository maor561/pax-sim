import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { initializePassengerRoutes } from './routes/passengers';
import { initializeFlightRoutes } from './routes/flight';
import { createFlightBridge } from './simconnect/bridge';
import { createFlightSimulator } from './flight/simulator';
import { generatePassengers } from './passengers/generator';
import { PassengerResponseEngine } from './passengers/responses';
import { WebSocketMessage, FlightData, Passenger, PassengerResponse } from './types';

let activeClients: Set<WebSocket> = new Set();
let passengers: Passenger[] = [];
let responseEngine: PassengerResponseEngine = new PassengerResponseEngine();
let flightSimulator: any = null;
let passengerUpdateBatch: PassengerResponse[] = [];

async function broadcastFlightUpdate(flightData: FlightData) {
  const message: WebSocketMessage = {
    type: 'flight_update',
    data: {
      ...flightData,
      averageComfort: calculateAverageComfort(),
    },
  };

  broadcastToClients(JSON.stringify(message));
}

async function broadcastPassengerUpdates(passengerResponses: PassengerResponse[]) {
  const message: WebSocketMessage = {
    type: 'passenger_batch_update',
    data: {
      count: passengerResponses.length,
      updates: passengerResponses,
      timestamp: Date.now(),
    },
  };

  broadcastToClients(JSON.stringify(message));
}

function broadcastToClients(data: string) {
  activeClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

function calculateAverageComfort(): number {
  if (passengers.length === 0) return 100;

  const totalComfort = passengers.reduce((sum) => {
    const state = responseEngine['passengerStates'].get(passengers[0].id) || 'comfortable';
    // Simplified comfort calculation
    return sum + 75;
  }, 0);

  return Math.round(totalComfort / passengers.length);
}

async function startFlightSimulationLoop() {
  if (!flightSimulator || !flightSimulator.isActive()) {
    return;
  }

  // Batch updates - send every 500ms
  const batchInterval = setInterval(() => {
    if (passengerUpdateBatch.length > 0) {
      broadcastPassengerUpdates(passengerUpdateBatch);
      passengerUpdateBatch = [];
    }
  }, 500);

  const updateInterval = setInterval(async () => {
    try {
      const flightData = await flightSimulator.getFlightData();

      if (!flightData) {
        clearInterval(updateInterval);
        clearInterval(batchInterval);
        return;
      }

      // Broadcast flight update
      await broadcastFlightUpdate(flightData);

      // Calculate passenger responses and accumulate in batch
      const responses = responseEngine.updatePassengers(passengers, flightData);
      passengerUpdateBatch.push(...responses);
    } catch (error) {
      console.error('Error in flight simulation loop:', error);
      clearInterval(updateInterval);
      clearInterval(batchInterval);
    }
  }, 100); // Update at 10Hz (100ms)
}

export async function startServer(port: number) {
  const app = express();
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer });

  // Middleware
  app.use(express.json());

  // Initialize flight bridge and simulator
  try {
    const bridge = await createFlightBridge();
    flightSimulator = await createFlightSimulator(bridge);
    console.log('✓ Flight simulator initialized');
  } catch (error) {
    console.error('✗ Failed to initialize flight simulator:', error);
    console.log('Server will continue without flight simulator');
  }

  // Routes
  initializePassengerRoutes(app, () => passengers);
  initializeFlightRoutes(app, async () => {
    if (flightSimulator) {
      return flightSimulator.getLastFlightData();
    }
    return null;
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Start flight endpoint
  app.post('/api/flight/start/:profile?', async (req, res) => {
    const profile = req.params.profile || 'short_haul';

    if (!flightSimulator) {
      return res.status(503).json({ error: 'Flight simulator not initialized' });
    }

    // Generate 1000 passengers
    passengers = generatePassengers(1000);
    responseEngine.resetPassengers(passengers);

    const success = await flightSimulator.start(profile);

    if (success) {
      startFlightSimulationLoop();
      res.json({ success: true, passengerCount: passengers.length, profile });
    } else {
      res.status(500).json({ error: 'Failed to start flight' });
    }
  });

  // WebSocket connection
  wss.on('connection', (ws) => {
    activeClients.add(ws);
    console.log(`✓ Client connected (${activeClients.size} total)`);

    // Send initial passenger data
    if (passengers.length > 0) {
      ws.send(
        JSON.stringify({
          type: 'passenger_init',
          data: passengers,
        })
      );
    }

    ws.on('close', () => {
      activeClients.delete(ws);
      console.log(`✗ Client disconnected (${activeClients.size} remaining)`);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      activeClients.delete(ws);
    });
  });

  return new Promise((resolve, reject) => {
    httpServer.listen(port, () => {
      resolve(undefined);
    });

    httpServer.on('error', reject);
  });
}
