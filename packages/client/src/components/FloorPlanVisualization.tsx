import React, { useMemo } from 'react';

interface Passenger {
  id: string;
  name: string;
  seatNumber: string;
  ticketClass: string;
}

interface PassengerState {
  state: 'relaxed' | 'comfortable' | 'anxious' | 'scared' | 'panicked';
  comfort: number;
  reaction: string;
}

interface FloorPlanVisualizationProps {
  passengers: Passenger[];
  passengerStates: Map<string, PassengerState>;
}

export function FloorPlanVisualization({
  passengers,
  passengerStates,
}: FloorPlanVisualizationProps) {
  const getStateColor = (state?: string): string => {
    switch (state) {
      case 'relaxed':
        return '#00ff41'; // Green
      case 'comfortable':
        return '#00d4ff'; // Cyan
      case 'anxious':
        return '#ffb300'; // Amber
      case 'scared':
        return '#ff8800'; // Orange
      case 'panicked':
        return '#ff4444'; // Red
      default:
        return '#7a8a9e'; // Gray
    }
  };

  const maxRow = Math.max(...passengers.map((p) => {
    const match = p.seatNumber.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }), 0);

  const seatMap = useMemo(() => {
    const map = new Map<string, { passenger: Passenger; state?: PassengerState }>();

    passengers.forEach((p) => {
      const state = passengerStates.get(p.id);
      map.set(p.seatNumber, { passenger: p, state });
    });

    return map;
  }, [passengers, passengerStates]);

  const stats = useMemo(() => {
    const states = {
      relaxed: 0,
      comfortable: 0,
      anxious: 0,
      scared: 0,
      panicked: 0,
    };

    passengerStates.forEach((state) => {
      states[state.state]++;
    });

    return states;
  }, [passengerStates]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Cabin Overview</h2>

      <div style={styles.mainContainer}>
        {/* Cabin Visualization - Horizontal Layout */}
        <div style={styles.cabinArea}>
          <div style={styles.cabinLabel}>AIRCRAFT CABIN PLAN (NOSE LEFT, TAIL RIGHT)</div>

          <div style={styles.svgWrapper}>
            <svg
              width="100%"
              height="250"
              viewBox={`0 0 ${50 + maxRow * 32 + 50} 300`}
              style={styles.svg}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Fuselage outline - horizontal */}
              <rect
                x="20"
                y="40"
                width={40 + maxRow * 32}
                height="200"
                fill="rgba(10, 22, 40, 0.5)"
                stroke="#1a3d4d"
                strokeWidth="2"
              />

              {/* Cockpit (Nose - Left) */}
              <rect x="0" y="90" width="20" height="120" fill="#1a3d4d" stroke="#00d4ff" strokeWidth="2" />
              <text
                x="10"
                y="155"
                textAnchor="middle"
                fontSize="9"
                fill="#00d4ff"
                fontFamily="monospace"
                fontWeight="600"
              >
                NOSE
              </text>

              {/* Aircraft Rows - Horizontal Layout (Left to Right) */}
              {Array.from({ length: maxRow }).map((_, rowIdx) => (
                <g key={`row-${rowIdx}`}>
                  {/* Row label above */}
                  <text
                    x={50 + rowIdx * 32 + 12}
                    y="35"
                    textAnchor="middle"
                    fontSize="8"
                    fill="#7a8a9e"
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    {rowIdx + 1}
                  </text>

                  {/* Top section (A, B, C) */}
                  {['A', 'B', 'C'].map((col, colIdx) => {
                    const seatNum = `${rowIdx + 1}${col}`;
                    const data = seatMap.get(seatNum);
                    const isOccupied = !!data;
                    const color = data ? getStateColor(data.state?.state) : '#1a3d4d';
                    const x = 50 + rowIdx * 32;
                    const y = 50 + colIdx * 28;

                    return (
                      <g key={`${rowIdx}-${col}`}>
                        <rect
                          x={x}
                          y={y}
                          width="22"
                          height="22"
                          fill={isOccupied ? color : 'transparent'}
                          stroke={color}
                          strokeWidth="1"
                          rx="2"
                        />
                        <text
                          x={x + 11}
                          y={y + 15}
                          textAnchor="middle"
                          fontSize="6"
                          fill={isOccupied ? '#050d14' : color}
                          fontWeight="700"
                          fontFamily="monospace"
                        >
                          {data ? '◆' : col}
                        </text>
                      </g>
                    );
                  })}

                  {/* Aisle separator */}
                  <line
                    x1={50 + rowIdx * 32 + 11}
                    y1={112}
                    x2={50 + rowIdx * 32 + 11}
                    y2={136}
                    stroke="#1a3d4d"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />

                  {/* Bottom section (D, E, F) */}
                  {['D', 'E', 'F'].map((col, colIdx) => {
                    const seatNum = `${rowIdx + 1}${col}`;
                    const data = seatMap.get(seatNum);
                    const isOccupied = !!data;
                    const color = data ? getStateColor(data.state?.state) : '#1a3d4d';
                    const x = 50 + rowIdx * 32;
                    const y = 140 + colIdx * 28;

                    return (
                      <g key={`${rowIdx}-${col}`}>
                        <rect
                          x={x}
                          y={y}
                          width="22"
                          height="22"
                          fill={isOccupied ? color : 'transparent'}
                          stroke={color}
                          strokeWidth="1"
                          rx="2"
                        />
                        <text
                          x={x + 11}
                          y={y + 15}
                          textAnchor="middle"
                          fontSize="6"
                          fill={isOccupied ? '#050d14' : color}
                          fontWeight="700"
                          fontFamily="monospace"
                        >
                          {data ? '◆' : col}
                        </text>
                      </g>
                    );
                  })}
                </g>
              ))}

              {/* Tail/Galley (Right) */}
              <rect
                x={35 + maxRow * 32}
                y="90"
                width="20"
                height="120"
                fill="#1a3d4d"
                stroke="#00d4ff"
                strokeWidth="2"
              />
              <text
                x={45 + maxRow * 32}
                y="155"
                textAnchor="middle"
                fontSize="9"
                fill="#00d4ff"
                fontFamily="monospace"
                fontWeight="600"
              >
                TAIL
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendDot, backgroundColor: '#00ff41' }} />
              <span>Relaxed</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendDot, backgroundColor: '#00d4ff' }} />
              <span>Comfortable</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendDot, backgroundColor: '#ffb300' }} />
              <span>Anxious</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendDot, backgroundColor: '#ff8800' }} />
              <span>Scared</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendDot, backgroundColor: '#ff4444' }} />
              <span>Panicked</span>
            </div>
          </div>
        </div>

        {/* Statistics Panel */}
        <div style={styles.statsPanel}>
          <div style={styles.statsTitle}>Passenger Status</div>

          <div style={styles.statItem}>
            <div style={{ ...styles.statDot, backgroundColor: '#00ff41' }} />
            <div style={styles.statLabel}>Relaxed</div>
            <div style={styles.statValue}>{stats.relaxed}</div>
          </div>

          <div style={styles.statItem}>
            <div style={{ ...styles.statDot, backgroundColor: '#00d4ff' }} />
            <div style={styles.statLabel}>Comfortable</div>
            <div style={styles.statValue}>{stats.comfortable}</div>
          </div>

          <div style={styles.statItem}>
            <div style={{ ...styles.statDot, backgroundColor: '#ffb300' }} />
            <div style={styles.statLabel}>Anxious</div>
            <div style={styles.statValue}>{stats.anxious}</div>
          </div>

          <div style={styles.statItem}>
            <div style={{ ...styles.statDot, backgroundColor: '#ff8800' }} />
            <div style={styles.statLabel}>Scared</div>
            <div style={styles.statValue}>{stats.scared}</div>
          </div>

          <div style={styles.statItem}>
            <div style={{ ...styles.statDot, backgroundColor: '#ff4444' }} />
            <div style={styles.statLabel}>Panicked</div>
            <div style={styles.statValue}>{stats.panicked}</div>
          </div>

          <div style={styles.separator} />

          <div style={styles.statItem}>
            <div style={styles.statLabel}>Total Passengers</div>
            <div style={styles.statValue}>{passengers.length}</div>
          </div>

          <div style={styles.statItem}>
            <div style={styles.statLabel}>Boarded</div>
            <div style={styles.statValue}>{seatMap.size}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: 'rgba(26, 35, 50, 0.85)',
    border: '1px solid #1a3d4d',
    borderRadius: '4px',
    padding: '1.25rem',
    marginBottom: '1.5rem',
    backdropFilter: 'blur(8px)',
    boxShadow:
      'inset 0 0 0 1px rgba(0, 212, 255, 0.1), 0 4px 16px rgba(0, 0, 0, 0.4)',
  } as React.CSSProperties,

  title: {
    fontSize: '1.1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#00d4ff',
    marginBottom: '1rem',
    margin: '0 0 1rem 0',
  } as React.CSSProperties,

  mainContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 200px',
    gap: '1.5rem',
  } as React.CSSProperties,

  cabinArea: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  } as React.CSSProperties,

  cabinLabel: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#7a8a9e',
    fontWeight: 600,
  } as React.CSSProperties,

  svgWrapper: {
    background: 'rgba(10, 22, 40, 0.4)',
    borderRadius: '3px',
    border: '1px solid #1a3d4d',
    padding: '1rem',
    overflow: 'auto',
    maxHeight: '300px',
  } as React.CSSProperties,

  svg: {
    background: 'rgba(10, 22, 40, 0.4)',
  } as React.CSSProperties,

  legend: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '0.75rem',
    marginTop: '0.75rem',
    padding: '0.75rem',
    background: 'rgba(10, 22, 40, 0.4)',
    borderRadius: '3px',
    border: '1px solid #1a3d4d',
  } as React.CSSProperties,

  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.7rem',
    color: '#7a8a9e',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  } as React.CSSProperties,

  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  } as React.CSSProperties,

  statsPanel: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    padding: '1rem',
    background: 'rgba(10, 22, 40, 0.6)',
    border: '1px solid #1a3d4d',
    borderRadius: '3px',
  } as React.CSSProperties,

  statsTitle: {
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#00d4ff',
    fontWeight: 600,
    paddingBottom: '0.75rem',
    marginBottom: '0.75rem',
    borderBottom: '1px solid #1a3d4d',
  } as React.CSSProperties,

  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
  } as React.CSSProperties,

  statDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  } as React.CSSProperties,

  statLabel: {
    flex: 1,
    color: '#7a8a9e',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  } as React.CSSProperties,

  statValue: {
    fontFamily: "'Source Code Pro', monospace",
    color: '#e8f0f8',
    fontWeight: 600,
    minWidth: '30px',
    textAlign: 'right' as const,
  } as React.CSSProperties,

  separator: {
    height: '1px',
    background: '#1a3d4d',
    margin: '0.5rem 0',
  } as React.CSSProperties,
};
