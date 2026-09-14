<script setup lang="ts">
import { onMounted, ref } from 'vue'; import { apiFetch } from '@/utils/api';
const props=defineProps<{title:string; endpoint:string}>(); const loading=ref(true),error=ref(''),data=ref<any>(null);
async function load(){loading.value=true;error.value='';try{data.value=await apiFetch(`/admin/providers/${props.endpoint}`)}catch(e:any){error.value=e.message}finally{loading.value=false}} onMounted(load)
</script>
<template><v-card elevation="0" class="border rounded-lg"><v-card-item><template #prepend><div><v-card-title>{{title}}</v-card-title><v-card-subtitle>Server-side provider data. API keys never reach the browser.</v-card-subtitle></div></template><template #append><v-btn variant="tonal" @click="load">Refresh</v-btn></template></v-card-item><v-card-text><v-alert v-if="error" type="warning" variant="tonal" class="mb-4">{{error}}</v-alert><v-progress-linear v-if="loading" indeterminate/><pre v-if="data && !loading" class="provider-json">{{JSON.stringify(data,null,2)}}</pre></v-card-text></v-card></template>
<style scoped>.provider-json{white-space:pre-wrap;word-break:break-word;max-height:650px;overflow:auto;background:rgba(0,0,0,.03);padding:16px;border-radius:8px}</style>
