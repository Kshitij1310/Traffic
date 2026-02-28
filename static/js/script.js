/**
 * Smart Traffic Optimization System - Dashboard JavaScript
 * B.Tech Final Year Project
 * 
 * This file handles:
 * - Real-time traffic data updates
 * - Traffic light signal animations
 * - Vehicle detection and upload
 * - Chart updates and visualizations
 * - Emergency alerts
 */

// Global state management
let currentTrafficData = {
    lane1: { count: 0, signal: 'red', timer: 0 },
    lane2: { count: 0, signal: 'red', timer: 0 },
    lane3: { count: 0, signal: 'red', timer: 0 },
    lane4: { count: 0, signal: 'red', timer: 0 },
    emergency_active: false,
    emergency_lane: null
};

let trafficHistory = [];
const MAX_HISTORY_POINTS = 20;

/**
 * Update Traffic Light Display
 * Controls the visual state of traffic lights based on signal status
 * 
 * Logic:
 * - Red signal: Red light active, others inactive
 * - Green signal: Green light active, others inactive
 * - Yellow signal: Yellow light active (transition state)
 */
function updateTrafficLight(laneId, signal) {
    const lights = {
        red: document.getElementById(`${laneId}-red`),
        yellow: document.getElementById(`${laneId}-yellow`),
        green: document.getElementById(`${laneId}-green`)
    };

    // Remove active class from all lights
    Object.values(lights).forEach(light => {
        if (light) light.classList.remove('active');
    });

    // Activate appropriate light
    if (lights[signal]) {
        lights[signal].classList.add('active');
    }
}

/**
 * Update Lane Information
 * Updates vehicle count and timer display for each lane
 */
function updateLaneInfo(laneId, count, timer) {
    const countElement = document.getElementById(`${laneId}-count`);
    const timerElement = document.getElementById(`${laneId}-timer`);

    if (countElement) countElement.textContent = count;
    if (timerElement) timerElement.textContent = timer;
}

/**
 * Update Dashboard Statistics
 * Calculates and displays aggregate statistics
 */
function updateDashboardStats(data) {
    // Calculate total vehicles
    const totalVehicles = data.lane1.count + data.lane2.count + 
                         data.lane3.count + data.lane4.count;
    
    document.getElementById('totalVehicles').textContent = totalVehicles;

    // Find active lane (green signal)
    let activeLane = '-';
    for (let lane in data) {
        if (lane.startsWith('lane') && data[lane].signal === 'green') {
            activeLane = lane.charAt(0).toUpperCase() + lane.slice(1);
            break;
        }
    }
    document.getElementById('activeLane').textContent = activeLane;

    // Update emergency status
    const emergencyStatus = data.emergency_active ? 'ACTIVE' : 'Normal';
    const emergencyElement = document.getElementById('emergencyStatus');
    emergencyElement.textContent = emergencyStatus;
    
    if (data.emergency_active) {
        emergencyElement.classList.add('text-red-600', 'font-bold');
        emergencyElement.classList.remove('text-gray-900');
    } else {
        emergencyElement.classList.remove('text-red-600', 'font-bold');
        emergencyElement.classList.add('text-gray-900');
    }

    // Calculate average wait time (simplified)
    const avgWaitTime = Math.round((data.lane1.timer + data.lane2.timer + 
                                    data.lane3.timer + data.lane4.timer) / 4);
    document.getElementById('avgWaitTime').textContent = avgWaitTime;
}

/**
 * Update Lane Ranking Display
 * Shows lanes sorted by traffic density
 */
