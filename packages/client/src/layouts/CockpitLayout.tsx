import React, { ReactNode, useMemo } from 'react';

interface CockpitLayoutProps {
  children: ReactNode;
  route?: string;
  destination?: string;
  callsign?: string;
  connected: boolean;
  flightStarted: boolean;
}

export function CockpitLayout({
  children,
  route = 'FLIGHT',
  destination = 'SIMULATOR',
  callsign = 'PAX-SIM',
  connected,
  flightStarted,
}: CockpitLayoutProps) {
  const currentTime = useMemo(() => {
    return new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, []);

  React.useEffect(() => {
    const timer = setInterval(() => {}, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="cockpit-layout">
      {/* Header */}
      <header className="cockpit-header">
        <div className="header-primary">
          <div className="callsign-display">
            <div className="label">CALLSIGN</div>
            <div className="value">{callsign}</div>
          </div>

          <div className="route-display">
            <div className="label">ROUTE</div>
            <div className="value">
              {route}
            </div>
          </div>

          <div className="destination-display">
            <div className="label">DESTINATION</div>
            <div className="value">{destination}</div>
          </div>
        </div>

        <div className="header-secondary">
          <div className={`status-box ${connected ? 'status-connected' : 'status-disconnected'}`}>
            <div className="label">SERVER</div>
            <div className="value">{connected ? 'ONLINE' : 'OFFLINE'}</div>
          </div>

          <div className={`status-box ${flightStarted ? 'status-active' : 'status-ready'}`}>
            <div className="label">FLIGHT</div>
            <div className="value">{flightStarted ? 'ACTIVE' : 'READY'}</div>
          </div>

          <div className="time-display">
            <div className="label">TIME (UTC)</div>
            <div className="value">{currentTime}</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="cockpit-main">
        {children}
      </main>

      {/* Footer */}
      <footer className="cockpit-footer">
        <div className="footer-left">
          <span className="footer-text">PAX SIMULATOR v1.0</span>
        </div>
        <div className="footer-center">
          <span className="footer-text">FLIGHT OPERATIONS CENTER</span>
        </div>
        <div className="footer-right">
          {connected && <span className="footer-status">System Online</span>}
          {!connected && <span className="footer-status disconnected">System Offline</span>}
        </div>
      </footer>

      <style>{`
        .cockpit-layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: linear-gradient(135deg, #050d14 0%, #0a1628 50%, #0d1f35 100%);
          color: #e8f0f8;
          font-family: 'Inter', sans-serif;
        }

        /* Header */
        .cockpit-header {
          background: rgba(5, 13, 20, 0.9);
          border-bottom: 2px solid #1a3d4d;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
        }

        .header-primary {
          display: flex;
          gap: 3rem;
          flex: 1;
        }

        .header-secondary {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .callsign-display,
        .route-display,
        .destination-display,
        .status-box,
        .time-display {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #7a8a9e;
          font-weight: 600;
        }

        .value {
          font-size: 0.95rem;
          color: #00d4ff;
          font-family: 'Source Code Pro', monospace;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .status-box {
          padding: 0.5rem 1rem;
          border-radius: 3px;
          background: rgba(26, 35, 50, 0.8);
          border: 1px solid #1a3d4d;
        }

        .status-connected {
          border-color: #00ff41;
          background: rgba(0, 255, 65, 0.05);
        }

        .status-connected .value {
          color: #00ff41;
        }

        .status-disconnected {
          border-color: #ff4444;
          background: rgba(255, 68, 68, 0.05);
        }

        .status-disconnected .value {
          color: #ff4444;
        }

        .status-active {
          border-color: #00d4ff;
          background: rgba(0, 212, 255, 0.05);
        }

        .status-active .value {
          color: #00d4ff;
        }

        .status-ready {
          border-color: #ffb300;
          background: rgba(255, 179, 0, 0.05);
        }

        .status-ready .value {
          color: #ffb300;
        }

        .time-display .value {
          font-family: 'Source Code Pro', monospace;
          font-size: 1rem;
        }

        /* Main Content */
        .cockpit-main {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
          overflow-x: hidden;
        }

        /* Footer */
        .cockpit-footer {
          background: rgba(5, 13, 20, 0.95);
          border-top: 1px solid #1a3d4d;
          padding: 0.75rem 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #7a8a9e;
        }

        .footer-text {
          color: #7a8a9e;
          font-weight: 500;
        }

        .footer-status {
          color: #00ff41;
          font-weight: 600;
        }

        .footer-status.disconnected {
          color: #ff4444;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .cockpit-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .header-primary {
            width: 100%;
            gap: 1.5rem;
          }

          .header-secondary {
            width: 100%;
            justify-content: space-between;
          }
        }

        @media (max-width: 768px) {
          .cockpit-header {
            padding: 0.75rem;
            gap: 1rem;
          }

          .header-primary {
            gap: 1rem;
          }

          .header-secondary {
            gap: 1rem;
          }

          .callsign-display,
          .route-display,
          .destination-display {
            flex-direction: column;
            gap: 0.2rem;
          }

          .value {
            font-size: 0.8rem;
          }

          .cockpit-main {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
