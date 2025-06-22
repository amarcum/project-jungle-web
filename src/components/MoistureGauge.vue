<template>
  <div>
    <div class="w-full bg-gray-700 rounded-full h-6 relative overflow-hidden my-4">
      <!-- Background Zones -->
      <div v-if="isValidRange" class="absolute top-0 bottom-0 bg-red-800"
           :style="{ left: '0%', width: dryZoneWidth }"></div>
      <div v-if="isValidRange" class="absolute top-0 bottom-0 bg-green-600"
           :style="{ left: okZoneStart, width: okZoneWidth }"></div> <!-- Use okZoneStart and okZoneWidth -->
      <div v-if="isValidRange && tooWetZoneWidthNum > 0" class="absolute top-0 bottom-0 bg-blue-700"
           :style="{ left: tooWetZoneStart, width: tooWetZoneWidth }"></div> <!-- Use tooWetZoneStart -->

      <!-- Current Value Indicator -->
      <div v-if="currentValue !== null && currentValue >= 0 && currentValue <= 100"
           class="absolute top-0 bottom-0 w-1 bg-white shadow-md z-10"
           :style="{ left: `${currentValue}%` }">
        <!-- Removed -left-2.5, adjusted positioning slightly -->
        <!-- <div class="absolute +top-10 left-[-5px] text-xs text-white bg-black bg-opacity-50 px-1 rounded whitespace-nowrap"> -->
        <div class="absolute text-xs text-white bg-black bg-opacity-50 px-2 rounded whitespace-nowrap">
          {{ currentValue }}%
        </div>
      </div>

      <!-- Invalid Range Indicator -->
      <div v-if="!isValidRange" class="absolute inset-0 flex items-center justify-center bg-gray-600">
        <span class="text-white text-xs font-semibold">Invalid Thresholds</span>
      </div>
      <div v-else-if="currentValue === null" class="absolute inset-0 flex items-center justify-center bg-gray-600">
        <span class="text-white text-xs font-semibold">No Reading</span>
      </div>
    </div>
    <div v-if="isValidRange" class="flex justify-between text-xs text-gray-400 px-1">
      <span>Dry ({{ dryThreshold }}%)</span> <!-- Use computed threshold -->
      <span>OK</span>
      <span>Too Wet ({{ wetThreshold }}%)</span> <!-- Use computed threshold -->
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';

const props = defineProps<{
  currentValue: number | null; // The current moisture percentage (0-100)
  waterWhenUnderPct?: number | null; // Dry threshold (e.g., 30)
  tooMuchWaterPct?: number | null; // Too Wet threshold (e.g., 80)
}>();

// --- Default values ---
const defaultDry = 0;
const defaultWet = 100;

// --- Computed values for thresholds, using defaults if null/undefined ---
const dryThreshold = computed(() => props.waterWhenUnderPct ?? defaultDry);
const wetThreshold = computed(() => props.tooMuchWaterPct ?? defaultWet);

// --- Validation ---
const isValidRange = computed(() => {
  // Ensure thresholds are valid numbers and dry < wet
  return typeof dryThreshold.value === 'number' &&
      typeof wetThreshold.value === 'number' &&
      dryThreshold.value < wetThreshold.value &&
      dryThreshold.value >= 0 &&
      wetThreshold.value <= 100;
});

// --- Zone Width Calculations ---
const dryZoneWidthNum = computed(() => {
  if (!isValidRange.value) return 0;
  return dryThreshold.value; // Width is simply the threshold value
});

const okZoneWidthNum = computed(() => {
  if (!isValidRange.value) return 0;
  // Width is the difference between wet and dry thresholds
  return wetThreshold.value - dryThreshold.value;
});

const tooWetZoneWidthNum = computed(() => {
  if (!isValidRange.value) return 0;
  // Width is from the wet threshold to 100
  return 100 - wetThreshold.value;
});

// --- CSS Style Strings ---
const dryZoneWidth = computed(() => `${dryZoneWidthNum.value}%`);
const okZoneWidth = computed(() => `${okZoneWidthNum.value}%`); // Renamed from wetZoneWidth
const tooWetZoneWidth = computed(() => `${tooWetZoneWidthNum.value}%`);

// --- Zone Starting Positions ---
const okZoneStart = computed(() => dryZoneWidth.value); // OK zone starts where dry zone ends
const tooWetZoneStart = computed(() => `${dryThreshold.value + okZoneWidthNum.value}%`); // Too Wet starts where OK ends

</script>

