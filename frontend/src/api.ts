import axios from 'axios';
import { SimulationConfig, SimulationSnapshot } from './types';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const simulationAPI = {
  // Initialize simulation
  initialize: async (config: SimulationConfig): Promise<void> => {
    const response = await api.post('/init', config);
    return response.data;
  },

  // Get current simulation state
  getSnapshot: async (): Promise<SimulationSnapshot> => {
    const response = await api.get('/snapshot');
    return response.data;
  },

  // Execute one simulation step
  step: async (): Promise<SimulationSnapshot> => {
    const response = await api.post('/step');
    // Backend now returns the snapshot directly
    return response.data;
  },

  // Run simulation to completion
  runComplete: async (): Promise<SimulationSnapshot> => {
    const response = await api.post('/run-complete');
    // Backend now returns the snapshot directly
    return response.data;
  },

  // Reset simulation
  reset: async (): Promise<void> => {
    const response = await api.post('/reset');
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<{ status: string; simulation_active: boolean }> => {
    const response = await api.get('/health');
    return response.data;
  },
};
