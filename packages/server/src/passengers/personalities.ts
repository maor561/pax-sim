import { PersonalityType } from '../types';

export interface PersonalityProfile {
  name: string;
  g_sensitivity: number;
  turbulence_sensitivity: number;
  altitude_fear: number;
  takeoff_anxiety: number;
  landing_anxiety: number;
  reaction_speed: number; // How fast they react (0.1 = slow, 1.0 = fast)
  recovery_speed: number; // How fast they calm down
}

export const PERSONALITIES: Record<PersonalityType, PersonalityProfile> = {
  calm: {
    name: 'Calm',
    g_sensitivity: 0.1,
    turbulence_sensitivity: 0.15,
    altitude_fear: 0.05,
    takeoff_anxiety: 0.1,
    landing_anxiety: 0.15,
    reaction_speed: 0.3,
    recovery_speed: 0.8,
  },
  anxious: {
    name: 'Anxious',
    g_sensitivity: 0.6,
    turbulence_sensitivity: 0.8,
    altitude_fear: 0.4,
    takeoff_anxiety: 0.6,
    landing_anxiety: 0.7,
    reaction_speed: 0.7,
    recovery_speed: 0.4,
  },
  fearful: {
    name: 'Fearful',
    g_sensitivity: 0.9,
    turbulence_sensitivity: 1.0,
    altitude_fear: 0.8,
    takeoff_anxiety: 0.9,
    landing_anxiety: 0.95,
    reaction_speed: 1.0,
    recovery_speed: 0.2,
  },
  business: {
    name: 'Business',
    g_sensitivity: 0.2,
    turbulence_sensitivity: 0.25,
    altitude_fear: 0.1,
    takeoff_anxiety: 0.15,
    landing_anxiety: 0.2,
    reaction_speed: 0.4,
    recovery_speed: 0.9,
  },
  casual: {
    name: 'Casual',
    g_sensitivity: 0.4,
    turbulence_sensitivity: 0.45,
    altitude_fear: 0.25,
    takeoff_anxiety: 0.35,
    landing_anxiety: 0.4,
    reaction_speed: 0.55,
    recovery_speed: 0.6,
  },
};

export function getPersonality(type: PersonalityType): PersonalityProfile {
  return PERSONALITIES[type];
}
