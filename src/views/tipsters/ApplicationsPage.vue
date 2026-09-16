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

  <v-dialog :model-value="!!selected" @update:model-value="(v: boolean) => { if (!v) selected = null }" max-width="880">
    <v-card v-if="selected" class="application-dialog">
      <div class="application-banner">
        <v-avatar size="52" color="white" class="application-avatar">
          <span class="text-h6 font-weight-bold" style="color: #ed275f">{{ (selected.userId?.name || selected.username || '?').charAt(0).toUpperCase() }}</span>
        </v-avatar>
        <div class="flex-grow-1 min-width-0">
          <div class="text-caption text-uppercase" style="opacity: 0.75; letter-spacing: 0.08em">Tipster application</div>
          <div class="text-h6 font-weight-bold text-truncate">{{ selected.userId?.name || selected.username }}</div>
          <div class="text-caption" style="opacity: 0.85">@{{ selected.username }} · {{ selected.userId?.email }}</div>
        </div>
        <StatusChip :status="selected.status" size="default" />
        <v-btn icon="mdi-close" variant="text" density="comfortable" color="white" @click="selected = null" />
      </div>

      <v-card-text class="pa-5">
        <v-row>
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="rounded-lg" style="height: 100%">
              <v-card-item class="pb-0">
                <template #prepend><v-icon icon="mdi-account-circle-outline" color="primary" /></template>
                <v-card-title class="text-subtitle-2 font-weight-bold">Applicant</v-card-title>
              </v-card-item>
              <v-card-text>
                <dl class="info-list">
                  <div><dt>Country</dt><dd>{{ selected.country || '—' }}</dd></div>
                  <div><dt>Experience</dt><dd>{{ selected.experience || '—' }}</dd></div>
                  <div><dt>Expertise</dt><dd>{{ selected.expertise?.join(', ') || '—' }}</dd></div>
                </dl>
                <p class="text-body-2 mt-3 mb-0"><span class="font-weight-medium">Bio</span><br />{{ selected.bio }}</p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="rounded-lg" style="height: 100%">
              <v-card-item class="pb-0">
                <template #prepend><v-icon icon="mdi-soccer" color="primary" /></template>
                <v-card-title class="text-subtitle-2 font-weight-bold">Sample Prediction</v-card-title>
                <template #append v-if="selected.samplePrediction?.confidence != null">
                  <v-chip size="small" variant="tonal" color="primary">{{ selected.samplePrediction.confidence }}% confidence</v-chip>
                </template>
              </v-card-item>
              <v-card-text>
                <div class="text-subtitle-1 font-weight-bold">{{ selected.samplePrediction?.fixture }}</div>
                <div class="text-caption text-medium-emphasis mb-2">{{ selected.samplePrediction?.league || '—' }}</div>
                <dl class="info-list">
                  <div><dt>Prediction</dt><dd>{{ selected.samplePrediction?.prediction }}</dd></div>
                  <div><dt>Odds</dt><dd>{{ selected.samplePrediction?.odds }}</dd></div>
                </dl>
                <p class="text-body-2 mt-3 mb-0"><span class="font-weight-medium">Analysis</span><br />{{ selected.samplePrediction?.analysis }}</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-textarea v-model="notes" label="Admin review notes" variant="outlined" rows="3" class="mt-4" />

        <div class="d-flex flex-wrap ga-2 mt-1">
          <v-btn color="info" variant="tonal" prepend-icon="mdi-eye-outline" :loading="reviewLoading" @click="review('under_review')">Under Review</v-btn>
          <v-btn color="warning" variant="tonal" prepend-icon="mdi-comment-question-outline" :loading="reviewLoading" @click="review('more_info')">Request More Info</v-btn>
          <v-spacer />
          <v-btn color="error" variant="outlined" prepend-icon="mdi-block-helper" :loading="reviewLoading" @click="review('suspend')">Suspend</v-btn>
          <v-btn color="error" prepend-icon="mdi-close-circle-outline" :loading="reviewLoading" @click="review('reject')">Reject</v-btn>
          <v-btn color="success" prepend-icon="mdi-check-circle-outline" :loading="reviewLoading" @click="review('approve')">Approve</v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.application-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px;
  color: #fff;
  background: linear-gradient(120deg, #7d1235 0%, #c8174c 45%, #ed275f 85%);
}
.application-avatar {
  flex-shrink: 0;
}
.min-width-0 {
  min-width: 0;
}
.info-list {
  margin: 0;
}
.info-list > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 13px;
}
.info-list > div:last-child {
  border-bottom: none;
}
.info-list dt {
  color: rgba(0, 0, 0, 0.55);
}
.info-list dd {
  margin: 0;
  font-weight: 600;
  text-align: right;
}
</style>
