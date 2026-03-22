"""
Demo mode flight data simulation for testing without MSFS2024
Generates realistic flight curves for different flight profiles
"""

import time
import math
from dataclasses import dataclass
from enum import Enum
from typing import Dict, Tuple

class FlightPhase(Enum):
    GROUND = "ground"
    TAKEOFF = "takeoff"
    CLIMB = "climb"
    CRUISE = "cruise"
    DESCENT = "descent"
    LANDING = "landing"

@dataclass
class FlightData:
    timestamp: float
    altitude: float
    speed: float
    g_force: float
    turbulence: float
    phase: FlightPhase

    def to_dict(self):
        return {
            "timestamp": self.timestamp,
            "altitude": self.altitude,
            "speed": self.speed,
            "gForce": self.g_force,
            "turbulence": self.turbulence,
            "phase": self.phase.value,
        }

class DemoFlightSimulator:
    """Simulates realistic flight data for testing"""

    def __init__(self, flight_profile: str = "short_haul"):
        """
        Initialize simulator with a flight profile
        Profiles: short_haul (30 min), medium_haul (2 hrs), long_haul (8 hrs)
        """
        self.profile = flight_profile
        self.start_time = time.time()
        self.elapsed_time = 0.0

        # Flight profiles: (total_duration_seconds, cruise_altitude, max_speed, turbulence_factor)
        self.profiles = {
            "short_haul": (30 * 60, 15000, 350, 0.3),
            "medium_haul": (120 * 60, 35000, 450, 0.2),
            "long_haul": (480 * 60, 43000, 490, 0.25),
        }

        if flight_profile not in self.profiles:
            raise ValueError(f"Unknown profile: {flight_profile}")

        self.total_duration, self.cruise_alt, self.max_speed, self.turbulence_factor = self.profiles[flight_profile]

    def get_phase(self, elapsed_ratio: float) -> Tuple[FlightPhase, float]:
        """
        Calculate flight phase and intensity (0-1) based on elapsed time
        elapsed_ratio: 0.0 to 1.0
        """
        if elapsed_ratio < 0.05:  # First 5%
            return FlightPhase.TAKEOFF, elapsed_ratio / 0.05
        elif elapsed_ratio < 0.15:  # Next 10%
            return FlightPhase.CLIMB, (elapsed_ratio - 0.05) / 0.10
        elif elapsed_ratio < 0.85:  # Middle 70%
            return FlightPhase.CRUISE, 1.0
        elif elapsed_ratio < 0.95:  # Next 10%
            return FlightPhase.DESCENT, (elapsed_ratio - 0.85) / 0.10
        else:  # Last 5%
            return FlightPhase.LANDING, (elapsed_ratio - 0.95) / 0.05

    def calculate_altitude(self, elapsed_ratio: float, phase: FlightPhase) -> float:
        """Calculate altitude with realistic curves"""
        if phase == FlightPhase.TAKEOFF:
            # Quick climb during takeoff
            return 1000 * math.pow(elapsed_ratio / 0.05, 1.5)

        elif phase == FlightPhase.CLIMB:
            # Gradual climb from takeoff to cruise
            climb_progress = (elapsed_ratio - 0.05) / 0.10
            start_alt = 1000
            return start_alt + (self.cruise_alt - start_alt) * math.pow(climb_progress, 0.8)

        elif phase == FlightPhase.CRUISE:
            # Maintain cruise altitude with slight variations
            variance = math.sin(elapsed_ratio * 2 * math.pi) * 500
            return self.cruise_alt + variance

        elif phase == FlightPhase.DESCENT:
            # Gradual descent
            descent_progress = (elapsed_ratio - 0.85) / 0.10
            return self.cruise_alt * (1 - math.pow(descent_progress, 0.8))

        else:  # LANDING
            # Final descent to ground
            landing_progress = (elapsed_ratio - 0.95) / 0.05
            return self.cruise_alt * 0.05 * (1 - landing_progress)

    def calculate_speed(self, elapsed_ratio: float, phase: FlightPhase) -> float:
        """Calculate airspeed with realistic curves"""
        if phase == FlightPhase.TAKEOFF:
            # Accelerate during takeoff
            return 50 + 200 * math.pow(elapsed_ratio / 0.05, 1.2)

        elif phase == FlightPhase.CLIMB:
            # Climb speed is usually lower than cruise
            climb_progress = (elapsed_ratio - 0.05) / 0.10
            return 200 + (self.max_speed - 200) * climb_progress

        elif phase == FlightPhase.CRUISE:
            # Cruise speed with slight variations
            variance = math.sin(elapsed_ratio * 3 * math.pi) * 20
            return self.max_speed + variance

        elif phase == FlightPhase.DESCENT:
            # Slow down during descent
            descent_progress = (elapsed_ratio - 0.85) / 0.10
            return self.max_speed * (1 - descent_progress * 0.5)

        else:  # LANDING
            # Final approach speed
            landing_progress = (elapsed_ratio - 0.95) / 0.05
            return (self.max_speed * 0.5) * (1 - landing_progress)

    def calculate_g_force(self, elapsed_ratio: float, phase: FlightPhase) -> float:
        """Calculate G-force with realistic variations"""
        base_g = 1.0

        if phase == FlightPhase.TAKEOFF:
            # Acceleration during takeoff
            takeoff_progress = elapsed_ratio / 0.05
            base_g += 0.3 * math.sin(takeoff_progress * math.pi / 2)

        elif phase == FlightPhase.CLIMB:
            # Climb can cause upward G
            climb_progress = (elapsed_ratio - 0.05) / 0.10
            base_g += 0.15 * math.sin(climb_progress * math.pi)

        elif phase == FlightPhase.CRUISE:
            # Slight turbulence variations
            turbulence = self.turbulence_factor * (0.3 + 0.7 * math.sin(elapsed_ratio * 5 * math.pi))
            base_g += turbulence * 0.2

        elif phase == FlightPhase.DESCENT:
            # Descent G-forces
            descent_progress = (elapsed_ratio - 0.85) / 0.10
            base_g -= 0.2 * math.sin(descent_progress * math.pi)

        else:  # LANDING
            # Landing forces
            landing_progress = (elapsed_ratio - 0.95) / 0.05
            base_g += 0.4 * math.sin(landing_progress * math.pi)

        return max(0.8, min(2.0, base_g))  # Clamp between 0.8G and 2.0G

    def calculate_turbulence(self, elapsed_ratio: float, phase: FlightPhase, altitude: float) -> float:
        """Calculate turbulence with altitude and phase considerations"""
        if phase == FlightPhase.TAKEOFF or phase == FlightPhase.LANDING:
            # More turbulence near ground
            return 0.3

        elif phase == FlightPhase.CLIMB or phase == FlightPhase.DESCENT:
            # Variable turbulence during climb/descent
            phase_turbulence = 0.4 * math.sin(elapsed_ratio * 4 * math.pi)
            return max(0, min(1.0, phase_turbulence))

        elif phase == FlightPhase.CRUISE:
            # Cruising turbulence - varies with "weather"
            # Simulate weather patterns
            weather_cycle = math.sin(elapsed_ratio * 2 * math.pi) * 0.3
            small_oscillations = math.sin(elapsed_ratio * 7 * math.pi) * 0.1
            return max(0, min(1.0, self.turbulence_factor * (0.1 + weather_cycle + small_oscillations)))

        else:  # GROUND
            return 0.0

    def get_flight_data(self) -> FlightData:
        """Generate flight data for current time"""
        current_time = time.time()
        self.elapsed_time = current_time - self.start_time

        # Calculate ratio (0.0 to 1.0+)
        elapsed_ratio = self.elapsed_time / self.total_duration

        # Clamp to flight duration
        if elapsed_ratio > 1.0:
            elapsed_ratio = 1.0

        phase, _ = self.get_phase(elapsed_ratio)
        altitude = self.calculate_altitude(elapsed_ratio, phase)
        speed = self.calculate_speed(elapsed_ratio, phase)
        g_force = self.calculate_g_force(elapsed_ratio, phase)
        turbulence = self.calculate_turbulence(elapsed_ratio, phase, altitude)

        return FlightData(
            timestamp=current_time,
            altitude=altitude,
            speed=speed,
            g_force=g_force,
            turbulence=turbulence,
            phase=phase,
        )

    def is_finished(self) -> bool:
        """Check if flight is complete"""
        return self.elapsed_time >= self.total_duration

# Test the simulator
if __name__ == "__main__":
    sim = DemoFlightSimulator("short_haul")

    for i in range(10):
        data = sim.get_flight_data()
        print(f"{data.phase.value:10} | Alt: {data.altitude:7.0f} ft | Speed: {data.speed:6.1f} kts | G: {data.g_force:4.2f} | Turb: {data.turbulence:4.2f}")
        time.sleep(2)
