-- Create database
CREATE DATABASE IF NOT EXISTS dodo_travel;
USE dodo_travel;

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category ENUM('Nacional Bus', 'Nacional Aereo', 'Internacional', 'Grupal') NOT NULL,
  dates JSON NOT NULL,
  price INT NOT NULL,
  currency ENUM('USD', '$') NOT NULL,
  amenities JSON,
  image_url VARCHAR(512),
  image_filename VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data
INSERT INTO trips (name, category, dates, price, currency, amenities) VALUES
('Paquete Playa', 'Nacional Aereo', '["2024-01-15", "2024-01-22"]', 250000, '$', '["Desayuno incluido", "Traslado aeropuerto", "Asistencia médica"]'),
('Aventura en la Montaña', 'Nacional Bus', '["2024-02-10", "2024-02-20"]', 180000, '$', '["Guía turístico", "Almuerzo incluido", "Seguro de viaje"]'),
('Europa Clásica', 'Internacional', '["2024-03-05", "2024-03-20"]', 3200, 'USD', '["Vuelos internacionales", "Hoteles 4 estrellas", "Tours guiados"]');
