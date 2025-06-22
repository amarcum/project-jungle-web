<template>
  <div class="container mx-auto px-4">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <h1 class="text-2xl font-bold text-white">Plants</h1>

      <!-- Filter Controls -->
      <div class="w-full md:w-auto flex flex-wrap gap-3 items-center">
        <!-- Search -->
        <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="px-3 py-2 bg-gray-700 text-white rounded-md text-sm flex-grow md:flex-grow-0"
        />

        <!-- Sort Controls -->
        <div class="flex items-center gap-1">
          <select
              v-model="sortBy"
              class="px-3 py-2 bg-gray-700 text-white rounded-l-md text-sm appearance-none"
              style="border-top-right-radius: 0; border-bottom-right-radius: 0;"
          >
            <option value="name">Sort: Name</option>
            <option value="moisture">Sort: Moisture</option>
            <option value="location">Sort: Location</option>
            <option value="lastUpdate">Sort: Last Update</option>
            <option value="status">Sort: Status</option>
          </select>
          <button
              @click="toggleSortDirection"
              class="px-2 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-r-md text-sm"
              :title="`Sort Direction: ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`"
          >
            <!-- Ascending Icon -->
            <svg v-if="sortDirection === 'asc'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>
            </svg>
            <!-- Descending Icon -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"/>
            </svg>
          </button>
        </div>

        <!-- Filter: Room -->
        <select
            v-model="selectedRoom"
            class="px-3 py-2 bg-gray-700 text-white rounded-md text-sm"
            :disabled="availableRooms.length <= 1"
        >
          <option value="all">Room: All</option>
          <option v-for="room in availableRooms.filter(r => r !== 'all')" :key="room" :value="room">
            {{ room }}
          </option>
        </select>

        <!-- Filter: Stand -->
        <select
            v-model="selectedStand"
            class="px-3 py-2 bg-gray-700 text-white rounded-md text-sm"
            :disabled="availableStands.length <= 1"
        >
          <option value="all">Stand: All</option>
          <option v-for="stand in availableStands.filter(s => s !== 'all')" :key="stand" :value="stand">
            {{ stand }}
          </option>
        </select>

        <!-- Toggle: Needs Watering -->
        <button
            @click="filterNeedsWatering = !filterNeedsWatering"
            :class="`px-3 py-2 rounded-md text-sm ${filterNeedsWatering ? 'bg-cyan-600' : 'bg-gray-600'}`"
            title="Show only plants that need watering"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20"
               fill="currentColor">
            <path fill-rule="evenodd"
                  d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"
                  clip-rule="evenodd"/>
            <path d="M15.5 11.75a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z"/>
            <path fill-rule="evenodd" d="M10 13.5a.5.5 0 01-.5-.5V11a.5.5 0 011 0v2a.5.5 0 01-.5.5z"
                  clip-rule="evenodd"/>
            <path d="M4.5 11.75a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z"/>
          </svg>
          Needs Watering
        </button>

        <!-- Toggle: Has Sensor -->
        <button
            @click="filterHasSensor = !filterHasSensor"
            :class="`px-3 py-2 rounded-md text-sm ${filterHasSensor ? 'bg-teal-600' : 'bg-gray-600'}`"
            title="Show only plants with assigned sensors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20"
               fill="currentColor">
            <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z"
                  clip-rule="evenodd"/>
          </svg>
          Has Sensor
        </button>

        <!-- Toggle: Show Disabled -->
        <button
            @click="showDisabled = !showDisabled"
            :class="`px-3 py-2 rounded-md text-sm ${showDisabled ? 'bg-blue-600' : 'bg-gray-600'}`"
            title="Include disabled plants in the list"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20"
               fill="currentColor">
            <path fill-rule="evenodd"
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                  clip-rule="evenodd"/>
            <path
                d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
          </svg>
          {{ showDisabled ? 'Show All' : 'Active Only' }}
        </button>

        <!-- Clear Filters -->
        <button
            @click="clearFilters"
            class="px-3 py-2 rounded-md text-sm bg-red-500 hover:bg-red-700"
            title="Reset all filters and sorting"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Clear
        </button>
      </div>
    </div>

    <p v-if="isLoading" class="text-center text-gray-400 mt-8">Loading plants...</p>
    <p v-else-if="filteredAndSortedPlants.length === 0 && plants.length > 0" class="text-center text-gray-400 mt-8">
      No plants match the current filters.
    </p>
    <p v-else-if="plants.length === 0" class="text-center text-gray-400 mt-8">
      No plants found. Add one using the button below!
    </p>
    <ul v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <li v-for="plant in filteredAndSortedPlants" :key="plant.id"
          class="bg-gray-800 rounded-lg p-4 shadow flex flex-col transition-all duration-300 hover:shadow-lg relative"
          :class="getPlantStatusBorder(getPlantStatus(plant))"> <!-- dynamic border -->

        <div class="absolute top-4 right-4 text-sm">
          <!-- Inactive Bubble -->
          <span v-if="!plant.is_enabled" class='px-2 py-1 text-sm rounded-full bg-red-500/20 text-red-300'>Inactive</span>
          <PlantStatusIcon v-else-if="getPlantStatus(plant) != 'ok'" :status="getPlantStatus(plant)"/>
          <!-- Moisture Level -->
          <p v-if="moistureLevel(plant).length != 0">{{ moistureLevel(plant) }}</p>
        </div>

        <!-- Plant Info -->
        <div class="flex-grow pr-8">
          <PlantInfo :plant="plant" :includeLink="true" :status="getPlantStatus(plant)"/>
        </div>
        <!-- Actions -->
        <div class="mt-auto pt-4 flex justify-end space-x-2 border-t border-gray-700">
          <button @click="$emit('edit-plant', plant)"
                  class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm">
            Edit
          </button>
          <button @click="deletePlant(plant.id)"
                  class="bg-violet-500 hover:bg-violet-700 text-white font-bold py-1 px-3 rounded text-sm">
            Delete
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, onMounted, ref} from 'vue';
import axios from "axios";
import type {PlantDetails} from '@/types/ApiInterfaces';
import PlantInfo from "@/components/PlantInfo.vue";
import PlantStatusIcon from "@/components/PlantStatusIcon.vue";
import {getMoisturePct} from "@/utils/plantHelpers";
import type {PlantWaterStatus} from '@/types/PlantStatus';
import {moistureLevel} from "@/utils/SensorHelpers";

