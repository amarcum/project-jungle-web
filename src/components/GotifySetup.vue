<template>
  <div class="max-w-md mx-auto p-4 bg-gray-800 rounded-lg shadow">
    <h3 class="text-xl font-semibold text-white mb-2">Gotify Setup</h3>
    <form @submit.prevent="saved" class="space-y-4">
      <div>
        <div>
          <label for="gotifyUrl" class="block text-white mb-2">Gotify URL:</label>
          <input v-model="gotifyUrl" id="gotifyUrl" type="text"
                 class="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md" required/>
        </div>
        <div>
          <label for="gotifyApiKey" class="block text-white mb-2">API Key:</label>
          <input v-model="gotifyApiKey" id="gotifyApiKey" type="text"
                 class="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md" required/>
        </div>
        <div class="text-center space-x-4">
          <button type="button" @click="testNotification"
                  class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Test Notification
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';

export default defineComponent({
  setup() {
    const gotifyUrl = ref('');
    const gotifyApiKey = ref('');

    const testNotification = () => {
      // Send a test notification to the backend
      // The backend will use Gotify to send the notification
    };
    const saved = () => {

    }

    return {
      gotifyUrl,
      gotifyApiKey,
      saved,
      testNotification,
    };
  },
});
</script>