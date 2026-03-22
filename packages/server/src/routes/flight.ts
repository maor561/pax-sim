import { Express } from 'express';

export function initializeFlightRoutes(app: Express) {
  app.get('/api/flight/plan', (req, res) => {
    // TODO: Fetch flight plan from SimBrief
    res.json({});
  });

  app.get('/api/flight/status', (req, res) => {
    // TODO: Fetch current flight status from SimConnect
    res.json({
      altitude: 0,
      speed: 0,
      gForce: 1.0,
      turbulence: 0,
      phase: 'ground',
      timestamp: Date.now(),
    });
  });

  app.post('/api/flight/start', (req, res) => {
    // TODO: Start flight simulation
    res.json({ status: 'started' });
  });
}