export default defineComponent({
  name: 'PlantList',
  methods: {moistureLevel},
  components: {PlantInfo, PlantStatusIcon},
  props: {
  },
  emits: ['edit-plant', 'afterSave'],

  setup(props, {emit}) {
    const plants = ref<Array<PlantDetails>>([]);
    const searchQuery = ref('');
    const sortBy = ref('name');
    const sortDirection = ref<'asc' | 'desc'>('asc');
    const showDisabled = ref(false);
    const filterHasSensor = ref(false);
    const filterNeedsWatering = ref(false);
    const selectedRoom = ref('all');
    const selectedStand = ref('all');
    const isLoading = ref(false);

    // --- Methods ---
    const fetchPlants = async () => {
      isLoading.value = true;
      try {
        const response = await axios.get<PlantDetails[]>('/api/plants');
        plants.value = response.data || [];
      } catch (error) {
        console.error('Error fetching plants:', error);
        plants.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    const deletePlant = async (id: number) => {
      if (!confirm(`Are you sure you want to delete plant ID ${id}?`)) {
        return;
      }
      try {
        await axios.delete(`/api/plant/${id}`);
        await fetchPlants();
        emit('afterSave');
      } catch (error) {
        console.error('Error deleting plant:', error);
        alert('Failed to delete plant.');
      }
    };

    const clearFilters = () => {
      searchQuery.value = '';
      sortBy.value = 'name';
      sortDirection.value = 'asc';
      showDisabled.value = false;
      filterHasSensor.value = false;
      filterNeedsWatering.value = false;
      selectedRoom.value = 'all';
      selectedStand.value = 'all';
    };

    const toggleSortDirection = () => {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    };

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

    const getPlantStatusBorder = (status: PlantWaterStatus): string => {
      switch (status) {
        case 'dry':
          return 'border-l-4 border-orange-500';
        case 'wet':
          return 'border-l-4 border-blue-400';
        case 'config_error':
          return 'border-l-4 border-red-500';
        case 'no_sensor':
        case 'no_reading':
          return 'border-l-4 border-gray-600'; // Subtle border for no data
        case 'ok':
        default:
          return 'border-l-4 border-transparent'; // No border or transparent
      }
    };


    // --- Computed Properties ---
    const availableRooms = computed(() => {
      const rooms = new Set(plants.value.map(p => p.location_room).filter(Boolean));
      return ['all', ...Array.from(rooms).sort()];
    });

    const availableStands = computed(() => {
      const stands = new Set(plants.value.map(p => p.location_stand).filter(Boolean));
      return ['all', ...Array.from(stands).sort()];
    });

    const filteredAndSortedPlants = computed(() => {
      let filtered = [...plants.value];

      // --- Filtering ---
      if (!showDisabled.value) {
        filtered = filtered.filter(plant => plant.is_enabled);
      }
      if (filterHasSensor.value) {
        filtered = filtered.filter(plant => plant.sensor_id && plant.sensor_id !== 0);
      }
      if (filterNeedsWatering.value) {
        filtered = filtered.filter(plant => getPlantStatus(plant) === 'dry');
      }
      if (selectedRoom.value !== 'all') {
        filtered = filtered.filter(plant => plant.location_room === selectedRoom.value);
      }
      if (selectedStand.value !== 'all') {
        filtered = filtered.filter(plant => plant.location_stand === selectedStand.value);
      }
      const query = searchQuery.value.toLowerCase().trim();
      if (query) {
        filtered = filtered.filter(plant =>
            plant.name.toLowerCase().includes(query) ||
            (plant.botanical_name && plant.botanical_name.toLowerCase().includes(query)) ||
            (plant.location_room && plant.location_room.toLowerCase().includes(query)) ||
            (plant.location_stand && plant.location_stand.toLowerCase().includes(query)) ||
            (plant.sensor?.name && plant.sensor.name.toLowerCase().includes(query))
        );
      }

      // --- Sorting ---
      const modifier = sortDirection.value === 'asc' ? 1 : -1;

      return filtered.sort((a, b) => {
        let comparison = 0;
        switch (sortBy.value) {
          case 'moisture':
            const moistA = getMoisturePct(a);
            const moistB = getMoisturePct(b);
            if (isNaN(moistA) && isNaN(moistB)) comparison = 0;
            else if (isNaN(moistA)) comparison = 1; // Put NaN last in asc, first in desc needs adjustment below
            else if (isNaN(moistB)) comparison = -1;
            else comparison = moistA - moistB; // Ascending sort (lowest first)
            break; // Will apply modifier outside switch
          case 'location':
            const locA = `${a.location_room || ''}-${a.location_stand || ''}`.toLowerCase();
            const locB = `${b.location_room || ''}-${b.location_stand || ''}`.toLowerCase();
            comparison = locA.localeCompare(locB);
            break;
          case 'lastUpdate':
            const updateA = a.since_last_seen ?? Infinity;
            const updateB = b.since_last_seen ?? Infinity;
            comparison = updateA - updateB; // Smaller (more recent) first is ascending
            break;
          case 'status': // Sort by status priority: error > dry > wet > ok > no_sensor/no_reading
            const statusOrder: Record<PlantWaterStatus, number> = {
              'config_error': 1,
              'dry': 2,
              'wet': 3,
              'ok': 4,
              'no_sensor': 5,
              'no_reading': 6,
            };
            comparison = statusOrder[getPlantStatus(a)] - statusOrder[getPlantStatus(b)];
            break;
          case 'name':
          default:
            comparison = a.name.localeCompare(b.name);
            break;
        }

        // Adjust for NaN moisture sorting based on direction
        if (sortBy.value === 'moisture') {
          if (isNaN(getMoisturePct(a)) && !isNaN(getMoisturePct(b))) {
            return modifier; // Put NaN last in asc, first in desc
          }
          if (!isNaN(getMoisturePct(a)) && isNaN(getMoisturePct(b))) {
            return -modifier; // Put NaN last in asc, first in desc
          }
        }

        return comparison * modifier;
      });
    });

    // --- Lifecycle Hook ---
    onMounted(() => {
      fetchPlants();
    });

    // --- Return values for template ---
    return {
      plants,
      searchQuery,
      sortBy,
      sortDirection, // Expose sort direction
      showDisabled,
      filterHasSensor,
      filterNeedsWatering, // Expose new filter
      selectedRoom,
      selectedStand,
      isLoading,
      fetchPlants,
      deletePlant,
      clearFilters,
      toggleSortDirection, // Expose toggle method
      availableRooms,
      availableStands,
      filteredAndSortedPlants,
      getPlantStatus, // Expose status calculation
      getPlantStatusBorder, // Expose border calculation
      getMoisturePct,
    };
  },
});
</script>

<style scoped>
select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button {
  transition: background-color 0.2s ease-in-out, opacity 0.2s ease-in-out;
}

/* Remove default arrow for custom sort dropdown */
select.appearance-none {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: none; /* Optional: remove background image if any */
  padding-right: 1.5rem; /* Add space for the button */
}

/* Style for status borders */
.border-l-4 {
  border-left-width: 4px;
}

.border-orange-500 {
  border-color: #F97316;
}

.border-blue-400 {
  border-color: #60A5FA;
}

.border-red-500 {
  border-color: #EF4444;
}

.border-gray-600 {
  border-color: #4B5563;
}

.border-transparent {
  border-color: transparent;
}

</style>