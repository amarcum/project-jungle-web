export type PlantWaterStatus =
    | 'ok'           // Within normal range
    | 'dry'          // Below water_when_under_pct
    | 'wet'          // Above too_much_water_pct
    | 'config_error' // Thresholds are illogical (e.g., water_when_under >= stop_watering)
    | 'no_sensor'    // No sensor assigned
    | 'no_reading';  // Sensor assigned, but no recent reading available or reading invalid