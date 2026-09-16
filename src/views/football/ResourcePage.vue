<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { apiFetch } from '@/utils/api';

interface SelectOption { value: string; title: string; }
interface Field {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'select';
  required?: boolean;
  optionsEndpoint?: string; // e.g. '/admin/leagues' — used when type is 'select'
  optionLabelKey?: string;  // key on the related record to show, e.g. 'name' (default: 'name')
  choices?: string[];       // static options for 'select' (e.g. enum status values), used instead of optionsEndpoint
}
const props = defineProps<{ title: string; endpoint: string; fields: Field[]; searchKey?: string; statusKey?: string; }>();
const rows = ref<any[]>([]);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const dialog = ref(false);
const editing = ref<any | null>(null);
const search = ref('');
const statusFilter = ref('');
const optionsByField = ref<Record<string, SelectOption[]>>({});
const labelByFieldAndId = ref<Record<string, Record<string, string>>>({});

const form = ref<Record<string, any>>({});
const statusChoices = computed(() => {
  if (!props.statusKey) return [];
  return props.fields.find(f => f.key === props.statusKey)?.choices || [];
});
const filtered = computed(() => {
  let list = rows.value;
  if (props.statusKey && statusFilter.value) list = list.filter(r => (r[props.statusKey!] ?? '') === statusFilter.value);
  const q = search.value.toLowerCase().trim();
  if (!q) return list;
  return list.filter(r => props.fields.some(f => String(displayValue(r, f)).toLowerCase().includes(q)));
});

