"""
Smart Traffic Optimization System - Main Flask Application
B.Tech Final Year Project

This application uses YOLOv8 for real-time vehicle detection and AI-based
traffic signal optimization with emergency vehicle priority handling.
"""

from flask import Flask, render_template, request, jsonify, Response
import mysql.connector
from datetime import datetime
import cv2
import json
import os
import threading
import time
from models.yolo_model import VehicleDetector

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize vehicle detector
detector = VehicleDetector()

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',  # Change this to your MySQL password
    'database': 'smart_traffic_db'
}

# Global variables for traffic state
traffic_state = {
    'lane1': {'count': 0, 'signal': 'red', 'timer': 30},
    'lane2': {'count': 0, 'signal': 'red', 'timer': 30},
    'lane3': {'count': 0, 'signal': 'red', 'timer': 30},
    'lane4': {'count': 0, 'signal': 'red', 'timer': 30},
    'emergency_active': False,
    'emergency_lane': None
}

LANES = ['lane1', 'lane2', 'lane3', 'lane4']
current_lane_index = 0
timer_value = 0
traffic_lock = threading.Lock()

def get_db_connection():
    """Establish database connection"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        return None

def calculate_green_time(vehicle_count):
    """
    Green time calculation logic
    Formula: green_time = 10 + (vehicle_count * 2)
    """
    return int(10 + (vehicle_count * 2))

def set_active_lane(lane_id, green_time_seconds):
    """
    Lane switching logic
    - Set all lanes to red
    - Set selected lane to green with calculated timer
    """
    for lane in LANES:
        traffic_state[lane]['signal'] = 'red'
        traffic_state[lane]['timer'] = 0

    traffic_state[lane_id]['signal'] = 'green'
    traffic_state[lane_id]['timer'] = green_time_seconds

def signal_rotation_loop():
    """
    Background timer logic
    - Decrease timer every second
    - Switch lane when timer reaches 0
    - Calculate next green time using vehicle count
    """
    global current_lane_index, timer_value

    while True:
        time.sleep(1)

        with traffic_lock:
            if traffic_state['emergency_active']:
                continue

            current_lane = LANES[current_lane_index]

            if timer_value <= 0:
                green_time = calculate_green_time(traffic_state[current_lane]['count'])
                timer_value = green_time
                set_active_lane(current_lane, green_time)
                continue

            timer_value -= 1
            traffic_state[current_lane]['timer'] = timer_value

            if timer_value <= 0:
                current_lane_index = (current_lane_index + 1) % len(LANES)
                next_lane = LANES[current_lane_index]
                next_green_time = calculate_green_time(traffic_state[next_lane]['count'])
                timer_value = next_green_time
                set_active_lane(next_lane, next_green_time)

def log_traffic_data(lane_id, vehicle_count):
    """Save traffic data to database"""
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            query = "INSERT INTO traffic_logs (lane_id, vehicle_count, timestamp) VALUES (%s, %s, %s)"
            cursor.execute(query, (lane_id, vehicle_count, datetime.now()))
            conn.commit()
            cursor.close()
            conn.close()
        except mysql.connector.Error as err:
            print(f"Database insert error: {err}")

def log_emergency_event(detected):
    """Log emergency vehicle detection to database"""
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            query = "INSERT INTO emergency_logs (detected, timestamp) VALUES (%s, %s)"
            cursor.execute(query, (detected, datetime.now()))
            conn.commit()
            cursor.close()
            conn.close()
        except mysql.connector.Error as err:
            print(f"Database insert error: {err}")

@app.route('/')
def index():
    """Main landing page"""
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    """Traffic monitoring dashboard"""
    return render_template('dashboard.html')

@app.route('/emergency')
def emergency():
    """Emergency vehicle management page"""
    return render_template('emergency.html')

@app.route('/api/detect', methods=['POST'])
def detect_vehicles():
    """
    Vehicle detection endpoint
    Accepts image upload and returns vehicle count by type
    
    Enhanced with:
    - Comprehensive error handling
    - File validation
    - Automatic folder creation
    - Detailed error messages
    """
    try:
        # Validate request has file
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No image provided',
                'message': 'Please select an image file to upload'
            }), 400
        
        file = request.files['image']
        lane_id = request.form.get('lane_id', 'lane1')
        
        # Validate file is selected
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected',
                'message': 'Please select a valid image file'
            }), 400
        
        # Validate file extension
        allowed_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.webp', '.avif'}
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            return jsonify({
                'success': False,
                'error': 'Invalid file type',
                'message': f'Only image files are allowed: {', '.join(allowed_extensions)}'
            }), 400
        
        # Ensure upload folder exists
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        
        # Save uploaded file with safe filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        safe_filename = f"{timestamp}_{os.path.basename(file.filename)}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], safe_filename)
        
        try:
            file.save(filepath)
            print(f"✓ File saved: {filepath}")
        except Exception as save_error:
            print(f"✗ Error saving file: {save_error}")
            return jsonify({
                'success': False,
                'error': 'File save failed',
                'message': 'Could not save uploaded file. Please check permissions.'
            }), 500
        
        # Verify file exists and is readable
        if not os.path.exists(filepath):
            return jsonify({
                'success': False,
                'error': 'File not found',
                'message': 'Uploaded file could not be found on server'
            }), 500
        
        # Detect vehicles using YOLO
        try:
            print(f"🔍 Running detection on: {filepath}")
            detections = detector.detect_vehicles(filepath)
            print(f"✓ Detection complete: {len(detections)} vehicles found")
        except Exception as detection_error:
            print(f"✗ Detection error: {detection_error}")
            # Clean up file
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({
                'success': False,
                'error': 'Detection failed',
                'message': 'Vehicle detection failed. Please try a different image.'
            }), 500
        
        # Count vehicles by type
        vehicle_counts = {
            'cars': detections.count('car'),
            'buses': detections.count('bus'),
            'trucks': detections.count('truck'),
            'bikes': detections.count('motorcycle'),
            'total': len(detections)
        }
        
        # Update traffic state safely
        with traffic_lock:
            traffic_state[lane_id]['count'] = vehicle_counts['total']
        
        # Log to database
        try:
            log_traffic_data(lane_id, vehicle_counts['total'])
        except Exception as db_error:
            print(f"⚠ Database logging failed: {db_error}")
            # Don't fail the request if logging fails
        
        return jsonify({
            'success': True,
            'lane_id': lane_id,
            'detections': vehicle_counts,
            'signal_timing': traffic_state[lane_id]['timer'],
            'current_signal': traffic_state[lane_id]['signal'],
            'message': f'Successfully detected {vehicle_counts["total"]} vehicles'
        }), 200
        
    except Exception as e:
        # Catch-all for unexpected errors
        print(f"✗ Unexpected error in /api/detect: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': 'Server error',
            'message': 'An unexpected error occurred. Please try again.'
        }), 500

@app.route('/api/detect-webcam', methods=['POST'])
def detect_from_webcam():
    """
    Detect vehicles from webcam stream
    Simulates real-time detection
    """
    lane_id = request.json.get('lane_id', 'lane1')
    
    # Initialize webcam
    cap = cv2.VideoCapture(0)
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        # Simulate detection if webcam not available
        import random
        vehicle_count = random.randint(5, 30)
        with traffic_lock:
            traffic_state[lane_id]['count'] = vehicle_count
    else:
        # Save frame temporarily
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], 'temp_webcam.jpg')
        cv2.imwrite(temp_path, frame)
        
        # Detect vehicles
        detections = detector.detect_vehicles(temp_path)
        vehicle_count = len(detections)
        with traffic_lock:
            traffic_state[lane_id]['count'] = vehicle_count
    
    # Log traffic data
    log_traffic_data(lane_id, vehicle_count)
    
    return jsonify({
        'success': True,
        'lane_id': lane_id,
        'vehicle_count': vehicle_count,
        'signal': traffic_state[lane_id]['signal'],
        'timer': traffic_state[lane_id]['timer']
    })

@app.route('/api/traffic-data')
def get_traffic_data():
    """
    API endpoint to get current traffic status for all lanes
    Used by dashboard for real-time updates
    """
    with traffic_lock:
        return jsonify({
            'lanes': {
                'lane1': traffic_state['lane1'],
                'lane2': traffic_state['lane2'],
                'lane3': traffic_state['lane3'],
                'lane4': traffic_state['lane4']
            },
            'emergency': {
                'active': traffic_state['emergency_active'],
                'lane': traffic_state['emergency_lane']
            },
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })

@app.route('/api/signal-status')
def get_signal_status():
    """
    Signal status API
    Returns current lane, countdown timer, and vehicle count
    """
    with traffic_lock:
        if traffic_state['emergency_active'] and traffic_state['emergency_lane']:
            lane_id = traffic_state['emergency_lane']
        else:
            lane_id = LANES[current_lane_index]

        return jsonify({
            'current_lane': lane_id.replace('lane', 'Lane '),
            'timer': traffic_state[lane_id]['timer'],
            'vehicle_count': traffic_state[lane_id]['count']
        })

@app.route('/api/emergency-override', methods=['POST'])
def emergency_override():
    """
    Emergency vehicle priority system
    Overrides normal traffic flow to prioritize emergency vehicles
    
    Logic:
    - Detect ambulance/emergency vehicle
    - Turn all signals red except emergency lane
    - Turn emergency lane green immediately
    - Log emergency event
    """
    data = request.json
    lane_id = data.get('lane_id', 'lane1')
    emergency_detected = data.get('detected', False)
    global timer_value
    
    if emergency_detected:
        # Activate emergency mode
        with traffic_lock:
            traffic_state['emergency_active'] = True
            traffic_state['emergency_lane'] = lane_id

            # Set all lanes to red
            for lane in LANES:
                traffic_state[lane]['signal'] = 'red'
                traffic_state[lane]['timer'] = 0

            # Set emergency lane to green with extended time
            traffic_state[lane_id]['signal'] = 'green'
            traffic_state[lane_id]['timer'] = 90  # 90 seconds for emergency
        
        # Log emergency event
        log_emergency_event(True)
        
        return jsonify({
            'success': True,
            'message': 'Emergency override activated',
            'emergency_lane': lane_id,
            'status': 'GREEN'
        })
    else:
        # Deactivate emergency mode
        with traffic_lock:
            traffic_state['emergency_active'] = False
            traffic_state['emergency_lane'] = None

            # Reset timer to force immediate lane recalculation
            timer_value = 0
        
        return jsonify({
            'success': True,
            'message': 'Emergency override deactivated',
            'status': 'NORMAL'
        })

@app.route('/api/history')
def get_traffic_history():
    """Get historical traffic data from database"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT lane_id, vehicle_count, timestamp 
            FROM traffic_logs 
            ORDER BY timestamp DESC 
            LIMIT 100
        """
        cursor.execute(query)
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Convert datetime to string for JSON serialization
        for row in results:
            row['timestamp'] = row['timestamp'].strftime('%Y-%m-%d %H:%M:%S')
        
        return jsonify({'success': True, 'data': results})
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

@app.route('/api/emergency-history')
def get_emergency_history():
    """Get emergency vehicle detection history"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT id, detected, timestamp 
            FROM emergency_logs 
            ORDER BY timestamp DESC 
            LIMIT 50
        """
        cursor.execute(query)
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Convert datetime to string
        for row in results:
            row['timestamp'] = row['timestamp'].strftime('%Y-%m-%d %H:%M:%S')
        
        return jsonify({'success': True, 'data': results})
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

@app.route('/api/simulate-traffic', methods=['POST'])
def simulate_traffic():
    """
    Simulate traffic for testing without webcam/images
    Useful for project demonstration
    """
    import random
    
    for lane in LANES:
        count = random.randint(3, 35)
        with traffic_lock:
            traffic_state[lane]['count'] = count
        log_traffic_data(lane, count)
    
    return jsonify({
        'success': True,
        'message': 'Traffic simulation completed',
        'data': traffic_state
    })

if __name__ == '__main__':
    # Create upload folder if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Start signal rotation thread once (avoid duplicate threads with reloader)
    if not app.debug or os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        rotation_thread = threading.Thread(target=signal_rotation_loop, daemon=True)
        rotation_thread.start()
    
    # Run Flask app
    print("=" * 60)
    print("Smart Traffic Optimization System")
    print("B.Tech Final Year Project")
    print("=" * 60)
    print("\nStarting server...")
    print("Access dashboard at: http://localhost:5000")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
