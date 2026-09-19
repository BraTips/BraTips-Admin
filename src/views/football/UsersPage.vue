<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { apiFetch } from '@/utils/api';
import DataTable from '@/components/shared/DataTable.vue';
import StatusChip from '@/components/shared/StatusChip.vue';

const rows = ref<any[]>([]);
const loading = ref(false);
const error = ref('');
const search = ref('');
const editing = ref<any | null>(null);
const saving = ref(false);

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Role', key: 'role' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const }
];

function normalizeUser(user: any) {
  const source = user.user || user.profile || user;
  const name =
    source.name ||
    source.fullName ||
    source.full_name ||
    [source.firstName || source.first_name, source.lastName || source.last_name].filter(Boolean).join(' ');

  return {
    ...user,
    name: name || user.name || user.fullName || '—',
    email: source.email || user.email || '—'
  };
}

async function load() {
  loading.value = true;
  try {
    const response = await apiFetch('/admin/users?limit=100');
    const users = Array.isArray(response) ? response : response.users || response.data || [];
    rows.value = users.map(normalizeUser);
  }
  catch (e: any) { error.value = e.message; }
  finally { loading.value = false; }
}
function edit(r: any) { editing.value = { ...r }; }
async function save() {
  if (!editing.value) return;
  saving.value = true;
  try {
    await apiFetch(`/admin/users/${editing.value._id}`, { method: 'PATCH', body: JSON.stringify({ name: editing.value.name, role: editing.value.role, status: editing.value.status }) });
    editing.value = null;
    await load();
  } catch (e: any) { error.value = e.message; }
  finally { saving.value = false; }
}
onMounted(load);
</script>

<template>
  <DataTable
    title="Users"
    subtitle="Manage account role and access status."
    :headers="headers"
    :items="rows"
    :loading="loading"
    :error="error"
    v-model:search="search"
    search-label="Search users"
    empty-title="No users found"
  >
    <template #item.role="{ item }"><span class="text-capitalize">{{ item.role }}</span></template>
    <template #item.status="{ item }">
      <StatusChip :status="item.status" />
    </template>
    <template #item.actions="{ item }">
      <v-btn size="small" variant="text" color="primary" @click="edit(item)">Edit</v-btn>
    </template>
  </DataTable>

  <v-dialog :model-value="!!editing" @update:model-value="(v: boolean) => { if (!v) editing = null }" max-width="520">
    <v-card v-if="editing">
      <v-card-title>Edit User</v-card-title>
      <v-card-text>
        <v-text-field v-model="editing.name" label="Name" variant="outlined" class="mb-2" />
        <v-select v-model="editing.role" :items="['user', 'tipster', 'admin']" label="Role" variant="outlined" class="mb-2" />
        <v-select v-model="editing.status" :items="['active', 'suspended']" label="Status" variant="outlined" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="editing = null">Cancel</v-btn>
        <v-btn color="primary" :loading="saving" @click="save">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
