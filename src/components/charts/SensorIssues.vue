<template>
  <div>
    <BaseChart :options="chartOptions" />
    <div v-if="loading">Loading chart data...</div>
    <div v-if="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import BaseChart from '@/components/charts/BaseChart.vue';
import type { PointClickEventObject, PointOptionsObject, SeriesOptionsType } from 'highcharts';
import { useSummaryData, type SummaryData } from '@/composables/useSummaryData';

const router = useRouter();
// Use the composable to get shared state and data
const { loading, error, summaryData } = useSummaryData();

const chartOptions = computed<Highcharts.Options>(() => ({
  chart: {
    type: 'pie',
  },
  title: {
    text: 'Sensor Issues & Status'
  },
  tooltip: {
    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b> ({point.y})'
  },
  plotOptions: {
    pie: {
      allowPointSelect: true,
      cursor: 'pointer',
      dataLabels: {
        enabled: true,
        format: '<b>{point.name}</b>: {point.percentage:.0f} %'
      },
      point: {
        events: {
          click: (event: PointClickEventObject) => {
            const reason = (event.point as any).name as string;
            if (reason) {
              router.push({ name: 'sensorList', query: { reason: reason } });
            }
          }
        }
      }
    }
  },
  series: mapApiDataToSeries(summaryData.value), // Use data from the composable
}));

const mapApiDataToSeries = (data: SummaryData | null): SeriesOptionsType[] => {
  if (!data) return [];

  const reasonCounts: { [key: string]: number } = {};

  if (data.sensor_issues && Array.isArray(data.sensor_issues)) {
    data.sensor_issues.forEach(sensor => {
      const reason = sensor.reason || 'Unknown Reason';
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });
  }

  const unattachedCount = data.active_sensors_not_attached_to_plant_count ?? 0;
  if (unattachedCount > 0) {
    reasonCounts["Active sensors not attached"] = unattachedCount;
  }

  const chartData: PointOptionsObject[] = Object.entries(reasonCounts)
      .map(([reason, count]): PointOptionsObject => ({ name: reason, y: count }))
      .filter(point => (point.y ?? 0) > 0);

  if (chartData.length === 0) {
    return [{
      type: 'pie',
      name: 'Status',
      data: [{ name: 'No Issues Found', y: 1, color: '#a6a6a6' }]
    }];
  }

  return [{
    type: 'pie',
    name: 'Issues',
    data: chartData
  }];
};

// No onMounted needed here anymore!
</script>