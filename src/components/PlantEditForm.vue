<template>
  <h2 class="text-lg font-bold mb-4 text-center text-white">
    {{ isNewPlant() ? 'Add New Plant' : 'Edit Plant' }}
  </h2>
  <div v-if="errorMessage" class="text-red-500 text-center mb-4">
    {{ errorMessage }}
  </div>
  <form @submit.prevent="savePlant" class="space-y-4">
    <div>
      <label for="name" class="block text-white mb-2">Plant Name</label>
      <input v-model="editablePlant.name" id="name" type="text"
             class="w-full px-3 py-1 border border-gray-600 bg-gray-700 text-white rounded-md" required/>
    </div>
    <div>
      <label for="botanical_name" class="block text-white mb-2">Botanical Name</label>
      <input v-model="editablePlant.botanical_name" id="botanical_name" type="text"
             class="w-full px-3 py-1 border border-gray-600 bg-gray-700 text-white rounded-md" required/>
    </div>

    <div>
      <!--      <label for="plantImage" class="block text-white mb-2">Plant Image</label>-->
      <!--      <input type="file" id="plantImage" @change="handleFileChange" accept="image/*"-->
      <!--             class="block w-full text-sm text-gray-400 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>-->
      <!--      <div v-if="imgSrc" class="mt-4">-->
      <!--        <p class="text-white mb-2">Crop Image:</p>-->
      <!--        <vue-cropper-->
      <!--            ref="cropper"-->
      <!--            :src="imgSrc"-->
      <!--            :aspect-ratio="1"-->
      <!--            :view-mode="1"-->
      <!--            alt="Crop preview"-->
      <!--            class="cropper-container"-->
      <!--            :img-style="{ 'max-height': '400px' }"-->
      <!--        ></vue-cropper>-->
      <!--        <button type="button" @click="clearImageSelection"-->
      <!--                class="mt-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-sm">-->
      <!--          Clear Image-->
      <!--        </button>-->
      <!--      </div>-->
      <!-- Display current image if editing and no new image selected -->
      <div v-if="!isNewPlant() && editablePlant.image_path" class="mt-4">
        <p class="text-white mb-1">Current Image:</p>
        <img :src="getImageUrl(editablePlant)" alt="Current plant image" class="max-w-xs max-h-40 rounded">
      </div>
    </div>

    <div>
      <label for="sensor" class="block text-white mb-2">Sensor</label>
      <select v-model="editablePlant.sensor_id" id="sensor"
              class="w-full px-3 py-1 border border-gray-600 bg-gray-700 text-white rounded-md">
        <option :value="null">-- Select Sensor --</option>
        <optgroup v-if="filteredSensors.prioritized.length > 0" label="Prioritized Sensors">
          <option v-for="sensorD in filteredSensors.prioritized" :key="sensorD.sensor?.id" :value="sensorD.sensor?.id"
                  :class="{ 'text-gray-400': !sensorD.sensor?.is_enabled || !sensorD.device?.is_enabled }">
            {{ briefSensorName(sensorD) }}
          </option>
        </optgroup>
        <optgroup v-if="filteredSensors.other.length > 0" label="Other Sensors">
          <option v-for="sensorD in filteredSensors.other" :key="sensorD.sensor?.id" :value="sensorD.sensor?.id"
                  :class="{ 'text-gray-500': !sensorD.sensor?.is_enabled || !sensorD.device?.is_enabled }">
            {{ briefSensorName(sensorD) }}
          </option>
        </optgroup>
        <!-- Show inactive sensors section needs correction in v-if/v-for -->
        <optgroup v-if="showInactiveSensors && filteredSensors.inactive.length > 0" label="Inactive/Orphaned Sensors">
          <option v-for="sensorD in filteredSensors.inactive" :key="sensorD.sensor?.id" :value="sensorD.sensor?.id"
                  class="text-gray-600">
            {{ briefSensorName(sensorD) }}
          </option>
        </optgroup>
      </select>
      <div class="mt-2">
        <input type="checkbox" id="showInactiveSensors" v-model="showInactiveSensors">
        <label for="showInactiveSensors" class="text-white ml-2 text-sm">Show Inactive/Orphaned Sensors</label>
      </div>
    </div>
    <div>
      <label for="location_room" class="block text-white mb-2">Room</label>
      <input v-model="editablePlant.location_room" id="location_room" type="text"
             class="w-full px-3 py-1 border border-gray-600 bg-gray-700 text-white rounded-md"/>
    </div>
    <div>
      <label for="location_stand" class="block text-white mb-2">Stand</label>
      <input v-model="editablePlant.location_stand" id="location_stand" type="text"
             class="w-full px-3 py-1 border border-gray-600 bg-gray-700 text-white rounded-md"/>
    </div>
    <div>
      <label for="location_shelf_num" class="block text-white mb-2">Shelf</label>
      <input v-model.number="editablePlant.location_shelf_num" id="location_shelf_num" type="number"
             class="w-full px-3 py-1 border border-gray-600 bg-gray-700 text-white rounded-md"/>
    </div>
    <div>
      <label for="pot_size_cm" class="block text-white mb-2">Pot Size (cm)</label>
      <input v-model.number="editablePlant.pot_size_cm" id="pot_size_cm" type="number"
             class="w-full px-3 py-1 border border-gray-600 bg-gray-700 text-white rounded-md"/>
    </div>
    <div>
      <label for="water_when_under" class="block text-white mb-2">Water When Under (%)</label>
      <input v-model.number="editablePlant.water_when_under_pct" id="water_when_under" type="number"
             class="w-full px-3 py-1 border border-gray-600 bg-gray-700  text-white rounded-md"/>
    </div>
    <div>
      <label for="stop_watering_when" class="block text-white mb-2">Stop Watering When (%)</label>
      <input v-model.number="editablePlant.stop_watering_when_pct" id="stop_watering_when" type="number"
             class="w-full px-3 py-1 border border-gray-600 bg-gray-700 text-white rounded-md"/>
    </div>
    <div>
      <label for="too_much_water" class="block text-white mb-2">Too Much Water (%)</label>
      <input v-model.number="editablePlant.too_much_water_pct" id="too_much_water" type="number"
             class="w-full px-3 py-1 border border-gray-600 bg-gray-700 text-white rounded-md"/>
    </div>
    <div>
      <label for="propagation_parent_id" class="block text-white mb-2">Propagation Parent ID</label>
      <!-- Corrected v-model -->
      <input v-model.number="editablePlant.propagation_parent_id" id="propagation_parent_id" type="number"
             class="w-full px-3 py-1 border border-gray-600 bg-gray-700 text-white rounded-md"/>
    </div>
    <div>
      <label for="light_hours_per_day" class="block text-white mb-2">Light Hours Per Day</label>
      <input v-model.number="editablePlant.light_hours_per_day" id="light_hours_per_day" type="number"
             class="w-full px-3 py-1 border border-gray-600 bg-gray-700 text-white rounded-md"/>
    </div>
    <div>
      <label for="adoption_date" class="block text-white mb-2">Adoption Date</label>
      <input v-model="editablePlant.adoption_date" id="adoption_date" type="date"
             class="w-full px-3 py-1 border border-gray-600 bg-gray-700 text-white rounded-md"/>
    </div>
    <div>
      <label for="last_repot_date" class="block text-white mb-2">Last Repot Date</label>
      <input v-model="editablePlant.last_repot_date" id="last_repot_date" type="date"
             class="w-full px-3 py-1 border border-gray-600 bg-gray-700 text-white rounded-md"/>
    </div>
    <div class="flex items-center space-x-3">
      <label for="is_enabled" class="text-white">Is Enabled</label>
      <div @click="toggleIsActive" id="is_enabled"
           :class="{ 'bg-purple-500': editablePlant.is_enabled, 'bg-gray-600': !editablePlant.is_enabled, }"
           class="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200">
          <span :class="{ 'translate-x-6': editablePlant.is_enabled, 'translate-x-1': !editablePlant.is_enabled, }"
                class="inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200"
          ></span>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Light Requirements -->
      <div class="bg-gray-700/50 rounded-lg p-4">
        <h3 class="text-sm text-gray-400 mb-4">Light Requirements</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-white mb-2">Light Level (Lux)</label>
            <div class="flex space-x-2">
              <input v-model.number="editablePlant.light_lux_min" type="number" placeholder="Min"
                     class="w-1/2 px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md"/>
              <input v-model.number="editablePlant.light_lux_max" type="number" placeholder="Max"
                     class="w-1/2 px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md"/>
            </div>
          </div>
          <div>
            <label class="block text-white mb-2">Light Duration (Hours)</label>
            <div class="flex space-x-2">
              <input v-model.number="editablePlant.light_duration_min_hrs" type="number" placeholder="Min"
                     class="w-1/2 px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md"/>
              <input v-model.number="editablePlant.light_duration_max_hrs" type="number" placeholder="Max"
                     class="w-1/2 px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md"/>
            </div>
          </div>
        </div>
      </div>

      <!-- Humidity and Water Requirements -->
      <div class="bg-gray-700/50 rounded-lg p-4">
        <h3 class="text-sm text-gray-400 mb-4">Humidity & Water</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-white mb-2">Humidity Range (%)</label>
            <div class="flex space-x-2">
              <input v-model.number="editablePlant.preferred_humidity_min_pct" type="number" placeholder="Min"
                     class="w-1/2 px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md"/>
              <input v-model.number="editablePlant.preferred_humidity_max_pct" type="number" placeholder="Max"
                     class="w-1/2 px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md"/>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <input type="checkbox" v-model="editablePlant.should_use_distilled_water" id="distilled_water"
                   class="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"/>
            <label for="distilled_water" class="text-white">Use Distilled Water</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Care Requirements -->
    <div class="bg-gray-700/50 rounded-lg p-4 mt-4">
      <h3 class="text-sm text-gray-400 mb-4">Care Requirements</h3>
      <div class="space-y-4">
        <div class="flex items-center space-x-2">
          <input type="checkbox" v-model="editablePlant.needs_more_attention" id="needs_attention"
                 class="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"/>
          <label for="needs_attention" class="text-white">Needs Extra Attention</label>
        </div>
        <div>
          <label for="notes" class="block text-white mb-2">Care Notes</label>
          <textarea v-model="editablePlant.notes" id="notes" rows="4"
                    class="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md"
                    placeholder="Special care instructions, warnings, or notes..."></textarea>
        </div>
      </div>
    </div>

    <div class="text-center space-x-4 pt-4">
      <button type="submit"
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded">
        Save
      </button>
      <button type="button" @click="cancelEdit"
              class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-4 rounded">
        Cancel
      </button>
    </div>
  </form>
