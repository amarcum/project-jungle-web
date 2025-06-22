<template>
  <div v-if="isLoadingDevices || devices.length == 0" class="flex justify-center items-center h-64">
    <div class="flex items-center space-x-2">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <p class="text-white">Loading device List...</p>
    </div>
  </div>
  <div v-else class="mx-auto p-4">
    <DeviceList :devices="devices" @edit="editDevice" @delete="deleteDevice" @afterSave="fetchDevices"/>
    <div v-if="showModal && editingDevice" class="modal-overlay">
      <div class="modal-content bg-gray-900 rounded-lg p-4">
        <button @click="showModal = false"
                class="close-button bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded">
          <span>X</span></button>
        <DeviceEditForm
            :device="editingDevice"
            @cancelEdit="cancelEdit"
            @saved="saved"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import type {Device} from '@/types/ApiInterfaces.ts';
import DeviceList from "@/components/DeviceList.vue";
import axios from "axios";
import DeviceEditForm from "@/components/DeviceEditForm.vue";

export default defineComponent({
  name: 'DeviceListView',
  components: {DeviceEditForm, DeviceList},
  data() {
    return {
      devices: [] as Device[],
      isLoadingDevices: false,
      editingDevice: null as Device | null,
      showModal: false,
    };
  },
  methods: {

    async fetchDevices() {
      this.isLoadingDevices = true;
      try {
        const response = await axios.get<Device[]>('/api/devices');
        if (Array.isArray(response.data)) {
          this.devices = response.data;
          this.devices = this.devices.sort((a: Device, b: Device) =>
              a.name.localeCompare(b.name, 'en', { sensitivity: 'accent' })
          );
          // this.devices = this.devices.filter((value: Device) => {
          //   return value.is_enabled
          // })
          this.editingDevice = null;
        }
      } catch (error) {
        console.error('Error fetching devices:', error);
      } finally {
        this.isLoadingDevices = false;
      }
    },
    editDevice(device: Device) {
      this.editingDevice = device;
      this.showModal = true;
      if (this.editingDevice && this.editingDevice.hardware_id) {
        console.log("Edit hardware_id: " + BigInt(this.editingDevice.hardware_id).toString());
      }
    },
    saved() {
      this.editingDevice = null;
    },
    cancelEdit() {
      this.editingDevice = null;
    },
    async deleteDevice(id: number) {
      try {
        await axios.delete(`/api/device/${id}`);
        await this.fetchDevices();
      } catch (error) {
        console.error('Error deleting device:', error);
      }
    },

  },
  mounted() {
    this.fetchDevices();
  }
});
</script>

<style scoped>
@import "@/utils/modal.css";
</style>