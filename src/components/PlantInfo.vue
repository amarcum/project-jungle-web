<template>
  <div class="flex justify-between items-start mb-4">
    <router-link v-if="includeLink" :to="{ name: 'plant', params: { id: plant.id }}"
                 class="text-white-500 hover:underline">
      <h3 class="text-xl font-semibold text-white">{{ plant.name }}</h3>
    </router-link>
    <h3 v-else class="text-xl font-semibold text-white mb-1">{{ plant.name }} <span class="text-sm">{{ moistureLevel(plant) }}</span></h3>
  </div>

  <p v-if="statusText" class="text-sm mb-2" :class="statusTextColor">
    {{ statusText }}
  </p>

  <!-- Image -->
  <div :style="{ backgroundImage: `url(${getImageUrl(plant)})`}"
       class="flex flex-wrap items-center justify-between octagon mb-2"></div>

  <!-- Other Details -->
  <div class="text-sm space-y-1 text-gray-300">
    <p v-if="plant.botanical_name"><span class="text-gray-400">Botanical: </span>{{ plant.botanical_name }}</p>
    <p v-if="formatDate(plant.adoption_date).length != 0"><span class="text-gray-400">Adopted: </span>{{ formatDate(plant.adoption_date) }}</p>
    <p v-if="formatDate(plant.last_repot_date).length != 0"><span class="text-gray-400">Repotted: </span>{{ formatDateTime(plant.last_repot_date) }}</p>

    <div v-if="plant.location_room || plant.location_stand || plant.location_shelf_num">
      <span class="text-gray-400">Location: </span>{{ plant.location_room }} / {{ plant.location_stand }} / {{ plant.location_shelf_num }}
    </div>
    <p v-else><span class="text-gray-400">Location: </span>Not Set</p>

    <p v-if="plant.light_hours_per_day"><span class="text-gray-400">Light: </span>{{ plant.light_hours_per_day }} hrs/day</p>
    <p v-if="plant.pot_size_cm"><span class="text-gray-400">Pot: </span>{{ plant.pot_size_cm }} CM</p>
    <p v-if="plant.water_when_under_pct"><span class="text-gray-400">Water </span>< {{ plant.water_when_under_pct }}%</p>
    <p v-if="plant.stop_watering_when_pct"><span class="text-gray-400">Stop </span>@ {{ plant.stop_watering_when_pct }}%</p>
    <p v-if="plant.too_much_water_pct"><span class="text-gray-400">Too Wet </span> > {{ plant.too_much_water_pct }}%</p>

    <p v-if="plant.propagation_parent_id && plant.propagation_parent_id != 0">
      <router-link :to="{ name: 'plant', params: { id: plant.propagation_parent_id}}"
                   class="text-blue-400 hover:underline">
        Parent: {{ plant.propagation_parent_id }}
      </router-link>
    </p>
    <p v-if="plant.sensor_id && plant.sensor_id != 0">
      <span class="text-gray-400">Sensor: </span>
      <router-link :to="{ name: 'sensor', params: { id: plant.sensor_id }}"
                   class="text-blue-400 hover:underline">
        {{ plant.sensor?.name || plant.sensor_id }}
      </router-link>
    </p>
  </div>

</template>

<script lang="ts">
import {computed, defineComponent, PropType} from "vue";
import type {PlantDetails} from "@/types/ApiInterfaces";
import type {PlantWaterStatus} from '@/types/PlantStatus'; // Import status type
import {moistureLevel} from "@/utils/SensorHelpers.js";
import {formatDate, formatDateTime} from "@/utils/timeHelpers.js";
import {getImageUrl, getMoisturePct} from "@/utils/plantHelpers.js";
import PlantStatusIcon from "@/components/PlantStatusIcon.vue";

export default defineComponent({
  name: "PlantInfo",
  components: {PlantStatusIcon},
  props: {
    plant: {
      type: Object as PropType<PlantDetails> | null,
      required: true,
    },
    includeLink: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String as PropType<PlantWaterStatus>,
      required: false, // Make optional if PlantList calculates it
      default: 'ok',
    }
  },
  setup(props) {
    // Computed property for displaying status text (optional)
    const statusText = computed(() => {
      switch (props.status) {
        case 'dry':
          return 'Needs Watering!';
        case 'wet':
          return 'Too Wet!';
        case 'config_error':
          return 'Config Error!';
          // case 'no_sensor': return 'No Sensor';
          // case 'no_reading': return 'No Reading';
        case 'ok':
        default:
          return ''; // Don't show text for OK status
      }
    });

    // Computed property for status text color
    const statusTextColor = computed(() => {
      switch (props.status) {
        case 'dry':
          return 'text-orange-400 font-semibold';
        case 'wet':
          return 'text-blue-400 font-semibold';
        case 'config_error':
          return 'text-red-500 font-semibold';
          // case 'no_sensor':
          // case 'no_reading':
          //    return 'text-gray-400';
        case 'ok':
        default:
          return 'text-gray-300';
      }
    });

    const getPlantStatus = (plant: PlantDetails): PlantWaterStatus => {
      // 1. Check if a sensor is assigned
      if (!plant.sensor_id || plant.sensor_id === 0) {
        return 'no_sensor'; // No sensor assigned
      }

      // 2. Check if there's a valid reading (sensor IS assigned at this point)
      if (plant.last_moisture === null || plant.last_moisture === undefined) {
        return 'no_reading'; // Sensor assigned, but no reading data yet
      }

      const currentMoisture = getMoisturePct(plant);
      if (isNaN(currentMoisture)) {
        // Consider if NaN reading should also be 'no_reading' or a different status
        return 'no_reading'; // Reading exists but is invalid (e.g., NaN)
      }

      const waterUnder = plant.water_when_under_pct;
      const waterOver = plant.too_much_water_pct;
      const stopWatering = plant.stop_watering_when_pct;

      // 3. Check for configuration errors
      // (Using !== null checks to ensure 0 is a valid threshold)
      if (waterUnder !== undefined && waterOver !== undefined && waterUnder >= waterOver) {
        if (stopWatering !== undefined && waterUnder >= stopWatering) {
          return 'config_error';
        }
        if (stopWatering !== undefined && stopWatering >= waterOver) {
          return 'config_error';
        }
        if (waterUnder >= waterOver) {
          return 'config_error';
        }

      }
      // 4. Check status based on thresholds
      if (waterUnder !== undefined && currentMoisture < waterUnder) {
        return 'dry';
      }
      if (waterOver !== undefined && currentMoisture > waterOver) {
        return 'wet';
      }

      // 5. If none of the above, it's okay
      return 'ok';
    };

    // Expose methods needed in template
    return {
      formatDate,
      formatDateTime,
      getImageUrl,
      getPlantStatus,
      moistureLevel,
      statusText,
      statusTextColor,
    }
  }
  // methods: { // Keep if you prefer Options API, but setup is used above
  //   formatDate, formatDateTime, getImageUrl, moistureLevel,
  // },
});

</script>

<style scoped>
.octagon {
  width: 150px; /* Slightly smaller */
  height: 150px;
  background-size: cover;
  background-position: center;
  clip-path: polygon(
      30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%
  );
}

</style>