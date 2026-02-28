# Configuration file for Smart Traffic Optimization System
# This file can be used to store environment-specific settings

import os

class Config:
    """Base configuration"""
    
    # Flask Settings
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DEBUG = True
    
    # Database Settings
    DB_HOST = os.environ.get('DB_HOST') or 'localhost'
    DB_USER = os.environ.get('DB_USER') or 'root'
    DB_PASSWORD = os.environ.get('DB_PASSWORD') or ''
    DB_NAME = os.environ.get('DB_NAME') or 'smart_traffic_db'
    
    # Upload Settings
    UPLOAD_FOLDER = 'static/uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}
    
    # YOLO Model Settings
    YOLO_MODEL = 'yolov8n.pt'  # Options: yolov8n.pt, yolov8s.pt, yolov8m.pt
    CONFIDENCE_THRESHOLD = 0.5
    
    # Traffic Signal Settings (in seconds)
    MIN_GREEN_TIME = 15
    MAX_GREEN_TIME = 60
    EMERGENCY_GREEN_TIME = 90
    YELLOW_TIME = 3
    
    # Lane Configuration
    NUM_LANES = 4
    LANE_NAMES = {
        'lane1': 'North',
        'lane2': 'East',
        'lane3': 'South',
        'lane4': 'West'
    }
    
    # Refresh Intervals (in milliseconds)
    DASHBOARD_REFRESH_INTERVAL = 5000
    EMERGENCY_CHECK_INTERVAL = 2000
    
    # Analytics Settings
    HISTORY_RETENTION_DAYS = 30
    MAX_CHART_POINTS = 20

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    # In production, use environment variables for sensitive data

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DB_NAME = 'smart_traffic_test_db'

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
