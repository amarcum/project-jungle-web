<template>
  <div class="max-w-md mx-auto p-4 bg-gray-800 rounded-lg shadow">
    <h2 class="text-lg font-bold mb-4 text-center text-white">
      Edit Sensor
    </h2>
    <form @submit.prevent="saveSensor" class="space-y-4" v-if="editableSensor">
      <div>
        <label for="name" class="block text-white mb-2">Sensor Name</label>
        <input v-model="editableSensor.name" id="name" type="text"
               class="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md" required/>
      </div>
      <div>
        <label for="model" class="block text-white mb-2">Model Name</label>
        <input v-model="editableSensor.model" id="model" type="text"
               class="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md"/>
      </div>
      <div>
        <label for="is_enabled" class="block text-white mb-2">Is Enabled</label>
        <div role="switch"
             :aria-checked="editableSensor.is_enabled"
             tabindex="0"
             @click="toggleIsEnabled"
             @keydown.space.prevent="toggleIsEnabled"
             :class="{ 
               'bg-green-500': editableSensor.is_enabled, 
               'bg-gray-300': !editableSensor.is_enabled 
             }"
             class="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200">
          <span :class="{ 
                  'translate-x-6': editableSensor.is_enabled, 
                  'translate-x-1': !editableSensor.is_enabled 
                }"
                class="inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200"
                aria-hidden="true">
          </span>
        </div>
      </div>
      <div v-if="errorMessage" class="text-red-500 text-center">
        {{ errorMessage }}
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

<script setup lang="ts">
import { ref, watch } from 'vue';
import axios from 'axios';
import type { Sensor } from '@/types/ApiInterfaces';

const props = defineProps<{
  sensor: Sensor | null
}>();

const emit = defineEmits<{
  saved: []
  cancelEdit: []
}>();

const editableSensor = ref<Sensor | null>(null);
const errorMessage = ref<string | null>(null);

watch(() => props.sensor, (newSensor) => {
  if (!newSensor) return;
  // Deep copy to avoid modifying the original prop
  editableSensor.value = JSON.parse(JSON.stringify(newSensor));
}, { immediate: true, deep: true });

const toggleIsEnabled = () => {
  if (!editableSensor.value) return;
  editableSensor.value.is_enabled = !editableSensor.value.is_enabled;
};

const saveSensor = async () => {
  if (!editableSensor.value) return;
  try {
    errorMessage.value = null;
    await axios.put(`/api/sensor/${editableSensor.value.id}`, editableSensor.value);
    emit('saved');
  } catch (error) {
    console.error('Error saving sensor:', error);
    errorMessage.value = 'Failed to save sensor. Please try again.';
  }
};

const cancelEdit = () => {
  editableSensor.value = null;
  errorMessage.value = null;
  emit('cancelEdit');
};
</script>