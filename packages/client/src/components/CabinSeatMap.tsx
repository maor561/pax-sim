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

interface CabinSeatMapProps {
  passengers: Passenger[];
  passengerStates: Map<string, PassengerState>;
}

// Boeing 737-800 Layout: 184 Economy Seats
// Economy Class (rows 1-31): 184 seats (31 rows × 6 seats)
const CABIN_CONFIG = {
  firstClass: { startRow: 0, endRow: 0, rows: 0 }, // Not configured
  business: { startRow: 0, endRow: 0, rows: 0 },    // Not configured
  mainCabin: { startRow: 1, endRow: 31, rows: 31 }, // 184 seats
};

const SEAT_COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function CabinSeatMap({ passengers, passengerStates }: CabinSeatMapProps) {
  const getStateColor = (state?: string): string => {
    switch (state) {
      case 'relaxed':
        return '#00ff41';
      case 'comfortable':
        return '#00d4ff';
      case 'anxious':
        return '#ffb300';
      case 'scared':
        return '#ff8800';
      case 'panicked':
        return '#ff4444';
      default:
        return '#1a3d4d';
    }
  };

  const getCabinClass = (): string => {
    return 'Economy';
  };

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
      <h2 style={styles.title}>Boeing 737-800 Cabin (184 Economy Seats)</h2>

      <div style={styles.mainContainer}>
        <div style={styles.mapArea}>
          <div style={styles.mapLabel}>
            AIRCRAFT CABIN CONFIGURATION - NOSE LEFT, TAIL RIGHT
          </div>

          <div style={styles.seatGridHorizontal}>
            {/* Cockpit/Nose on left */}
            <div style={styles.noseTail}>
              <div style={styles.noseTailLabel}>NOSE</div>
            </div>

            {/* Seat columns (rows displayed horizontally) */}
            {Array.from({ length: CABIN_CONFIG.mainCabin.endRow }).map((_, rowIdx) => {
              const rowNum = rowIdx + 1;

              return (
                <div key={rowNum} style={styles.seatColumn}>
                  {/* Row number at top */}
                  <div style={styles.rowNumberTop}>{rowNum}</div>

                  {/* Seats A-F vertically */}
                  {SEAT_COLUMNS.map((col) => {
                    const seatNum = `${rowNum}${col}`;
                    const data = seatMap.get(seatNum);
                    const isOccupied = !!data;
                    const color = data ? getStateColor(data.state?.state) : '#1a3d4d';

                    return (
                      <div
                        key={col}
                        style={{
                          ...styles.seatSmall,
                          backgroundColor: isOccupied ? color : 'transparent',
                          borderColor: color,
                        }}
                        title={isOccupied ? `${data.passenger.name} (${data.state?.state})` : seatNum}
                      >
                        {isOccupied ? (
                          <span style={styles.seatSymbolSmall}>◆</span>
                        ) : (
                          <span style={styles.seatEmptySmall}>∘</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Tail on right */}
            <div style={styles.noseTail}>
              <div style={styles.noseTailLabel}>TAIL</div>
            </div>
          </div>

          {/* Legend */}
          <div style={styles.legend}>
            <div style={styles.legendSection}>
              <span style={styles.legendLabel}>CABIN CONFIGURATION:</span>
              <div style={styles.legendItem}>
                <div style={{ ...styles.legendBox, backgroundColor: '#4488ff' }} />
                <span>Economy (Rows 1-31, 184 seats)</span>
              </div>
            </div>

            <div style={styles.legendSection}>
              <span style={styles.legendLabel}>PASSENGER STATES:</span>
              <div style={styles.legendItem}>
                <div style={{ ...styles.legendBox, backgroundColor: '#00ff41' }} />
                <span>Relaxed</span>
              </div>
              <div style={styles.legendItem}>
                <div style={{ ...styles.legendBox, backgroundColor: '#00d4ff' }} />
                <span>Comfortable</span>
              </div>
              <div style={styles.legendItem}>
                <div style={{ ...styles.legendBox, backgroundColor: '#ffb300' }} />
                <span>Anxious</span>
              </div>
              <div style={styles.legendItem}>
                <div style={{ ...styles.legendBox, backgroundColor: '#ff8800' }} />
                <span>Scared</span>
              </div>
              <div style={styles.legendItem}>
                <div style={{ ...styles.legendBox, backgroundColor: '#ff4444' }} />
                <span>Panicked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div style={styles.statsPanel}>
          <div style={styles.statsTitle}>Status Summary</div>

          <div style={styles.statBox}>
            <div style={styles.statBoxLabel}>TOTAL PASSENGERS</div>
            <div style={styles.statBoxValue}>{passengers.length}/184</div>
          </div>

          <div style={styles.statBox}>
            <div style={styles.statBoxLabel}>BOARDED</div>
            <div style={styles.statBoxValue}>{seatMap.size}</div>
          </div>

          <div style={styles.separator} />

          <div style={styles.statsTitle}>Emotional States</div>

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
    margin: '0 0 1rem 0',
  } as React.CSSProperties,

  mainContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 220px',
    gap: '1.5rem',
  } as React.CSSProperties,

  mapArea: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  } as React.CSSProperties,

  mapLabel: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#7a8a9e',
    fontWeight: 600,
  } as React.CSSProperties,

  seatGrid: {
    background: 'rgba(10, 22, 40, 0.6)',
    border: '1px solid #1a3d4d',
    borderRadius: '3px',
    padding: '1rem',
    overflowX: 'auto',
    maxHeight: '600px',
    overflowY: 'auto',
  } as React.CSSProperties,

  seatGridHorizontal: {
    background: 'rgba(10, 22, 40, 0.6)',
    border: '1px solid #1a3d4d',
    borderRadius: '3px',
    padding: '1.5rem 1rem',
    overflowX: 'auto',
    overflowY: 'hidden',
    display: 'flex',
    gap: '0.2rem',
    alignItems: 'center',
    minHeight: '250px',
  } as React.CSSProperties,

  noseTail: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    padding: '0.75rem',
    background: 'rgba(0, 212, 255, 0.1)',
    border: '2px solid #00d4ff',
    borderRadius: '3px',
    minWidth: '60px',
    minHeight: '200px',
  } as React.CSSProperties,

  noseTailLabel: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    color: '#00d4ff',
    fontWeight: 700,
    letterSpacing: '0.1em',
    writingMode: 'vertical-rl' as any,
    textOrientation: 'mixed' as any,
  } as React.CSSProperties,

  seatColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.15rem',
    alignItems: 'center',
    flexShrink: 0,
  } as React.CSSProperties,

  rowNumberTop: {
    fontSize: '0.6rem',
    color: '#7a8a9e',
    fontWeight: 700,
    fontFamily: "'Source Code Pro', monospace",
    minHeight: '16px',
    textAlign: 'center' as const,
    width: '20px',
  } as React.CSSProperties,

  seatSmall: {
    width: '18px',
    height: '18px',
    border: '1px solid',
    borderRadius: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  seatSymbolSmall: {
    fontSize: '0.6rem',
    fontWeight: 700,
  } as React.CSSProperties,

  seatEmptySmall: {
    fontSize: '0.65rem',
    color: '#7a8a9e',
  } as React.CSSProperties,

  seatRow: {
    display: 'grid',
    gridTemplateColumns: '50px 1fr',
    gap: '0.5rem',
    marginBottom: '0.25rem',
    alignItems: 'center',
  } as React.CSSProperties,

  rowLabel: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    border: '1px solid',
    borderRadius: '2px',
    padding: '4px',
    fontSize: '0.65rem',
  } as React.CSSProperties,

  rowNumber: {
    fontWeight: 700,
    color: '#e8f0f8',
    fontFamily: "'Source Code Pro', monospace",
  } as React.CSSProperties,

  rowClass: {
    fontSize: '0.55rem',
    color: '#7a8a9e',
    textTransform: 'uppercase',
  } as React.CSSProperties,

  seatLetters: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '0.4rem',
  } as React.CSSProperties,

  seatLetter: {
    textAlign: 'center' as const,
    fontSize: '0.65rem',
    color: '#7a8a9e',
    fontWeight: 600,
    textTransform: 'uppercase',
  } as React.CSSProperties,

  seat: {
    width: '100%',
    aspectRatio: '1',
    border: '1.5px solid',
    borderRadius: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  seatSymbol: {
    fontSize: '0.7rem',
    fontWeight: 700,
  } as React.CSSProperties,

  seatEmpty: {
    fontSize: '0.8rem',
    color: '#7a8a9e',
  } as React.CSSProperties,

  legend: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    padding: '1rem',
    background: 'rgba(10, 22, 40, 0.4)',
    borderRadius: '3px',
    border: '1px solid #1a3d4d',
  } as React.CSSProperties,

  legendSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  } as React.CSSProperties,

  legendLabel: {
    fontSize: '0.65rem',
    color: '#00d4ff',
    fontWeight: 600,
    textTransform: 'uppercase',
    marginBottom: '0.25rem',
  } as React.CSSProperties,

  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.65rem',
    color: '#7a8a9e',
  } as React.CSSProperties,

  legendBox: {
    width: '12px',
    height: '12px',
    borderRadius: '2px',
  } as React.CSSProperties,

  statsPanel: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    padding: '1rem',
    background: 'rgba(10, 22, 40, 0.6)',
    border: '1px solid #1a3d4d',
    borderRadius: '3px',
    height: 'fit-content',
  } as React.CSSProperties,

  statsTitle: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#00d4ff',
    fontWeight: 600,
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #1a3d4d',
  } as React.CSSProperties,

  statBox: {
    padding: '0.75rem',
    background: 'rgba(0, 212, 255, 0.05)',
    border: '1px solid #1a3d4d',
    borderRadius: '2px',
    textAlign: 'center' as const,
  } as React.CSSProperties,

  statBoxLabel: {
    fontSize: '0.6rem',
    color: '#7a8a9e',
    textTransform: 'uppercase',
    marginBottom: '0.25rem',
  } as React.CSSProperties,

  statBoxValue: {
    fontSize: '1.5rem',
    color: '#00d4ff',
    fontFamily: "'Source Code Pro', monospace",
    fontWeight: 700,
  } as React.CSSProperties,

  separator: {
    height: '1px',
    background: '#1a3d4d',
    margin: '0.5rem 0',
  } as React.CSSProperties,

  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.7rem',
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
  } as React.CSSProperties,

  statValue: {
    fontFamily: "'Source Code Pro', monospace",
    color: '#e8f0f8',
    fontWeight: 600,
  } as React.CSSProperties,
};
