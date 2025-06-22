<template>
  <div class="modal-overlay">
    <div class="modal-content bg-gray-900 rounded-lg p-6 max-w-3xl w-full mx-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-semibold text-white">Sensor Calibration</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white">
          <span class="text-2xl">×</span>
        </button>
      </div>

      <!-- Calibration Steps -->
      <div class="space-y-6">
        <!-- Progress Steps -->
        <div class="flex justify-between mb-8">
          <div v-for="(step, index) in steps" :key="index"
               class="flex flex-col items-center flex-1">
            <div :class="`w-8 h-8 rounded-full flex items-center justify-center
                         ${currentStep === index ? 'bg-blue-500' :
                           currentStep > index ? 'bg-green-500' : 'bg-gray-600'}`">
              {{ index + 1 }}
            </div>
            <div class="text-sm text-gray-400 mt-2 text-center">{{ step.title }}</div>
          </div>
        </div>

        <!-- Current Step Content -->
        <div class="bg-gray-800 rounded-lg p-4">
          <h4 class="text-lg font-semibold text-white mb-4">{{ steps[currentStep].title }}</h4>
          <p class="text-gray-300 mb-4">{{ steps[currentStep].instructions }}</p>

          <!-- Live Chart -->
          <div v-if="sensorId" class="mb-4 h-64">
            <BaseChart :options="chartOptions"/>
          </div>

          <!-- Current Reading -->
          <div class="text-center mb-4">
            <span class="text-gray-400">Current Reading: </span>
            <span v-if="currentReading" class="text-2xl font-bold text-white">{{ currentReading.raw_value }} Raw Val (maybe {{ currentReading.moisture }}%)</span>
            <p v-if="currentReading" class="text-sm text-white">Sensor raw min {{ currentReading.sensor_min_raw }} max {{ currentReading.sensor_max_raw }}</p>
          </div>

          <!-- Status Message -->
          <div v-if="statusMessage"
               :class="[
                 'text-center p-2 rounded mb-4',
                 messageType === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
               ]">
            {{ statusMessage }}
          </div>

          <!-- Stability Indicator -->
          <div class="flex items-center justify-center gap-2 mb-4">
            <span class="text-gray-400">Stability: </span>
            <div class="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div :style="`width: ${stabilityPercentage}%`"
                   :class="`h-full transition-all duration-300
                           ${isStable ? 'bg-green-500' : 'bg-yellow-500'}`">
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex justify-between mt-6">
          <button v-if="currentStep > 0"
                  @click="previousStep"
                  class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
            Back
          </button>
          <button v-if="currentStep < steps.length - 1"
                  :disabled="!isStable"
                  @click="nextStep"
                  :class="`px-4 py-2 rounded text-white
                          ${isStable ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 cursor-not-allowed'}`">
            Next
          </button>
          <button v-else
                  @click="finishCalibration"
                  class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
            Complete Calibration
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref} from 'vue';
import BaseChart from '@/components/charts/BaseChart.vue';
import type {Options, SeriesOptionsType} from 'highcharts';
import {
  CalibrationData,
  CalibrationMessage, HistoricalData,
  PlantWsCalibration, PlantWsCalibrationHistory,
  PlantWsError,
  PlantWsInfo,
  WsComms
} from "@/types/ApiInterfaces";

interface ReadingPoint {
  timestamp: number;
  value: number;
}

const props = defineProps<{
  sensorId: number;
}>();

const emit = defineEmits(['close', 'calibrationComplete']);

const steps = [
  {
    title: 'Prepare Sensor',
    instructions: 'Remove the sensor from soil and clean it gently with a dry cloth.',
    action: null
  },
  {
    title: 'Wet Calibration',
    instructions: 'Submerge the sensor in water and wait for the reading to stabilize.',
    action: 'set_wet'
  },
  {
    title: 'Dry Calibration',
    instructions: 'Remove from water, dry the sensor completely with a cloth, and wait for reading to stabilize.',
    action: 'set_dry'
  },
  {
    title: 'Complete',
    instructions: 'Calibration complete! You can now return the sensor to the soil.',
    action: null
  }
];

const currentStep = ref(0);
const currentReading = ref<CalibrationData | null>(null);
const readings = ref<ReadingPoint[]>([]);
const isStable = ref(false);
const stabilityPercentage = ref(0);
const statusMessage = ref('');
const messageType = ref<'info' | 'error' | null>(null);
let ws: WebSocket | null = null;

// Chart configuration
const chartOptions = computed<Options>(() => ({
  chart: {
    type: 'line',
    animation: false,
    height: 250
  },
  title: {text: 'Live Readings'},
  xAxis: {
    type: 'datetime',
    labels: {style: {color: '#a0a0a0'}}
  },
  yAxis: {
    title: {text: 'Moisture Raw Val', style: {color: '#a0a0a0'}},
    min: 0,
    max: 1000
  },
  series: [{
    type: 'line', // Explicitly specify type
    name: 'Moisture',
    data: readings.value.map(r => [r.timestamp, r.value]),
    color: '#60a5fa'
  }] as SeriesOptionsType[]
}));


