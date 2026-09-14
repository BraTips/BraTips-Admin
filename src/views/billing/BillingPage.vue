<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { apiFetch } from '@/utils/api';
const loading=ref(false),error=ref(''),data=ref<any>({totals:{},byPlan:[],recent:[]});
async function load(){loading.value=true;error.value='';try{data.value=await apiFetch('/admin/billing/overview?days=30')}catch(e:any){error.value=e.message||'Unable to load billing.'}finally{loading.value=false}}
onMounted(load)
</script>
<template>
  <v-row>
    <v-col cols="12"><v-alert v-if="error" type="warning" variant="tonal">{{error}}</v-alert></v-col>
    <v-col v-for="(v,k) in data.totals" :key="k" cols="6" md="2"><v-card elevation="0" class="border rounded-lg pa-4"><div class="text-caption text-medium-emphasis text-capitalize">{{String(k).replace(/([A-Z])/g,' $1')}}</div><div class="text-h4 font-weight-bold mt-1">{{v}}</div></v-card></v-col>
    <v-col cols="12" md="5"><v-card elevation="0" class="border rounded-lg"><v-card-item><v-card-title>Active plans</v-card-title></v-card-item><v-card-text><v-chip v-for="p in data.byPlan" :key="p._id" class="ma-1" variant="tonal">{{p._id}} · {{p.count}}</v-chip><div v-if="!data.byPlan.length" class="text-medium-emphasis">No active subscriptions yet.</div></v-card-text></v-card></v-col>
    <v-col cols="12" md="7"><v-card elevation="0" class="border rounded-lg"><v-card-item><v-card-title>Recent subscription activity</v-card-title><template #append><v-btn variant="tonal" :loading="loading" @click="load">Refresh</v-btn></template></v-card-item><v-table><thead><tr><th>User</th><th>Plan</th><th>Status</th><th>Created</th></tr></thead><tbody><tr v-for="s in data.recent" :key="s._id"><td>{{s.userId?.name||s.userId?.email||'—'}}</td><td class="text-capitalize">{{s.plan}}</td><td class="text-capitalize">{{s.status}}</td><td>{{new Date(s.createdAt).toLocaleString()}}</td></tr><tr v-if="!data.recent.length"><td colspan="4" class="text-center py-8">No subscriptions yet.</td></tr></tbody></v-table></v-card></v-col>
  </v-row>
</template>
