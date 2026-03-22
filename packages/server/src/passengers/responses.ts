import { Passenger, PassengerResponse, PassengerState, FlightData, FlightPhase } from '../types';
import { getPersonality } from './personalities';

// Reaction templates for different states
const REACTIONS = {
  relaxed: [
    'Relaxing with eyes closed',
    'Reading comfortably',
    'Watching the clouds',
    'Enjoying the flight',
    'Peacefully resting',
    'Napping gently',
  ],
  comfortable: [
    'Settling into seat',
    'Chatting with seatmate',
    'Watching the in-flight entertainment',
    'Working on laptop',
    'Eating snack',
    'Browsing phone',
  ],
  anxious: [
    'Gripping armrests',
    'Checking phone nervously',
    'Looking around anxiously',
    'Adjusting seatbelt repeatedly',
    'Taking deep breaths',
    'Fidgeting in seat',
  ],
  scared: [
    'Holding armrests tightly',
    'Eyes widened',
    'Sitting rigidly',
    'Praying quietly',
    'Knuckles white from gripping',
    'Looking very tense',
  ],
  panicked: [
    'Calling for flight attendant',
    'Hyperventilating',
    'In visible distress',
    'Cannot sit still',
    'Absolutely terrified',
    'On verge of emergency call',
  ],
};

function calculateStressScore(
  flightData: FlightData,
  passenger: Passenger,
  previousState: PassengerState
): number {
  const personality = getPersonality(passenger.personality);
  let stress = 0;

  // Phase-based anxiety
  if (flightData.phase === FlightPhase.TAKEOFF) {
    stress += personality.takeoff_anxiety * 30;
  } else if (flightData.phase === FlightPhase.LANDING) {
    stress += personality.landing_anxiety * 30;
  }

  // G-force stress
  const g_excess = Math.max(0, flightData.gForce - 1.0);
  stress += g_excess * personality.g_sensitivity * 20;

  // Turbulence stress
  stress += flightData.turbulence * personality.turbulence_sensitivity * 25;

  // Altitude fear (higher altitude = more fear for some)
  const altitude_ratio = flightData.altitude / 43000; // Max commercial altitude
  stress += altitude_ratio * personality.altitude_fear * 15;

  // Flight experience helps mitigate stress
  const experience_factor = 1 - passenger.flightExperience / 100 * 0.4; // Up to 40% reduction
  stress *= experience_factor;

  // Clamp between 0-100
  return Math.max(0, Math.min(100, stress));
}

function mapStressToState(stress: number): PassengerState {
  if (stress < 15) return PassengerState.RELAXED;
  if (stress < 30) return PassengerState.COMFORTABLE;
  if (stress < 55) return PassengerState.ANXIOUS;
  if (stress < 80) return PassengerState.SCARED;
  return PassengerState.PANICKED;
}

function interpolateState(
  currentState: PassengerState,
  targetState: PassengerState,
  reactionSpeed: number
): PassengerState {
  // Simple state progression
  const states = [PassengerState.RELAXED, PassengerState.COMFORTABLE, PassengerState.ANXIOUS, PassengerState.SCARED, PassengerState.PANICKED];

  const currentIndex = states.indexOf(currentState);
  const targetIndex = states.indexOf(targetState);

  if (currentIndex === targetIndex) return currentState;

  // Interpolate based on reaction speed
  if (currentIndex < targetIndex) {
    // Moving towards worse state (faster to panic)
    const nextIndex = Math.min(currentIndex + 1, targetIndex);
    return states[nextIndex];
  } else {
    // Moving towards better state (slower to calm down)
    const nextIndex = Math.max(currentIndex - 1, targetIndex);
    return states[nextIndex];
  }
}

function getRandomReaction(state: PassengerState): string {
  const reactions = REACTIONS[state];
  return reactions[Math.floor(Math.random() * reactions.length)];
}

function stateToComfort(state: PassengerState): number {
  const comfortMap = {
    [PassengerState.RELAXED]: 95,
    [PassengerState.COMFORTABLE]: 80,
    [PassengerState.ANXIOUS]: 50,
    [PassengerState.SCARED]: 20,
    [PassengerState.PANICKED]: 5,
  };

  return comfortMap[state];
}

export class PassengerResponseEngine {
  private passengerStates: Map<string, PassengerState> = new Map();
  private lastUpdateTime: number = Date.now();

  constructor() {
    this.lastUpdateTime = Date.now();
  }

  updatePassengers(
    passengers: Passenger[],
    flightData: FlightData
  ): PassengerResponse[] {
    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // In seconds
    this.lastUpdateTime = currentTime;

    return passengers.map((passenger) => {
      const personality = getPersonality(passenger.personality);

      // Get current state or initialize
      let currentState = this.passengerStates.get(passenger.id) || PassengerState.COMFORTABLE;

      // Calculate stress
      const stress = calculateStressScore(flightData, passenger, currentState);

      // Map stress to target state
      const targetState = mapStressToState(stress);

      // Interpolate smoothly based on personality reaction speed
      const interpolationFactor = personality.reaction_speed * (deltaTime / 0.5); // Normalize to 0.5s updates
      const nextState = interpolateState(currentState, targetState, personality.reaction_speed);

      // Store new state
      this.passengerStates.set(passenger.id, nextState);

      // Generate reaction
      const reaction = getRandomReaction(nextState);
      const comfort = stateToComfort(nextState);

      return {
        id: passenger.id,
        state: nextState,
        comfort,
        reaction,
        isReacting: nextState !== PassengerState.COMFORTABLE && nextState !== PassengerState.RELAXED,
      };
    });
  }

  resetPassengers(passengers: Passenger[]): void {
    this.passengerStates.clear();
    passengers.forEach((p) => {
      this.passengerStates.set(p.id, PassengerState.COMFORTABLE);
    });
    this.lastUpdateTime = Date.now();
  }
}
