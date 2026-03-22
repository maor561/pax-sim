"""
Flight data bridge - connects to MSFS2024 SimConnect or provides demo mode
Runs as a separate process and serves flight data via HTTP
"""

from flask import Flask, jsonify
from flask_cors import CORS
import json
from demo_mode import DemoFlightSimulator, FlightPhase

app = Flask(__name__)
CORS(app)

# Global simulator instance
current_simulator = None
use_demo_mode = True

def init_demo_mode(profile: str = "short_haul"):
    """Initialize demo mode simulator"""
    global current_simulator, use_demo_mode
    use_demo_mode = True
    current_simulator = DemoFlightSimulator(profile)
    return current_simulator

def init_simconnect():
    """Initialize actual SimConnect connection"""
    global use_demo_mode
    use_demo_mode = False
    # TODO: Implement actual SimConnect connection here
    print("SimConnect mode not yet implemented")

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "mode": "demo" if use_demo_mode else "simconnect",
        "simulator": "DemoFlightSimulator" if use_demo_mode else "SimConnect"
    })

@app.route('/flight/data', methods=['GET'])
def get_flight_data():
    """Get current flight data"""
    if not current_simulator:
        return jsonify({"error": "Simulator not initialized"}), 500

    flight_data = current_simulator.get_flight_data()

    return jsonify({
        "success": True,
        "data": flight_data.to_dict(),
        "finished": current_simulator.is_finished()
    })

@app.route('/flight/start/<profile>', methods=['POST'])
def start_flight(profile: str = "short_haul"):
    """Start a new flight simulation with given profile"""
    try:
        init_demo_mode(profile)
        return jsonify({
            "success": True,
            "message": f"Started {profile} flight simulation",
            "profile": profile
        })
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/flight/reset', methods=['POST'])
def reset_flight():
    """Reset the current flight"""
    global current_simulator
    if current_simulator:
        profile = current_simulator.profile
        init_demo_mode(profile)
        return jsonify({"success": True, "message": "Flight reset"})
    return jsonify({"success": False, "error": "No flight in progress"}), 400

@app.route('/flight/switch-mode/<mode>', methods=['POST'])
def switch_mode(mode: str):
    """Switch between demo and SimConnect mode"""
    if mode == "demo":
        init_demo_mode()
        return jsonify({"success": True, "message": "Switched to demo mode"})
    elif mode == "simconnect":
        init_simconnect()
        return jsonify({"success": True, "message": "Switched to SimConnect mode"})
    else:
        return jsonify({"success": False, "error": "Invalid mode"}), 400

if __name__ == "__main__":
    # Start with demo mode by default
    init_demo_mode("short_haul")

    print("Starting PAX SIM Flight Bridge...")
    print("Demo mode: Short Haul flight")
    print("Server running on http://localhost:5000")

    app.run(host='localhost', port=5000, debug=False)
