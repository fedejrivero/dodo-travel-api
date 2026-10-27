-- Dodo Travel - Database initializer
-- Basado en los modelos en `models/*.js`.
--
-- IMPORTANTE: este script es DESTRUCTIVO: elimina y recrea las tablas del esquema `dodo_travel`.
-- Usalo solo en entornos donde sea seguro reinicializar la base.

CREATE DATABASE IF NOT EXISTS dodo_travel
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dodo_travel;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS deposits;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS service_documents;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS file_passengers;
DROP TABLE IF EXISTS files;
DROP TABLE IF EXISTS passengers;
DROP TABLE IF EXISTS operators;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS rates;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- Auth
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Website trips (public)
CREATE TABLE trips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category ENUM('Nacional Bus', 'Nacional Aereo', 'Internacional', 'Grupal') NOT NULL,
  dates JSON NOT NULL,
  price INT NOT NULL,
  currency ENUM('USD', '$') NOT NULL,
  description TEXT,
  amenities JSON,
  image_url VARCHAR(512),
  image_filename VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_trips_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  nights INT NOT NULL,
  busBed VARCHAR(255),
  regime VARCHAR(255),
  assist VARCHAR(255),
  excursions VARCHAR(255),
  price INT NOT NULL,
  trip_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_rates_trip (trip_id),
  CONSTRAINT fk_rates_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BackOffice - Reservas
CREATE TABLE clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dni INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  surname VARCHAR(255) NOT NULL,
  cuil BIGINT NULL,
  birthday DATE NOT NULL,
  mail VARCHAR(255),
  phone BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_clients_dni (dni),
  INDEX idx_clients_cuil (cuil)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE passengers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  dni INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  surname VARCHAR(255) NOT NULL,
  birthday DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_passengers_client (client_id),
  CONSTRAINT fk_passenger_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE operators (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cuit BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_operators_cuit (cuit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  creation_date DATE NOT NULL,
  date_out DATE NOT NULL,
  date_in DATE NULL,
  status ENUM('Completo', 'Incompleto', 'Deprecado') NOT NULL DEFAULT 'Incompleto',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_files_client (client_id),
  CONSTRAINT fk_file_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Relación entre fichas y pasajeros (solo pasajeros del mismo client_id)
CREATE TABLE file_passengers (
  file_id INT NOT NULL,
  passenger_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (file_id, passenger_id),
  INDEX idx_file_passengers_file (file_id),
  INDEX idx_file_passengers_passenger (passenger_id),
  CONSTRAINT fk_file_passengers_file FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
  CONSTRAINT fk_file_passengers_passenger FOREIGN KEY (passenger_id) REFERENCES passengers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_id INT NOT NULL,
  operator_id INT NOT NULL,
  type ENUM('Vuelo', 'Hospedaje', 'Asistencia', 'Paquete', 'Otro') NOT NULL,
  description TEXT NOT NULL,
  bill VARCHAR(512) NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency ENUM('$', 'USD') NOT NULL,
  conversion DECIMAL(12,6) NULL,
  status ENUM('Completo', 'Incompleto', 'Deprecado') NOT NULL DEFAULT 'Incompleto',
  cost DECIMAL(12,2) NULL,
  bank_expense DECIMAL(12,2) NULL,
  revenue DECIMAL(12,2) NULL,
  date_out DATE NOT NULL,
  date_in DATE NULL,
  date_profitability DATE NULL,
  `file` VARCHAR(512) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_services_file (file_id),
  INDEX idx_services_operator (operator_id),
  CONSTRAINT fk_service_file FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
  CONSTRAINT fk_service_operator FOREIGN KEY (operator_id) REFERENCES operators(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE service_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_id INT NOT NULL,
  document_type ENUM('reservation', 'invoice', 'receipt', 'liquidation') NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INT UNSIGNED NOT NULL,
  file_data MEDIUMBLOB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_service_documents_service_type (service_id, document_type),
  CONSTRAINT fk_service_documents_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_id INT NOT NULL,
  date DATE NOT NULL,
  value DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency ENUM('$', 'USD') NOT NULL,
  type ENUM('tranferencia', 'efectivo', 'Credito') NOT NULL DEFAULT 'efectivo',
  detail VARCHAR(512) NULL,
  receipt VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_payments_file (file_id),
  CONSTRAINT fk_payment_file FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE deposits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_id INT NOT NULL,
  date DATE NOT NULL,
  value DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency ENUM('$', 'USD') NOT NULL,
  type ENUM('tranferencia', 'efectivo') NOT NULL,
  receipt VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_deposits_service (service_id),
  CONSTRAINT fk_deposit_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BackOffice - Gastos
CREATE TABLE expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  description VARCHAR(512) NOT NULL,
  value DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency ENUM('$', 'USD') NOT NULL DEFAULT 'USD',
  conversion DECIMAL(12,6) NULL,
  is_from_fede TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_expenses_is_from_fede CHECK (is_from_fede IN (0, 1)),
  INDEX idx_expenses_date (date),
  INDEX idx_expenses_currency (currency)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