// WebSocket connection
const connectWebSocket = () => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  let connectHost = window.location.host; // Default to current host (e.g., localhost:5173 for dev, localhost:9000 for local prod, plants.jarvis for full prod)

  // Vite provides `import.meta.env.DEV` (true in dev) and `import.meta.env.PROD` (true in prod builds)
  if (import.meta.env.PROD) {
    // This is a production build.
    // If testing locally where hostname is 'localhost' and the frontend is served on a port
    // different from the backend's WebSocket port (9004), adjust the host.
    if (window.location.hostname === 'localhost' && window.location.port !== '9004') {
      // As per your Vite proxy, backend WS is on 9004.
      // Your log shows frontend on localhost:9000 for local prod test.
      connectHost = 'localhost:9004';
    }
    // If deployed (e.g., to plants.jarvis), connectHost remains window.location.host.
    // In this case, your reverse proxy (Traefik) is responsible for routing
    // requests like ws://plants.jarvis/ws/... to the actual backend service (e.g., 10.0.0.20:9004).
  }
  // In development (import.meta.env.DEV is true), connectHost remains window.location.host (e.g., localhost:5173).
  // Vite's dev server proxy will correctly forward /ws requests to localhost:9004.

  const wsUrl = `${wsProtocol}//${connectHost}/ws/calibrate/${props.sensorId}`;
  console.log('Connecting to WebSocket:', wsUrl);

  ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    try {
      const comm = JSON.parse(event.data as string) as WsComms;
      console.log("we got ", comm.type, ": ", event.data, " with ", comm);

      if (comm.type === PlantWsCalibrationHistory) {
        // Handle initial historical data
        const historicalData = comm as HistoricalData;
        if (!historicalData.historical) {
          return;
        }
        for (const reading of historicalData.historical) {
          const newReading: ReadingPoint = {
            timestamp: new Date(Number(reading.timestamp)).getTime(),
            value: reading.raw_value
          };
          readings.value.push(newReading);
        }
        console.log("Reading: ", comm.type, " with ", historicalData);
        if (readings.value.length > 0) {
          currentReading.value = historicalData.historical[historicalData.historical.length - 1];
          calculateStability();
        }
      } else if (comm.type === PlantWsCalibration) {
        const cal = comm as CalibrationData;
        if (!cal) {
          return;
        }
        console.log("Reading: ", cal.type, " with ", cal.moisture, " at ", cal.timestamp, " which is ", new Date(Number(cal.timestamp)).toLocaleString());
        currentReading.value = cal;
        const localTimestamp = new Date(Number(cal.timestamp)).getTime();
        const newReading: ReadingPoint = {
          timestamp: localTimestamp,
          value: cal.raw_value
        };
        readings.value.push(newReading);

        // Keep only 30 seconds of readings
        const thirtySecondsAgo = localTimestamp - 30000;
        readings.value = readings.value.filter(reading => reading.timestamp > thirtySecondsAgo);
        calculateStability();
      } else if (comm.type === PlantWsInfo || comm.type === PlantWsError) {
        const data = comm as CalibrationMessage;
        console.log("  --we got ", data.type, ": ", data.message);
        statusMessage.value = data.message;
        // Correctly set messageType based on the incoming data's type
        messageType.value = data.type === PlantWsError ? 'error' : 'info';
        setTimeout(() => {
          statusMessage.value = '';
          messageType.value = null;
        }, 5000);
      }
    } catch (err) {
      console.error('Error processing WebSocket message:', err);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    statusMessage.value = 'Connection error. Please try again.';
    messageType.value = 'error';
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
  };
};

const calculateStability = () => {
  if (readings.value.length < 10) return;

  // Calculate variance of last 10 readings
  const last10 = readings.value.slice(-10).map(r => r.value);
  const mean = last10.reduce((a, b) => a + b) / 10;
  const variance = last10.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 10;

  // Consider stable if variance is less than 2
  isStable.value = variance < 5;
  stabilityPercentage.value = Math.min(100, Math.max(0, (2 - variance) * 50));
};

// Update the nextStep function to handle calibration points
const nextStep = async () => {
  if (!isStable.value || currentStep.value >= steps.length - 1) return;
  const step = steps[currentStep.value];
  if (step.action && ws) {
    try {
      ws.send(JSON.stringify({type: step.action}));
      // Message feedback will be handled by onmessage event
    } catch (err) {
      console.error('Failed to send calibration command:', err);
      statusMessage.value = 'Failed to set calibration point';
      messageType.value = 'error';
      return;
    }
  }
  currentStep.value++;
  readings.value = []; // Clear readings for next step
  isStable.value = false;
};

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
    readings.value = [];
    isStable.value = false;
  }
};

const finishCalibration = async () => {
  if (ws) ws.close();
  emit('calibrationComplete');
};

onMounted(() => {
  connectWebSocket();
});

onUnmounted(() => {
  if (ws) ws.close();
});

</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  max-height: 90vh;
  overflow-y: auto;
}
</style>