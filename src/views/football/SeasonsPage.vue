<script setup lang="ts">
import ResourcePage from './ResourcePage.vue';

const fields = [
  { key: 'name', label: 'Name', required: true },
  { key: 'leagueId', label: 'League', type: 'select' as const, optionsEndpoint: '/admin/leagues', optionLabelKey: 'name', required: true },
  { key: 'externalId', label: 'Sportmonks ID' },
  { key: 'startDate', label: 'Start Date', type: 'date' as const },
  { key: 'endDate', label: 'End Date', type: 'date' as const },
  { key: 'active', label: 'Active', type: 'boolean' as const }
];
</script>

<template>
  <ResourcePage title="Seasons" endpoint="seasons" :fields="fields" />
</template>