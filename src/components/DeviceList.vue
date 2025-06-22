<template>
  <div class="container mx-auto p-4">
    <h2 class="text-2xl font-bold mb-4 text-center text-white">Devices</h2>
    <input type="checkbox" v-model="showAll"/> Show All
    <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <li v-for="device in filteredItems" :key="device.id"
          class="text-sm text-gray-400 bg-gray-800 rounded-lg shadow p-4">
        <div v-if="device.is_enabled || showAll" class="text-sm text-gray-400 mb-4">
          <router-link :to="{ name: 'device', params: { id: device.id }}"
                       class="text-white-500 hover:underline">
            <h3 class="text-xl font-semibold text-white mb-2">{{ device.name }}</h3>
          </router-link>
          <div v-if="device.location_room || device.location_stand || device.location_shelf_num">
            Located:
            <p v-if="device.location_room">Room: {{ device.location_room }}</p>
            <p v-if="device.location_stand">Stand: {{ device.location_stand }}</p>
            <p v-if="device.location_shelf_num">Shelf #{{ device.location_shelf_num }}</p>
          </div>
          <p v-else>Location: Not Set</p>
          <p v-if="device?.mac_address">Has WiFi</p>
          <p v-if="formatDateTime(device.last_seen).length != 0">Last Seen: {{ formatDateTime(device.last_seen) }}</p>
          <p v-if=isValidParent(device)>
            <router-link
                v-if="device.parent_hardware_id !== undefined && device.parent_hardware_id !== null && device.parent_hardware_id != device. hardware_id"
                :to="{ name: 'deviceHardware', params: { hardwareId: device.parent_hardware_id?.toString() }}"
                class="text-blue-500 hover:underline">
              Connected to {{ getParentDeviceName(device.parent_hardware_id) }}
            </router-link>
          </p>
          <div class="mt-auto flex justify-end space-x-2">
            <button @click="$emit('edit', device)"
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Edit
            </button>
            <button @click="$emit('delete', device.id)"
                    class="bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded">
              Delete
            </button>
          </div>
          <div v-if="editingDevice && editingDevice.id === device.id" class="mt-4">
            <DeviceEditForm :device="editingDevice"
                        @afterSave="afterSave"
                        @cancelEdit="cancelEdit"/>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';
import DeviceEditForm from "@/components/DeviceEditForm.vue";
import type {Device} from "@/types/ApiInterfaces.ts";
import ErrorBoundary from "@/components/ErrorBoundary.vue";
import {formatDate, formatDateTime} from "@/utils/timeHelpers";

export default defineComponent({
  name: 'DeviceList',
  components: {ErrorBoundary, DeviceEditForm},
  props: {
    devices: {
      type: Array as PropType<Device[]>,
      required: true,
      default: () => [], // Default to an empty array
    }
  },
  emits: ['edit', 'delete', 'afterSave', 'cancelEdit'],
  data() {
    return {
      editingDevice: null as Device | null,
      showAll: false,
    };
  },
  computed: {
    filteredItems(): Device[] {
      return this.showAll ? this.devices : this.devices.filter((device: Device) => device.is_enabled);
    },
  },
  methods: {
    formatDateTime,
    formatDate,
    isValidParent(device: Device): boolean {
      return (
          device.parent_hardware_id !== undefined &&
          device.parent_hardware_id !== null &&
          device.parent_hardware_id !== 0n &&
          device.parent_hardware_id !== device.hardware_id
      );
    },
    getParentDeviceName(parentHardwareId: bigint | null): string {
      if ((!parentHardwareId) && (parentHardwareId !== 0n)) {
        return 'Unknown Device';
      }
      const parentDevice = this.devices.find((d: Device) => d.hardware_id === parentHardwareId);
      return parentDevice && parentDevice.name ? parentDevice.name : 'Unknown Device';
    },
    editDevice(device: Device) {
      this.editingDevice = device;
      this.$emit('edit', device);
    },
    cancelEdit() {
      this.editingDevice = null;
      this.$emit('cancelEdit');
    },
    afterSave() {
      this.editingDevice = null;
      this.$emit('afterSave');
    },
  },
});
</script>
