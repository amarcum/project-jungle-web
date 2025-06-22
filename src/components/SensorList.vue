<template>
  <div class="container mx-auto p-4 max-w-6xl">
    <!-- Loading State -->
    <input type="checkbox" v-model="showAll"/> Show All
    <p v-if="selectedReason">Showing sensors with issue: {{ selectedReason }}</p>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="flex items-center space-x-2">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p class="text-white">Loading sensors...</p>
      </div>
    </div>

    <!-- Sensor Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="sensorD in sensorsDList" :key="sensorD.sensor.id"
           class="bg-gray-800 h-full rounded-lg shadow-lg overflow-hidden">
        <div class="p-6">
          <div class="flex  justify-between items-start mb-4">
            <h3 class="text-xl font-semibold text-white">{{ sensorD.sensor.name }}</h3>
            <span :class="[
              'px-2 py-1 text-sm rounded-full',
              sensorD.sensor.is_enabled ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
            ]">
              {{ sensorD.sensor.is_enabled ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <!-- Moisture Level -->
          <p v-if="moistureLevel(sensorD).length != 0" class="text-sm mb-2">{{ moistureLevel(sensorD) }}</p>
          <br v-else>

          <div class="flex-grow pr-8 text-sm text-gray-300">
            <p><span class="text-gray-400">Device:</span> {{ sensorD.device?.name || 'Not assigned' }}</p>
            <p><span class="text-gray-400">Last Seen:</span> {{ formatTimeAgo(sensorD.since_last_seen) }}</p>
            <p><span class="text-gray-400">Raw Value:</span> {{ sensorD.sensor.raw_val }}</p>
            <p><span class="text-gray-400">Range:</span> {{ sensorD.sensor.min_raw_val }} - {{ sensorD.sensor.max_raw_val }}</p>
          </div>

          <!-- Actions -->
          <div class="mt-auto pt-4 flex justify-end space-x-2 border-t border-gray-700">
            <RouterLink :to="{ name: 'sensor', params: { id: sensorD.sensor.id }}"
                        class="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Details
            </RouterLink>
            <button @click="calibrateSensor(sensorD.sensor.id)"
                    class="bg-purple-500 hover:bg-purple-700 text-white px-4 py-2 rounded">
              Calibrate
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import type {SensorDetail} from '@/types/ApiInterfaces';
import {formatTimeAgo} from "@/utils/timeHelpers";
import {moistureLevel} from "@/utils/SensorHelpers";

const router = useRouter();
const sensorsDList = ref<SensorDetail[]>([]);
const loading = ref(true);
const showAll = ref(false);
const selectedReason = ref(useRoute().query.reason as string | undefined);

const fetchSensors = async () => {
  try {
    const response = await axios.get('/api/sensors/list');
    sensorsDList.value = response.data;
  } catch (error) {
    console.error('Error fetching sensors:', error);
  } finally {
    loading.value = false;
  }
};

const calibrateSensor = async (sensorId: number) => {
  if (!confirm('Start calibration? Make sure you have water and a dry towel ready.')) return;
  
  try {
    await axios.post(`/api/sensor/${sensorId}/calibrate`);
    alert('Calibration started! Follow these steps:\n1. Dip sensor in water\n2. Wait for reading to stabilize\n3. Wipe sensor completely dry\n4. Wait for reading to stabilize');
  } catch (error) {
    console.error('Error starting calibration:', error);
    alert('Failed to start calibration');
  }
};

onMounted(fetchSensors);
</script>