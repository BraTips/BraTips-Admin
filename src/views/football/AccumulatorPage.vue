<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { apiFetch } from '@/utils/api';
import PageHeader from '@/components/shared/PageHeader.vue';

const date = ref(new Date().toISOString().slice(0, 10));
const selectionCount = ref(5);
const rows = ref<any[]>([]);
const loading = ref(false);
const error = ref('');
const message = ref('');

const selected = computed(() => rows.value.find(x => Number(x.selectionCount) === Number(selectionCount.value)));

async function load() {
  try { error.value = ''; rows.value = await apiFetch(`/admin/accumulators?date=${date.value}`); }
  catch (e: any) { error.value = e.message; }
}
async function generate() {
  loading.value = true; error.value = ''; message.value = '';
  try { const item = await apiFetch('/admin/accumulators/generate', { method: 'POST', body: JSON.stringify({ date: date.value, selectionCount: selectionCount.value }) }); rows.value = [...rows.value.filter(x => x.selectionCount !== item.selectionCount), item].sort((a,b)=>a.selectionCount-b.selectionCount); message.value = `${selectionCount.value}-selection accumulator generated and published.`; }
  catch (e: any) { error.value = e.message; }
  finally { loading.value = false; }
}
async function generateAll() {
  loading.value = true; error.value = ''; message.value = '';
  try { rows.value = await apiFetch('/admin/accumulators/generate-all', { method: 'POST', body: JSON.stringify({ date: date.value }) }); message.value = 'All available 1–10 selection accumulators generated and published.'; }
  catch (e: any) { error.value = e.message; }
  finally { loading.value = false; }
}
onMounted(load);
</script>

<template>
  <PageHeader title="AI Daily Accumulator" subtitle="Generate the daily AI accumulator from 1 to 10 selections. Published combinations appear automatically on the public shopfront.">
    <template #actions>
      <v-text-field v-model="date" type="date" density="compact" variant="outlined" hide-details style="width: 170px" @change="load" />
      <v-select v-model="selectionCount" :items="Array.from({length:10},(_,i)=>i+1)" label="Selections" density="compact" variant="outlined" hide-details style="width: 130px" />
      <v-btn color="primary" :loading="loading" prepend-icon="mdi-auto-fix" @click="generate">Generate {{ selectionCount }}-Leg</v-btn>
      <v-btn variant="tonal" :loading="loading" prepend-icon="mdi-layers-triple" @click="generateAll">Generate 1–10</v-btn>
    </template>
  </PageHeader>

  <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>
  <v-alert v-if="message" type="success" variant="tonal" class="mb-4">{{ message }}</v-alert>

  <v-card v-if="selected" elevation="0" class="border rounded-lg mb-6">
    <v-card-item>
      <v-card-title>{{ selected.selectionCount }}-Selection Accumulator</v-card-title>
      <v-card-subtitle>{{ selected.model }} · {{ selected.status }} · {{ selected.risk }} risk</v-card-subtitle>
      <template #append><div class="text-h5 font-weight-bold">{{ Number(selected.combinedOdds || 1).toFixed(2) }}</div></template>
    </v-card-item>
    <v-card-text>
      <v-row>
        <v-col v-for="(leg, i) in selected.legs" :key="i" cols="12" md="6">
          <v-card variant="tonal" class="h-100">
            <v-card-item>
              <v-card-title class="text-body-1">{{ i + 1 }}. {{ leg.matchId?.homeTeamId?.name }} vs {{ leg.matchId?.awayTeamId?.name }}</v-card-title>
              <v-card-subtitle>{{ leg.matchId?.leagueId?.name || 'Football' }}</v-card-subtitle>
            </v-card-item>
            <v-card-text>
              <div class="text-h6 font-weight-bold">{{ leg.prediction }}</div>
              <div class="mt-2">Odds: <b>{{ leg.odds ? Number(leg.odds).toFixed(2) : '—' }}</b> · Confidence: <b>{{ leg.confidence }}%</b> · Risk: <b>{{ leg.risk }}</b></div>
              <p class="mt-3 text-body-2 text-medium-emphasis">{{ leg.analysis }}</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-card elevation="0" class="border rounded-lg">
    <v-card-item><v-card-title>Today's Generated Accumulators</v-card-title><v-card-subtitle>Choose any level from 1 to 10 selections.</v-card-subtitle></v-card-item>
    <v-card-text>
      <v-chip-group v-if="rows.length" v-model="selectionCount" selected-class="text-primary" mandatory>
        <v-chip v-for="row in rows" :key="row.selectionCount" :value="row.selectionCount" variant="outlined">{{ row.selectionCount }}-leg · {{ Number(row.combinedOdds || 1).toFixed(2) }}</v-chip>
      </v-chip-group>
      <div v-else class="text-center py-10 text-medium-emphasis">No accumulators generated for this date yet.</div>
    </v-card-text>
  </v-card>
</template>
