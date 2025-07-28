<template>
  <div class="container mx-auto p-4 max-w-7xl">
    <h2 class="flex justify-center items-center text-2xl font-bold mb-4 text-white">Device Details</h2>
    <div v-if="deviceD == null" class="flex justify-center items-center h-64">
      <div class="flex items-center space-x-2">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p class="text-white">Loading Device Details...</p>
      </div>
    </div>
    <div v-else class="bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 class="text-xl font-semibold text-white mb-2">
        <span v-if="deviceD.device.name">{{ deviceD.device.name }}</span>
        <span v-else>{{ deviceD.device.hardware_id }}</span>
      </h3>
      <div class="signal-bars mb-4">
        <div class="bar" v-for="i in 5" :class="{ active: i <= signalStrength() }"></div>
      </div>
      <div class="space-y-2 text-gray-300 text-sm">
        <p v-if="deviceD.latest_device_stats?.rssi_db"><span class="text-gray-400">RSSI:</span> {{ deviceD.latest_device_stats?.rssi_db }} dB</p>
        <p v-if="deviceD.device.mac_address"><span class="text-gray-400">WiFi:</span> Yes</p>
        <p v-else><span class="text-gray-400">WiFi:</span> No</p>
        <p v-if="deviceD.device.mac_address"><span class="text-gray-400">MAC Address:</span> {{ deviceD.device.mac_address }}</p>
        <p v-if="deviceD.device.hop_from_mac"><span class="text-gray-400">Hop From Mac:</span> {{ deviceD.device.hop_from_mac }}</p>
        <p v-if=isValidParent(deviceD.device)>
          <router-link
              v-if="deviceD.parent_brief?.id"
              :to="{ name: 'device', params: { id: deviceD.parent_brief?.id }}"
              class="text-blue-400 hover:underline">
            <span class="text-gray-400">Parent Device:</span>
            <span v-if="deviceD.parent_brief?.name.length != 0">{{ deviceD.parent_brief?.name }}</span>
          </router-link>
        </p>

        <p v-if="formatDate(deviceD.device.added).length != 0"><span class="text-gray-400">Added:</span> {{ formatDate(deviceD.device.added) }}</p>
        <p v-if="formatDate(deviceD.device.last_seen).length != 0"><span class="text-gray-400">Last Seen:</span> {{
          formatDateTime(deviceD.device.last_seen)
        }}</p>
        <p><span class="text-gray-400">Since Last Seen:</span> {{ deviceD.since_last_seen }}</p>

        <p v-if="deviceD.device.location_room || deviceD.device.location_stand || deviceD.device.location_shelf_num">
          <span class="text-gray-400">Location:</span>
          <span v-if="deviceD.device.location_room">{{ deviceD.device.location_room }} </span>
          <span v-if="deviceD.device.location_stand">{{ deviceD.device.location_stand }} </span>
          <span v-if="deviceD.device.location_shelf_num">{{
            deviceD.device.location_shelf_num
          }}</span>
        </p>
        <p v-else><span class="text-gray-400">Location:</span> Not Set</p>
        <p v-if="deviceD.latest_device_stats?.cpu_temp_c"><span class="text-gray-400">CPU Temperature:</span>
          {{ deviceD.latest_device_stats.cpu_temp_c }} degrees C</p>
        <p><span class="text-gray-400">Is Enabled:</span> {{ deviceD.device.is_enabled }}</p>
      </div>

      <div v-if="deviceD.attached_sensors" class="mt-6 border-t border-gray-700 pt-4">
        <h2 class="text-xl font-semibold mb-4 text-white">Attached Sensors</h2>
        <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <li v-for="sensor in deviceD.attached_sensors" :key="sensor.id"
              class="bg-gray-700 rounded-lg shadow p-4">
            <div class="flex flex-col h-full">
              <router-link :to="{ name: 'sensor', params: { id: sensor.id }}"
                           :class="[sensor.is_enabled ? 'text-blue-400 hover:underline' : 'text-gray-500']">
                <h3 v-if="sensor.name" class="text-lg font-semibold text-white mb-2">{{ sensor.name }}</h3>
                <h3 v-else class="text-lg font-semibold text-white mb-2">{{ sensor.type_and_num }}</h3>
              </router-link>
              <div class="text-sm text-gray-400 mb-4 space-y-1">
                <p v-if="!sensor.is_enabled" class="text-red-400">Deactivated</p>
                <p v-if="formatDate(sensor.added).length != 0"><span class="text-gray-500">Added:</span> {{ formatDate(sensor.added) }}</p>
                <p v-if="formatDate(sensor.last_seen).length != 0"><span class="text-gray-500">Last Seen:</span> {{ formatDateTime(sensor.last_seen) }}</p>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content bg-gray-900 rounded-lg p-4">
          <button @click="showModal = false"
                  class="close-button bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded">
            <span>X</span></button>
          <DeviceEditForm :device="deviceD.device" @cancelEdit="cancelEdit" @saved="saved"/>
        </div>
      </div>

      <div class="mt-6 border-t border-gray-700 pt-4 flex justify-end space-x-2">
        <button @click="edit(deviceD)"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm">
          Edit
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import axios from 'axios';
import type {Device, DeviceDetail} from "@/types/ApiInterfaces";
import DeviceEditForm from "@/components/DeviceEditForm.vue";
import SensorEditForm from "@/components/SensorEditForm.vue";
import {formatDate, formatDateTime} from "@/utils/timeHelpers";

