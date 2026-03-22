/**
 * SimBrief API Client
 * Fetches flight briefing data including passenger count, route, and aircraft info
 */

export interface SimBriefFlight {
  route: string;
  aircraft: string;
  pax: number;
  distance: number;
  fuelplanned: number;
  ete: number; // estimated time en route in minutes
}

export interface SimBriefResponse {
  fetch: {
    status: string;
    query: string;
  };
  flight: SimBriefFlight;
}

export class SimBriefClient {
  private baseUrl = 'https://api.simbrief.com/api/v1';

  /**
   * Fetch briefing details from SimBrief using briefing ID
   * Public API - no authentication required
   */
  async getBriefing(briefingId: string): Promise<SimBriefResponse | null> {
    try {
      const url = `${this.baseUrl}/xml2json.php?query=${briefingId}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`SimBrief API error: ${response.statusText}`);
        return null;
      }

      const data: unknown = await response.json();

      // Validate response structure
      if (
        typeof data !== 'object' ||
        data === null ||
        !('flight' in data) ||
        !(typeof data.flight === 'object') ||
        data.flight === null ||
        !('pax' in data.flight)
      ) {
        console.error('Invalid SimBrief response structure:', data);
        return null;
      }

      return data as SimBriefResponse;
    } catch (error) {
      console.error('Failed to fetch SimBrief briefing:', error);
      return null;
    }
  }

  /**
   * Get passenger count from briefing
   */
  async getPassengerCount(briefingId: string): Promise<number | null> {
    const briefing = await this.getBriefing(briefingId);
    if (!briefing || !briefing.flight) {
      return null;
    }

    // Clamp passenger count between 10 and 1000 (server has pool of 1000)
    return Math.min(Math.max(briefing.flight.pax || 100, 10), 1000);
  }

  /**
   * Get full flight details from briefing
   */
  async getFlightDetails(briefingId: string): Promise<SimBriefFlight | null> {
    const briefing = await this.getBriefing(briefingId);
    return briefing ? briefing.flight : null;
  }
}
