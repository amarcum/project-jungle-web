<template>
  <div>
    <BaseChart :options="chartOptions"/>
    <div v-if="loading">Loading chart data...</div>
    <div v-if="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import BaseChart from '@/components/charts/BaseChart.vue';
import type { PointOptionsObject } from 'highcharts';
import {SensorMoistureHistory} from "@/types/ApiInterfaces";
import axios from "axios";
import { type SeriesLineOptions } from 'highcharts';

const loading = ref(true);
const error = ref<string | null>(null);
const apiData = ref<SensorMoistureHistory[]>([]); // Store raw API data

// Use computed property for chart options for reactivity
const chartOptions = computed<Highcharts.Options>(() => ({
  chart: {
    type: 'line',
    zoomType: 'x',
  },
  title: {
    text: 'Moisture Levels',
  },
  xAxis: {
    type: 'datetime',
    title: {
      text: 'Time',
    },
  },
  yAxis: {
    title: {
      text: 'Moisture (%)',
    },
  },
  tooltip: {
    shared: true, // Show tooltip for all series at a point
    crosshairs: true
  },
  series: mapApiDataToSeries(apiData.value), // Use the mapping function
}));

// Function to map API data to Highcharts series format
const mapApiDataToSeries = (sensors: SensorMoistureHistory[]): SeriesLineOptions[] => {
  if (!sensors) return [];

  return sensors.map((sensor): SeriesLineOptions => {
    // Ensure history is an array before mapping
    const historyData = sensor.history ?? [];

    // Map history points, converting timestamp string to milliseconds
    const dataPoints: PointOptionsObject[] = historyData.map((point) => ({
      x: new Date(point.timestamp).getTime(),
      y: point.value,
    }));

    return {
      type: 'line',
      name: sensor.sensor_brief.name || `Sensor ${sensor.sensor_brief.id}`,
      data: dataPoints,
    };
  }).filter((series): series is SeriesLineOptions => 
    Boolean(series.data && series.data.length > 0)
  );
};

onMounted(async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await axios.get<SensorMoistureHistory[]>('/api/sensors/moisture/history');
    if (Array.isArray(response.data)) {
      apiData.value = response.data;
    } else {
      console.warn("Received unexpected data format for moisture history:", response.data);
      apiData.value = []; // Reset or handle appropriately
      error.value = "Received unexpected data format.";
    }
  } catch (err: any) {
    console.error('Error fetching moisture history:', err);
    error.value = `Failed to load moisture data: ${err.message}`;
    apiData.value = []; // Clear data on error
  } finally {
    loading.value = false;
  }
});

</script>