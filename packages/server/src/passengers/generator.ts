import { Passenger, PersonalityType } from '../types';

const FIRST_NAMES = [
  'James', 'Mary', 'Robert', 'Patricia', 'Michael', 'Jennifer', 'William', 'Linda',
  'David', 'Barbara', 'Richard', 'Elizabeth', 'Joseph', 'Susan', 'Thomas', 'Jessica',
  'Charles', 'Sarah', 'Christopher', 'Karen', 'Daniel', 'Nancy', 'Matthew', 'Lisa',
  'Anthony', 'Betty', 'Mark', 'Margaret', 'Donald', 'Sandra', 'Steven', 'Ashley',
  'Paul', 'Kimberly', 'Andrew', 'Emily', 'Joshua', 'Donna', 'Kenneth', 'Michelle',
  'Kevin', 'Dorothy', 'Brian', 'Carol', 'George', 'Amanda', 'Edward', 'Melissa',
  'Ronald', 'Deborah', 'Timothy', 'Stephanie', 'Jason', 'Rebecca', 'Jeffrey', 'Sharon',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Peterson', 'Phillips', 'Campbell',
];

const NATIONALITIES = [
  'USA', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Spain', 'Italy',
  'Japan', 'China', 'Brazil', 'Mexico', 'India', 'Netherlands', 'Sweden', 'Norway',
  'Denmark', 'Belgium', 'Austria', 'Switzerland', 'Portugal', 'Greece', 'Poland',
  'Russia', 'Thailand', 'Singapore', 'Malaysia', 'Philippines', 'Vietnam', 'Korea',
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomName(): string {
  return `${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`;
}

function generateRandomAge(): number {
  // Weighted towards 20-70
  const min = 18;
  const max = 80;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getPersonalityType(): PersonalityType {
  const rand = Math.random();
  // Distribution: calm 20%, anxious 30%, fearful 15%, business 20%, casual 15%
  if (rand < 0.20) return PersonalityType.CALM;
  if (rand < 0.50) return PersonalityType.ANXIOUS;
  if (rand < 0.65) return PersonalityType.FEARFUL;
  if (rand < 0.85) return PersonalityType.BUSINESS;
  return PersonalityType.CASUAL;
}

function getTicketClass(): 'economy' | 'business' | 'first' {
  const rand = Math.random();
  if (rand < 0.80) return 'economy';
  if (rand < 0.95) return 'business';
  return 'first';
}

function generateSeatNumber(): string {
  const row = Math.floor(Math.random() * 60) + 1; // Rows 1-60
  const seat = String.fromCharCode(65 + Math.floor(Math.random() * 6)); // A-F
  return `${row}${seat}`;
}

export function generatePassengers(count: number): Passenger[] {
  const passengers: Passenger[] = [];

  for (let i = 0; i < count; i++) {
    const isFrequentFlyer = Math.random() < 0.25; // 25% are frequent flyers
    const frequentFlyerDays = isFrequentFlyer ? Math.floor(Math.random() * 500) + 50 : 0;

    passengers.push({
      id: `P${String(i + 1).padStart(5, '0')}`,
      name: generateRandomName(),
      age: generateRandomAge(),
      nationality: getRandomElement(NATIONALITIES),
      ticketClass: getTicketClass(),
      seatNumber: generateSeatNumber(),
      personality: getPersonalityType(),
      isFrequentFlyer,
      frequentFlyerDays,
      flightExperience: frequentFlyerDays > 0 ? Math.min(100, frequentFlyerDays / 5) : Math.random() * 40,
    });
  }

  return passengers;
}

export function generateFrequentFlyerPassenger(): Passenger {
  const flightDays = Math.floor(Math.random() * 800) + 200;

  return {
    id: `PFF${Math.random().toString(36).substr(2, 9)}`,
    name: generateRandomName(),
    age: Math.floor(Math.random() * 40) + 30, // Frequent flyers tend to be older
    nationality: getRandomElement(NATIONALITIES),
    ticketClass: Math.random() < 0.5 ? 'business' : 'economy',
    seatNumber: generateSeatNumber(),
    personality: Math.random() < 0.7 ? PersonalityType.BUSINESS : PersonalityType.CALM,
    isFrequentFlyer: true,
    frequentFlyerDays: flightDays,
    flightExperience: Math.min(100, flightDays / 5),
  };
}
