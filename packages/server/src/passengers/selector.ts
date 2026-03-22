/**
 * Passenger Selector
 * Randomly selects a subset of passengers from the full pool
 */

import { Passenger } from '../types';

/**
 * Randomly select N passengers from a pool while maintaining distribution
 * Uses Fisher-Yates shuffle algorithm for uniform randomization
 */
export function selectRandomPassengers(
  passengerPool: Passenger[],
  count: number
): Passenger[] {
  if (count >= passengerPool.length) {
    return passengerPool;
  }

  if (count <= 0) {
    return [];
  }

  // Create a copy to avoid mutating the original pool
  const pool = [...passengerPool];
  const selected: Passenger[] = [];

  // Fisher-Yates shuffle to select random passengers
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * (pool.length - i)) + i;
    // Swap
    [pool[i], pool[randomIndex]] = [pool[randomIndex], pool[i]];
    selected.push(pool[i]);
  }

  return selected;
}

/**
 * Select passengers while maintaining class distribution
 * Useful for ensuring realistic cabin composition
 */
export function selectPassengersByDistribution(
  passengerPool: Passenger[],
  count: number,
  distribution?: {
    economy?: number; // percentage
    business?: number;
    first?: number;
  }
): Passenger[] {
  if (count >= passengerPool.length) {
    return passengerPool;
  }

  const dist = {
    economy: distribution?.economy ?? 70,
    business: distribution?.business ?? 20,
    first: distribution?.first ?? 10,
  };

  // Group passengers by class
  const byClass = {
    economy: passengerPool.filter(p => p.ticketClass === 'economy'),
    business: passengerPool.filter(p => p.ticketClass === 'business'),
    first: passengerPool.filter(p => p.ticketClass === 'first'),
  };

  const selected: Passenger[] = [];

  // Calculate how many from each class
  const economyCount = Math.floor((count * dist.economy) / 100);
  const businessCount = Math.floor((count * dist.business) / 100);
  const firstCount = count - economyCount - businessCount; // Remainder goes to first class

  // Select from each class
  selected.push(...selectRandomPassengers(byClass.economy, economyCount));
  selected.push(...selectRandomPassengers(byClass.business, businessCount));
  selected.push(...selectRandomPassengers(byClass.first, firstCount));

  return selected;
}
