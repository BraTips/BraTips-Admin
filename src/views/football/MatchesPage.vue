<script setup lang="ts">
import ResourcePage from './ResourcePage.vue';

const fields = [
  { key: 'leagueId', label: 'League', type: 'select' as const, optionsEndpoint: '/admin/leagues', optionLabelKey: 'name', required: true },
  { key: 'seasonId', label: 'Season', type: 'select' as const, optionsEndpoint: '/admin/seasons', optionLabelKey: 'name' },
  { key: 'homeTeamId', label: 'Home Team', type: 'select' as const, optionsEndpoint: '/admin/teams', optionLabelKey: 'name', required: true },
  { key: 'awayTeamId', label: 'Away Team', type: 'select' as const, optionsEndpoint: '/admin/teams', optionLabelKey: 'name', required: true },
  { key: 'kickoff', label: 'Kickoff', type: 'date' as const, required: true },
  { key: 'status', label: 'Status', type: 'select' as const, choices: ['scheduled', 'live', 'finished', 'postponed', 'cancelled'] },
  { key: 'homeScore', label: 'Home Score', type: 'number' as const },
  { key: 'awayScore', label: 'Away Score', type: 'number' as const },
  { key: 'externalId', label: 'Sportmonks ID' }
];
</script>

<template>
  <ResourcePage title="Matches" endpoint="matches" :fields="fields" />
</template>