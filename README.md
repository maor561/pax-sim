# PAX SIM - Flight Passenger Experience Simulator

A web-based passenger experience simulator that integrates with **Microsoft Flight Simulator 2024** via SimConnect API and **SimBrief** flight plans. Watch as passengers react in real-time to flight behavior including G-forces, turbulence, altitude changes, and flight phases.

## Features

- 🛫 **Real-time Flight Data** - Syncs with MSFS2024 via SimConnect API
- ✈️ **SimBrief Integration** - Loads flight plans directly from SimBrief
- 👥 **Individual Passengers** - Each passenger has unique personality and characteristics
- 🎭 **Dynamic Reactions** - Passengers respond realistically to flight conditions (G-forces, turbulence, speed, altitude, phase)
- 📊 **Beautiful Visualizations** - Real-time flight metrics and passenger state indicators
- 🔄 **Repeat Customers** - Track frequent flyers and their flight history
- 📡 **WebSocket Sync** - Real-time updates with < 100ms latency

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **WebSocket** for real-time updates

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma** ORM with SQLite
- **WebSocket** server for real-time communication

### Integrations
- **SimConnect API** - Flight data from MSFS2024
- **SimBrief API** - Flight plans and briefing data

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Microsoft Flight Simulator 2024 (for actual flight data)

### Installation

```bash
# Install dependencies
npm install

# Create environment files
cp packages/server/.env.example packages/server/.env
cp packages/client/.env.example packages/client/.env

# Set up database
cd packages/server
npx prisma migrate dev --name init
cd ../..
```

### Development

```bash
# Start both server and client in development mode
npm run dev

# Or start individually:
# Server (runs on port 3000)
cd packages/server && npm run dev

# Client (runs on port 5173)
cd packages/client && npm run dev
```

### Building

```bash
npm run build
```

## Project Structure

```
pax-sim/
├── packages/
│   ├── server/          # Express backend + WebSocket
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── server.ts
│   │   │   ├── simconnect/    # SimConnect integration
│   │   │   ├── simbrief/      # SimBrief API client
│   │   │   ├── passengers/    # Passenger logic
│   │   │   ├── routes/        # Express routes
│   │   │   └── db/            # Database schemas
│   │   └── prisma/
│   │       └── schema.prisma
│   │
│   └── client/          # React frontend
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── components/
│       │   ├── hooks/
│       │   └── services/
│       └── index.html
│
├── .gitignore
├── package.json         # Root workspace
└── README.md
```

## API Documentation

### REST Endpoints

- `GET /api/passengers` - Get all passengers for current flight
- `GET /api/passengers/:id` - Get single passenger details
- `GET /api/flight/plan` - Get SimBrief flight plan
- `GET /api/flight/status` - Get current flight metrics
- `POST /api/flight/start` - Begin flight simulation
- `POST /api/flight/load-plan/:briefId` - Load a SimBrief briefing

### WebSocket Messages

**Flight Update** (Server → Client)
```json
{
  "type": "flight_update",
  "data": {
    "altitude": 10500,
    "speed": 450,
    "gForce": 1.2,
    "turbulence": 0.3,
    "phase": "climb",
    "timestamp": 1234567890
  }
}
```

**Passenger Update** (Server → Client)
```json
{
  "type": "passenger_update",
  "data": {
    "passengerIds": ["P1", "P2"],
    "states": [
      {
        "id": "P1",
        "state": "calm",
        "reaction": "Settling into seat",
        "comfort": 85
      }
    ]
  }
}
```

## Configuration

### Server Environment (.env)

```env
PORT=3000
NODE_ENV=development
SIMCONNECT_ENABLED=false
SIMBRIEFAPI_ENABLED=false
DATABASE_URL="file:./dev.db"
```

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `SIMCONNECT_ENABLED` - Enable SimConnect integration (requires MSFS2024)
- `SIMBRIEFAPI_ENABLED` - Enable SimBrief API
- `DATABASE_URL` - Database connection string

## Development Roadmap

### Phase 1: Foundation ✅
- Initialize monorepo with workspace
- Create server skeleton (Express + WebSocket)
- Create client skeleton (React + Vite)
- Set up database schema (Prisma)
- Basic project structure

### Phase 2: Flight Data Integration 🔄
- Implement SimConnect data polling
- Parse flight parameters
- Implement SimBrief flight plan fetching
- WebSocket real-time broadcast
- Basic flight metrics display

### Phase 3: Passenger System 📋
- Design passenger data model
- Implement passenger generator
- Implement response system with personality matrix
- State transitions and reactions

### Phase 4: Visual Experience 🎨
- Passenger card UI design
- Flight dashboard with metrics
- Smooth animations for state transitions
- Responsive design

### Phase 5: Polish & Deployment 🚀
- Error handling and reconnection logic
- Database persistence
- Testing (unit + E2E)
- Documentation
- Docker setup
- Cloud deployment

## Contributing

This project is currently in active development. Feel free to submit issues and pull requests.

## License

MIT

## Support

For questions or issues, please create a GitHub issue.

---

**Made with ✈️ for flight simulation enthusiasts**
