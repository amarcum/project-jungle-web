<template>
  <div>
    <BaseChart :options="chartOptions"/>
    <div v-if="loading">Loading chart data...</div>
    <div v-if="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseChart from '@/components/charts/BaseChart.vue';
import { type SeriesOptionsType } from 'highcharts';
import { useSummaryData, type SummaryData } from '@/composables/useSummaryData';

// Use the composable to get shared state and data
const { loading, error, summaryData } = useSummaryData();

const chartOptions = computed<Highcharts.Options>(() => ({
  chart: {
    type: 'column',
  },
  title: {
    text: 'Summary Statistics',
  },
  xAxis: {
    categories: ["Total", "Enabled", "Active"],
  },
  yAxis: {
    title: { text: 'Count' },
    min: 0,
    allowDecimals: false,
  },
  tooltip: {
    shared: true,
    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y}</b></td></tr>',
    footerFormat: '</table>',
    useHTML: true
  },
  plotOptions: {
    column: {
      pointPadding: 0.2,
      borderWidth: 0
    }
  },
  series: mapApiDataToSeries(summaryData.value), // Use data from the composable
}));

const mapApiDataToSeries = (data: SummaryData | null): SeriesOptionsType[] => {
  const stats = data?.stats;
  if (!stats) return [];
  // The API does not provide a separate 'active' count for plants.
  // 'enabled' is the equivalent of 'active' for this series.
  const activePlants = stats.total_enabled_plants || 0;
  return [
    {
      type: 'column',
      name: 'Plants',
      data: [
        stats.total_plants || 0,
        stats.total_enabled_plants || 0,
        activePlants
      ]
    },
    {
      type: 'column',
      name: 'Devices',
      data: [
        stats.total_devices || 0,
        stats.total_enabled_devices || 0,
        stats.total_active_devices || 0
      ]
    },
    {
      type: 'column',
      name: 'Sensors',
      data: [
        stats.total_sensors || 0,
        stats.total_enabled_sensors || 0,
        stats.total_active_sensors || 0
      ]
    }
  ];
};

</script>
