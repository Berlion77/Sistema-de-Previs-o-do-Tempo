-- Migração para renomear a coluna reservada `condition` em weather_alerts

ALTER TABLE weather_alerts
  CHANGE COLUMN `condition` alert_condition VARCHAR(50) NOT NULL COMMENT 'rain,snow,storm,temp_above,temp_below';
