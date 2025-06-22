<template>
  <div :id="plantId" class="view-container">
    <!-- Modal -->
    <div v-if="showModal.valueOf() && editingPlant" class="modal-overlay">
      <div class="modal-content bg-gray-900 rounded-lg p-4">
        <button @click="showModal = false"
                class="close-button bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded">
          <span>X</span></button>
        <PlantEditForm
            :plant="editingPlant"
            @cancelEdit="cancelEdit"
            @saved="plantSaved"
        />
      </div>
    </div>

    <div class="container mx-auto p-4 max-w-7xl">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="flex items-center space-x-2">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p class="text-white">Loading plant details...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center text-red-400 bg-gray-800 p-4 rounded-lg">
        <p>Error loading plant data: {{ error }}</p>
        <button @click="fetchPlantDetails"
                class="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded">
          Retry
        </button>
      </div>

      <!-- Plant Details -->
      <div v-else-if="plantDetails" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Left Column: Info & Image -->
        <div class="md:col-span-1 bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-2xl font-bold text-white">{{ plantDetails.name }}</h2>
            <!-- Add Edit Button Here Later -->
          </div>

          <!-- Current Moisture Gauge -->
          <div v-if="plantDetails.sensor_id">
            <h3 class="text-lg font-semibold text-white mb-2">Current Moisture</h3>
            <MoistureGauge
                :current-value="plantDetails.last_moisture?.value ?? null"
                :water-when-under-pct="plantDetails.water_when_under_pct"
                :stop-watering-when-pct="plantDetails.stop_watering_when_pct"
                :too-much-water-pct="plantDetails.too_much_water_pct"
            />
          </div>
          <p v-else class="text-gray-400 text-sm my-4">No sensor assigned.</p>

          <!-- Image -->
          <div class="flex-grow flex items-center justify-center my-4">
            <div :style="{ backgroundImage: `url(${getImageUrl(plantDetails)})` }"
                 class="octagon"></div>
          </div>

          <!-- Other Details -->
          <div class="text-sm space-y-1 text-gray-300 mt-auto">
            <p v-if="plantDetails.botanical_name">Botanical Name: {{ plantDetails.botanical_name }}</p>
            <p>Location: {{ plantDetails.location_room || 'N/A' }} / {{ plantDetails.location_stand || 'N/A' }} /
              {{ plantDetails.location_shelf_num || 'N/A' }}</p>

            <p v-if="plantDetails.sensor_id && plantDetails.sensor_id != 0">
              <span class="text-gray-400">Sensor: </span>
              <router-link :to="{ name: 'sensor', params: { id: plantDetails.sensor_id }}"
                           class="text-blue-400 hover:underline">
                {{ plantDetails.sensor?.name || plantDetails.sensor_id }}
              </router-link>
            </p>
            <p v-if="plantDetails.device_name?.[0]?.name">
              <span class="text-gray-400">Device: </span>
              <router-link :to="{ name: 'device', params: { id: plantDetails.device_name[0].id }}"
                           class="text-blue-400 hover:underline">
                {{ plantDetails.device_name[0].name }}
              </router-link>
            </p>
            <p v-if="plantDetails.light_hours_per_day"><span
                class="text-gray-400">Light: </span>{{ plantDetails.light_hours_per_day }} hrs/day</p>
            <p v-if="plantDetails.pot_size_cm"><span class="text-gray-400">Pot: </span>{{ plantDetails.pot_size_cm }} CM
            </p>

            <p>Last Seen: {{ formatTimeAgo(plantDetails.since_last_seen) }}</p>
            <p v-if="formatDate(plantDetails.adoption_date).length != 0"><span
                class="text-gray-400">Adopted: </span>{{ formatDate(plantDetails.adoption_date) }}</p>
            <p v-if="formatDate(plantDetails.last_repot_date).length != 0"><span class="text-gray-400">Repotted: </span>{{
                formatDateTime(plantDetails.last_repot_date)
              }}</p>
            <!-- Add other relevant details -->
          </div>

          <div class="flex justify-between items-center mb-6">
            <div class="flex space-x-2">
              <button @click="openModal(plantDetails)"
                      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Edit
              </button>
              <button v-if="plantDetails?.id"
                      @click="deletePlant(plantDetails.id)"
                      class="bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded">
                Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Right Column: History Chart & Actions -->
        <div class="md:col-span-2 bg-gray-800 rounded-lg shadow-lg p-6">
          <div v-if="plantDetails.sensor_id">
            <h3 class="text-lg font-semibold text-white mb-4">Moisture History</h3>
            <div class="flex justify-center space-x-2 mb-4">
              <button @click="fetchHistory('1d')" :class="historyDuration === '1d' ? 'bg-blue-600' : 'bg-gray-600'"
                      class="hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">1 Day
              </button>
              <button @click="fetchHistory('7d')" :class="historyDuration === '7d' ? 'bg-blue-600' : 'bg-gray-600'"
                      class="hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">7 Days
              </button>
              <button @click="fetchHistory('30d')" :class="historyDuration === '30d' ? 'bg-blue-600' : 'bg-gray-600'"
                      class="hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">30 Days
              </button>
            </div>
            <div v-if="historyLoading" class="text-center text-gray-400">Loading history...</div>
            <div v-else-if="historyError" class="text-center text-red-400">{{ historyError }}</div>
            <BaseChart v-else :options="chartOptions" theme="gray" style="height: 400px;"/>
          </div>
          <div v-else class="flex items-center justify-center h-full">
            <p class="text-gray-500">Assign a sensor to view history.</p>
          </div>

          <!-- Calibration Section (Placeholder) -->
          <div class="mt-6 border-t border-gray-700 pt-4">
            <h3 class="text-lg font-semibold text-white mb-2">Calibration</h3>
            <button v-if="plantDetails.sensor_id" @click="startCalibration"
                    class="bg-purple-500 hover:bg-purple-700 text-white px-4 py-2 rounded">
              Calibrate Sensor
            </button>
            <p v-else class="text-gray-500 text-sm">Assign a sensor to enable calibration.</p>
          </div>

        </div>

        <!-- Requirements Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <!-- Light Requirements Card -->
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-white mb-4">Light Requirements</h3>
            <div class="space-y-3">
              <div v-if="plantDetails.light_lux_min || plantDetails?.light_lux_max"
                   class="flex justify-between items-center">
                <span class="text-gray-400">Light Level:</span>
                <span class="text-white">{{ plantDetails?.light_lux_min }} - {{
                    plantDetails?.light_lux_max
                  }} Lux</span>
              </div>
              <div v-if="plantDetails?.light_duration_min_hrs || plantDetails?.light_duration_max_hrs"
                   class="flex justify-between items-center">
                <span class="text-gray-400">Daily Duration:</span>
                <span class="text-white">{{
                    plantDetails?.light_duration_min_hrs
                  }} - {{ plantDetails?.light_duration_max_hrs }} hours</span>
              </div>
            </div>
          </div>

          <!-- Care Requirements Card -->
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-white mb-4">Care Requirements</h3>
            <div class="space-y-3">
              <div v-if="plantDetails?.preferred_humidity_min_pct || plantDetails?.preferred_humidity_max_pct"
                   class="flex justify-between items-center">
                <span class="text-gray-400">Humidity Range:</span>
                <span class="text-white">{{
                    plantDetails?.preferred_humidity_min_pct
                  }}% - {{ plantDetails?.preferred_humidity_max_pct }}%</span>
              </div>
              <div v-if="plantDetails?.should_use_distilled_water"
                   class="flex items-center text-yellow-400">
                <span class="icon mr-2">💧</span>
                <span>Requires distilled water</span>
              </div>
              <div v-if="plantDetails?.needs_more_attention"
                   class="flex items-center text-red-400">
                <span class="icon mr-2">⚠️</span>
                <span>Needs extra attention</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Care Notes Card -->
        <div v-if="plantDetails?.notes" class="md:col-span-2 bg-gray-800 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Care Notes</h3>
          <p class="text-white whitespace-pre-line">{{ plantDetails?.notes }}</p>
        </div>

      </div>

      <div v-else class="text-center text-gray-400">
        Plant not found.
      </div>
    </div>

    <!-- Add Plant FAB -->
    <div
        class="fixed bottom-8 right-8 bg-green-500 hover:bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-colors duration-200"
        @click="addNewPlant">
      <svg xmlns="http://www.w3.org/2000/svg"
           class="h-8 w-8"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
      </svg>
    </div>

    <CalibrationModal
        v-if="showCalibrationModal && plantDetails?.sensor_id"
        :sensor-id="plantDetails.sensor_id"
        @close="closeCalibrationModal"
        @calibrationComplete="onCalibrationComplete"
    />
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref, shallowRef, watch} from 'vue';
import {useRoute} from 'vue-router';
import axios from 'axios';
import type {Plant, PlantDetails} from '@/types/ApiInterfaces';
import {formatDate, formatDateTime, formatTimeAgo} from '@/utils/timeHelpers';
// import { getImageUrl } from '@/utils/imageHelpers'; // Assuming you have this, Nope I do not, but I do need it
import MoistureGauge from '@/components/MoistureGauge.vue'; // Import the new gauge
import BaseChart from '@/components/charts/BaseChart.vue'; // Import base chart
import * as Highcharts from 'highcharts';
import {getImageUrl} from "@/utils/plantHelpers";
import PlantEditForm from "@/components/PlantEditForm.vue";
import CalibrationModal from '@/components/CalibrationModal.vue';

