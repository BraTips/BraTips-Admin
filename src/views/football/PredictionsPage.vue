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
  <!--
    Predictions submitted by tipsters land here with status "pending" and only appear on
    the public site once status is "published". Editing a prediction through the generic
    dialog used to silently fail (see ResourcePage.vue fix) which meant approvals never
    went through. The Approve/Reject buttons below patch just the status field directly,
    so approving a tipster's pick is one click and can't hit that bug.
  -->
  <ResourcePage title="Predictions" endpoint="predictions" :fields="fields" status-key="status">
    <template #row-actions="{ row, quickUpdate }">
      <v-btn v-if="row.status === 'pending'" size="small" variant="tonal" color="success" class="mr-1" @click="quickUpdate(row, { status: 'published' })">Approve</v-btn>
      <v-btn v-if="row.status === 'pending'" size="small" variant="tonal" color="error" class="mr-1" @click="quickUpdate(row, { status: 'void' })">Reject</v-btn>
    </template>
  </ResourcePage>
</template>