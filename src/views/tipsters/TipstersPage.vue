<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiFetch } from '@/utils/api';
import DataTable from '@/components/shared/DataTable.vue';
import StatusChip from '@/components/shared/StatusChip.vue';

const rows = ref<any[]>([]);
const loading = ref(false);
const error = ref('');
const search = ref('');

const headers = [
  { title: 'Tipster', key: 'username' },
  { title: 'Tips', key: 'totalTips', align: 'end' as const },
  { title: 'Wins', key: 'wins', align: 'end' as const },
  { title: 'Losses', key: 'losses', align: 'end' as const },
  { title: 'Profit', key: 'profit', align: 'end' as const },
  { title: 'ROI', key: 'roi', align: 'end' as const },
  { title: 'Status', key: 'active' }
];

async function load() {
  loading.value = true;
  try {
    const d = await apiFetch('/admin/tipsters');
    rows.value = d.data || d || [];
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
onMounted(load);
</script>

<template>
  <DataTable
    title="Approved Tipsters"
    subtitle="Manage approved BraTipsters tipster profiles and performance."
    :headers="headers"
    :items="rows"
    :loading="loading"
    :error="error"
    v-model:search="search"
    search-label="Search tipsters"
    empty-title="No approved tipsters yet"
    empty-text="Approved applications will appear here."
  >
    <template #item.username="{ item }">
      <div class="font-weight-bold">{{ item.username }}</div>
      <div class="text-caption text-medium-emphasis">{{ item.userId?.email }}</div>
    </template>
    <template #item.roi="{ item }">{{ item.roi }}%</template>
    <template #item.active="{ item }">
      <StatusChip :status="item.active" />
    </template>
  </DataTable>
</template>
