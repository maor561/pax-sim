import React, { useMemo } from 'react';

interface CockpitMetricsProps {
  data: {
    altitude: number;
    speed: number;
    gForce: number;
    turbulence: number;
    phase: string;
    averageComfort?: number;
  };
}

export function CockpitMetrics({ data }: CockpitMetricsProps) {
  const getPhaseColor = (phase: string): string => {
    const colors: Record<string, string> = {
      ground: '#ffb300',
      takeoff: '#ff4444',
      climb: '#00d4ff',
      cruise: '#00ff41',
      descent: '#ff00ff',
      landing: '#ff4444',
    };
    return colors[phase] || '#7a8a9e';
  };

  const getTurbulenceLevel = (value: number): string => {
    if (value < 0.15) return 'SMOOTH';
    if (value < 0.35) return 'LIGHT';
    if (value < 0.6) return 'MODERATE';
    if (value < 0.8) return 'SEVERE';
    return 'EXTREME';
  };

  const getTurbulenceColor = (value: number): string => {
    if (value < 0.15) return '#00ff41';
    if (value < 0.35) return '#ffb300';
    if (value < 0.6) return '#ffc300';
    if (value < 0.8) return '#ff8800';
    return '#ff4444';
  };

  const getGForceColor = (value: number): string => {
    if (value < 1.1) return '#00ff41';
    if (value < 1.3) return '#ffb300';
    if (value < 1.5) return '#ffc300';
    if (value < 1.7) return '#ff8800';
    return '#ff4444';
  };

  const getComfortColor = (value?: number): string => {
    if (!value) return '#7a8a9e';
    if (value >= 80) return '#00ff41';
    if (value >= 60) return '#ffb300';
    if (value >= 40) return '#ffc300';
    if (value >= 20) return '#ff8800';
    return '#ff4444';
  };

  return (
    <div style={styles.container}>
      {/* Top Row - Primary Flight Instruments */}
      <div style={styles.topRow}>
        {/* Altitude */}
        <div style={styles.primaryBox}>
          <div style={styles.boxLabel}>ALTITUDE</div>
          <div style={styles.largeValue}>{Math.round(data.altitude / 100).toString().padStart(4, '0')}</div>
          <div style={styles.boxUnit}>FT</div>
        </div>

        {/* Airspeed */}
        <div style={styles.primaryBox}>
          <div style={styles.boxLabel}>AIRSPEED</div>
          <div style={styles.largeValue}>{Math.round(data.speed).toString().padStart(3, '0')}</div>
          <div style={styles.boxUnit}>KT</div>
        </div>

        {/* Flight Phase */}
        <div
          style={{
            ...styles.phaseBox,
            color: getPhaseColor(data.phase),
            borderColor: getPhaseColor(data.phase),
            backgroundColor: `${getPhaseColor(data.phase)}15`,
          }}
        >
          <div style={styles.boxLabel}>PHASE</div>
          <div style={styles.largeValue}>{data.phase.toUpperCase()}</div>
        </div>
      </div>

      {/* Middle Row - Status Gauges */}
      <div style={styles.middleRow}>
        {/* G-Force Gauge */}
        <div style={styles.gauge}>
          <div style={styles.gaugeLabel}>G-FORCE</div>
          <div style={{ ...styles.gaugeValue, color: getGForceColor(data.gForce) }}>
            {data.gForce.toFixed(2)}
          </div>
          <div style={styles.gaugeUnit}>G</div>
          <div style={styles.gaugeBar}>
            <div
              style={{
                ...styles.gaugeFill,
                width: `${Math.min((data.gForce / 2) * 100, 100)}%`,
                backgroundColor: getGForceColor(data.gForce),
              }}
            />
          </div>
        </div>

        {/* Turbulence Gauge */}
        <div style={styles.gauge}>
          <div style={styles.gaugeLabel}>TURBULENCE</div>
          <div style={{ ...styles.gaugeValue, color: getTurbulenceColor(data.turbulence) }}>
            {getTurbulenceLevel(data.turbulence)}
          </div>
          <div style={styles.gaugeUnit}>{(data.turbulence * 100).toFixed(0)}%</div>
          <div style={styles.gaugeBar}>
            <div
              style={{
                ...styles.gaugeFill,
                width: `${data.turbulence * 100}%`,
                backgroundColor: getTurbulenceColor(data.turbulence),
              }}
            />
          </div>
        </div>

        {/* Passenger Comfort Gauge */}
        <div style={styles.gauge}>
          <div style={styles.gaugeLabel}>CABIN COMFORT</div>
          <div style={{ ...styles.gaugeValue, color: getComfortColor(data.averageComfort) }}>
            {Math.round(data.averageComfort || 0)}
          </div>
          <div style={styles.gaugeUnit}>%</div>
          <div style={styles.gaugeBar}>
            <div
              style={{
                ...styles.gaugeFill,
                width: `${data.averageComfort || 0}%`,
                backgroundColor: getComfortColor(data.averageComfort),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    marginBottom: '1.5rem',
    padding: '1.25rem',
    background: 'rgba(26, 35, 50, 0.85)',
    border: '1px solid #1a3d4d',
    borderRadius: '4px',
    backdropFilter: 'blur(8px)',
    boxShadow:
      'inset 0 0 0 1px rgba(0, 212, 255, 0.1), 0 4px 16px rgba(0, 0, 0, 0.4)',
  } as React.CSSProperties,

  topRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  } as React.CSSProperties,

  middleRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  } as React.CSSProperties,

  primaryBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    background: 'rgba(10, 22, 40, 0.6)',
    border: '2px solid #00d4ff',
    borderRadius: '4px',
    gap: '0.5rem',
    minHeight: '120px',
  } as React.CSSProperties,

  phaseBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    background: 'rgba(10, 22, 40, 0.6)',
    border: '2px solid',
    borderRadius: '4px',
    gap: '0.5rem',
    minHeight: '120px',
    transition: 'all 0.3s ease',
  } as React.CSSProperties,

  boxLabel: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#7a8a9e',
    fontWeight: 600,
  } as React.CSSProperties,

  largeValue: {
    fontSize: '2rem',
    color: '#00d4ff',
    fontFamily: "'Source Code Pro', monospace",
    letterSpacing: '0.05em',
    fontWeight: 700,
  } as React.CSSProperties,

  boxUnit: {
    fontSize: '0.65rem',
    color: '#7a8a9e',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  } as React.CSSProperties,

  gauge: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem',
    background: 'rgba(10, 22, 40, 0.6)',
    border: '1px solid #1a3d4d',
    borderRadius: '4px',
    minHeight: '120px',
    justifyContent: 'center',
  } as React.CSSProperties,

  gaugeLabel: {
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#7a8a9e',
    fontWeight: 600,
  } as React.CSSProperties,

  gaugeValue: {
    fontSize: '1.75rem',
    fontFamily: "'Source Code Pro', monospace",
    letterSpacing: '0.05em',
    fontWeight: 600,
  } as React.CSSProperties,

  gaugeUnit: {
    fontSize: '0.65rem',
    color: '#7a8a9e',
    textTransform: 'uppercase',
    marginTop: '0.25rem',
  } as React.CSSProperties,

  gaugeBar: {
    width: '100%',
    height: '8px',
    background: 'rgba(5, 13, 20, 0.8)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: '0.5rem',
  } as React.CSSProperties,

  gaugeFill: {
    height: '100%',
    transition: 'width 0.2s ease-out',
  } as React.CSSProperties,
};
