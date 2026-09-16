<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { apiFetch } from '@/utils/api';
import DataTable from '@/components/shared/DataTable.vue';
import StatCard from '@/components/shared/StatCard.vue';

const days = ref(30);
const loading = ref(false);
const error = ref('');
const data = ref<any>({ totals: {}, userSeries: [], predictionSeries: [], matchStatuses: [], predictionStatuses: [], topTipsters: [] });
const search = ref('');

const statIcons: Record<string, string> = {
  users: 'mdi-account-group',
  tipsters: 'mdi-trophy',
  predictions: 'mdi-chart-line',
  matches: 'mdi-soccer',
  activeSubscriptions: 'mdi-credit-card',
  revenue: 'mdi-cash'
};
function iconFor(key: string) {
  const k = String(key).toLowerCase();
  return Object.keys(statIcons).find((s) => k.includes(s)) ? statIcons[Object.keys(statIcons).find((s) => k.includes(s))!] : 'mdi-chart-box';
}
function metricLabel(k: string) { return String(k).replace(/([A-Z])/g, ' $1').replace(/^\w/, (c) => c.toUpperCase()); }

const labels = computed(() => data.value.userSeries.map((x: any) => x._id));
const usersSeries = computed(() => [{ name: 'New users', data: data.value.userSeries.map((x: any) => x.count) }]);
const predictionSeries = computed(() => [
  { name: 'Predictions', data: data.value.predictionSeries.map((x: any) => x.count) },
  { name: 'Profit', data: data.value.predictionSeries.map((x: any) => Number(x.profit || 0)) }
]);

const brandColors = ['#ed275f', '#7d53eb', '#2e70ff', '#20a866', '#d98a00'];

const areaOptions = computed(() => ({
  chart: { toolbar: { show: false }, fontFamily: 'inherit' },
  colors: [brandColors[0]],
  stroke: { curve: 'smooth', width: 3 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 90, 100] } },
  dataLabels: { enabled: false },
  grid: { borderColor: 'rgba(0,0,0,.06)', strokeDashArray: 4 },
  xaxis: { categories: labels.value, labels: { style: { fontSize: '11px' } } },
  legend: { show: false }
}));
const lineOptions = computed(() => ({
  chart: { toolbar: { show: false }, fontFamily: 'inherit' },
  colors: [brandColors[0], brandColors[2]],
  stroke: { curve: 'smooth', width: [3, 3] },
  dataLabels: { enabled: false },
  grid: { borderColor: 'rgba(0,0,0,.06)', strokeDashArray: 4 },
  xaxis: { categories: labels.value, labels: { style: { fontSize: '11px' } } },
  legend: { position: 'top', horizontalAlign: 'right' }
}));

const tipsterHeaders = [
  { title: 'Tipster', key: 'username' },
  { title: 'Tips', key: 'totalTips', align: 'end' as const },
  { title: 'Wins', key: 'wins', align: 'end' as const },
  { title: 'Profit', key: 'profit', align: 'end' as const },
  { title: 'ROI', key: 'roi', align: 'end' as const }
];

function statusTotal(list: any[]) { return list.reduce((sum, x) => sum + (x.count || 0), 0); }
const matchStatusPct = computed(() => {
  const total = statusTotal(data.value.matchStatuses) || 1;
  return data.value.matchStatuses.map((m: any) => ({ ...m, pct: Math.round(((m.count || 0) / total) * 100) }));
});
const predictionStatusPct = computed(() => {
  const total = statusTotal(data.value.predictionStatuses) || 1;
  return data.value.predictionStatuses.map((m: any) => ({ ...m, pct: Math.round(((m.count || 0) / total) * 100) }));
});

async function load() {
  loading.value = true; error.value = '';
  try { data.value = await apiFetch(`/admin/analytics/overview?days=${days.value}`); }
  catch (e: any) { error.value = e.message; }
  finally { loading.value = false; }
}
onMounted(load);
</script>