function updateLaneRanking(data) {
    const lanes = [
        { id: 'lane1', name: 'Lane 1', count: data.lane1.count },
        { id: 'lane2', name: 'Lane 2', count: data.lane2.count },
        { id: 'lane3', name: 'Lane 3', count: data.lane3.count },
        { id: 'lane4', name: 'Lane 4', count: data.lane4.count }
    ];

    // Sort by vehicle count (descending)
    lanes.sort((a, b) => b.count - a.count);

    const rankingContainer = document.getElementById('laneRanking');
    if (!rankingContainer) return;

    rankingContainer.innerHTML = '';

    lanes.forEach((lane, index) => {
        const barWidth = (lane.count / Math.max(1, lanes[0].count)) * 100;
        const colors = ['bg-purple-600', 'bg-blue-500', 'bg-green-500', 'bg-gray-400'];
        
        const div = document.createElement('div');
        div.innerHTML = `
            <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-gray-700">${index + 1}. ${lane.name}</span>
                <span class="text-sm font-semibold text-gray-900">${lane.count} vehicles</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="${colors[index]} h-2 rounded-full transition-all duration-500" style="width: ${barWidth}%"></div>
            </div>
        `;
        rankingContainer.appendChild(div);
    });
}

/**
 * Update Traffic Trend Chart
 * Displays historical traffic data over time
 */
function updateTrafficChart(totalVehicles) {
    if (!window.trafficChart) return;

    const now = new Date().toLocaleTimeString();
    
    // Add new data point
    trafficHistory.push({ time: now, count: totalVehicles });
    
    // Keep only last MAX_HISTORY_POINTS
    if (trafficHistory.length > MAX_HISTORY_POINTS) {
        trafficHistory.shift();
    }

    // Update chart
    trafficChart.data.labels = trafficHistory.map(h => h.time);
    trafficChart.data.datasets[0].data = trafficHistory.map(h => h.count);
    trafficChart.update();
}

/**
 * Update Lane Distribution Chart
 * Shows vehicle distribution across lanes as doughnut chart
 */
function updateDistributionChart(data) {
    if (!window.distributionChart) return;

    distributionChart.data.datasets[0].data = [
        data.lane1.count,
        data.lane2.count,
        data.lane3.count,
        data.lane4.count
    ];
    distributionChart.update();
}

/**
 * Show Alert Message
 * Displays alerts for important events
 */
function showAlert(title, message, type = 'info') {
    const alertBar = document.getElementById('alertBar');
    const alertIcon = document.getElementById('alertIcon');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');

    if (!alertBar) return;

    // Set alert style based on type
    const styles = {
        info: 'bg-blue-50 border-blue-500 text-blue-800',
        success: 'bg-green-50 border-green-500 text-green-800',
        warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
        error: 'bg-red-50 border-red-500 text-red-800'
    };

    const icons = {
        info: 'fa-info-circle text-blue-600',
        success: 'fa-check-circle text-green-600',
        warning: 'fa-exclamation-triangle text-yellow-600',
        error: 'fa-times-circle text-red-600'
    };

    alertBar.className = `mb-6 p-4 rounded-lg border-l-4 ${styles[type]}`;
    alertIcon.className = `fas ${icons[type]} text-xl mr-3`;
    alertTitle.textContent = title;
    alertMessage.textContent = message;
    
    alertBar.classList.remove('hidden');

    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertBar.classList.add('hidden');
    }, 5000);
}

/**
 * Fetch Traffic Data from API
 * Gets current traffic status from backend
 */
async function fetchTrafficData() {
    try {
        const response = await fetch('/api/traffic-data');
        const data = await response.json();

        if (data && data.lanes) {
            return {
                lane1: data.lanes.lane1,
                lane2: data.lanes.lane2,
                lane3: data.lanes.lane3,
                lane4: data.lanes.lane4,
                emergency_active: data.emergency.active,
                emergency_lane: data.emergency.lane
            };
        }
    } catch (error) {
        console.error('Error fetching traffic data:', error);
        return null;
    }
}

/**
 * Fetch Signal Status
 * Gets current lane and countdown timer every second
 */
async function fetchSignalStatus() {
    try {
        const response = await fetch('/api/signal-status');
        const data = await response.json();

        if (data && data.current_lane) {
            return data;
        }
    } catch (error) {
        console.error('Error fetching signal status:', error);
        return null;
    }
}