</template>

<script lang="ts">
import {computed, defineComponent, onMounted, PropType, ref, watch} from 'vue';
import axios from 'axios';
import type {Plant, SensorDetail} from '@/types/ApiInterfaces.ts';
// import Cropper, {CropperCanvas} from "cropperjs";
import {getImageUrl} from "@/utils/plantHelpers.js"; // Import helper

// Helper function to safely stringify potentially null/undefined values for FormData
const safeStringify = (value: any): string => {
  if (value === null || typeof value === 'undefined') {
    return ''; // Send empty string for null/undefined
  }
  return String(value);
};


export default defineComponent({
  name: 'PlantEditForm',
  // components: {
  //   Cropper, // Register component
  // },
  props: {
    plant: {
      // Accept null for adding a new plant
      type: Object as PropType<Plant | null>,
      required: true,
      // Default factory now creates a new plant object or uses null
      default: null,
    },
  },
  emits: ['saved', 'cancelEdit'],
  setup(props, {emit}) {
    const editablePlant = ref<Plant>({
      id: 0,
      name: '',
      adoption_date: undefined,
      propagation_parent_id: undefined,
      last_repot_date: undefined,
      location_room: "",
      location_stand: "",
      location_shelf_num: undefined,
      light_hours_per_day: undefined,
      pot_size_cm: undefined,
      sensor_id: undefined,
      image_path: "",
      water_when_under_pct: undefined,
      stop_watering_when_pct: undefined,
      too_much_water_pct: undefined,
      is_enabled: true,
      botanical_name: "",
      should_use_distilled_water: false,
      needs_more_attention: false,
      notes: "",
    });
    const allSensors = ref<SensorDetail[]>([]);
    const showInactiveSensors = ref(false);
    const errorMessage = ref<string | null>(null);
    // const imgSrc = ref<string | null>(null); // For cropper source
    // const croppedBlob = ref<Blob | null>(null); // To store the cropped image blob
    // const cropper = ref<typeof Cropper | null>(null); // Ref for cropper instance
    // const fileInputKey = ref(0); // To reset file input

    // Watch the incoming plant prop to update the local editablePlant
    watch(() => props.plant, (newPlant) => {
      console.log("Plant prop changed:", newPlant);
      if (newPlant) {
        // Deep copy to avoid modifying the original prop directly
        editablePlant.value = JSON.parse(JSON.stringify(newPlant));
      } else {
// Reset to default if prop is null (for adding new)
        editablePlant.value = {
          id: 0,
          name: '',
          adoption_date: undefined,
          propagation_parent_id: undefined,
          last_repot_date: undefined,
          location_room: "",
          location_stand: "",
          location_shelf_num: undefined,
          light_hours_per_day: undefined,
          pot_size_cm: undefined,
          sensor_id: undefined,
          image_path: "",
          water_when_under_pct: undefined,
          stop_watering_when_pct: undefined,
          too_much_water_pct: undefined,
          is_enabled: true,
          botanical_name: "",
          should_use_distilled_water: false,
          needs_more_attention: false,
          notes: "",
        };
      }
      // Reset image state when plant changes
      // clearImageSelection();
      console.log("Editable plant set to:", JSON.parse(JSON.stringify(editablePlant.value)));
    }, {immediate: true, deep: true}); // immediate: run on mount, deep: watch nested properties


    // --- Computed Properties ---
    const filteredSensors = computed((): {
      prioritized: SensorDetail[];
      other: SensorDetail[];
      inactive: SensorDetail[]
    } => {
      const prioritized: SensorDetail[] = [];
      const other: SensorDetail[] = [];
      const inactive: SensorDetail[] = [];
      // console.log("Filtering " + allSensors.value.length + " sensors...")

      for (const sensorD of allSensors.value) {
        if (!sensorD.sensor) continue; // Skip if no sensor
        const isDeviceEnabled = sensorD.device ? sensorD.device.is_enabled : false;

        if (!sensorD.sensor.is_enabled || !isDeviceEnabled) {
          inactive.push(sensorD);
        } else if (isPrioritizedSensor(sensorD)) {
          prioritized.push(sensorD);
        } else {
          other.push(sensorD);
        }
      }
      return {prioritized, other, inactive};
    });

    // --- Methods ---
    const isNewPlant = (): boolean => {
      // Check the local editablePlant's id
      return !editablePlant.value || typeof editablePlant.value.id === 'undefined' || editablePlant.value.id === 0 || editablePlant.value.id === null;
    };

    const fetchSensors = async () => {
      try {
        console.log('Fetching sensors...');
        const response = await axios.get<SensorDetail[]>('/api/sensors/list');
        if (Array.isArray(response.data)) {
          allSensors.value = response.data;
          console.log(`Fetched ${allSensors.value.length} sensors.`);
        } else {
          console.warn('Received non-array response for sensors:', response.data);
          allSensors.value = [];
        }
      } catch (error) {
        console.error('Error fetching sensors:', error);
        errorMessage.value = 'Failed to load sensor list.';
        allSensors.value = [];
      }
    };

    // const handleFileChange = (event: Event) => {
    //   const input = event.target as HTMLInputElement;
    //   if (input.files && input.files[0]) {
    //     const file = input.files[0];
    //     const reader = new FileReader();
    //     reader.onload = (e) => {
    //       const newSrc = e.target?.result as string;
    //       imgSrc.value = newSrc;
    //       croppedBlob.value = null; // Reset cropped blob when new image is loaded
    //     };
    //     reader.readAsDataURL(file);
    //   } else {
    //     clearImageSelection(); // Clear if no file selected
    //   }
    // };

    // const clearImageSelection = () => {
    //   imgSrc.value = null;
    //   croppedBlob.value = null;
    //   // Reset the file input visually by changing its key
    //   fileInputKey.value++;
    //   // Also clear the actual input value if possible (might need direct DOM manipulation or ref)
    //   const fileInput = document.getElementById('plantImage') as HTMLInputElement;
    //   if (fileInput) {
    //     fileInput.value = '';
    //   }
    // };

    // const getCroppedImageBlob = (): Promise<Blob | null> => {
    //   return new Promise((resolve) => {
    //     const cropperInstance = cropper.value;
    //     if (!cropperInstance || !imgSrc.value) {
    //       console.log("No cropper or imgSrc")
    //       resolve(null);
    //       return;
    //     }
    //     let canvas: CropperCanvas | null = cropperInstance.prototype.getCropperCanvas() //.$toCanvas();
    //     if (!canvas) {
    //       console.log("No canvas")
    //       resolve(null);
    //       return;
    //     }
    //     // Get cropped canvas, then convert to blob
    //     // let c: HTMLCanvasElement = canvas.$toCanvas()
    //     // c.toBlob((blob: Blob | null) => {
    //     //     if (blob)  {
    //     //       resolve(blob);
    //     //     } else {
    //     //       resolve(null);
    //     //     }
    //     // }, 'image/jpeg', 0.85);
    //
    //       // croppedCanvas.toBlob((blob: Blob | null) => {
    //       //   resolve(blob);
    //       // }, 'image/jpeg', 0.85);
    //
    //   });
    // };

    const savePlant = async () => {
      errorMessage.value = null;
      // croppedBlob.value = await getCroppedImageBlob(); // Get the blob before sending

      try {
        if (!editablePlant.value.name) {
          errorMessage.value = 'Plant name is required.';
          alert(errorMessage.value);
          return;
        }

        const formData = new FormData();

        // Append all plant data fields (handle null/undefined)
        // Need to iterate over the editablePlant object keys
        console.log("editablePlant: ", editablePlant.value);
        const plantPayload: Partial<Plant> = {...editablePlant.value};
        if (isNewPlant()) {
          delete plantPayload.id;
        }
        delete plantPayload.image_path;
        const plantJson = JSON.stringify(plantPayload);
        console.log("editablePlant.json: ", plantJson);

        formData.append('plant', plantJson);
        // Append the cropped image blob if it exists
        // if (croppedBlob.value) {
        //   formData.append('file', croppedBlob.value, `${editablePlant.value.name || 'plant'}_cropped.jpg`); // Provide a filename
        // }

        console.log('Saving plant with FormData...');
        // Log FormData entries (for debugging)
        // formData.forEach((value, key, parent) => {
        //   console.log("[", parent, "]", key, ":", value)
        // })
        // for (let [key, value] of range formData.getAll()) {
        //   console.log(`${key}:`, value);
        // }
        console.log("Plant JSON being sent: ", formData.get('plant'))

        const endpoint = isNewPlant() ? '/api/plant' : `/api/plant/${editablePlant.value.id}`;
        const method = isNewPlant() ? 'post' : 'put';

        const response = await axios<Plant>({
          method,
          url: endpoint,
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });


        console.log('Plant response ', response.status, ' ', response.statusText, ':', response.data);
        emit('saved'); // Emit saved event
        // clearImageSelection(); // Clear image after successful save

      } catch (error: any) {
        console.error('Error saving plant:', error);
        if (error.response) {
          console.error("Error data:", error.response.data);
          console.error("Error status:", error.response.status);
          // Try to get a more specific error message from backend if available
          const backendError = error.response.data?.error || error.response.data?.message || error.response.statusText;
          errorMessage.value = `Error: ${backendError || 'Unknown server error'}`;
        } else if (error.request) {
          console.error("Error request:", error.request);
          errorMessage.value = 'No response from server. Please check network connection.';
        } else {
          console.error('Error message:', error.message);
          errorMessage.value = `Request setup error: ${error.message}`;
        }
        alert(`Failed to save the plant: ${errorMessage.value}`);
      }
    };

    const cancelEdit = () => {
      // clearImageSelection(); // Clear image state on cancel
      emit('cancelEdit');
    };

    const toggleIsActive = () => {
      if (editablePlant.value) {
        editablePlant.value.is_enabled = !editablePlant.value.is_enabled;
      }
    };

    const isPrioritizedSensor = (sensorD: SensorDetail): boolean => {
      if (!sensorD?.sensor || !sensorD?.device || !editablePlant.value) {
        return false;
      }
      const plantLoc = editablePlant.value;
      if (!plantLoc.location_room && !plantLoc.location_stand && !plantLoc.location_shelf_num) {
        return false; // No plant location set, cannot prioritize based on it
      }

      const deviceLoc = sensorD.device;
      const roomMatch = !!plantLoc.location_room && deviceLoc.location_room === plantLoc.location_room;
      const standMatch = !!plantLoc.location_stand && deviceLoc.location_stand === plantLoc.location_stand;

      // Prioritize if Room and Stand match
      if (roomMatch && standMatch) return true;
      // Prioritize if only Room matches and plant has no stand/shelf specified
      if (roomMatch && !plantLoc.location_stand && !plantLoc.location_shelf_num) return true;
      // Prioritize if only Stand matches and plant has no room/shelf specified
      if (standMatch && !plantLoc.location_room && !plantLoc.location_shelf_num) return true;

      // Add more specific logic if needed, e.g., matching shelf

      return false;
    };

    const briefSensorName = (sensorD: SensorDetail): string => {
      if (!sensorD?.sensor) return 'Invalid Sensor Data';

      const deviceStatus = sensorD.device
          ? (sensorD.device.is_enabled ? '' : '(Device Inactive)')
          : '(No Device Info)';
      const sensorStatus = sensorD.sensor.is_enabled ? '' : '(Sensor Inactive)';
      const status = [deviceStatus, sensorStatus].filter(s => s).join(' '); // Combine statuses

      let name = sensorD.sensor.name || sensorD.sensor.type_and_num || `Sensor ID ${sensorD.sensor.id}`;

      let locationParts: string[] = [];
      if (sensorD.device?.location_room) locationParts.push(`Rm: ${sensorD.device.location_room}`);
      if (sensorD.device?.location_stand) locationParts.push(`St: ${sensorD.device.location_stand}`);
      if (sensorD.device?.location_shelf_num) locationParts.push(`Sh: ${sensorD.device.location_shelf_num}`);

      let locationString = locationParts.length > 0 ? ` - [${locationParts.join(', ')}]` : '';

      return `${name}${locationString} ${status}`.trim(); // Trim trailing spaces
    };

    // --- Lifecycle Hooks ---
    onMounted(() => {
      fetchSensors();
    });

    // --- Return values for template ---
    return {
      editablePlant,
      allSensors,
      showInactiveSensors,
      errorMessage,
      // imgSrc,
      // cropper,
      // fileInputKey, // Expose key for resetting file input
      filteredSensors,
      isNewPlant,
      savePlant,
      cancelEdit,
      toggleIsActive,
      // handleFileChange,
      // clearImageSelection,
      briefSensorName,
      getImageUrl, // Expose helper for displaying current image
    };
  },
});
</script>

<style scoped>

/* Optional: Style the file input button */
input[type="file"]::file-selector-button {
  margin-right: 1rem;
  padding: 0.25rem 1rem; /* Adjusted padding */
  border-radius: 9999px;
  border-width: 0px;
  font-size: 0.875rem; /* text-sm */
  line-height: 1.25rem;
  font-weight: 600; /* font-semibold */
  background-color: rgb(245 243 255); /* bg-violet-50 */
  color: rgb(109 40 217); /* text-violet-700 */
  cursor: pointer; /* Add cursor pointer */
  transition: background-color 0.2s; /* Smooth transition */
}

input[type="file"]::file-selector-button:hover {
  background-color: rgb(237 233 254); /* hover:bg-violet-100 */
}

/* Ensure labels are block elements for proper spacing */
label {
  display: block;
}
</style>