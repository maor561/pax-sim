import { Express } from 'express';
import { Passenger } from '../types';

export function initializePassengerRoutes(app: Express, getPassengers: () => Passenger[]) {
  app.get('/api/passengers', (req, res) => {
    const passengers = getPassengers();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;

    const paginatedPassengers = passengers.slice(startIdx, endIdx);

    res.json({
      total: passengers.length,
      page,
      limit,
      data: paginatedPassengers,
    });
  });

  app.get('/api/passengers/:id', (req, res) => {
    const passengers = getPassengers();
    const passenger = passengers.find((p) => p.id === req.params.id);

    if (!passenger) {
      return res.status(404).json({ error: 'Passenger not found' });
    }

    res.json(passenger);
  });

  app.get('/api/passengers/stats/distribution', (req, res) => {
    const passengers = getPassengers();

    const stats = {
      total: passengers.length,
      byClass: {
        economy: passengers.filter((p) => p.ticketClass === 'economy').length,
        business: passengers.filter((p) => p.ticketClass === 'business').length,
        first: passengers.filter((p) => p.ticketClass === 'first').length,
      },
      frequentFlyers: passengers.filter((p) => p.isFrequentFlyer).length,
      averageAge: Math.round(passengers.reduce((sum, p) => sum + p.age, 0) / passengers.length),
    };

    res.json(stats);
  });
}