/**
 * Update Signal Countdown
 * Updates active lane highlight and live countdown timer
 */
async function updateSignalStatus() {
    const status = await fetchSignalStatus();
    if (!status) return;

    const laneLabel = status.current_lane;
    const laneId = laneLabel.toLowerCase().replace(' ', '');

    // Update live countdown display
    const countdownEl = document.getElementById('currentCountdown');
    const laneEl = document.getElementById('currentGreenLane');
    const vehicleEl = document.getElementById('currentVehicleCount');

    if (countdownEl) countdownEl.textContent = status.timer;
    if (laneEl) laneEl.textContent = laneLabel;
    if (vehicleEl) vehicleEl.textContent = status.vehicle_count;

    // Highlight active lane signal
    ['lane1', 'lane2', 'lane3', 'lane4'].forEach(lane => {
        updateTrafficLight(lane, lane === laneId ? 'green' : 'red');
    });

    // Update active lane card text for real-time accuracy
    const activeLaneEl = document.getElementById('activeLane');
    if (activeLaneEl) activeLaneEl.textContent = laneLabel;
}

/**
 * Main Dashboard Update Function
 * Updates all dashboard components with latest data
 * 
 * Called automatically every 5 seconds
 */
async function updateDashboard() {
    const data = await fetchTrafficData();
    
    if (!data) {
        console.warn('No traffic data available');
        return;
    }

    // Store current data
    currentTrafficData = data;

    // Update traffic lights
    ['lane1', 'lane2', 'lane3', 'lane4'].forEach(lane => {
        updateTrafficLight(lane, data[lane].signal);
        updateLaneInfo(lane, data[lane].count, data[lane].timer);
    });

    // Update statistics
    updateDashboardStats(data);

    // Update lane ranking
    updateLaneRanking(data);

    // Calculate total vehicles for chart
    const totalVehicles = data.lane1.count + data.lane2.count + 
                         data.lane3.count + data.lane4.count;

    // Update charts
    updateTrafficChart(totalVehicles);
    updateDistributionChart(data);

    // Show emergency alert if active
    if (data.emergency_active) {
        showAlert(
            'Emergency Mode Active',
            `${data.emergency_lane.toUpperCase()} has priority green signal`,
            'error'
        );
    }
}

/**
 * Handle Image Upload for Vehicle Detection
 * Processes uploaded image and sends to backend for detection
 * 
 * Enhanced with:
 * - File validation before upload
 * - HTTP status checking
 * - Detailed error messages
 * - Loading state management
 */
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showAlert(
            'Invalid File Type',
            'Please upload a valid image file (JPG, PNG, BMP, or WebP)',
            'error'
        );
        // Reset file input
        event.target.value = '';
        return;
    }

    // Validate file size (max 16MB)
    const maxSize = 16 * 1024 * 1024; // 16MB
    if (file.size > maxSize) {
        showAlert(
            'File Too Large',
            'Please upload an image smaller than 16MB',
            'error'
        );
        // Reset file input
        event.target.value = '';
        return;
    }

    const laneId = document.getElementById('laneSelect').value;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('lane_id', laneId);

    try {
        showAlert('Processing', 'Uploading and detecting vehicles...', 'info');

        const response = await fetch('/api/detect', {
            method: 'POST',
            body: formData
        });

        // Check HTTP status before parsing JSON
        if (!response.ok) {
            let errorMessage = 'Failed to upload image';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (parseError) {
                errorMessage = `Server error (${response.status}): ${response.statusText}`;
            }
            
            showAlert('Upload Failed', errorMessage, 'error');
            console.error('Upload failed:', response.status, errorMessage);
            // Reset file input
            event.target.value = '';
            return;
        }

        const data = await response.json();

        if (data.success) {
            // Display detection results
            displayDetectionResults(data.detections);
            
            showAlert(
                'Detection Complete',
                data.message || `Detected ${data.detections.total} vehicles in ${laneId.toUpperCase()}`,
                'success'
            );

            // Refresh dashboard
            await updateDashboard();
        } else {
            // Server returned success: false
            const errorMsg = data.message || data.error || 'Failed to detect vehicles';
            showAlert('Detection Failed', errorMsg, 'error');
        }
        
        // Reset file input for next upload
        event.target.value = '';
        
    } catch (error) {
        console.error('Error uploading image:', error);
        showAlert(
            'Upload Error',
            'Network error or server is unreachable. Please check your connection.',
            'error'
        );
        // Reset file input
        event.target.value = '';
    }
}