const route = useRoute();
const plantId = computed(() => route.params.id as string);

const plantDetails = ref<PlantDetails | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
let refreshInterval: number | undefined;
const showModal = ref(false);
const editingPlant = ref<PlantDetails | null>(null);

const historyData = ref<number[][]>([]); // Array of [timestamp_ms, value]
const historyLoading = ref(false);
const historyError = ref<string | null>(null);
const historyDuration = ref<string>('7d'); // Default history view
const currentThemeOptions = shallowRef<Highcharts.Options | null>(null);

const showCalibrationModal = ref(false);

// --- Fetching Plant Details ---
const fetchPlantDetails = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await axios.get<PlantDetails>(`/api/plant/${plantId.value}`);
    plantDetails.value = response.data;
    // If sensor exists, fetch initial history
    if (plantDetails.value?.sensor_id) {
      await fetchHistory(historyDuration.value); // Fetch default history on load
    }
  } catch (err: any) {
    console.error('Error fetching plant details:', err);
    error.value = err.response?.data?.error || err.message || 'Failed to load plant data.';
    plantDetails.value = null;
  } finally {
    loading.value = false;
  }
};

// --- Fetching History Data ---
const fetchHistory = async (duration: string) => {
  // const themeModule = await import(`highcharts/themes/gray`);
  // themeModule.factory(Highcharts)
  // Reset any existing theme first
  // Highcharts.setOptions({});

  // Import theme module
  // const themeModule = await import(`highcharts/themes/gray`);

  // const factoryFn = themeModule.default || themeModule.factory; // <--- Key change here

  // if (factoryFn && typeof factoryFn === 'function') {
  //   factoryFn(Highcharts); // Apply theme using the found factory function
  //   currentThemeOptions.value = Highcharts.getOptions(); // Capture the theme-specific options
  // } else {
  //   currentThemeOptions.value = null; // Reset to default
  // }

  if (!plantDetails.value?.id) return; // Need plant ID
  historyLoading.value = true;
  historyError.value = null;
  historyDuration.value = duration; // Store selected duration
  try {
    const response = await axios.get<number[][]>(`/api/plant/${plantDetails.value.id}/history?duration=${duration}`);
    historyData.value = response.data;
  } catch (err: any) {
    console.error(`Error fetching ${duration} history:`, err);
    historyError.value = `Failed to load ${duration} history.`;
    historyData.value = [];
  } finally {
    historyLoading.value = false;
  }
};


