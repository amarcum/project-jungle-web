<template>
  <div class="mx-auto p-4">
    <h2 class="text-2xl font-bold mb-4 text-center text-white">Settings</h2>
    <GotifySetup />
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import GotifySetup from "@/components/GotifySetup.vue";

export default defineComponent({
  name: 'Settings',
  components: {GotifySetup},
  data() {
    return {
    };
  },
  methods: {},
});
</script>