/**
 * Display Vehicle Detection Results
 * Shows breakdown of detected vehicle types
 */
function displayDetectionResults(detections) {
    const resultsDiv = document.getElementById('detectionResults');
    if (!resultsDiv) return;

    // Update counts
    document.getElementById('carCount').textContent = detections.cars || 0;
    document.getElementById('busCount').textContent = detections.buses || 0;
    document.getElementById('truckCount').textContent = detections.trucks || 0;
    document.getElementById('bikeCount').textContent = detections.bikes || 0;
    document.getElementById('totalDetected').textContent = detections.total || 0;

    // Show results section
    resultsDiv.classList.remove('hidden');
}

/**
 * Detect from Webcam
 * Captures frame from webcam and runs detection
 */
async function detectFromWebcam() {
    const laneId = document.getElementById('laneSelect').value;

    try {
        showAlert('Processing', 'Accessing webcam...', 'info');

        const response = await fetch('/api/detect-webcam', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ lane_id: laneId })
        });

        const data = await response.json();

        if (data.success) {
            showAlert(
                'Detection Complete',
                `Detected ${data.vehicle_count} vehicles from webcam`,
                'success'
            );

            // Refresh dashboard
            await updateDashboard();
        } else {
            showAlert('Error', 'Webcam detection failed', 'error');
        }
    } catch (error) {
        console.error('Error detecting from webcam:', error);
        showAlert('Error', 'Failed to access webcam', 'error');
    }
}

/**
 * Simulate Traffic Data
 * Generates random traffic for testing/demonstration
 */
async function simulateTraffic() {
    try {
        showAlert('Simulating', 'Generating random traffic data...', 'info');

        const response = await fetch('/api/simulate-traffic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            showAlert(
                'Simulation Complete',
                'Traffic data has been generated successfully',
                'success'
            );

            // Refresh dashboard
            await updateDashboard();
        } else {
            showAlert('Error', 'Simulation failed', 'error');
        }
    } catch (error) {
        console.error('Error simulating traffic:', error);
        showAlert('Error', 'Failed to simulate traffic', 'error');
    }
}

/**
 * Get Traffic History
 * Loads historical traffic data from database
 */
async function loadTrafficHistory() {
    try {
        const response = await fetch('/api/history');
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            // Process and display history
            console.log('Traffic history loaded:', data.data.length, 'records');
        }
    } catch (error) {
        console.error('Error loading traffic history:', error);
    }
}

/**
 * Initialize Dashboard
 * Called when page loads
 */
function initializeDashboard() {
    console.log('Smart Traffic Dashboard Initialized');
    
    // Load initial data
    updateDashboard();
    updateSignalStatus();
    loadTrafficHistory();
    
    // Set up auto-refresh (every 5 seconds)
    setInterval(updateDashboard, 5000);
    // Set up signal countdown refresh (every 1 second)
    setInterval(updateSignalStatus, 1000);
    
    console.log('Auto-refresh enabled (5 second interval)');
}

// Export functions for global access
window.updateDashboard = updateDashboard;
window.handleImageUpload = handleImageUpload;
window.detectFromWebcam = detectFromWebcam;
window.simulateTraffic = simulateTraffic;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    initializeDashboard();
}
