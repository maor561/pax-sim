export enum FlightPhase {
  GROUND = 'ground',
  TAKEOFF = 'takeoff',
  CLIMB = 'climb',
  CRUISE = 'cruise',
  DESCENT = 'descent',
  LANDING = 'landing',
}

export enum PersonalityType {
  CALM = 'calm',
  ANXIOUS = 'anxious',
  FEARFUL = 'fearful',
  BUSINESS = 'business',
  CASUAL = 'casual',
}

export enum PassengerState {
  RELAXED = 'relaxed',
  COMFORTABLE = 'comfortable',
  ANXIOUS = 'anxious',
  SCARED = 'scared',
  PANICKED = 'panicked',
}

export interface Passenger {
  id: string;
  name: string;
  age: number;
  nationality: string;
  ticketClass: 'economy' | 'business' | 'first';
  seatNumber: string;
  personality: PersonalityType;
  isFrequentFlyer: boolean;
  frequentFlyerDays: number;
  flightExperience: number; // 0-100
}

export interface PassengerResponse {
  id: string;
  state: PassengerState;
  comfort: number; // 0-100
  reaction: string; // Descriptive reaction
  isReacting: boolean;
}

export interface FlightData {
  timestamp: number;
  altitude: number;
  speed: number;
  gForce: number;
  turbulence: number;
  phase: FlightPhase;
  averageComfort?: number;
}

export interface FlightUpdate {
  type: 'flight_update';
  data: FlightData;
}

export interface PassengerBatchUpdate {
  type: 'passenger_batch_update';
  data: {
    count: number;
    updates: PassengerResponse[];
    timestamp: number;
  };
}

export type WebSocketMessage = FlightUpdate | PassengerBatchUpdate;
