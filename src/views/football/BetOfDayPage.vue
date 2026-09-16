<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiFetch } from '@/utils/api';
import PageHeader from '@/components/shared/PageHeader.vue';
import StatusChip from '@/components/shared/StatusChip.vue';

const date = ref(new Date().toISOString().slice(0, 10));
const rows = ref<any[]>([]);
const loading = ref(false);
const error = ref('');

async function load() {
  try { rows.value = await apiFetch(`/admin/bet-of-day?date=${date.value}`); }
  catch (e: any) { error.value = e.message; }
}
async function generate() {
  loading.value = true; error.value = '';
  try { rows.value = await apiFetch('/admin/bet-of-day/generate', { method: 'POST', body: JSON.stringify({ date: date.value }) }); }
  catch (e: any) { error.value = e.message; }
  finally { loading.value = false; }
}
onMounted(load);
</script>

<template>
  <PageHeader title="AI Bet of the Day" subtitle="Automatically selected and published daily from available fixtures, markets and odds. Admin review is no longer required.">
    <template #actions>
      <v-text-field v-model="date" type="date" density="compact" variant="outlined" hide-details style="width: 170px" @change="load" />
      <v-btn color="primary" :loading="loading" prepend-icon="mdi-auto-fix" @click="generate">Run Automatic Selection</v-btn>
    </template>
  </PageHeader>

  <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>

  <v-row v-if="rows.length">
    <v-col v-for="r in rows" :key="r._id" cols="12" md="6">
      <v-card elevation="0" class="border rounded-lg">
        <v-card-item>
          <v-card-title>{{ r.matchId?.homeTeamId?.name }} vs {{ r.matchId?.awayTeamId?.name }}</v-card-title>
          <v-card-subtitle>{{ r.matchId?.leagueId?.name }} · {{ r.matchId?.kickoff ? new Date(r.matchId.kickoff).toLocaleString() : '' }}</v-card-subtitle>
          <template #append><StatusChip :status="r.status" /></template>
        </v-card-item>
        <v-card-text>
          <div class="text-h6 font-weight-bold">{{ r.prediction }}</div>
          <div class="mt-2 text-body-2">Confidence: <b>{{ r.confidence }}%</b> · Risk: <b class="text-capitalize">{{ r.risk }}</b></div>
          <p class="mt-3 text-body-2 text-medium-emphasis">{{ r.analysis }}</p>
          <v-chip size="small" variant="tonal">{{ r.model }}</v-chip>
        </v-card-text>
        <v-card-actions v-if="r.status === 'published'">
          <v-chip color="success" variant="tonal" prepend-icon="mdi-check-circle">Live on public site</v-chip>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
  <v-card v-else elevation="0" class="border rounded-lg">
    <v-card-text class="text-center py-10 text-medium-emphasis">No picks generated for this date.</v-card-text>
  </v-card>
</template>
