import { Express } from 'express';

export function initializePassengerRoutes(app: Express) {
  app.get('/api/passengers', (req, res) => {
    // TODO: Fetch passengers from database
    res.json([]);
  });

  app.get('/api/passengers/:id', (req, res) => {
    // TODO: Fetch single passenger
    res.json({});
  });
}
