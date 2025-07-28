<template>
  <div v-if="isLoadingSensors" class="flex justify-center items-center h-64">
    <div class="flex items-center space-x-2">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <p class="text-white">Loading Sensor List...</p>
    </div>
  </div>
  <div v-else class="mx-auto p-4 max-w-7xl">
    <SensorList :sensors="filteredSensors" @edit="openModal"/>
    <div v-if="showModal" class="modal-overlay">
      <div v-if="editingSensor" class="modal-content bg-gray-900 rounded-lg p-4">
        <button @click="showModal = false"
                class="close-button bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded">
          <span>X</span></button>
        <SensorEditForm
            :sensor="editingSensor"
            @cancelEdit="cancelEdit"
            @saved="saved"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import SensorList from '@/components/SensorList.vue';
import type {Sensor, SensorDetail} from "@/types/ApiInterfaces";
import axios from "axios";
import SensorEditForm from "@/components/SensorEditForm.vue";

export default defineComponent({
  name: 'SensorListView',
  components: {SensorEditForm, SensorList},
  data() {
    return {
      sensors: [] as SensorDetail[],
      isLoadingSensors: false,
      showModal: false,
      editingSensor: null as Sensor | null,
      showAllSensors: false, // New data property
    };
  },
  computed: {
    filteredSensors(): SensorDetail[] {
      if (this.showAllSensors) {
        return this.sensors;
      } else {
        return this.sensors.filter(sensor => sensor.sensor.is_enabled);
      }
    },
  },
  methods: {

    async fetchSensors() {
      this.isLoadingSensors = true;
      try {
        const response = await axios.get<SensorDetail[]>('/api/sensors/list');
        if (Array.isArray(response.data)) {
          this.sensors = response.data;
          this.sensors = this.sensors.sort((a: SensorDetail, b: SensorDetail) => {
            return ((a.sensor.name === undefined || a.sensor.name.length == 0) ? `${a.sensor.type_and_num} ${a.sensor.device_id}` : (`${a.sensor.name}`)).localeCompare(
                ((b.sensor.name === undefined || b.sensor.name.length == 0) ? `${b.sensor.type_and_num} ${b.sensor.device_id}` : (`${b.sensor.name}`)), 'en', {sensitivity: 'accent'}
            )
          });
          this.editingSensor = null;
        }
      } catch (error) {
        console.error('Error fetching sensors:', error);
      } finally {
        this.isLoadingSensors = false;
      }
    },
    editSensor(sensor: Sensor) {
      this.editingSensor = sensor;
      console.log("Edit sensor id: " + this.editingSensor.id);
    },
    saved() {
      this.cancelEdit();
      this.fetchSensors();
    },
    cancelEdit() {
      this.editingSensor = null; // Clear editing sensor
      this.showModal = false;
    },
    openModal(sensor: Sensor) {
      this.editingSensor = {...sensor}; // Create a copy
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    toggleShowAllSensors() { // New method
      this.showAllSensors = !this.showAllSensors;
    },
  },
  mounted() {
    this.fetchSensors();
  }

});
</script>

<style scoped>
@import "@/utils/modal.css";
</style>