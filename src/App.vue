<template>
  <div class="text-white min-h-screen">
    <header class="bg-primary text-center py-3">
      <h1>Project Jungle</h1>
    </header>
    <div id="nav">
      <NavBar/>
    </div>
    <ErrorBoundary>
      <main class="pt-20">
        <router-view/>
      </main>
    </ErrorBoundary>
  </div>
</template>

<script setup lang="ts">
import NavBar from "@/components/NavBar.vue";
import ErrorBoundary from "@/components/ErrorBoundary.vue";
</script>