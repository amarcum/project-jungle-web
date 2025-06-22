// src/components/charts/BaseChart.vue
<template>
  <Chart :options="finalChartOptions" ref="highchartsRef"></Chart>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Highcharts from 'highcharts';
import { Chart } from 'highcharts-vue';
// Import the composable to get the reactivity trigger
import { useHighchartsTheme } from '@/composables/useHighchartsTheme';

const props = defineProps<{
  options: Highcharts.Options;
}>();

const highchartsRef = ref<any>(null);
// Get the reactive signal from the composable
const { themeVersion } = useHighchartsTheme();

const finalChartOptions = computed<Highcharts.Options>(() => {
  // This line makes the computed property "listen" for theme changes.
  // When themeVersion changes, this code re-runs, and the chart gets new options.
  themeVersion.value;

  const themeOptions = Highcharts.getOptions();

  // Deep merge the options for a more robust combination.
  return {
    ...themeOptions,
    ...props.options,
    // Explicitly merge nested objects to combine theme and prop settings
    chart: {
      ...themeOptions.chart,
      ...props.options.chart,
    },
    plotOptions: {
      ...themeOptions.plotOptions,
      ...props.options.plotOptions,
    },
    // Global overrides that should always apply
    credits: { enabled: false },
    exporting: { enabled: true },
    accessibility: { enabled: false },
  };
});
</script>