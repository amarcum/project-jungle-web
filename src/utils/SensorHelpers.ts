import {PlantDetails, Sensor, SensorDetail} from "@/types/ApiInterfaces.js";
import axios from "axios";

export function moisturePercent(sensorD: Sensor | SensorDetail | PlantDetails | null): number {
    if (!sensorD) {
        return -1;
    }
    // PlantDetails - Uses pre-calculated value from API
    if ('last_moisture' in sensorD) {
        if (!sensorD.last_moisture) {
            return -1;
        }
        // Clamp API value just in case
        return Math.max(0, Math.min(100, sensorD.last_moisture.value));
    }

    let sen: Sensor | null | undefined = null;
    // SensorDetail
    if ('sensor' in sensorD) {
        sen = sensorD.sensor;
    }
    // Sensor
    else if ('raw_val' in sensorD) {
        sen = sensorD;
    }

    if (!sen) {
        return -1; // No valid sensor object found
    }

    const min = sen.min_raw_val;
    const max = sen.max_raw_val;
    const current = sen.raw_val;
    const range = max - min;

    if (range <= 0) { // Invalid range
        return -1;
    }

    // Clamp current value to the defined range
    const clampedCurrent = Math.max(min, Math.min(max, current));

    // Inverted percentage calculation
    const percent = ((max - clampedCurrent) / range) * 100;

    // Clamp final percentage and floor it
    return Math.floor(Math.max(0, Math.min(100, percent)));
}

export function moistureLevel(sensorD: Sensor | SensorDetail | PlantDetails | null): string {
    if (!sensorD) {
        return "";
    }
    const percent = moisturePercent(sensorD)
    if (percent < 0) {
        return ""
    }
    return "💧" + percent + "%";
}


export function deviceName(sensor: Sensor | SensorDetail): string {
    if (!sensor) {
        return "";
    }
    if ('device' in sensor) {
        if (!sensor.device) {
            return "";
        }
        return sensor.device.name;
    }
    return "";

}

export function getSensorById(id: number): SensorDetail | null {
    if (id == 0) {
        return null;
    }
    console.log(`Fetching sensor...`);
    try {
        console.log(`Fetching sensor with id ${id}...`);
        const response = axios.get<SensorDetail>(`/api/sensor/${id}`);
        console.log("Response: ", response);

    } catch (error) {
        console.error('Error fetching sensor:', error);
    }
    return null;
}
