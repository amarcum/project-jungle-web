<template>
  <nav class="bg-gray-800 dark:bg-gray-900">
    <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
      <div class="relative flex h-16 items-center justify-between">
        <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
          <button
              type="button"
              class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              :aria-expanded="isMobileMenuOpen"
              @click="isMobileMenuOpen = !isMobileMenuOpen"
          >
            <span class="sr-only">Open main menu</span>
            <!-- Use v-if/v-else for cleaner conditional rendering -->
            <MenuIcon v-if="!isMobileMenuOpen" class="block h-6 w-6" />
            <CloseIcon v-else class="block h-6 w-6" />
          </button>
        </div>
        <div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
          <div class="flex flex-shrink-0 items-center">
          </div>
          <div class="hidden sm:ml-6 sm:block">
            <div class="flex space-x-4">
              <router-link
                  v-for="item in navigationItems"
                  :key="item.name"
                  :to="item.to"
                  class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  active-class="bg-gray-900 text-white"
              >{{ item.name }}</router-link
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile menu, show/hide based on menu state. -->
    <div class="sm:hidden" id="mobile-menu" v-show="isMobileMenuOpen">
      <div class="space-y-1 px-2 pt-2 pb-3">
        <router-link
            v-for="item in navigationItems"
            :key="item.name"
            :to="item.to"
            class="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            active-class="bg-gray-900 text-white"
            @click="isMobileMenuOpen = false"
        >{{ item.name }}</router-link
        >
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// Import the new icon components
import MenuIcon from '@/components/icons/MenuIcon.vue';
import CloseIcon from '@/components/icons/CloseIcon.vue';

const isMobileMenuOpen = ref(false);

const navigationItems = [
  { name: 'Plants', to: '/plants' },
  { name: 'Charts', to: '/charts' },
  { name: 'Sensors', to: '/sensors' },
  { name: 'Devices', to: '/devices' },
  { name: 'Settings', to: '/settings' },
];
</script>