<template>
  <div>
    <slot v-if="!error" />
    <p v-else class="text-red-500">An error occurred: {{ error.message }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onErrorCaptured } from 'vue';

export default defineComponent({
  name: 'ErrorBoundary',
  setup() {
    const error = ref<Error | null>(null);

    onErrorCaptured((err) => {
      error.value = err as Error;
      return false; // Prevent further propagation
    });

    return { error };
  },
});
</script>