<template>
  <section class="analytics-hero">
    <div>
      <div class="hero-eyebrow">Platform intelligence</div>
      <h1>Analytics</h1>
      <p>Live metrics from BraTipsters, updated in real time.</p>
    </div>
    <v-select
      v-model="days"
      :items="[7, 30, 90, 180, 365]"
      suffix=" days"
      density="compact"
      variant="solo"
      hide-details
      class="hero-select"
      @update:model-value="load"
    />
  </section>

  <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>

  <template v-if="loading">
    <v-row class="mb-1">
      <v-col v-for="i in 6" :key="i" cols="6" md="2"><v-skeleton-loader type="card" /></v-col>
    </v-row>
  </template>

  <template v-else>
    <v-row class="mb-1">
      <v-col v-for="(value, key) in data.totals" :key="key" cols="6" md="2">
        <StatCard :label="metricLabel(String(key))" :value="value as any" :icon="iconFor(String(key))" />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="6">
        <v-card elevation="0" class="border rounded-lg chart-card">
          <v-card-item><v-card-title class="text-subtitle-1 font-weight-bold">User Growth</v-card-title></v-card-item>
          <v-card-text><apexchart type="area" height="290" :options="areaOptions" :series="usersSeries" /></v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" lg="6">
        <v-card elevation="0" class="border rounded-lg chart-card">
          <v-card-item><v-card-title class="text-subtitle-1 font-weight-bold">Prediction Activity</v-card-title></v-card-item>
          <v-card-text><apexchart type="line" height="290" :options="lineOptions" :series="predictionSeries" /></v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="7">
        <DataTable
          title="Top Tipsters"
          :headers="tipsterHeaders"
          :items="data.topTipsters"
          :show-search="data.topTipsters.length > 5"
          v-model:search="search"
          search-label="Search tipsters"
          empty-title="No tipster data for this period"
        >
          <template #item.username="{ item }"><span class="font-weight-medium">{{ item.username }}</span></template>
          <template #item.roi="{ item }">{{ item.roi }}%</template>
        </DataTable>
      </v-col>

      <v-col cols="12" lg="5">
        <v-row>
          <v-col cols="12">
            <v-card elevation="0" class="border rounded-lg">
              <v-card-item><v-card-title class="text-subtitle-1 font-weight-bold">Match Status</v-card-title></v-card-item>
              <v-card-text>
                <div v-for="(m, i) in matchStatusPct" :key="m._id" class="status-row">
                  <div class="d-flex justify-space-between text-body-2 mb-1">
                    <span class="text-capitalize">{{ m._id }}</span>
                    <span class="font-weight-medium">{{ m.count }} · {{ m.pct }}%</span>
                  </div>
                  <v-progress-linear :model-value="m.pct" height="6" rounded :color="brandColors[i % brandColors.length]" bg-color="rgba(0,0,0,.06)" />
                </div>
                <div v-if="!matchStatusPct.length" class="text-medium-emphasis text-body-2 py-4 text-center">No match data.</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12">
            <v-card elevation="0" class="border rounded-lg">
              <v-card-item><v-card-title class="text-subtitle-1 font-weight-bold">Prediction Status</v-card-title></v-card-item>
              <v-card-text>
                <div v-for="(m, i) in predictionStatusPct" :key="m._id" class="status-row">
                  <div class="d-flex justify-space-between text-body-2 mb-1">
                    <span class="text-capitalize">{{ m._id }}</span>
                    <span class="font-weight-medium">{{ m.count }} · {{ m.pct }}%</span>
                  </div>
                  <v-progress-linear :model-value="m.pct" height="6" rounded :color="brandColors[(i + 2) % brandColors.length]" bg-color="rgba(0,0,0,.06)" />
                </div>
                <div v-if="!predictionStatusPct.length" class="text-medium-emphasis text-body-2 py-4 text-center">No prediction data.</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </template>
</template>

<style scoped>
.analytics-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 22px;
  padding: 26px 28px;
  border-radius: 18px;
  color: #fff;
  background: linear-gradient(120deg, #7d1235 0%, #c8174c 45%, #ed275f 85%);
  box-shadow: 0 14px 36px rgba(200, 23, 76, 0.22);
}
.hero-eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
  font-weight: 700;
  opacity: 0.8;
  margin-bottom: 6px;
}
.analytics-hero h1 {
  margin: 0 0 6px;
  font-size: 28px;
  font-weight: 750;
}
.analytics-hero p {
  margin: 0;
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
}
.hero-select {
  max-width: 140px;
  flex-shrink: 0;
}
.hero-select :deep(.v-field) {
  background: rgba(255, 255, 255, 0.15) !important;
  color: #fff;
}
.chart-card {
  height: 100%;
}
.status-row + .status-row {
  margin-top: 14px;
}
</style>
