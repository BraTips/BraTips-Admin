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
const props = defineProps<{ title: string; endpoint: string; fields: Field[]; searchKey?: string; }>();
const rows = ref<any[]>([]);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const dialog = ref(false);
const editing = ref<any | null>(null);
const search = ref('');
const optionsByField = ref<Record<string, SelectOption[]>>({});
const labelByFieldAndId = ref<Record<string, Record<string, string>>>({});

const form = ref<Record<string, any>>({});
const filtered = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) return rows.value;
  return rows.value.filter(r => props.fields.some(f => String(displayValue(r, f)).toLowerCase().includes(q)));
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
    if (f.type === 'select') v[f.key] = typeof raw === 'object' && raw ? raw._id : raw;
    else if (f.type === 'date') v[f.key] = toDateInput(raw);
    else v[f.key] = raw ?? '';
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
      <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>
      <v-progress-linear v-if="loading" indeterminate />
      <v-table v-else>
        <thead><tr><th v-for="f in fields" :key="f.key">{{ f.label }}</th><th class="text-right">Actions</th></tr></thead>
        <tbody>
          <tr v-for="row in filtered" :key="row._id">
            <td v-for="f in fields" :key="f.key">{{ displayValue(row, f) }}</td>
            <td class="text-right text-no-wrap">
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