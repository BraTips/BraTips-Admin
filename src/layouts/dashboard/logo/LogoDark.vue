<template>
  <div class="logo">
    <RouterLink to="/dashboard" aria-label="BraTipsters dashboard">
      <img :src="logoUrl" @error="onLogoError" alt="BraTipsters" class="app-logo" />
    </RouterLink>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
const logoUrl = computed(() => `${import.meta.env.BASE_URL}logo.svg`);
const onLogoError = (e: Event) => { const img=e.target as HTMLImageElement; img.src='/logo.svg'; }; 
</script>
