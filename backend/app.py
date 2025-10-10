from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from simulation import OSSimulation
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Global simulation instance
sim = None

@app.route('/api/init', methods=['POST'])
def initialize_simulation():
    """Initialize a new simulation with jobs and partitions"""
    global sim
    
    data = request.get_json()
    jobs = data.get('jobs', [])
    partitions = data.get('partitions', [])
    strategy = data.get('strategy', 'first-fit')
    
    # Validate input
    if not jobs or not partitions:
        return jsonify({'error': 'Jobs and partitions are required'}), 400
    
    try:
        print(f"Creating simulation with {len(jobs)} jobs and {len(partitions)} partitions")
        sim = OSSimulation(jobs, partitions, strategy)
        print("Simulation created successfully")
        return jsonify({
            'message': 'Simulation initialized successfully',
            'strategy': strategy,
            'total_jobs': len(jobs),
            'total_partitions': len(partitions)
        })
    except Exception as e:
        print(f"Error creating simulation: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/step', methods=['POST'])
def simulation_step():
    """Execute one simulation step"""
    global sim
    
    if sim is None:
        return jsonify({'error': 'Simulation not initialized'}), 400
    
    if sim.all_done():
        return jsonify({'error': 'Simulation already completed'}), 400
    
    try:
        sim.step()
        snapshot_data = get_simulation_snapshot()
        return jsonify(snapshot_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/snapshot', methods=['GET'])
def get_current_snapshot():
    """Get current simulation state"""
    global sim
    
    if sim is None:
        return jsonify({'error': 'Simulation not initialized'}), 400
    
    try:
        job_table, mem_table = sim.get_snapshot()
        recent_logs = sim.get_recent_logs(50)  # Get more logs to see from beginning
        
        return jsonify({
            'clock': sim.clock,
            'is_done': sim.all_done(),
            'strategy': sim.strategy,
            'job_table': job_table,
            'memory_table': mem_table,
            'recent_logs': recent_logs,
            'statistics': sim.statistics() if sim.all_done() else None
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reset', methods=['POST'])
def reset_simulation():
    """Reset the simulation to initial state"""
    global sim
    
    if sim is None:
        return jsonify({'error': 'No simulation to reset'}), 400
    
    try:
        # Reinitialize with same parameters
        jobs = [(j.id, j.size, j.run_time) for j in sim.jobs]
        partitions = [p.size for p in sim.partitions]
        strategy = sim.strategy
        
        sim = OSSimulation(jobs, partitions, strategy)
        return jsonify({'message': 'Simulation reset successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/run-complete', methods=['POST'])
def run_complete_simulation():
    """Run the entire simulation to completion and return final state"""
    global sim
    
    if sim is None:
        return jsonify({'error': 'Simulation not initialized'}), 400
    
    try:
        # Run simulation to completion
        while not sim.all_done():
            sim.step()
        
        snapshot_data = get_simulation_snapshot()
        return jsonify(snapshot_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_simulation_snapshot():
    """Helper function to get simulation snapshot"""
    if sim is None:
        return None
    
    job_table, mem_table = sim.get_snapshot()
    recent_logs = sim.get_recent_logs(50)  # Get more logs to see from beginning
    
    return {
        'clock': sim.clock,
        'isDone': sim.all_done(),
        'strategy': sim.strategy,
        'jobTable': job_table,
        'memoryTable': mem_table,
        'recentLogs': recent_logs,
        'statistics': sim.statistics() if sim.all_done() else None
    }

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'simulation_active': sim is not None})

if __name__ == '__main__':
    print("Starting Memory Allocation Simulator Backend...")
    print("API endpoints available at http://localhost:8000/api/")
    app.run(debug=True, host='0.0.0.0', port=8000)
