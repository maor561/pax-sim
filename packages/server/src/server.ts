import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { initializePassengerRoutes } from './routes/passengers';
import { initializeFlightRoutes } from './routes/flight';

export async function startServer(port: number) {
  const app = express();
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer });

  // Middleware
  app.use(express.json());

  // Routes
  initializePassengerRoutes(app);
  initializeFlightRoutes(app);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // WebSocket connection
  wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('close', () => {
      console.log('Client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return new Promise((resolve, reject) => {
    httpServer.listen(port, () => {
      resolve(undefined);
    });

    httpServer.on('error', reject);
  });
}
