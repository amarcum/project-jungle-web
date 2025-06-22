<template>
  <div class="flex gap-4 items-center">
    <input
      v-model="searchValue"
      type="text"
      :placeholder="placeholder"
      class="px-3 py-2 bg-gray-700 text-white rounded-md"
      @input="emitChanges"
    />
    <select 
      v-model="sortValue"
      class="px-3 py-2 bg-gray-700 text-white rounded-md"
      @change="emitChanges"
    >
      <option v-for="option in sortOptions" 
              :key="option.value" 
              :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <button
      @click="toggleShowAll"
      :class="`px-4 py-2 rounded-md ${showAll ? 'bg-blue-600' : 'bg-gray-600'}`"
    >
      {{ showAll ? 'Show Active Only' : 'Show All' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  sortOptions: Array<{value: string, label: string}>,
  placeholder?: string
}>();

const emit = defineEmits(['filter-change']);

const searchValue = ref('');
const sortValue = ref(props.sortOptions[0]?.value || '');
const showAll = ref(false);

const emitChanges = () => {
  emit('filter-change', {
    search: searchValue.value,
    sortBy: sortValue.value,
    showAll: showAll.value
  });
};

const toggleShowAll = () => {
  showAll.value = !showAll.value;
  emitChanges();
};
</script>