<template>
  <div class="container mx-auto p-4 max-w-6xl">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-white">Sensor Details</h2>
      <div class="flex space-x-2">
        <button @click="editSensor(sensorD?.sensor)"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Edit
        </button>
        <button @click="calibrateSensor" 
                class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
          Calibrate
        </button>
        <button @click="deleteSensor" 
                class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Delete
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="flex items-center space-x-2">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p class="text-white">Loading sensor details...</p>
      </div>
    </div>

    <div v-else-if="sensorD" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Main Info Card -->
      <div class="bg-gray-800 rounded-lg shadow-lg p-6 space-y-3 text-gray-300 text-sm">
        <h3 class="text-lg font-semibold text-white mb-4">Sensor Information</h3>
        <div class="flex justify-between">
          <span class="text-gray-400">Name:</span>
          <span class="text-white">{{ sensorD.sensor.name }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Status:</span>
          <span :class="[
            'px-2 py-1 rounded-full text-sm',
            sensorD.sensor.is_enabled ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
          ]">
            {{ sensorD.sensor.is_enabled ? 'Active' : 'Inactive' }}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Last Seen:</span>
          <span class="text-white">{{ formatTimeAgo(sensorD.since_last_seen) }}</span>
        </div>
      </div>

      <!-- Calibration Card -->
      <div class="bg-gray-800 rounded-lg shadow-lg p-6 space-y-3 text-gray-300 text-sm">
        <h3 class="text-lg font-semibold text-white mb-4">Calibration Values</h3>

        <div class="relative pt-6">
          <!-- Value Scale -->
          <div class="absolute left-0 right-0 h-2 bg-gray-600 rounded">
            <div class="absolute h-full bg-blue-500 rounded"
                 :style="{ left: moisturePercent(sensorD) + '%',
                          right: (100 - moisturePercent(sensorD)) + '%' }">
            </div>
            <!-- Current Value Marker -->
            <div class="absolute w-4 h-4 bg-white rounded-full -mt-1 transform -translate-x-1/2"
                 :style="{ left: moisturePercent(sensorD) + '%' }">
            </div>
          </div>
          <!-- Value Labels -->
          <div class="flex justify-between mt-4 text-sm">
            <span class="text-gray-400">Max Raw 0%: {{ sensorD.sensor.max_raw_val }}</span>
            <span class="text-white">Current Raw {{ moisturePercent(sensorD) }}%: {{ sensorD.sensor.raw_val }}</span>
            <span class="text-gray-400">Min Raw 100%: {{ sensorD.sensor.min_raw_val }}</span>
          </div>
        </div>
      </div>

      <!-- Associated Plants -->
      <div class="bg-gray-800 rounded-lg shadow-lg p-6 md:col-span-2">
        <h3 class="text-lg font-semibold text-white mb-4">Associated Plants</h3>
        <div v-if="sensorD.plants_brief?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="plant in sensorD.plants_brief" :key="plant.id"
               class="bg-gray-700 rounded-lg p-4">
            <RouterLink :to="{ name: 'plant', params: { id: plant.id }}"
                       class="text-blue-400 hover:text-blue-300">
              {{ plant.name }}
            </RouterLink>
          </div>
        </div>
        <p v-else class="text-gray-400">No plants associated with this sensor</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { formatTimeAgo } from '@/utils/timeHelpers';
import type {Sensor, SensorDetail} from '@/types/ApiInterfaces';
import {moisturePercent} from "@/utils/SensorHelpers";

const router = useRouter();
const route = useRoute();
const sensorD = ref<SensorDetail | null>(null);
const loading = ref(true);
const editingSensor = ref<Sensor | null>(null);

const fetchSensor = async () => {
  try {
    const response = await axios.get(`/api/sensor/${route.params.id}`);
    sensorD.value = response.data;
  } catch (error) {
    console.error('Error fetching sensor:', error);
  } finally {
    loading.value = false;
  }
};

const calibrateSensor = async () => {
  if (!confirm('Start calibration? Make sure you have water and a dry towel ready.')) return;
  
  try {
    await axios.post(`/api/sensor/${route.params.id}/calibrate`);
    alert('Calibration started! Follow these steps\n1. Dip sensor in water\n2. Wait for reading to stabilize\n3. Wipe sensor completely dry\n4. Wait for reading to stabilize');
    await fetchSensor(); // Refresh data after calibration
  } catch (error) {
    console.error('Error starting calibration:', error);
    alert('Failed to start calibration');
  }
};

const editSensor = async (sensor: Sensor | null = null) => {
  editingSensor.value = sensor;
};

const deleteSensor = async () => {
  if (!confirm('Are you sure you want to delete this sensor?')) return;
  
  try {
    await axios.delete(`/api/sensor/${route.params.id}`);
    await router.push({name: 'sensor'});
  } catch (error) {
    console.error('Error deleting sensor:', error);
    alert('Failed to delete sensor');
  }
};

onMounted(fetchSensor);
</script>

<style>
@import "@/utils/modal.css";
</style>