const addNewPlant = () => {
  openModal(null);
};

const openModal = (plant: Plant | null) => {
  editingPlant.value = plant ? {...plant} : null; // Create a copy
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingPlant.value = null;
};

const cancelEdit = () => {
  closeModal();
};

const plantSaved = () => {
  closeModal();
  fetchPlantDetails();
};

const deletePlant = async (id: number) => {
  if (!id) return;
  try {
    await axios.delete(`/api/plant/${id}`);
    // this.fetchPlants();
    // $emit('afterSave')
  } catch (error) {
    console.error('Error deleting plant:', error);
  }
};

// --- Chart Options ---
const chartOptions = computed<Highcharts.Options>(() => {
  const plotLines: Highcharts.YAxisPlotLinesOptions[] = [];

  // Add "Water When Under" plot line if defined
  if (plantDetails.value && typeof plantDetails.value.water_when_under_pct === 'number') {
    plotLines.push({
      value: plantDetails.value.water_when_under_pct,
      color: '#f97316', // Tailwind orange-500 (adjust color as needed)
      width: 2,
      label: {
        text: `Dry (${plantDetails.value.water_when_under_pct}%)`,
        align: 'right',
        x: -5, // Position label slightly left of the line
        style: {
          color: '#f97316',
          fontWeight: 'bold'
        }
      },
      zIndex: 3 // Ensure line is visible
    });
  }

  // Add "Too Much Water" plot line if defined
  if (plantDetails.value && typeof plantDetails.value.too_much_water_pct === 'number') {
    plotLines.push({
      value: plantDetails.value.too_much_water_pct,
      color: '#3b82f6', // Tailwind blue-500 (adjust color as needed)
      width: 2,
      label: {
        text: `Too Wet (${plantDetails.value.too_much_water_pct}%)`,
        align: 'right',
        x: -5, // Position label slightly left of the line
        style: {
          color: '#3b82f6',
          fontWeight: 'bold'
        }
      },
      zIndex: 3 // Ensure line is visible
    });
  }

  return {
    chart: {
      type: 'line',
      zoomType: 'x',
    },
    title: {
      text: `Moisture History (${historyDuration.value})`,
      style: {color: '#e0e0e0'}
    },
    xAxis: {
      type: 'datetime',
      labels: {style: {color: '#a0a0a0'}},
      title: {text: 'Time', style: {color: '#a0a0a0'}}
    },
    yAxis: {
      title: {text: 'Moisture (%)', style: {color: '#a0a0a0'}},
      labels: {style: {color: '#a0a0a0'}},
      min: 0,
      max: 100,
      gridLineColor: '#404040',
      plotLines: plotLines
    },
    legend: {enabled: false},
    tooltip: {
      pointFormat: 'Moisture: <b>{point.y:.0f}%</b>',
      xDateFormat: '%Y-%m-%d %H:%M',
    },
    series: [{
      type: 'line',
      name: 'Moisture',
      data: historyData.value,
      color: '#60a5fa' // Series color (Tailwind blue-400)
    }] as Highcharts.SeriesLineOptions[],
  };
});

