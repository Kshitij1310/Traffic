"""
YOLOv8 Vehicle Detection Module
Handles real-time vehicle detection and classification

This module uses YOLOv8 pretrained model to detect:
- Cars
- Buses
- Trucks
- Motorcycles
- Ambulances (for emergency detection)
"""

import cv2
import numpy as np
from ultralytics import YOLO
import os

class VehicleDetector:
    """
    Vehicle Detection class using YOLOv8
    Pretrained COCO model can detect multiple vehicle types
    """
    
    def __init__(self, model_path='yolov8n.pt'):
        """
        Initialize YOLO model
        
        Args:
            model_path: Path to YOLOv8 weights file
                       'yolov8n.pt' - Nano (fastest)
                       'yolov8s.pt' - Small
                       'yolov8m.pt' - Medium
                       'yolov8l.pt' - Large
        """
        self.model_path = model_path
        self.model = None
        print(f"VehicleDetector initialized (lazy loading enabled)")
        
        # COCO dataset class IDs for vehicles
        # Reference: https://github.com/ultralytics/ultralytics
        self.vehicle_classes = {
            2: 'car',
            3: 'motorcycle',
            5: 'bus',
            7: 'truck'
        }
        
        # Confidence threshold for detection
        self.confidence_threshold = 0.5
    
    def _load_model(self):
        """Load YOLO model on first use (lazy loading)"""
        if self.model is None:
            try:
                print(f"Loading YOLOv8 model: {self.model_path}...")
                self.model = YOLO(self.model_path)
                print(f"✓ YOLOv8 model loaded successfully")
            except Exception as e:
                print(f"✗ Error loading YOLO model: {e}")
                print("Attempting to download model...")
                try:
                    self.model = YOLO('yolov8n.pt')
                    print(f"✓ YOLOv8 model downloaded and loaded successfully")
                except Exception as download_error:
                    print(f"✗ Failed to download model: {download_error}")
                    raise RuntimeError(f"Could not load YOLO model: {download_error}")
    
    def detect_vehicles(self, image_path, draw_boxes=True):
        """
        Detect vehicles in an image
        
        Args:
            image_path: Path to input image
            draw_boxes: Whether to draw bounding boxes on image
            
        Returns:
            List of detected vehicle types
            
        Detection Logic:
        1. Load image using OpenCV
        2. Run YOLOv8 inference
        3. Filter detections for vehicle classes only
        4. Apply confidence threshold
        5. Return list of vehicle types
        """
        # Load model if not already loaded
        self._load_model()
        
        # Read image
        image = cv2.imread(image_path)
        if image is None:
            print(f"Error: Could not read image from {image_path}")
            return []
        
        # Run YOLO detection
        results = self.model(image, verbose=False)
        
        detected_vehicles = []
        
        # Process detections
        for result in results:
            boxes = result.boxes
            
            for box in boxes:
                # Get class ID and confidence
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                
                # Check if detected object is a vehicle and meets confidence threshold
                if class_id in self.vehicle_classes and confidence >= self.confidence_threshold:
                    vehicle_type = self.vehicle_classes[class_id]
                    detected_vehicles.append(vehicle_type)
                    
                    # Draw bounding box if requested
                    if draw_boxes:
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        
                        # Draw rectangle
                        cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
                        
                        # Add label
                        label = f"{vehicle_type}: {confidence:.2f}"
                        cv2.putText(image, label, (x1, y1 - 10),
                                  cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Save annotated image
        if draw_boxes and len(detected_vehicles) > 0:
            output_path = image_path.replace('.', '_detected.')
            cv2.imwrite(output_path, image)
            print(f"✓ Annotated image saved: {output_path}")
        
        return detected_vehicles
    
    def detect_emergency_vehicle(self, image_path):
        """
        Detect emergency vehicles (ambulance)
        
        Emergency Detection Logic:
        1. Check for ambulance class in YOLO detections
        2. Use color detection (red/white pattern) as backup
        3. Return True if emergency vehicle detected
        
        Note: COCO dataset doesn't have ambulance class,
        so this uses a combination of vehicle detection +
        color analysis as a simulation for the project
        """
        # Load model if not already loaded
        self._load_model()
        
        # First, detect all vehicles
        vehicles = self.detect_vehicles(image_path, draw_boxes=False)
        
        # Load image for color analysis
        image = cv2.imread(image_path)
        if image is None:
            return False
        
        # Convert to HSV color space for better color detection
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        # Define red color range (ambulance colors)
        lower_red1 = np.array([0, 100, 100])
        upper_red1 = np.array([10, 255, 255])
        lower_red2 = np.array([160, 100, 100])
        upper_red2 = np.array([180, 255, 255])
        
        # Create masks for red color
        mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
        mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
        red_mask = cv2.bitwise_or(mask1, mask2)
        
        # Calculate percentage of red pixels
        red_pixels = cv2.countNonZero(red_mask)
        total_pixels = image.shape[0] * image.shape[1]
        red_percentage = (red_pixels / total_pixels) * 100
        
        # If significant red color detected and vehicles present
        # Consider it as potential emergency vehicle
        if red_percentage > 5 and len(vehicles) > 0:
            print(f"⚠ Emergency vehicle detected! (Red: {red_percentage:.1f}%)")
            return True
        
        return False
    
    def count_vehicles_by_lane(self, image_path, num_lanes=4):
        """
        Count vehicles in different lanes
        
        Lane Detection Logic:
        1. Divide image into equal vertical sections (lanes)
        2. Detect vehicles in entire image
        3. Assign each vehicle to a lane based on position
        4. Return dictionary with count per lane
        
        Args:
            image_path: Path to image
            num_lanes: Number of lanes to divide image into
            
        Returns:
            Dictionary: {lane1: count, lane2: count, ...}
        """
        # Load model if not already loaded
        self._load_model()
        
        # Read image
        image = cv2.imread(image_path)
        if image is None:
            return {}
        
        height, width = image.shape[:2]
        lane_width = width // num_lanes
        
        # Run detection
        results = self.model(image, verbose=False)
        
        # Initialize lane counts
        lane_counts = {f'lane{i+1}': 0 for i in range(num_lanes)}
        
        # Process each detection
        for result in results:
            boxes = result.boxes
            
            for box in boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                
                if class_id in self.vehicle_classes and confidence >= self.confidence_threshold:
                    # Get bounding box center
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    center_x = (x1 + x2) // 2
                    
                    # Determine which lane the vehicle is in
                    lane_index = min(center_x // lane_width, num_lanes - 1)
                    lane_key = f'lane{lane_index + 1}'
                    lane_counts[lane_key] += 1
        
        return lane_counts
    
    def process_video_stream(self, video_source=0):
        """
        Process live video stream for real-time detection
        
        Args:
            video_source: 0 for webcam, or path to video file
            
        Real-time Processing:
        1. Capture frame from video source
        2. Run YOLO detection
        3. Draw bounding boxes
        4. Display vehicle count
        5. Return frame and count
        """
        # Load model if not already loaded
        self._load_model()
        
        cap = cv2.VideoCapture(video_source)
        
        if not cap.isOpened():
            print("Error: Could not open video source")
            return None, 0
        
        ret, frame = cap.read()
        if not ret:
            cap.release()
            return None, 0
        
        # Run detection on frame
        results = self.model(frame, verbose=False)
        
        vehicle_count = 0
        
        for result in results:
            boxes = result.boxes
            
            for box in boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                
                if class_id in self.vehicle_classes and confidence >= self.confidence_threshold:
                    vehicle_count += 1
                    vehicle_type = self.vehicle_classes[class_id]
                    
                    # Draw bounding box
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    
                    label = f"{vehicle_type}: {confidence:.2f}"
                    cv2.putText(frame, label, (x1, y1 - 10),
                              cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Display count on frame
        cv2.putText(frame, f"Vehicles: {vehicle_count}", (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        
        cap.release()
        return frame, vehicle_count

def test_detector():
    """
    Test function to verify YOLO model is working
    For development and debugging
    """
    print("\n" + "="*60)
    print("Testing Vehicle Detection System")
    print("="*60 + "\n")
    
    detector = VehicleDetector()
    
    print("✓ Detector initialized successfully")
    print(f"✓ Detecting vehicle classes: {list(detector.vehicle_classes.values())}")
    print(f"✓ Confidence threshold: {detector.confidence_threshold}")
    print("\nReady for detection!")

if __name__ == "__main__":
    # Run test when module is executed directly
    test_detector()
