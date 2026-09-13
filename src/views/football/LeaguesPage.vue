<script setup lang="ts">
import ResourcePage from './ResourcePage.vue';

const fields = [
  { key: 'name', label: 'Name', required: true },
  { key: 'country', label: 'Country', required: true },
  { key: 'externalId', label: 'Sportmonks ID' },
  { key: 'logo', label: 'Logo URL' },
  { key: 'active', label: 'Active', type: 'boolean' as const }
];
</script>

<template>
  <ResourcePage title="Leagues" endpoint="leagues" :fields="fields" />
</template>