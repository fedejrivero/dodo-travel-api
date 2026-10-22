-- Ejecutar una sola vez después de desplegar el backend que usa services.file.
-- Conserva los identificadores antiguos antes de retirar services.liquidation.

ALTER TABLE services
  MODIFY COLUMN `file` VARCHAR(512) NULL;

UPDATE services
SET `file` = `liquidation`
WHERE `liquidation` IS NOT NULL
  AND TRIM(`liquidation`) <> ''
  AND (`file` IS NULL OR TRIM(`file`) = '');

ALTER TABLE services
  DROP COLUMN `liquidation`;
