-- Agrega Reserva como tipo de documento asociado a un servicio.
ALTER TABLE service_documents
  MODIFY COLUMN document_type ENUM('reservation', 'invoice', 'receipt', 'liquidation') NOT NULL;
