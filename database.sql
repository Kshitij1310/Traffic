-- ============================================================
-- Smart Traffic Optimization System - Database Schema
-- B.Tech Final Year Project
-- ============================================================

-- Create database
CREATE DATABASE IF NOT EXISTS smart_traffic_db;
USE smart_traffic_db;

-- ============================================================
-- Table: traffic_logs
-- Purpose: Store real-time traffic density data from all lanes
-- ============================================================
CREATE TABLE IF NOT EXISTS traffic_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lane_id VARCHAR(20) NOT NULL,
    vehicle_count INT NOT NULL,
    timestamp DATETIME NOT NULL,
    INDEX idx_lane_id (lane_id),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: emergency_logs
-- Purpose: Track emergency vehicle detections and overrides
-- ============================================================
CREATE TABLE IF NOT EXISTS emergency_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    detected BOOLEAN NOT NULL DEFAULT FALSE,
    timestamp DATETIME NOT NULL,
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: signal_timings
-- Purpose: Store AI-calculated signal timing history
-- ============================================================
CREATE TABLE IF NOT EXISTS signal_timings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lane_id VARCHAR(20) NOT NULL,
    green_time INT NOT NULL,
    red_time INT NOT NULL,
    vehicle_count INT NOT NULL,
    timestamp DATETIME NOT NULL,
    INDEX idx_lane_id (lane_id),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: vehicle_detections
-- Purpose: Store detailed vehicle type detections
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicle_detections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lane_id VARCHAR(20) NOT NULL,
    vehicle_type ENUM('car', 'bus', 'truck', 'motorcycle', 'other') NOT NULL,
    detection_time DATETIME NOT NULL,
    confidence FLOAT NOT NULL,
    INDEX idx_lane_id (lane_id),
    INDEX idx_vehicle_type (vehicle_type),
    INDEX idx_detection_time (detection_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: system_stats
-- Purpose: Store daily system statistics for analysis
-- ============================================================
CREATE TABLE IF NOT EXISTS system_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_vehicles INT NOT NULL DEFAULT 0,
    emergency_events INT NOT NULL DEFAULT 0,
    avg_wait_time FLOAT NOT NULL DEFAULT 0,
    peak_hour VARCHAR(10),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Insert sample data for testing and demonstration
-- ============================================================

-- Sample traffic logs (last hour simulation)
INSERT INTO traffic_logs (lane_id, vehicle_count, timestamp) VALUES
('lane1', 15, DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
('lane2', 8, DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
('lane3', 22, DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
('lane4', 12, DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
('lane1', 18, DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
('lane2', 10, DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
('lane3', 25, DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
('lane4', 14, DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
('lane1', 12, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
('lane2', 6, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
('lane3', 19, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
('lane4', 9, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
('lane1', 20, DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
('lane2', 13, DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
('lane3', 28, DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
('lane4', 16, DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
('lane1', 17, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
('lane2', 11, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
('lane3', 24, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
('lane4', 13, DATE_SUB(NOW(), INTERVAL 10 MINUTE));

-- Sample emergency logs
INSERT INTO emergency_logs (detected, timestamp) VALUES
(TRUE, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(TRUE, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(TRUE, DATE_SUB(NOW(), INTERVAL 8 HOUR));

-- Sample signal timings
INSERT INTO signal_timings (lane_id, green_time, red_time, vehicle_count, timestamp) VALUES
('lane1', 30, 90, 15, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
('lane2', 15, 105, 8, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
('lane3', 45, 75, 22, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
('lane4', 30, 90, 12, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
('lane1', 45, 75, 20, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
('lane2', 30, 90, 13, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
('lane3', 60, 60, 28, DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
('lane4', 30, 90, 16, DATE_SUB(NOW(), INTERVAL 15 MINUTE));

-- Sample vehicle detections
INSERT INTO vehicle_detections (lane_id, vehicle_type, detection_time, confidence) VALUES
('lane1', 'car', DATE_SUB(NOW(), INTERVAL 5 MINUTE), 0.95),
('lane1', 'car', DATE_SUB(NOW(), INTERVAL 5 MINUTE), 0.89),
('lane1', 'bus', DATE_SUB(NOW(), INTERVAL 5 MINUTE), 0.92),
('lane2', 'motorcycle', DATE_SUB(NOW(), INTERVAL 5 MINUTE), 0.87),
('lane2', 'car', DATE_SUB(NOW(), INTERVAL 5 MINUTE), 0.91),
('lane3', 'truck', DATE_SUB(NOW(), INTERVAL 5 MINUTE), 0.88),
('lane3', 'car', DATE_SUB(NOW(), INTERVAL 5 MINUTE), 0.94),
('lane3', 'car', DATE_SUB(NOW(), INTERVAL 5 MINUTE), 0.90),
('lane4', 'car', DATE_SUB(NOW(), INTERVAL 5 MINUTE), 0.93),
('lane4', 'motorcycle', DATE_SUB(NOW(), INTERVAL 5 MINUTE), 0.86);

-- Initialize system stats for today
INSERT INTO system_stats (date, total_vehicles, emergency_events, avg_wait_time, peak_hour)
VALUES (CURDATE(), 0, 0, 0, 'N/A')
ON DUPLICATE KEY UPDATE date=date;

-- ============================================================
-- Useful Queries for Dashboard and Analytics
-- ============================================================

-- Query 1: Get current traffic status (last 5 minutes)
-- SELECT lane_id, AVG(vehicle_count) as avg_count 
-- FROM traffic_logs 
-- WHERE timestamp > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
-- GROUP BY lane_id;

-- Query 2: Get peak traffic hours
-- SELECT HOUR(timestamp) as hour, AVG(vehicle_count) as avg_vehicles
-- FROM traffic_logs
-- GROUP BY HOUR(timestamp)
-- ORDER BY avg_vehicles DESC
-- LIMIT 5;

-- Query 3: Get emergency event count today
-- SELECT COUNT(*) as emergency_count
-- FROM emergency_logs
-- WHERE DATE(timestamp) = CURDATE();

-- Query 4: Get vehicle type distribution
-- SELECT vehicle_type, COUNT(*) as count
-- FROM vehicle_detections
-- WHERE detection_time > DATE_SUB(NOW(), INTERVAL 1 HOUR)
-- GROUP BY vehicle_type;

-- Query 5: Get average signal timing by lane
-- SELECT lane_id, AVG(green_time) as avg_green, AVG(red_time) as avg_red
-- FROM signal_timings
-- GROUP BY lane_id;

-- ============================================================
-- Database Setup Complete
-- ============================================================

-- Display confirmation message
SELECT 'Database setup completed successfully!' AS Status;
SELECT 'Tables created: traffic_logs, emergency_logs, signal_timings, vehicle_detections, system_stats' AS Info;
SELECT COUNT(*) AS Sample_Traffic_Records FROM traffic_logs;
SELECT COUNT(*) AS Sample_Emergency_Records FROM emergency_logs;
