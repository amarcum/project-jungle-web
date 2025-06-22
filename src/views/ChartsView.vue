// src/views/ChartsView.vue
<template>
  <div class="p-4">
    <!-- Theme Selector -->
    <div class="mb-6 max-w-xs">
      <label for="theme-select" class="block text-white mb-2 font-medium">Select Theme:</label>
      <select v-model="selectedTheme" id="theme-select" class="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option v-for="theme in themeOptions" :value="theme.value" :key="theme.value ?? 'default'">{{ theme.label }}</option>
      </select>
    </div>

    <!-- Charts Container using Tailwind CSS -->
    <div class="flex flex-wrap -m-2">
      <!-- Left Column -->
      <div class="w-full lg:w-1/2 p-2">
        <div class="bg-gray-800 rounded-lg shadow p-4 h-full flex flex-col">
          <h2 class="text-white text-xl font-semibold mb-4">Moisture Chart</h2>
          <MoistureChart class="flex-grow min-h-[400px]"/>
        </div>
      </div>

      <!-- Right Column -->
      <div class="w-full lg:w-1/2 p-2">
        <div class="flex flex-col space-y-4 h-full">
          <div class="bg-gray-800 rounded-lg shadow p-4 flex-grow flex flex-col">
            <h2 class="text-white text-xl font-semibold mb-4">Summary Stats</h2>
            <SummaryStatsChart class="flex-grow min-h-[300px]" />
          </div>
          <div class="bg-gray-800 rounded-lg shadow p-4 flex-grow flex flex-col">
            <h2 class="text-white text-xl font-semibold mb-4">Sensor Issues</h2>
            <SensorIssues class="flex-grow min-h-[300px]" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'; // <-- Add watch
import MoistureChart from '@/components/charts/MoistureChart.vue';
import SummaryStatsChart from '@/components/charts/SummaryStatsChart.vue';
import SensorIssues from '@/components/charts/SensorIssues.vue';
import { useHighchartsTheme } from '@/composables/useHighchartsTheme';

// Get the function to set the theme
const { setTheme } = useHighchartsTheme();

// Theme options - Ensure values match the filenames in highcharts/themes/ (without .js)
interface ThemeOption {
  label: string;
  value: string | null;
}
const themeOptions: ThemeOption[] = [
  { label: 'Dark Unica', value: 'dark-unica' },
  { label: 'Gray', value: 'gray' },
  { label: 'Dark Blue', value: 'dark-blue' },
  { label: 'Dark Green', value: 'dark-green' },
  { label: 'Default', value: null },
  { label: 'Brand Dark', value: 'brand-dark' },
  { label: 'Grid', value: 'grid' },
  { label: 'Sand Signika', value: 'sand-signika' },
  { label: 'Skies', value: 'skies' },
  { label: 'Sunset', value: 'sunset' },
];

// Set a default theme
const selectedTheme = ref<string | null>('dark-unica');

// Watch for changes in the dropdown and call our global theme setter.
// `immediate: true` ensures the initial theme is set on component load.
watch(selectedTheme, (newTheme) => {
  setTheme(newTheme);
}, { immediate: true });
</script>
