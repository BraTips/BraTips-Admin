<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { apiFetch } from '@/utils/api';
import DataTable from '@/components/shared/DataTable.vue';
import StatusChip from '@/components/shared/StatusChip.vue';
import StatCard from '@/components/shared/StatCard.vue';

const rows = ref<any[]>([]);
const summary = ref<{ open: number; inProgress: number }>({ open: 0, inProgress: 0 });
const loading = ref(false);
const error = ref('');
const search = ref('');
const status = ref('');
const category = ref('');
const priority = ref('');
const selected = ref<any | null>(null);
const adminNote = ref('');
const draftStatus = ref('');
const draftPriority = ref('');
const savingId = ref('');

const headers = [
  { title: 'Reporter', key: 'reporter' },
  { title: 'Category', key: 'category' },
  { title: 'Subject', key: 'subject' },
  { title: 'Priority', key: 'priority' },
  { title: 'Status', key: 'status' },
  { title: 'Submitted', key: 'createdAt' },
  { title: '', key: 'actions', sortable: false, align: 'end' as const }
];
const statusOptions = ['open', 'in_progress', 'resolved', 'rejected', 'closed'];
const categoryOptions = [
  { title: 'Content report', value: 'content' },
  { title: 'Support ticket', value: 'support' },
  { title: 'Financial dispute', value: 'financial' }
];
const priorityOptions = ['low', 'medium', 'high'];
const categoryLabel = (c: string) => (c === 'content' ? 'Content report' : c === 'financial' ? 'Financial dispute' : 'Support ticket');
const priorityColor = (p: string) => (p === 'high' ? 'error' : p === 'low' ? 'secondary' : 'warning');

const filtered = computed(() =>
  rows.value.filter(
    (r) =>
      (!status.value || r.status === status.value) &&
      (!category.value || r.category === category.value) &&
      (!priority.value || r.priority === priority.value) &&
      (!search.value ||
        `${r.subject} ${r.description} ${r.reporterId?.name || ''} ${r.reporterId?.email || ''}`
          .toLowerCase()
          .includes(search.value.toLowerCase().trim()))
  )
);

async function load() {
  loading.value = true;
  try {
    const d = await apiFetch('/admin/reports');
    rows.value = d.data || d || [];
    if (d.summary) summary.value = d.summary;
  } catch (e: any) { error.value = e.message; }
  finally { loading.value = false; }
}

function open(row: any) {
  selected.value = row;
  adminNote.value = row.adminNote || '';
  draftStatus.value = row.status;
  draftPriority.value = row.priority;
}

