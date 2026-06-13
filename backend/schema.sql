CREATE DATABASE IF NOT EXISTS fastx;
USE fastx;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  gender VARCHAR(20),
  phone VARCHAR(20),
  address TEXT,
  role ENUM('user','operator','admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE routes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  operator_id INT NOT NULL,
  bus_name VARCHAR(100) NOT NULL,
  bus_number VARCHAR(50) NOT NULL,
  bus_type ENUM('sleeper_ac','sleeper_non_ac','seat_ac','seat_non_ac') NOT NULL,
  total_seats INT NOT NULL,
  origin VARCHAR(100) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  fare DECIMAL(10,2) NOT NULL,
  amenities JSON,
  FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  route_id INT NOT NULL,
  travel_date DATE NOT NULL,
  seats JSON NOT NULL,
  total_fare DECIMAL(10,2) NOT NULL,
  status ENUM('confirmed','cancelled','refunded') DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);
