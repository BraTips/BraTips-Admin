<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiFetch } from '@/utils/api';
import DataTable from '@/components/shared/DataTable.vue';
import StatusChip from '@/components/shared/StatusChip.vue';
import StatCard from '@/components/shared/StatCard.vue';

const data = ref<any[]>([]);
const stats = ref<any>({});
const loading = ref(false);
const error = ref('');
const status = ref('');
const search = ref('');

const headers = [
  { title: 'Date', key: 'date' },
  { title: 'Tipster', key: 'tipster' },
  { title: 'Fixture', key: 'fixture' },
  { title: 'Prediction', key: 'prediction' },
  { title: 'Odds', key: 'odds', align: 'end' as const },
  { title: 'Confidence', key: 'confidence', align: 'end' as const },
  { title: 'Result', key: 'status' },
  { title: 'P/L', key: 'profit', align: 'end' as const }
];
const statCards = [
  { k: 'total', l: 'Settled Tips' },
  { k: 'wins', l: 'Wins' },
  { k: 'losses', l: 'Losses' },
  { k: 'winRate', l: 'Win Rate %' },
  { k: 'profit', l: 'Profit / Loss' }
];

async function load() {
  loading.value = true;
  try {
    const q = status.value ? `?status=${status.value}` : '';
    const d = await apiFetch(`/admin/prediction-history${q}`);
    data.value = d.data;
    stats.value = d.stats;
  } catch (e: any) { error.value = e.message; }
  finally { loading.value = false; }
}
onMounted(load);
</script>

<template>
  <v-row class="mb-1">
    <v-col v-for="s in statCards" :key="s.k" cols="6" md="2" lg="2">
      <StatCard :label="s.l" :value="stats[s.k] ?? 0" />
    </v-col>
  </v-row>

  <DataTable
    title="Prediction History"
    subtitle="Historical BraTipsters track record and settled results."
    :headers="headers"
    :items="data"
    :loading="loading"
    :error="error"
    v-model:search="search"
    search-label="Search history"
    empty-title="No settled predictions yet"
  >
    <template #filters>
      <v-select
        v-model="status"
        :items="['', 'won', 'lost', 'void']"
        label="Result"
        density="compact"
        variant="outlined"
        hide-details
        style="min-width: 150px"
        @update:model-value="load"
      />
    </template>

    <template #item.date="{ item }">{{ item.resultAt ? new Date(item.resultAt).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString() }}</template>
    <template #item.tipster="{ item }">{{ item.tipsterId?.name || item.tipsterId?.email }}</template>
    <template #item.confidence="{ item }">{{ item.confidence ?? '—' }}%</template>
    <template #item.status="{ item }"><StatusChip :status="item.status" /></template>
    <template #item.profit="{ item }">{{ item.profit ?? 0 }}</template>
  </DataTable>
</template>
