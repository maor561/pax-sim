import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { initializePassengerRoutes } from './routes/passengers';
import { initializeFlightRoutes } from './routes/flight';
import { createFlightBridge } from './simconnect/bridge';
import { createFlightSimulator } from './flight/simulator';
import { generatePassengers } from './passengers/generator';
import { selectRandomPassengers } from './passengers/selector';
import { PassengerResponseEngine } from './passengers/responses';
import { WebSocketMessage, FlightData, Passenger, PassengerResponse } from './types';
import { SimBriefClient } from './simbrief/client';

let activeClients: Set<WebSocket> = new Set();
let passengers: Passenger[] = [];
let passengerPool: Passenger[] = []; // Full pool of 1000 passengers for selection
let responseEngine: PassengerResponseEngine = new PassengerResponseEngine();
let flightSimulator: any = null;
let passengerUpdateBatch: PassengerResponse[] = [];
let simBriefClient: SimBriefClient = new SimBriefClient();

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

  // Initialize passenger pool (1000 passengers) on startup
  console.log('Generating passenger pool...');
  passengerPool = generatePassengers(1000);
  console.log(`✓ Generated ${passengerPool.length} passengers`);

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

  // SimBrief endpoints
  app.get('/api/simbrief/briefing/:briefId', async (req, res) => {
    const { briefId } = req.params;
    try {
      const briefing = await simBriefClient.getBriefing(briefId);
      if (!briefing) {
        return res.status(404).json({ error: 'Briefing not found' });
      }

      const passengerCount = await simBriefClient.getPassengerCount(briefId);
      res.json({
        success: true,
        briefing,
        passengerCount,
      });
    } catch (error) {
      console.error('Error fetching SimBrief:', error);
      res.status(500).json({ error: 'Failed to fetch briefing' });
    }
  });

  app.post('/api/simbrief/load/:briefId', async (req, res) => {
    const { briefId } = req.params;
    try {
      const passengerCount = await simBriefClient.getPassengerCount(briefId);
      if (!passengerCount) {
        return res
          .status(400)
          .json({ error: 'Could not determine passenger count from briefing' });
      }

      // Select random passengers from the pool
      passengers = selectRandomPassengers(passengerPool, passengerCount);
      responseEngine.resetPassengers(passengers);

      res.json({
        success: true,
        passengerCount: passengers.length,
        message: `Loaded ${passengers.length} passengers from SimBrief briefing ${briefId}`,
      });
    } catch (error) {
      console.error('Error loading SimBrief flight:', error);
      res.status(500).json({ error: 'Failed to load SimBrief flight' });
    }
  });

  // Start flight endpoint
  // POST /api/flight/start/:profile?passengerCount=N
  app.post('/api/flight/start/:profile?', async (req, res) => {
    const profile = req.params.profile || 'short_haul';
    const { passengerCount: requestedCount } = req.query;

    if (!flightSimulator) {
      return res.status(503).json({ error: 'Flight simulator not initialized' });
    }

    // Determine passenger count
    let count = 1000; // Default to full pool
    if (requestedCount) {
      const parsed = parseInt(requestedCount as string);
      if (!isNaN(parsed) && parsed > 0) {
        count = Math.min(parsed, passengerPool.length);
      }
    }

    // Select random passengers from the pool
    passengers = selectRandomPassengers(passengerPool, count);
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
