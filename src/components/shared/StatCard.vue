<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    value: string | number;
    caption?: string;
    icon?: string;
    color?: string;
  }>(),
  { color: 'primary' }
);
</script>

<template>
  <v-card elevation="0" class="border rounded-lg stat-card">
    <v-card-text class="d-flex align-start justify-space-between ga-3">
      <div>
        <div class="text-caption text-medium-emphasis text-uppercase font-weight-medium mb-1">{{ label }}</div>
        <div class="text-h5 font-weight-bold">{{ value }}</div>
        <div v-if="caption" class="text-caption text-medium-emphasis mt-1">{{ caption }}</div>
      </div>
      <v-avatar v-if="icon" :color="`light${color}`" size="42" rounded="lg">
        <v-icon :icon="icon" :color="color" size="22" />
      </v-avatar>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.stat-card {
  height: 100%;
}
</style>
