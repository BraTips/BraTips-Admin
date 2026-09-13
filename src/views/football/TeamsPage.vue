<script setup lang="ts">
import ResourcePage from './ResourcePage.vue';

const fields = [
  { key: 'name', label: 'Name', required: true },
  { key: 'shortName', label: 'Short Name' },
  { key: 'country', label: 'Country' },
  { key: 'externalId', label: 'Sportmonks ID' },
  { key: 'logo', label: 'Logo URL' },
  { key: 'active', label: 'Active', type: 'boolean' as const }
];
</script>

<template>
  <ResourcePage title="Teams" endpoint="teams" :fields="fields" />
</template>