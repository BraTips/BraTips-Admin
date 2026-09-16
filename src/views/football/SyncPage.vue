<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { apiFetch } from '@/utils/api';
import DataTable from '@/components/shared/DataTable.vue';
import StatusChip from '@/components/shared/StatusChip.vue';
import PageHeader from '@/components/shared/PageHeader.vue';
import StatCard from '@/components/shared/StatCard.vue';

const loading = ref(false), error = ref(''), message = ref(''), status = ref<any>(null);
const date = ref(new Date().toISOString().slice(0, 10));
const startDate = ref(new Date().toISOString().slice(0, 10));
const endDate = ref(new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10));

async function load() { try { status.value = await apiFetch('/admin/sync/status'); } catch (e: any) { error.value = e.message; } }
async function run(type: 'live' | 'daily') { loading.value = true; error.value = ''; message.value = ''; try { const d = await apiFetch('/admin/sync/run', { method: 'POST', body: JSON.stringify({ type, date: date.value }) }); message.value = `${type === 'live' ? 'Live' : 'Daily'} sync completed: ${d.fetched} fetched, ${d.upserted} saved.`; await load(); } catch (e: any) { error.value = e.message; } finally { loading.value = false; } }
async function runDaily() { loading.value = true; error.value = ''; message.value = ''; try { const d = await apiFetch('/admin/sync/run-daily', { method: 'POST', body: JSON.stringify({ date: date.value }) }); message.value = `Daily sync completed and Bet of the Day generated (${d.picks?.length || 0} picks).`; await load(); } catch (e: any) { error.value = e.message; } finally { loading.value = false; } }
async function runWeekly() { loading.value = true; error.value = ''; message.value = ''; try { const d = await apiFetch('/admin/sync/run-weekly', { method: 'POST', body: JSON.stringify({ date: date.value }) }, 120000); message.value = `Full week sync completed: ${d.job?.fetched || 0} fixtures fetched, ${d.job?.upserted || 0} saved. Weekly predictions were generated.`; await load(); } catch (e: any) { error.value = e.message; } finally { loading.value = false; } }
async function runRange() {
  loading.value = true; error.value = ''; message.value = '';
  try {
    if (!startDate.value || !endDate.value) throw new Error('Select both a start date and an end date.');
    if (endDate.value < startDate.value) throw new Error('End date must be on or after start date.');
    const d = await apiFetch('/admin/sync/run-range', { method: 'POST', body: JSON.stringify({ startDate: startDate.value, endDate: endDate.value }) }, 30000);
    const jobId = d.job?._id;
    if (!jobId) throw new Error('The backend accepted the sync but did not return a job ID.');
    message.value = 'Custom range sync started. Keeping the job status updated…';
    for (let i = 0; i < 120; i++) {
      await new Promise(resolve => window.setTimeout(resolve, 3000));
      const job = await apiFetch(`/admin/sync/status/${jobId}`, {}, 15000);
      if (job.status === 'success') {
        message.value = `Custom range sync completed: ${job.fetched || 0} fixtures fetched, ${job.upserted || 0} saved. Predictions generated for the selected range.`;
        await load();
        return;
      }
      if (job.status === 'failed') throw new Error(job.error || 'Custom range sync failed.');
    }
    throw new Error('Custom range sync is still running. Check Sync History shortly for the final result.');
  } catch (e: any) { error.value = e.message; } finally { loading.value = false; }
}
async function generatePredictions() {
  loading.value = true; error.value = ''; message.value = '';
  try {
    if (!startDate.value || !endDate.value) throw new Error('Select both a start date and an end date.');
    if (endDate.value < startDate.value) throw new Error('End date must be on or after start date.');
    const d = await apiFetch('/admin/prediction-engine/generate-range', { method: 'POST', body: JSON.stringify({ startDate: startDate.value, endDate: endDate.value }) }, 30000);
    const jobId = d.data?.job?._id || d.job?._id;
    if (!jobId) throw new Error('The backend accepted prediction generation but did not return a job ID.');
    message.value = 'Prediction generation started. It will not wait for kickoff times.';
    for (let i = 0; i < 240; i++) {
      await new Promise(resolve => window.setTimeout(resolve, 3000));
      const job = await apiFetch(`/admin/sync/status/${jobId}`, {}, 15000);
      if (job.status === 'success') {
        message.value = `Manual prediction generation completed: ${job.upserted || 0} prediction records created or confirmed.`;
        await load();
        return;
      }
      if (job.status === 'failed') throw new Error(job.error || 'Manual prediction generation failed.');
    }
    message.value = 'Prediction generation is still running. Check Sync History shortly for the final result.';
  } catch (e: any) { error.value = e.message; } finally { loading.value = false; }
}
onMounted(load);

const lastJob = computed(() => status.value?.history?.[0]);
const successCount = computed(() => (status.value?.history || []).filter((j: any) => j.status === 'success').length);
const failedCount = computed(() => (status.value?.history || []).filter((j: any) => j.status === 'failed').length);
</script>