// --- Calibration ---
const startCalibration = () => {
  if (!plantDetails.value?.sensor_id) return;
  showCalibrationModal.value = true;
};

const closeCalibrationModal = () => {
  showCalibrationModal.value = false;
};

const onCalibrationComplete = () => {
  closeCalibrationModal();
  fetchPlantDetails(); // Refresh plant data to get new calibration values
};

// --- Lifecycle Hooks ---
onMounted(() => {
  fetchPlantDetails();
  // Set up interval to refresh current plant data (e.g., every 30 seconds)
  refreshInterval = window.setInterval(async () => {
    if (!loading.value && plantId.value) { // Only refresh if not already loading
      try {
        const response = await axios.get<PlantDetails>(`/api/plant/${plantId.value}`);
        // Only update relevant parts to avoid full re-render if possible
        if (plantDetails.value) {
          plantDetails.value.last_moisture = response.data.last_moisture;
          plantDetails.value.since_last_seen = response.data.since_last_seen;
          // Update other fields if necessary
        }
      } catch (err) {
        console.warn("Failed to auto-refresh plant data:", err);
        // Optionally show a small, non-intrusive error indicator
      }
    }
  }, 30000); // Refresh every 30 seconds
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

// Watch for route changes if users navigate between plants directly
watch(plantId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    fetchPlantDetails();
  }
});

</script>

<style scoped>
@import "@/utils/modal.css";
/* Re-add octagon styles if they were removed */
.octagon {
  width: 150px; /* Adjust as needed */
  height: 150px; /* Make it square */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  clip-path: polygon(
      30% 0%, 70% 0%, /* Top */ 100% 30%, 100% 70%, /* Right */ 70% 100%, 30% 100%, /* Bottom */ 0% 70%, 0% 30% /* Left */
  );
}

/* Add any other specific styles */
</style>