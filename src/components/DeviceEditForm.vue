<template>
  <div class="max-w-md mx-auto p-4 bg-gray-900 rounded-lg shadow" v-if="showForm">
    <h2 class="text-lg font-bold mb-4 text-center text-white">
      Edit Device
    </h2>
    <form @submit.prevent="saveDevice" class="space-y-4">
      <div>
        <label for="devName" class="block text-white mb-2">Device Name:</label>
        <input v-model="device.name" id="devName" type="text"
               class="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md" required/>
      </div>
      <div>
        <label for="location_room" class="block text-white mb-2">Room:</label>
        <input v-model="device.location_room" id="location_room" type="text"
               class="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md"/>
      </div>
      <div>
        <label for="location_stand" class="block text-white mb-2">Stand:</label>
        <input v-model="device.location_stand" id="location_stand" type="text"
               class="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md"/>
      </div>
      <div>
        <label for="location_shelf_num" class="block text-white mb-2">Shelf #:</label>
        <input v-model="device.location_shelf_num" id="location_shelf_num" type="number"
               class="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md"/>
      </div>
      <div>
        <label for="model" class="block text-white mb-2">Model Friendly Name:</label>
        <input v-model="device.model" id="model" type="text"
               class="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md"/>
      </div>
      <div>
        <label for="is_enabled" class="block text-white mb-2">Is Enabled: </label>
        <div @click="toggleIsActive" :class="{ 'bg-green-500': device.is_enabled, 'bg-gray-300': !device.is_enabled, }"
             class="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200">
          <span :class="{   'translate-x-6': device.is_enabled, 'translate-x-1': !device.is_enabled,  }"
                class="inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200"
          ></span>
        </div>
      </div>
      <div class="text-center space-x-4">
        <button type="submit"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Save
        </button>
        <button type="button" @click="cancelEdit"
                class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';
import axios from 'axios';
import type {Device} from '@/types/ApiInterfaces.ts';

export default defineComponent({
  name: 'DeviceEditForm',
  props: {
    device: {
      type: Object as PropType<Device> | null,
      required: true,
    },
  },
  emits: ['saved', 'cancelEdit'],
  data() {
    return {
      // device: {} as Device,
      showForm: true,
    };
  },
  methods: {
    async saveDevice() {
      try {
        const deviceToSave = {
          ...this.device,
          hardware_id: this.device.hardware_id?.toString(),
          parent_hardware_id: this.device.parent_hardware_id?.toString(),
        };
        await axios.put(`/api/device/${this.device.id}`, deviceToSave);
        this.$emit('saved');
      } catch (error) {
        console.error('Error saving device:', error);
      }
    },
    cancelEdit() {
      this.resetForm();
      this.$emit('cancelEdit'); // Emit event to notify parent
    },
    resetForm() {
      // this.device = {} as Device;
      this.showForm = false;
    },
    // Function to toggle is_active
    toggleIsActive() {
      this.device.is_enabled = !this.device.is_enabled;
    },

  },
});
</script>