<template>
  <PageHeader title="Data Sync" subtitle="Football data sync runs automatically every Monday at 00:00 UTC. Use these controls for admin overrides.">
    <template #actions>
      <v-btn variant="tonal" prepend-icon="mdi-refresh" @click="load">Refresh status</v-btn>
    </template>
  </PageHeader>

  <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = ''">{{ error }}</v-alert>
  <v-alert v-if="message" type="success" variant="tonal" class="mb-4" closable @click:close="message = ''">{{ message }}</v-alert>

  <v-row class="mb-1">
    <v-col cols="12" sm="6" md="3">
      <StatCard label="Last job" :value="lastJob ? lastJob.type : '—'" :caption="lastJob ? new Date(lastJob.startedAt).toLocaleString() : 'No jobs run yet'" icon="mdi-sync" />
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <StatCard label="Last status" :value="lastJob ? lastJob.status : '—'" icon="mdi-check-decagram-outline" :color="lastJob?.status === 'failed' ? 'error' : 'success'" />
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <StatCard label="Successful jobs" :value="successCount" icon="mdi-check-circle-outline" color="success" />
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <StatCard label="Failed jobs" :value="failedCount" icon="mdi-alert-circle-outline" color="error" />
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12" lg="5">
      <v-card elevation="0" class="border rounded-lg sync-card">
        <v-card-item>
          <template #prepend><v-avatar color="lightprimary" rounded="lg"><v-icon color="primary" icon="mdi-calendar-week" /></v-avatar></template>
          <v-card-title class="text-subtitle-1 font-weight-bold">Full week</v-card-title>
          <v-card-subtitle>Syncs the Monday–Sunday week containing the chosen date and generates predictions.</v-card-subtitle>
        </v-card-item>
        <v-card-text>
          <v-text-field v-model="date" type="date" label="Date / week containing" variant="outlined" density="comfortable" hide-details class="mb-4" />
          <v-btn color="primary" block :loading="loading" @click="runWeekly">Sync Full Week + Generate Predictions</v-btn>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" lg="7">
      <v-card elevation="0" class="border rounded-lg sync-card">
        <v-card-item>
          <template #prepend><v-avatar color="lightsecondary" rounded="lg"><v-icon color="secondary" icon="mdi-calendar-range" /></v-avatar></template>
          <v-card-title class="text-subtitle-1 font-weight-bold">Custom date range</v-card-title>
          <v-card-subtitle>Sync an exact range (max 31 days), or generate predictions immediately without waiting for kickoff.</v-card-subtitle>
        </v-card-item>
        <v-card-text>
          <div class="d-flex flex-wrap ga-3">
            <v-text-field v-model="startDate" type="date" label="Start date" variant="outlined" density="comfortable" hide-details style="max-width: 220px" />
            <v-text-field v-model="endDate" type="date" label="End date" variant="outlined" density="comfortable" hide-details style="max-width: 220px" />
          </div>
          <div class="d-flex flex-wrap ga-2 mt-4">
            <v-btn color="primary" variant="tonal" :loading="loading" @click="runRange">Sync Range + Generate Predictions</v-btn>
            <v-btn color="secondary" variant="tonal" :loading="loading" @click="generatePredictions">Generate Predictions Only</v-btn>
          </div>
        </v-card-text>
      </v-card>

      <v-card elevation="0" class="border rounded-lg sync-card mt-4">
        <v-card-item>
          <template #prepend><v-avatar color="lightwarning" rounded="lg"><v-icon color="warning" icon="mdi-tune" /></v-avatar></template>
          <v-card-title class="text-subtitle-1 font-weight-bold">Other controls</v-card-title>
        </v-card-item>
        <v-card-text>
          <div class="d-flex flex-wrap ga-2">
            <v-btn variant="tonal" :loading="loading" @click="runDaily">Run Daily Sync + Generate Picks</v-btn>
            <v-btn variant="tonal" :loading="loading" @click="run('live')">Sync Live Now</v-btn>
            <v-btn variant="tonal" :loading="loading" @click="run('daily')">Sync Date Now</v-btn>
          </div>
          <div class="text-caption text-medium-emphasis mt-3">The weekly button normalizes the selected date to that week's Monday. The custom range uses exactly the two dates you select.</div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <DataTable
    title="Sync History"
    :headers="[
      { title: 'Type', key: 'type' },
      { title: 'Status', key: 'status' },
      { title: 'Started', key: 'startedAt' },
      { title: 'Finished', key: 'finishedAt' },
      { title: 'Fetched', key: 'fetched', align: 'end' },
      { title: 'Saved', key: 'upserted', align: 'end' },
      { title: 'Error', key: 'error' }
    ]"
    :items="status?.history || []"
    :show-search="false"
    empty-title="No sync jobs yet"
    class="mt-4"
  >
    <template #item.type="{ item }"><v-chip size="small" variant="tonal">{{ item.type }}</v-chip></template>
    <template #item.status="{ item }"><StatusChip :status="item.status" /></template>
    <template #item.startedAt="{ item }">{{ new Date(item.startedAt).toLocaleString() }}</template>
    <template #item.finishedAt="{ item }">{{ item.finishedAt ? new Date(item.finishedAt).toLocaleString() : '—' }}</template>
    <template #item.error="{ item }">{{ item.error || '—' }}</template>
  </DataTable>
</template>

<style scoped>
.sync-card {
  height: auto;
}
</style>
