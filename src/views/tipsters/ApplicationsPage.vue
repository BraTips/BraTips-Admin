<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { apiFetch } from '@/utils/api';
import DataTable from '@/components/shared/DataTable.vue';
import StatusChip from '@/components/shared/StatusChip.vue';

const rows = ref<any[]>([]);
const loading = ref(false);
const error = ref('');
const search = ref('');
const status = ref('');
const selected = ref<any | null>(null);
const notes = ref('');
const reviewLoading = ref(false);

const headers = [
  { title: 'Applicant', key: 'applicant' },
  { title: 'Username', key: 'username' },
  { title: 'Sample Tip', key: 'sample' },
  { title: 'Odds', key: 'odds', align: 'end' as const },
  { title: 'Status', key: 'status' },
  { title: 'Date', key: 'createdAt' },
  { title: '', key: 'actions', sortable: false, align: 'end' as const }
];
const statusOptions = ['pending', 'under_review', 'more_info', 'approved', 'rejected', 'suspended'];

const filtered = computed(() =>
  rows.value.filter(
    (r) =>
      (!status.value || r.status === status.value) &&
      (!search.value ||
        `${r.username} ${r.userId?.name || ''} ${r.userId?.email || ''}`.toLowerCase().includes(search.value.toLowerCase().trim()))
  )
);

async function load() {
  loading.value = true;
  try {
    const d = await apiFetch('/admin/tipster-applications');
    rows.value = d.data || d || [];
  } catch (e: any) { error.value = e.message; }
  finally { loading.value = false; }
}
function open(row: any) { selected.value = row; notes.value = row.adminNotes || ''; }
async function review(action: string) {
  if (!selected.value) return;
  reviewLoading.value = true;
  try {
    await apiFetch(`/admin/tipster-applications/${selected.value._id}/review`, { method: 'PATCH', body: JSON.stringify({ action, adminNotes: notes.value }) });
    selected.value = null;
    await load();
  } catch (e: any) { error.value = e.message; }
  finally { reviewLoading.value = false; }
}
onMounted(load);
</script>

<template>
  <DataTable
    title="Tipster Applications"
    subtitle="Review applicants and their required sample prediction."
    :headers="headers"
    :items="filtered"
    :loading="loading"
    :error="error"
    v-model:search="search"
    search-label="Search applicants"
    external-filter
    empty-title="No applications found"
  >
    <template #filters>
      <v-select
        v-model="status"
        label="Status"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        :items="statusOptions"
        style="min-width: 180px"
      />
    </template>

    <template #item.applicant="{ item }">
      <div class="font-weight-bold">{{ item.userId?.name }}</div>
      <div class="text-caption text-medium-emphasis">{{ item.userId?.email }}</div>
    </template>
    <template #item.sample="{ item }">{{ item.samplePrediction?.fixture }} — {{ item.samplePrediction?.prediction }}</template>
    <template #item.odds="{ item }">{{ item.samplePrediction?.odds }}</template>
    <template #item.status="{ item }"><StatusChip :status="item.status" /></template>
    <template #item.createdAt="{ item }">{{ new Date(item.createdAt).toLocaleDateString() }}</template>
    <template #item.actions="{ item }">
      <v-btn size="small" color="primary" variant="text" @click="open(item)">Review</v-btn>
    </template>
  </DataTable>

  <v-dialog :model-value="!!selected" @update:model-value="(v: boolean) => { if (!v) selected = null }" max-width="850">
    <v-card v-if="selected">
      <v-card-title class="d-flex align-center">
        Tipster Application
        <v-spacer />
        <StatusChip :status="selected.status" />
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-card variant="tonal">
              <v-card-title>Applicant</v-card-title>
              <v-card-text>
                <div><b>Name:</b> {{ selected.userId?.name }}</div>
                <div><b>Email:</b> {{ selected.userId?.email }}</div>
                <div><b>Username:</b> {{ selected.username }}</div>
                <div><b>Country:</b> {{ selected.country || '—' }}</div>
                <div><b>Experience:</b> {{ selected.experience || '—' }}</div>
                <div><b>Expertise:</b> {{ selected.expertise?.join(', ') || '—' }}</div>
                <p class="mt-3"><b>Bio:</b><br />{{ selected.bio }}</p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card variant="tonal">
              <v-card-title>Sample Prediction</v-card-title>
              <v-card-text>
                <div><b>Fixture:</b> {{ selected.samplePrediction?.fixture }}</div>
                <div><b>League:</b> {{ selected.samplePrediction?.league || '—' }}</div>
                <div><b>Prediction:</b> {{ selected.samplePrediction?.prediction }}</div>
                <div><b>Odds:</b> {{ selected.samplePrediction?.odds }}</div>
                <div><b>Confidence:</b> {{ selected.samplePrediction?.confidence ?? '—' }}%</div>
                <p class="mt-3"><b>Analysis:</b><br />{{ selected.samplePrediction?.analysis }}</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-textarea v-model="notes" label="Admin review notes" variant="outlined" class="mt-4" />
        <div class="d-flex flex-wrap ga-2">
          <v-btn color="info" :loading="reviewLoading" @click="review('under_review')">Under Review</v-btn>
          <v-btn color="success" :loading="reviewLoading" @click="review('approve')">Approve</v-btn>
          <v-btn color="warning" :loading="reviewLoading" @click="review('more_info')">Request More Info</v-btn>
          <v-btn color="error" :loading="reviewLoading" @click="review('reject')">Reject</v-btn>
          <v-btn color="error" variant="outlined" :loading="reviewLoading" @click="review('suspend')">Suspend</v-btn>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="selected = null">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
