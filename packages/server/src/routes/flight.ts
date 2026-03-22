import { Express } from 'express';
import { FlightData } from '../types';

export function initializeFlightRoutes(
  app: Express,
  getFlightData: () => Promise<FlightData | null>
) {
  app.get('/api/flight/plan', (req, res) => {
    // TODO: Fetch flight plan from SimBrief
    res.json({
      origin: 'JFK',
      destination: 'LHR',
      cruiseAltitude: 35000,
      estimatedDuration: 430,
    });
  });

  app.get('/api/flight/status', async (req, res) => {
    const flightData = await getFlightData();

    if (!flightData) {
      return res.json({
        altitude: 0,
        speed: 0,
        gForce: 1.0,
        turbulence: 0,
        phase: 'ground',
        timestamp: Date.now(),
      });
    }

    res.json(flightData);
  });
}
