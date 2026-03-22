import axios from 'axios';
import { FlightData, FlightPhase } from '../types';

const BRIDGE_URL = process.env.BRIDGE_URL || 'http://localhost:5000';

export interface BridgeFlightData {
  timestamp: number;
  altitude: number;
  speed: number;
  gForce: number;
  turbulence: number;
  phase: string;
  finished: boolean;
}

export class FlightBridge {
  private readonly bridgeUrl: string;
  private isConnected = false;
  private currentMode: 'demo' | 'simconnect' = 'demo';

  constructor(url: string = BRIDGE_URL) {
    this.bridgeUrl = url;
  }

  async initialize(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.bridgeUrl}/health`, { timeout: 5000 });
      this.isConnected = response.data.status === 'ok';
      this.currentMode = response.data.mode || 'demo';
      console.log(`✓ Flight Bridge connected (mode: ${this.currentMode})`);
      return true;
    } catch (error) {
      console.error('✗ Failed to connect to Flight Bridge:', error);
      return false;
    }
  }

  async startFlight(profile: string = 'short_haul'): Promise<boolean> {
    try {
      const response = await axios.post(`${this.bridgeUrl}/flight/start/${profile}`);
      return response.data.success;
    } catch (error) {
      console.error('Failed to start flight:', error);
      return false;
    }
  }

  async getFlightData(): Promise<FlightData | null> {
    try {
      const response = await axios.get(`${this.bridgeUrl}/flight/data`, { timeout: 1000 });

      if (!response.data.success) {
        return null;
      }

      const raw = response.data.data;

      return {
        timestamp: raw.timestamp,
        altitude: raw.altitude,
        speed: raw.speed,
        gForce: raw.gForce,
        turbulence: raw.turbulence,
        phase: raw.phase as FlightPhase,
      };
    } catch (error) {
      console.error('Failed to get flight data:', error);
      return null;
    }
  }

  async switchMode(mode: 'demo' | 'simconnect'): Promise<boolean> {
    try {
      const response = await axios.post(`${this.bridgeUrl}/flight/switch-mode/${mode}`);
      if (response.data.success) {
        this.currentMode = mode;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to switch mode:', error);
      return false;
    }
  }

  isReady(): boolean {
    return this.isConnected;
  }

  getMode(): 'demo' | 'simconnect' {
    return this.currentMode;
  }
}

export async function createFlightBridge(): Promise<FlightBridge> {
  const bridge = new FlightBridge();
  const initialized = await bridge.initialize();

  if (!initialized) {
    throw new Error('Failed to initialize Flight Bridge');
  }

  return bridge;
}
