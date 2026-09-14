<template>
  <div class="logo">
    <RouterLink to="/dashboard" aria-label="logo">
      <img :src="`${baseUrl}logo.svg`" alt="BraTipsters" class="app-logo" />
    </RouterLink>
  </div>
</template>
<script setup lang="ts">
import { RouterLink } from 'vue-router';

const baseUrl = import.meta.env.BASE_URL;

</script>
