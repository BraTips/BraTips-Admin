<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { apiFetch } from '@/utils/api';
import DataTable from '@/components/shared/DataTable.vue';
import StatusChip from '@/components/shared/StatusChip.vue';
import StatCard from '@/components/shared/StatCard.vue';
import PageHeader from '@/components/shared/PageHeader.vue';

const loading = ref(false);
const error = ref('');
const data = ref<any>({ totals: {}, byPlan: [], recent: [] });
const search = ref('');

const headers = [
  { title: 'User', key: 'user' },
  { title: 'Plan', key: 'plan' },
  { title: 'Status', key: 'status' },
  { title: 'Created', key: 'createdAt' }
];

async function load() {
  loading.value = true;
  error.value = '';
  try { data.value = await apiFetch('/admin/billing/overview?days=30'); }
  catch (e: any) { error.value = e.message || 'Unable to load billing.'; }
  finally { loading.value = false; }
}
function metricLabel(k: string) { return String(k).replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase()); }
onMounted(load);
</script>

<template>
  <PageHeader title="Billing" subtitle="Subscription revenue and plan activity for the last 30 days.">
    <template #actions>
      <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="load">Refresh</v-btn>
    </template>
  </PageHeader>

  <v-alert v-if="error" type="warning" variant="tonal" class="mb-4">{{ error }}</v-alert>

  <v-row class="mb-1">
    <v-col v-for="(v, k) in data.totals" :key="k" cols="6" md="2">
      <StatCard :label="metricLabel(String(k))" :value="v as any" />
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12" md="5">
      <v-card elevation="0" class="border rounded-lg" style="height: 100%">
        <v-card-item><v-card-title class="text-subtitle-1 font-weight-bold">Active plans</v-card-title></v-card-item>
        <v-card-text>
          <v-chip v-for="p in data.byPlan" :key="p._id" class="ma-1" variant="tonal" color="primary">{{ p._id }} · {{ p.count }}</v-chip>
          <div v-if="!data.byPlan.length" class="text-medium-emphasis">No active subscriptions yet.</div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="7">
      <DataTable
        title="Recent subscription activity"
        :headers="headers"
        :items="data.recent"
        :loading="loading"
        v-model:search="search"
        search-label="Search subscriptions"
        empty-title="No subscriptions yet"
      >
        <template #item.user="{ item }">{{ item.userId?.name || item.userId?.email || '—' }}</template>
        <template #item.plan="{ item }"><span class="text-capitalize">{{ item.plan }}</span></template>
        <template #item.status="{ item }"><StatusChip :status="item.status" /></template>
        <template #item.createdAt="{ item }">{{ new Date(item.createdAt).toLocaleString() }}</template>
      </DataTable>
    </v-col>
  </v-row>
</template>
