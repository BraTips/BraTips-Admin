<script setup lang="ts">
import ResourcePage from './ResourcePage.vue';

const fields = [
  { key: 'tipsterId', label: 'Tipster', type: 'select' as const, optionsEndpoint: '/admin/users?role=tipster', optionLabelKey: 'name', required: true },
  { key: 'fixture', label: 'Fixture', required: true },
  { key: 'league', label: 'League (label)' },
  { key: 'prediction', label: 'Prediction', required: true },
  { key: 'odds', label: 'Odds', type: 'number' as const, required: true },
  { key: 'confidence', label: 'Confidence %', type: 'number' as const },
  { key: 'analysis', label: 'Analysis' },
  { key: 'status', label: 'Status', type: 'select' as const, choices: ['pending', 'published', 'won', 'lost', 'void'] },
  { key: 'profit', label: 'Profit / Loss', type: 'number' as const },
  { key: 'matchId', label: 'Match ID (optional, links to Matches)' }
];
</script>

<template>
  <ResourcePage title="Predictions" endpoint="predictions" :fields="fields" />
</template>