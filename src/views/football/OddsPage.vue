<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { apiFetch } from '@/utils/api';
import DataTable from '@/components/shared/DataTable.vue';

const mode = ref<'pre-match' | 'inplay'>('pre-match');
const loading = ref(false);
const error = ref('');
const rows = ref<any[]>([]);
const search = ref('');

const headers = [
  { title: 'Fixture', key: 'fixture' },
  { title: 'Bookmaker', key: 'bookmaker' },
  { title: 'Market', key: 'market' },
  { title: 'Selection', key: 'selection' },
  { title: 'Value', key: 'value', align: 'end' as const },
  { title: 'Updated', key: 'updated' }
];

async function load() {
  loading.value = true; error.value = '';
  try {
    const d = await apiFetch(`/admin/providers/odds?mode=${mode.value}`);
    rows.value = Array.isArray(d?.data) ? d.data : [];
  } catch (e: any) { error.value = e.message; rows.value = []; }
  finally { loading.value = false; }
}
onMounted(load);
const count = computed(() => rows.value.length);
</script>

<template>
  <DataTable
    title="Sportmonks Odds"
    :subtitle="`${count} odds returned · pre-match and in-play prices from the server-side Sportmonks feed`"
    :headers="headers"
    :items="rows"
    item-key="id"
    :loading="loading"
    :error="error"
    v-model:search="search"
    search-label="Search odds"
    empty-title="No odds returned"
    empty-text="No odds returned for this mode, or your Sportmonks plan does not include it."
  >
    <template #filters>
      <v-select v-model="mode" :items="['pre-match', 'inplay']" label="Mode" density="compact" variant="outlined" hide-details style="width: 150px" @update:model-value="load" />
    </template>
    <template #toolbar>
      <v-btn variant="tonal" prepend-icon="mdi-refresh" @click="load">Refresh</v-btn>
    </template>

    <template #item.fixture="{ item }">{{ item.fixture?.name || item.fixture_id || '—' }}</template>
    <template #item.bookmaker="{ item }">{{ item.bookmaker?.name || item.bookmaker_id || '—' }}</template>
    <template #item.market="{ item }">{{ item.market?.name || item.market_description || item.market_id || '—' }}</template>
    <template #item.selection="{ item }">{{ item.label || item.name || '—' }}</template>
    <template #item.value="{ item }">{{ item.value || '—' }}</template>
    <template #item.updated="{ item }">{{ item.latest_bookmaker_update || item.last_update || '—' }}</template>
  </DataTable>
</template>
