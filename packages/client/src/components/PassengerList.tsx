import React, { useState, useCallback, useMemo } from 'react';

interface Passenger {
  id: string;
  name: string;
  age: number;
  personality: string;
  ticketClass: string;
  seatNumber: string;
  isFrequentFlyer: boolean;
}

interface PassengerState {
  state: 'relaxed' | 'comfortable' | 'anxious' | 'scared' | 'panicked';
  comfort: number;
  reaction: string;
}

interface PassengerListProps {
  passengers: Passenger[];
  passengerStates?: Map<string, PassengerState>;
}

const ITEMS_PER_PAGE = 50;

export function PassengerList({ passengers, passengerStates = new Map() }: PassengerListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterClass, setFilterClass] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'seat' | 'comfort'>('seat');

  // Filter passengers
  const filteredPassengers = useMemo(() => {
    return passengers.filter((p) => {
      const matchesClass = filterClass === 'all' || p.ticketClass === filterClass;
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.seatNumber.includes(searchTerm);
      return matchesClass && matchesSearch;
    });
  }, [passengers, filterClass, searchTerm]);

  // Sort passengers
  const sortedPassengers = useMemo(() => {
    const sorted = [...filteredPassengers];
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'seat':
        sorted.sort((a, b) => {
          const aRow = parseInt(a.seatNumber);
          const bRow = parseInt(b.seatNumber);
          if (aRow !== bRow) return aRow - bRow;
          return a.seatNumber.localeCompare(b.seatNumber);
        });
        break;
      case 'comfort':
        sorted.sort((a, b) => {
          const aComfort = passengerStates.get(a.id)?.comfort ?? 50;
          const bComfort = passengerStates.get(b.id)?.comfort ?? 50;
          return bComfort - aComfort;
        });
        break;
    }
    return sorted;
  }, [filteredPassengers, sortBy, passengerStates]);

  // Paginate
  const totalPages = Math.ceil(sortedPassengers.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const currentPassengers = sortedPassengers.slice(startIdx, endIdx);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

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
        return '#7a8a9e';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Passengers</h2>

        {/* Controls */}
        <div style={styles.controls}>
          <input
            type="text"
            placeholder="Search by name or seat..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={styles.input}
          />

          <select
            value={filterClass}
            onChange={(e) => {
              setFilterClass(e.target.value);
              setCurrentPage(1);
            }}
            style={styles.input}
          >
            <option value="all">All Classes</option>
            <option value="economy">Economy</option>
            <option value="business">Business</option>
            <option value="first">First Class</option>
          </select>

          <div style={styles.info}>
            Showing {startIdx + 1}-{Math.min(endIdx, sortedPassengers.length)} of{' '}
            {sortedPassengers.length}
          </div>
        </div>
      </div>

      {/* Passengers Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th
                style={{ ...styles.headerCell, cursor: 'pointer' }}
                onClick={() => setSortBy('name')}
              >
                NAME {sortBy === 'name' && '↑'}
              </th>
              <th
                style={{ ...styles.headerCell, cursor: 'pointer' }}
                onClick={() => setSortBy('seat')}
              >
                SEAT {sortBy === 'seat' && '↑'}
              </th>
              <th style={styles.headerCell}>CLASS</th>
              <th style={styles.headerCell}>PERSONALITY</th>
              <th style={styles.headerCell}>STATE</th>
              <th
                style={{ ...styles.headerCell, cursor: 'pointer' }}
                onClick={() => setSortBy('comfort')}
              >
                COMFORT {sortBy === 'comfort' && '↓'}
              </th>
              <th style={styles.headerCell}>FF</th>
            </tr>
          </thead>
          <tbody>
            {currentPassengers.map((passenger) => {
              const state = passengerStates.get(passenger.id);
              const stateColor = getStateColor(state?.state);

              return (
                <tr key={passenger.id} style={styles.row}>
                  <td style={styles.cell}>{passenger.name}</td>
                  <td style={{ ...styles.cell, fontFamily: "'Source Code Pro', monospace" }}>
                    {passenger.seatNumber}
                  </td>
                  <td style={styles.cell}>
                    <span
                      style={{
                        ...styles.badge,
                        backgroundColor:
                          passenger.ticketClass === 'economy'
                            ? 'rgba(68, 136, 255, 0.2)'
                            : 'rgba(153, 102, 255, 0.2)',
                        color:
                          passenger.ticketClass === 'economy' ? '#4488ff' : '#9966ff',
                      }}
                    >
                      {passenger.ticketClass.charAt(0).toUpperCase() +
                        passenger.ticketClass.slice(1)}
                    </span>
                  </td>
                  <td style={styles.cell}>{passenger.personality}</td>
                  <td style={styles.cell}>
                    {state ? (
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor: `${stateColor}20`,
                          color: stateColor,
                        }}
                      >
                        {state.state}
                      </span>
                    ) : (
                      <span style={styles.neutral}>—</span>
                    )}
                  </td>
                  <td style={styles.cell}>
                    <div style={styles.comfortBar}>
                      <div
                        style={{
                          ...styles.comfortFill,
                          width: `${state?.comfort ?? 50}%`,
                          backgroundColor: stateColor,
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#7a8a9e' }}>
                      {state?.comfort ? Math.round(state.comfort) : '—'}%
                    </span>
                  </td>
                  <td style={{ ...styles.cell, textAlign: 'center' }}>
                    {passenger.isFrequentFlyer ? (
                      <span style={{ color: '#ffb300', fontWeight: 700 }}>★</span>
                    ) : (
                      <span style={{ color: '#7a8a9e' }}>○</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              ...styles.paginationButton,
              opacity: currentPage === 1 ? 0.5 : 1,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Previous
          </button>

          <div style={styles.pageNumbers}>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const pageNum = currentPage > 3 ? currentPage - 2 + i : i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  style={{
                    ...styles.pageButton,
                    backgroundColor:
                      pageNum === currentPage ? '#00d4ff' : 'rgba(26, 35, 50, 0.8)',
                    color: pageNum === currentPage ? '#050d14' : '#00d4ff',
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && <span style={styles.pageDots}>...</span>}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              ...styles.paginationButton,
              opacity: currentPage === totalPages ? 0.5 : 1,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            Next
          </button>
        </div>
      )}
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

  header: {
    marginBottom: '1.5rem',
  } as React.CSSProperties,

  title: {
    fontSize: '1.1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#00d4ff',
    margin: '0 0 1rem 0',
  } as React.CSSProperties,

  controls: {
    display: 'grid',
    gridTemplateColumns: '1fr 180px auto',
    gap: '1rem',
    alignItems: 'center',
  } as React.CSSProperties,

  input: {
    padding: '0.75rem',
    border: '1px solid #1a3d4d',
    borderRadius: '3px',
    background: 'rgba(10, 22, 40, 0.6)',
    color: '#e8f0f8',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
  } as React.CSSProperties,

  info: {
    fontSize: '0.75rem',
    color: '#7a8a9e',
    textAlign: 'right' as const,
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  } as React.CSSProperties,

  tableWrapper: {
    overflowX: 'auto',
    marginBottom: '1.5rem',
    background: 'rgba(10, 22, 40, 0.4)',
    borderRadius: '3px',
    border: '1px solid #1a3d4d',
  } as React.CSSProperties,

  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.85rem',
  } as React.CSSProperties,

  headerRow: {
    borderBottom: '2px solid #1a3d4d',
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
  } as React.CSSProperties,

  headerCell: {
    padding: '0.75rem',
    textAlign: 'left' as const,
    color: '#00d4ff',
    fontWeight: 600,
    textTransform: 'uppercase',
    fontSize: '0.7rem',
    letterSpacing: '0.08em',
    borderRight: '1px solid #1a3d4d',
  } as React.CSSProperties,

  row: {
    borderBottom: '1px solid #1a3d4d',
    transition: 'background-color 0.2s ease',
  } as React.CSSProperties,

  cell: {
    padding: '0.75rem',
    color: '#e8f0f8',
    borderRight: '1px solid #1a3d4d',
  } as React.CSSProperties,

  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    borderRadius: '3px',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'capitalize',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,

  neutral: {
    color: '#7a8a9e',
  } as React.CSSProperties,

  comfortBar: {
    width: '100%',
    height: '6px',
    background: 'rgba(5, 13, 20, 0.8)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '0.25rem',
  } as React.CSSProperties,

  comfortFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  } as React.CSSProperties,

  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.75rem',
  } as React.CSSProperties,

  paginationButton: {
    padding: '0.5rem 1rem',
    border: '1px solid #1a3d4d',
    borderRadius: '3px',
    background: 'rgba(26, 35, 50, 0.8)',
    color: '#00d4ff',
    fontWeight: 600,
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  pageNumbers: {
    display: 'flex',
    gap: '0.25rem',
  } as React.CSSProperties,

  pageButton: {
    padding: '0.4rem 0.6rem',
    border: '1px solid #1a3d4d',
    borderRadius: '2px',
    fontWeight: 600,
    fontSize: '0.75rem',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  } as React.CSSProperties,

  pageDots: {
    color: '#7a8a9e',
    padding: '0 0.25rem',
  } as React.CSSProperties,
};
