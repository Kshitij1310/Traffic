import axios from 'axios';

const API_BASE_URL = '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const trafficApi = {
  // Get current traffic data
  getTrafficData: async () => {
    const response = await api.get('/api/traffic-data');
    return response.data;
  },

  // Vehicle detection from image upload
  detectVehicles: async (formData) => {
    const response = await api.post('/api/detect', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Detect from webcam
  detectFromWebcam: async (laneId) => {
    const response = await api.post('/api/detect-webcam', { lane_id: laneId });
    return response.data;
  },

  // Emergency override
  emergencyOverride: async (laneId, detected) => {
    const response = await api.post('/api/emergency-override', {
      lane_id: laneId,
      detected: detected,
    });
    return response.data;
  },

  // Simulate traffic
  simulateTraffic: async () => {
    const response = await api.post('/api/simulate-traffic');
    return response.data;
  },

  // Get traffic history
  getTrafficHistory: async () => {
    const response = await api.get('/api/history');
    return response.data;
  },

  // Get emergency history
  getEmergencyHistory: async () => {
    const response = await api.get('/api/emergency-history');
    return response.data;
  },
};

export default api;
