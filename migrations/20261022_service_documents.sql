-- Ejecutar una sola vez en la base de datos activa de Dodo Travel.
-- Agrega el identificador del operador mayorista y la tabla de adjuntos binarios.

ALTER TABLE services
  ADD COLUMN `file` VARCHAR(255) NULL AFTER date_profitability;

CREATE TABLE service_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_id INT NOT NULL,
  document_type ENUM('invoice', 'receipt', 'liquidation') NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INT UNSIGNED NOT NULL,
  file_data MEDIUMBLOB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_service_documents_service_type (service_id, document_type),
  CONSTRAINT fk_service_documents_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
