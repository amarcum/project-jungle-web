<template>
  <div class="mx-auto p-4">
    <div v-if="isLoadingPlants || plants.length === 0" class="flex justify-center items-center h-64">
      <div class="flex items-center space-x-2">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p class="text-white">Loading...</p>
      </div>
    </div>
    <PlantList v-else :plants="plants" @edit-plant="openModal"/>
    <div v-if="showModal && editingPlant" class="modal-overlay">
      <div class="modal-content bg-gray-900 rounded-lg p-4">
        <button @click="showModal = false"
                class="close-button bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded">
          <span>X</span></button>
        <PlantEditForm
            :plant="editingPlant"
            @cancelEdit="cancelEdit"
            @saved="plantSaved"
        />
      </div>
    </div>
    <!-- Add plant floating action button -->
    <div
        class="fixed bottom-8 right-8 bg-green-500 hover:bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
        @click="addNewPlant">
      <svg xmlns="http://www.w3.org/2000/svg"
           class="h-8 w-8"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import PlantList from '@/components/PlantList.vue';
import PlantEditForm from '@/components/PlantEditForm.vue';
import type {Plant} from '@/types/ApiInterfaces.ts';
import axios from 'axios';

export default defineComponent({
  name: 'PlantListView',
  components: {PlantList, PlantEditForm},
  data() {
    return {
      plants: [] as Plant[],
      isLoadingPlants: false,
      showModal: false,
      editingPlant: null as Plant | null,
      curError: null,
    };
  },
  mounted() {
    this.fetchPlants();
  },
  methods: {
    async fetchPlants() {
      this.isLoadingPlants = true;
      this.curError = null;
      try {
        const response = await axios.get<Plant[]>('/api/plants');
        if (Array.isArray(response.data)) {
          this.plants = response.data;
          this.plants = this.plants.sort((a: Plant, b: Plant) =>
              a.name.localeCompare(b.name, 'en', {sensitivity: 'accent'})
          );
        }
      } catch (error) {
        console.error('Error fetching plants:', error);
      } finally {
        this.isLoadingPlants = false;
      }
    },
    addNewPlant() {
      this.editingPlant = {} as Plant;
      this.showModal = true;
    },
    cancelEdit() {
      this.editingPlant = null;
      this.showModal = false;
    },
    plantSaved() {
      this.cancelEdit();
      this.fetchPlants();
    },
    openModal(plant: Plant) {
      this.editingPlant = {...plant}; // Create a copy
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
  },
});
</script>
<style scoped>
@import "@/utils/modal.css";
</style>