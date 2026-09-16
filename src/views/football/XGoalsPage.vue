<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { apiFetch } from '@/utils/api';
import PageHeader from '@/components/shared/PageHeader.vue';
import StatCard from '@/components/shared/StatCard.vue';

const fixtures = ref<any[]>([]);
const selected = ref('');
const data = ref<any>(null);
const loading = ref(false);
const error = ref('');
const showRaw = ref(false);

async function loadFixtures() {
  try {
    const d = await apiFetch('/admin/providers/fixtures');
    fixtures.value = Array.isArray(d?.data) ? d.data : [];
    if (fixtures.value[0]) selected.value = String(fixtures.value[0].id);
  } catch (e: any) { error.value = e.message; }
}
async function loadXg() {
  if (!selected.value) return;
  loading.value = true; error.value = '';
  try { data.value = await apiFetch(`/admin/providers/xgoals/${selected.value}`); }
  catch (e: any) { error.value = e.message; data.value = null; }
  finally { loading.value = false; }
}
onMounted(async () => { await loadFixtures(); await loadXg(); });

const fixtureOptions = computed(() => fixtures.value.map((f: any) => ({ title: f.name, value: String(f.id) })));

const metrics = computed(() => {
  const list = data.value?.xgfixture || [];
  return list.map((x: any) => ({
    label: x.type?.name || x.type?.developer_name || 'xG',
    location: x.location || '',
    value: x.data?.value ?? '—'
  }));
});
const homeMetrics = computed(() => metrics.value.filter((m: any) => m.location === 'home'));
const awayMetrics = computed(() => metrics.value.filter((m: any) => m.location === 'away'));
const otherMetrics = computed(() => metrics.value.filter((m: any) => m.location !== 'home' && m.location !== 'away'));

function numeric(v: any) { const n = Number(v); return isNaN(n) ? 0 : n; }
const homeTotal = computed(() => numeric(homeMetrics.value.find((m: any) => /xg$/i.test(m.label))?.value ?? homeMetrics.value[0]?.value));
const awayTotal = computed(() => numeric(awayMetrics.value.find((m: any) => /xg$/i.test(m.label))?.value ?? awayMetrics.value[0]?.value));
const homeShare = computed(() => {
  const total = homeTotal.value + awayTotal.value;
  return total > 0 ? Math.round((homeTotal.value / total) * 100) : 50;
});
</script>

<template>
  <PageHeader title="Sportmonks xGoals" subtitle="Expected goals and related metrics for a selected fixture.">
    <template #actions>
      <v-select
        v-model="selected"
        :items="fixtureOptions"
        label="Fixture"
        density="compact"
        variant="outlined"
        hide-details
        style="min-width: 300px"
        @update:model-value="loadXg"
      />
      <v-btn variant="tonal" prepend-icon="mdi-refresh" @click="loadXg">Refresh</v-btn>
    </template>
  </PageHeader>

  <v-alert v-if="error" type="warning" variant="tonal" class="mb-4">{{ error }}</v-alert>

  <v-skeleton-loader v-if="loading" type="article, article" />

  <template v-else-if="data">
    <v-card elevation="0" class="border rounded-lg mb-4">
      <v-card-item>
        <v-card-title>{{ data.name || 'Fixture' }}</v-card-title>
        <v-card-subtitle>{{ data.starting_at || '' }}</v-card-subtitle>
      </v-card-item>
      <v-card-text v-if="homeMetrics.length || awayMetrics.length">
        <div class="d-flex justify-space-between text-body-2 font-weight-medium mb-2">
          <span>Home xG · {{ homeTotal.toFixed(2) }}</span>
          <span>Away xG · {{ awayTotal.toFixed(2) }}</span>
        </div>
        <div class="xg-bar">
          <div class="xg-bar-home" :style="{ width: homeShare + '%' }" />
          <div class="xg-bar-away" :style="{ width: 100 - homeShare + '%' }" />
        </div>
      </v-card-text>
    </v-card>

    <v-row class="mb-1">
      <v-col cols="12" md="6">
        <v-card elevation="0" class="border rounded-lg" style="height: 100%">
          <v-card-item><v-card-title class="text-subtitle-1 font-weight-bold">Home metrics</v-card-title></v-card-item>
          <v-card-text>
            <v-row v-if="homeMetrics.length">
              <v-col v-for="m in homeMetrics" :key="m.label" cols="6">
                <StatCard :label="m.label" :value="m.value" color="primary" />
              </v-col>
            </v-row>
            <div v-else class="text-medium-emphasis text-body-2 py-4 text-center">No home metrics returned.</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card elevation="0" class="border rounded-lg" style="height: 100%">
          <v-card-item><v-card-title class="text-subtitle-1 font-weight-bold">Away metrics</v-card-title></v-card-item>
          <v-card-text>
            <v-row v-if="awayMetrics.length">
              <v-col v-for="m in awayMetrics" :key="m.label" cols="6">
                <StatCard :label="m.label" :value="m.value" color="secondary" />
              </v-col>
            </v-row>
            <div v-else class="text-medium-emphasis text-body-2 py-4 text-center">No away metrics returned.</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="otherMetrics.length" class="mb-1">
      <v-col v-for="m in otherMetrics" :key="m.label + m.location" cols="6" md="3">
        <StatCard :label="`${m.label} ${m.location ? '· ' + m.location : ''}`" :value="m.value" color="info" />
      </v-col>
    </v-row>

    <v-card elevation="0" class="border rounded-lg">
      <v-card-item>
        <v-card-title class="text-subtitle-1 font-weight-bold">Raw provider response</v-card-title>
        <template #append>
          <v-btn size="small" variant="text" @click="showRaw = !showRaw">{{ showRaw ? 'Hide' : 'Show' }}</v-btn>
        </template>
      </v-card-item>
      <v-expand-transition>
        <v-card-text v-if="showRaw">
          <pre class="provider-json">{{ JSON.stringify(data, null, 2) }}</pre>
        </v-card-text>
      </v-expand-transition>
    </v-card>
  </template>

  <v-card v-else elevation="0" class="border rounded-lg">
    <v-card-text class="text-center py-10 text-medium-emphasis">No xGoals data for this fixture.</v-card-text>
  </v-card>
</template>

<style scoped>
.provider-json {
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 500px;
  overflow: auto;
  background: rgba(0, 0, 0, 0.03);
  padding: 16px;
  border-radius: 8px;
  font-size: 12px;
}
.xg-bar {
  display: flex;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.06);
}
.xg-bar-home {
  background: rgb(var(--v-theme-primary));
}
.xg-bar-away {
  background: rgb(var(--v-theme-secondary));
}
</style>