function toDateInput(v: any) {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function displayValue(row: any, f: Field) {
  const raw = row[f.key];
  if (f.type === 'boolean') return raw ? 'Active' : 'Inactive';
  if (f.type === 'select') {
    const id = typeof raw === 'object' && raw ? raw._id : raw;
    return labelByFieldAndId.value[f.key]?.[id] ?? raw ?? '—';
  }
  if (f.type === 'date') return raw ? new Date(raw).toLocaleDateString() : '—';
  // A field can come back as a populated object (Mongo .populate()) even when it isn't
  // declared type:'select' in this page's field config. Showing "[object Object]" is a
  // real bug we hit on Predictions (matchId) — fall back to a readable id/label instead.
  if (raw && typeof raw === 'object') return raw.name || raw.fixture || raw.username || raw._id || '—';
  return raw ?? '—';
}

async function loadFieldOptions() {
  for (const f of props.fields) {
    if (f.type !== 'select') continue;
    if (f.choices) {
      optionsByField.value[f.key] = f.choices.map(c => ({ value: c, title: c }));
      continue;
    }
    if (f.optionsEndpoint) {
      try {
        const sep = f.optionsEndpoint.includes('?') ? '&' : '?';
        const data = await apiFetch(`${f.optionsEndpoint}${sep}limit=200`);
        const list = Array.isArray(data) ? data : (data.items || data.results || []);
        const labelKey = f.optionLabelKey || 'name';
        optionsByField.value[f.key] = list.map((item: any) => ({ value: item._id, title: item[labelKey] || item._id }));
        labelByFieldAndId.value[f.key] = Object.fromEntries(list.map((item: any) => [item._id, item[labelKey] || item._id]));
      } catch (e: any) { error.value = e.message; }
    }
  }
}

function resetForm() {
  const v: Record<string, any> = {};
  props.fields.forEach(f => v[f.key] = f.type === 'boolean' ? true : '');
  form.value = v;
}
function openCreate() { editing.value = null; resetForm(); dialog.value = true; }
function openEdit(row: any) {
  editing.value = row;
  const v: Record<string, any> = {};
  props.fields.forEach(f => {
    const raw = row[f.key];
    // A populated Mongo reference is an object with an _id, regardless of whether this
    // field is declared type:'select'. Previously only 'select' fields were unwrapped,
    // so a plain text field holding a populated ref (e.g. Predictions' matchId) got the
    // raw object stuffed into the form and silently failed to save (backend expects a
    // plain id string). Unwrap defensively for every field type.
    const unwrapped = raw && typeof raw === 'object' && raw._id ? raw._id : raw;
    if (f.type === 'date') v[f.key] = toDateInput(unwrapped);
    else v[f.key] = unwrapped ?? '';
  });
  form.value = v;
  dialog.value = true;
}

async function load() {
  loading.value = true; error.value = '';
  try {
    const data = await apiFetch(`/admin/${props.endpoint}?limit=100`);
    rows.value = Array.isArray(data) ? data : (data.items || data.results || []);
  } catch (e: any) { error.value = e.message; }
  finally { loading.value = false; }
}
async function save() {
  saving.value = true; error.value = '';
  try {
    const payload: Record<string, any> = { ...form.value };
    props.fields.forEach(f => { if (f.type === 'number' && payload[f.key] !== '') payload[f.key] = Number(payload[f.key]); });
    if (editing.value?._id) await apiFetch(`/admin/${props.endpoint}/${editing.value._id}`, { method: 'PATCH', body: JSON.stringify(payload) });
    else await apiFetch(`/admin/${props.endpoint}`, { method: 'POST', body: JSON.stringify(payload) });
    dialog.value = false; await load();
  } catch (e: any) { error.value = e.message; }
  finally { saving.value = false; }
}
async function remove(row: any) {
  if (!confirm(`Delete ${row.name || row.email || 'this record'}?`)) return;
  try { await apiFetch(`/admin/${props.endpoint}/${row._id}`, { method: 'DELETE' }); await load(); }
  catch (e: any) { error.value = e.message; }
}
// Lets a page (e.g. Predictions) set a field's value directly — bypassing the edit
// dialog entirely — for a one-click action like "Approve". This sends only the
// changed field, so it can never trip over the populated-object round-trip bug above.
async function quickUpdate(row: any, patch: Record<string, any>) {
  error.value = '';
  try { await apiFetch(`/admin/${props.endpoint}/${row._id}`, { method: 'PATCH', body: JSON.stringify(patch) }); await load(); }
  catch (e: any) { error.value = e.message; }
}
defineExpose({ load, quickUpdate });
onMounted(async () => { await loadFieldOptions(); await load(); });
</script>

<template>
  <v-card elevation="0" class="border rounded-lg">
    <v-card-item>
      <template #prepend><div><v-card-title>{{ title }}</v-card-title><v-card-subtitle>Manage {{ title.toLowerCase() }} in MongoDB.</v-card-subtitle></div></template>
      <template #append><v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Add New</v-btn></template>
    </v-card-item>
    <v-card-text>
      <v-text-field v-model="search" label="Search" prepend-inner-icon="mdi-magnify" variant="outlined" clearable class="mb-4" />
      <div v-if="statusChoices.length" class="mb-4" style="display:flex;gap:8px;flex-wrap:wrap">
        <v-chip :color="!statusFilter?'primary':undefined" :variant="!statusFilter?'flat':'outlined'" size="small" @click="statusFilter=''">All ({{ rows.length }})</v-chip>
        <v-chip v-for="c in statusChoices" :key="c" :color="statusFilter===c?'primary':undefined" :variant="statusFilter===c?'flat':'outlined'" size="small" @click="statusFilter=c">
          {{ c }} ({{ rows.filter(r => (r[statusKey!] ?? '') === c).length }})
        </v-chip>
      </div>
      <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>
      <v-progress-linear v-if="loading" indeterminate />
      <v-table v-else>
        <thead><tr><th v-for="f in fields" :key="f.key">{{ f.label }}</th><th class="text-right">Actions</th></tr></thead>
        <tbody>
          <tr v-for="row in filtered" :key="row._id">
            <td v-for="f in fields" :key="f.key">{{ displayValue(row, f) }}</td>
            <td class="text-right text-no-wrap">
              <slot name="row-actions" :row="row" :quick-update="quickUpdate" />
              <v-btn size="small" variant="text" color="primary" @click="openEdit(row)">Edit</v-btn>
              <v-btn size="small" variant="text" color="error" @click="remove(row)">Delete</v-btn>
            </td>
          </tr>
          <tr v-if="!filtered.length"><td :colspan="fields.length + 1" class="text-center py-8">No records found.</td></tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>

  <v-dialog v-model="dialog" max-width="650">
    <v-card>
      <v-card-title>{{ editing ? 'Edit' : 'Add' }} {{ title }}</v-card-title>
      <v-card-text>
        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>
        <template v-for="f in fields" :key="f.key">
          <v-select v-if="f.type === 'select'" v-model="form[f.key]" :items="optionsByField[f.key] || []"
            :label="f.label" variant="outlined" class="mb-2" :required="f.required" clearable />
          <v-switch v-else-if="f.type === 'boolean'" v-model="form[f.key]" :label="f.label" color="primary" />
          <v-text-field v-else v-model="form[f.key]" :label="f.label" :type="f.type || 'text'" variant="outlined" class="mb-2" :required="f.required" />
        </template>
      </v-card-text>
      <v-card-actions><v-spacer /><v-btn variant="text" @click="dialog=false">Cancel</v-btn><v-btn color="primary" :loading="saving" @click="save">Save</v-btn></v-card-actions>
    </v-card>
  </v-dialog>
</template>