async function save() {
  if (!selected.value) return;
  savingId.value = selected.value._id;
  try {
    await apiFetch(`/admin/reports/${selected.value._id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: draftStatus.value, priority: draftPriority.value, adminNote: adminNote.value })
    });
    selected.value = null;
    await load();
  } catch (e: any) { error.value = e.message; }
  finally { savingId.value = ''; }
}

async function quickResolve(row: any, nextStatus: string) {
  savingId.value = row._id;
  try {
    await apiFetch(`/admin/reports/${row._id}`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) });
    await load();
  } catch (e: any) { error.value = e.message; }
  finally { savingId.value = ''; }
}

onMounted(load);
</script>

<template>
  <v-row class="mb-4">
    <v-col cols="12" sm="6" md="3">
      <StatCard label="Open" :value="summary.open" icon="mdi-flag-outline" color="warning" caption="Awaiting first response" />
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <StatCard label="In progress" :value="summary.inProgress" icon="mdi-progress-clock" color="info" caption="Being worked on" />
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <StatCard label="Total shown" :value="filtered.length" icon="mdi-format-list-bulleted" color="primary" />
    </v-col>
    <v-col cols="12" sm="6" md="3">
      <StatCard label="High priority" :value="rows.filter(r => r.priority === 'high' && !['resolved','closed','rejected'].includes(r.status)).length" icon="mdi-alert-outline" color="error" />
    </v-col>
  </v-row>

  <DataTable
    title="Reports & tickets"
    subtitle="Content reports, support tickets and financial disputes submitted by members and tipsters."
    :headers="headers"
    :items="filtered"
    :loading="loading"
    :error="error"
    v-model:search="search"
    search-label="Search subject, description or reporter"
    external-filter
    empty-title="No reports found"
    empty-text="Nothing matches these filters right now."
  >
    <template #filters>
      <v-select v-model="category" label="Category" variant="outlined" density="compact" hide-details clearable :items="categoryOptions" item-title="title" item-value="value" style="min-width: 180px" />
      <v-select v-model="status" label="Status" variant="outlined" density="compact" hide-details clearable :items="statusOptions" style="min-width: 160px" />
      <v-select v-model="priority" label="Priority" variant="outlined" density="compact" hide-details clearable :items="priorityOptions" style="min-width: 140px" />
    </template>
    <template #toolbar>
      <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="load">Refresh</v-btn>
    </template>

    <template #item.reporter="{ item }">
      <div class="font-weight-bold">{{ item.reporterId?.name || 'Deleted user' }}</div>
      <div class="text-caption text-medium-emphasis">{{ item.reporterId?.email }} · {{ item.reporterRole }}</div>
    </template>
    <template #item.category="{ item }">
      <v-chip size="small" variant="tonal" color="secondary">{{ categoryLabel(item.category) }}</v-chip>
    </template>
    <template #item.subject="{ item }">
      <div class="font-weight-medium text-truncate" style="max-width: 260px">{{ item.subject }}</div>
    </template>
    <template #item.priority="{ item }">
      <v-chip size="small" variant="tonal" :color="priorityColor(item.priority)" class="text-capitalize">{{ item.priority }}</v-chip>
    </template>
    <template #item.status="{ item }"><StatusChip :status="item.status" /></template>
    <template #item.createdAt="{ item }">{{ new Date(item.createdAt).toLocaleDateString() }}</template>
    <template #item.actions="{ item }">
      <v-btn v-if="item.status === 'open'" size="small" color="info" variant="text" :loading="savingId === item._id" @click="quickResolve(item, 'in_progress')">Start</v-btn>
      <v-btn size="small" color="primary" variant="text" @click="open(item)">View</v-btn>
    </template>
  </DataTable>

  <v-dialog :model-value="!!selected" @update:model-value="(v: boolean) => { if (!v) selected = null }" max-width="720">
    <v-card v-if="selected" class="report-dialog">
      <div class="report-banner">
        <div class="flex-grow-1 min-width-0">
          <div class="text-caption text-uppercase" style="opacity: 0.75; letter-spacing: 0.08em">{{ categoryLabel(selected.category) }}</div>
          <div class="text-h6 font-weight-bold text-truncate">{{ selected.subject }}</div>
          <div class="text-caption" style="opacity: 0.85">{{ selected.reporterId?.name }} ({{ selected.reporterId?.email }}) · {{ selected.reporterRole }}</div>
        </div>
        <StatusChip :status="selected.status" size="default" />
        <v-btn icon="mdi-close" variant="text" density="comfortable" color="white" @click="selected = null" />
      </div>

      <v-card-text class="pa-5">
        <v-card variant="outlined" class="rounded-lg mb-4">
          <v-card-text>
            <div class="text-caption text-medium-emphasis mb-1">Description</div>
            <p class="text-body-2 mb-2" style="white-space: pre-wrap">{{ selected.description }}</p>
            <div v-if="selected.targetType" class="text-caption text-medium-emphasis">
              Reference: {{ selected.targetType }} · {{ selected.targetId || '—' }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">Submitted {{ new Date(selected.createdAt).toLocaleString() }}</div>
          </v-card-text>
        </v-card>

        <v-row>
          <v-col cols="12" sm="6">
            <v-select v-model="draftStatus" label="Status" variant="outlined" density="comfortable" :items="statusOptions" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select v-model="draftPriority" label="Priority" variant="outlined" density="comfortable" :items="priorityOptions" />
          </v-col>
        </v-row>
        <v-textarea v-model="adminNote" label="Admin note (visible to your team only)" variant="outlined" rows="3" />

        <div class="d-flex justify-end ga-2 mt-2">
          <v-btn variant="text" @click="selected = null">Cancel</v-btn>
          <v-btn color="primary" :loading="savingId === selected._id" @click="save">Save changes</v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.report-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px;
  color: #fff;
  background: linear-gradient(120deg, #7d1235 0%, #c8174c 45%, #ed275f 85%);
}
.min-width-0 {
  min-width: 0;
}
</style>
