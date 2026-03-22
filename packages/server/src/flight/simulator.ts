import { FlightBridge } from '../simconnect/bridge';
import { FlightData, FlightPhase } from '../types';

export class FlightSimulator {
  private bridge: FlightBridge;
  private lastFlightData: FlightData | null = null;
  private currentProfile: string = 'short_haul';
  private isRunning = false;

  constructor(bridge: FlightBridge) {
    this.bridge = bridge;
  }

  async start(profile: string = 'short_haul'): Promise<boolean> {
    this.currentProfile = profile;

    const success = await this.bridge.startFlight(profile);

    if (success) {
      this.isRunning = true;
      console.log(`✓ Flight simulator started (${profile})`);
    }

    return success;
  }

  async getFlightData(): Promise<FlightData | null> {
    if (!this.isRunning) {
      return null;
    }

    const data = await this.bridge.getFlightData();

    if (data) {
      this.lastFlightData = data;
    }

    return data;
  }

  getLastFlightData(): FlightData | null {
    return this.lastFlightData;
  }

  isActive(): boolean {
    return this.isRunning;
  }

  getCurrentProfile(): string {
    return this.currentProfile;
  }

  async switchMode(mode: 'demo' | 'simconnect'): Promise<boolean> {
    return this.bridge.switchMode(mode);
  }

  getMode(): 'demo' | 'simconnect' {
    return this.bridge.getMode();
  }
}

export async function createFlightSimulator(bridge: FlightBridge): Promise<FlightSimulator> {
  return new FlightSimulator(bridge);
}