export default defineComponent({
  name: "DeviceView",
  components: {SensorEditForm, DeviceEditForm},
  props: {
    id: {
      type: String,
      required: false,
      default: null,
    },
    hardwareId: {
      type: String,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      deviceD: null as DeviceDetail | null,
      showModal: false,
    };
  },
  methods: {
    formatDate,
    formatDateTime,
    signalStrength(): number {
      if (!this.deviceD?.latest_device_stats?.rssi_db) return 0;
      const max = -28;
      const min = -95;
      const range = max - min;
      const sigId = ((this.deviceD?.latest_device_stats.rssi_db - min) / range) * 5;
      console.log("sigId", sigId + .5);
      return sigId + .5;
    },
    async fetchDevice() {
      try {
        if (this.id != null) {
          console.log(`Fetching device details with id ${this.id}...`);
          const response = await axios.get<DeviceDetail>(`/api/device/${this.id}`);
          console.log(response);
          this.deviceD = response.data;
          console.log("Device Info: ", this.deviceD.device);
          console.log("Latest Device Stats: ", this.deviceD.latest_device_stats);
          console.log("Parent Name: ", this.deviceD.parent_brief?.name);
          console.log("Last Seen: ", this.deviceD.since_last_seen);
        } else if (this.hardwareId != null) {
          console.log(`Fetching device details with hardware id ${this.hardwareId}...`);
          const response = await axios.get<DeviceDetail>(`/api/device/hardware/${this.hardwareId}`);
          this.deviceD = response.data;
        }
      } catch (error) {
        console.error('Error fetching device:', error);
      }
    },
    isValidParent(device: Device): boolean {
      return device.parent_hardware_id !== null &&
          device.parent_hardware_id !== 0n &&
          device.parent_hardware_id !== device.hardware_id;
    },
    getDeviceImage(device: Device) {
      switch (device.model) {
        case "Raspberry Pi Pico":
          return "/assets/pico.jpg";
        case "Pico W":
          return "/assets/pico-w.jpg";
        case "ESP":
          return "/assets/esp.jpg";
        default:
          return "/assets/default-device.jpg";
      }
    },
    edit(device: DeviceDetail) {
      this.deviceD = device;
      this.showModal = true;
      // this.$emit('edit', device);
    },
    cancelEdit() {
      this.showModal = false;
      this.$emit('cancelEdit');
    },
    saved() {
      this.showModal = false;
      this.fetchDevice();
    },

    // getParentDeviceName(parentHardwareId: bigint): string {
    //   const response = axios.get<Device>(`/api/deviceHardware/${parentHardwareId}`);
    //   response.data
    //   console.log(parentDevice);
    //   return parentDevice ? parentDevice.name : 'Unknown Device';
    // },
    // getParentDeviceId(parentHardwareId: bigint): number {devices
    //   const parentDevice = axios.get<Device>(`/api/deviceHardware/${parentHardwareId}`);
    //   console.log(parentDevice);
    //   return parentDevice ? parentDevice.id : 0;
    // },
  },
  mounted() {
    this.fetchDevice();
  },
});
</script>

<style scoped>
@import "@/utils/modal.css";

.signal-bars {
  display: flex;
  align-items: flex-end;
}

.bar {
  width: 5px;
  margin: 0 1px;
  background: gray;
  height: 10px;
}

.bar.active {
  background: green;
}
</style>