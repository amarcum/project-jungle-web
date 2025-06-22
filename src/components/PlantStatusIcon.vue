<template>
  <div v-if="status !== 'ok'" :title="statusTitle" class="w-6 h-6 rounded-full flex items-center justify-center" :class="statusClass">
    <!-- Water Drop (Dry) -->
    <svg v-if="status === 'dry'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M19.333 8A7.99 7.99 0 0012 4.07M4.667 8A7.99 7.99 0 0112 4.07" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 12.5l-1.76-1.76a2.5 2.5 0 10-3.54 3.54L12 19.5l5.3-5.22a2.5 2.5 0 00-3.54-3.54L12 12.5z" opacity="0.6"/> <!-- Faded heart/drop -->
    </svg>
    <!-- Flood/Excess Water (Wet) -->
    <svg v-if="status === 'wet'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.116 6.022A5.982 5.982 0 0110 5.5c.814 0 1.582.165 2.288.463.41.176.335.79-.14 1.017a3.98 3.98 0 00-4.295 0c-.475-.227-.55-.841-.14-1.017zm-.64 2.08A7.958 7.958 0 0110 7.5a7.958 7.958 0 012.525.502c.41.176.336.79-.14 1.017a3.98 3.98 0 00-4.77 0c-.475-.227-.55-.841-.14-1.017zM10 14a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" clip-rule="evenodd" />
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
    <!-- Warning/Config Error -->
    <svg v-if="status === 'config_error'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M8.257 3.099c.624-1.23 2.86-1.23 3.484 0l5.48 10.826c.473.934-.16 2.075-1.22 2.075H3.996c-1.06 0-1.692-1.141-1.22-2.075L8.257 3.099zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
    </svg>
    <!-- Question Mark (No Sensor/Reading) -->
    <svg v-if="status === 'no_sensor' || status === 'no_reading'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import type { PlantWaterStatus } from '@/types/PlantStatus';

export default defineComponent({
  name: 'PlantStatusIcon',
  props: {
    status: {
      type: String as PropType<PlantWaterStatus>,
      required: true,
    },
  },
  setup(props) {
    const statusClass = computed(() => {
      switch (props.status) {
        case 'dry': return 'bg-orange-500';
        case 'wet': return 'bg-blue-400';
        case 'config_error': return 'bg-red-500';
        case 'no_sensor':
        case 'no_reading':
          return 'bg-gray-500';
        case 'ok':
        default: return 'bg-transparent'; // No background for 'ok'
      }
    });

    const statusTitle = computed(() => {
      switch (props.status) {
        case 'dry': return 'Needs Watering';
        case 'wet': return 'Too Wet';
        case 'config_error': return 'Configuration Error (Check thresholds)';
        case 'no_sensor': return 'No Sensor Assigned';
        case 'no_reading': return 'No Recent Sensor Reading';
        case 'ok':
        default: return 'Status OK';
      }
    });

    return { statusClass, statusTitle };
  },
});
</script>
