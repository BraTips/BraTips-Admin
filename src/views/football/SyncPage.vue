<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiFetch } from '@/utils/api';

const loading=ref(false), error=ref(''), message=ref(''), status=ref<any>(null);
const date=ref(new Date().toISOString().slice(0,10));
const startDate=ref(new Date().toISOString().slice(0,10));
const endDate=ref(new Date(Date.now()+6*86400000).toISOString().slice(0,10));

async function load(){try{status.value=await apiFetch('/admin/sync/status')}catch(e:any){error.value=e.message}}
async function run(type:'live'|'daily'){loading.value=true;error.value='';message.value='';try{const d=await apiFetch('/admin/sync/run',{method:'POST',body:JSON.stringify({type,date:date.value})});message.value=`${type==='live'?'Live':'Daily'} sync completed: ${d.fetched} fetched, ${d.upserted} saved.`;await load()}catch(e:any){error.value=e.message}finally{loading.value=false}}
async function runDaily(){loading.value=true;error.value='';message.value='';try{const d=await apiFetch('/admin/sync/run-daily',{method:'POST',body:JSON.stringify({date:date.value})});message.value=`Daily sync completed and Bet of the Day generated (${d.picks?.length||0} picks).`;await load()}catch(e:any){error.value=e.message}finally{loading.value=false}}
async function runWeekly(){loading.value=true;error.value='';message.value='';try{const d=await apiFetch('/admin/sync/run-weekly',{method:'POST',body:JSON.stringify({date:date.value})},120000);message.value=`Full week sync completed: ${d.job?.fetched||0} fixtures fetched, ${d.job?.upserted||0} saved. Weekly predictions were generated.`;await load()}catch(e:any){error.value=e.message}finally{loading.value=false}}
async function runRange(){
  loading.value=true;error.value='';message.value='';
  try{
    if(!startDate.value||!endDate.value) throw new Error('Select both a start date and an end date.');
    if(endDate.value<startDate.value) throw new Error('End date must be on or after start date.');
    const d=await apiFetch('/admin/sync/run-range',{method:'POST',body:JSON.stringify({startDate:startDate.value,endDate:endDate.value})},30000);
    const jobId=d.job?._id;
    if(!jobId) throw new Error('The backend accepted the sync but did not return a job ID.');
    message.value='Custom range sync started. Keeping the job status updated…';
    for(let i=0;i<120;i++){
      await new Promise(resolve=>window.setTimeout(resolve,3000));
      const job=await apiFetch(`/admin/sync/status/${jobId}`,{},15000);
      if(job.status==='success'){
        message.value=`Custom range sync completed: ${job.fetched||0} fixtures fetched, ${job.upserted||0} saved. Predictions generated for the selected range.`;
        await load();
        return;
      }
      if(job.status==='failed') throw new Error(job.error||'Custom range sync failed.');
    }
    throw new Error('Custom range sync is still running. Check Sync History shortly for the final result.');
  }catch(e:any){error.value=e.message}finally{loading.value=false}
}
async function generatePredictions(){
  loading.value=true;error.value='';message.value='';
  try{
    if(!startDate.value||!endDate.value) throw new Error('Select both a start date and an end date.');
    if(endDate.value<startDate.value) throw new Error('End date must be on or after start date.');
    const d=await apiFetch('/admin/prediction-engine/generate-range',{method:'POST',body:JSON.stringify({startDate:startDate.value,endDate:endDate.value})},30000);
    const jobId=d.data?.job?._id || d.job?._id;
    if(!jobId) throw new Error('The backend accepted prediction generation but did not return a job ID.');
    message.value='Prediction generation started. It will not wait for kickoff times.';
    for(let i=0;i<240;i++){
      await new Promise(resolve=>window.setTimeout(resolve,3000));
      const job=await apiFetch(`/admin/sync/status/${jobId}`,{},15000);
      if(job.status==='success'){
        message.value=`Manual prediction generation completed: ${job.upserted||0} prediction records created or confirmed.`;
        await load();
        return;
      }
      if(job.status==='failed') throw new Error(job.error||'Manual prediction generation failed.');
    }
    message.value='Prediction generation is still running. Check Sync History shortly for the final result.';
  }catch(e:any){error.value=e.message}finally{loading.value=false}
}
onMounted(load)
</script>
<template>
<v-row>
  <v-col cols="12">
    <v-card elevation="0" class="border rounded-lg">
      <v-card-item>
        <v-card-title>Automatic Data Sync</v-card-title>
        <v-card-subtitle>Football data sync runs automatically. Every Monday at 00:00 UTC the backend populates the new Monday-Sunday week and generates weekly predictions. Use these controls for admin overrides.</v-card-subtitle>
      </v-card-item>
      <v-card-text>
        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{error}}</v-alert>
        <v-alert v-if="message" type="success" variant="tonal" class="mb-4">{{message}}</v-alert>

        <div class="text-subtitle-1 font-weight-bold mb-2">Full week</div>
        <div class="d-flex flex-wrap ga-3 align-center">
          <v-text-field v-model="date" type="date" label="Date / week containing" variant="outlined" density="comfortable" hide-details style="max-width:240px"/>
          <v-btn color="primary" :loading="loading" @click="runWeekly">Sync Full Week + Generate Predictions</v-btn>
        </div>

        <v-divider class="my-5"/>

        <div class="text-subtitle-1 font-weight-bold mb-2">Custom date range</div>
        <div class="text-body-2 text-medium-emphasis mb-3">Choose any start and end date to sync that exact range. Maximum range: 31 days. You can also generate predictions immediately for fixtures already in the database — no need to wait for their scheduled kickoff time.</div>
        <div class="d-flex flex-wrap ga-3 align-center">
          <v-text-field v-model="startDate" type="date" label="Start date" variant="outlined" density="comfortable" hide-details style="max-width:220px"/>
          <v-text-field v-model="endDate" type="date" label="End date" variant="outlined" density="comfortable" hide-details style="max-width:220px"/>
          <v-btn color="primary" variant="tonal" :loading="loading" @click="runRange">Sync Custom Range + Generate Predictions</v-btn>
          <v-btn color="secondary" variant="tonal" :loading="loading" @click="generatePredictions">Generate Predictions Now (No Sync)</v-btn>
        </div>

        <v-divider class="my-5"/>

        <div class="text-subtitle-1 font-weight-bold mb-2">Other controls</div>
        <div class="d-flex flex-wrap ga-3 align-center">
          <v-btn variant="tonal" :loading="loading" @click="runDaily">Run Daily Sync + Generate Picks</v-btn>
          <v-btn variant="tonal" :loading="loading" @click="run('live')">Sync Live Now</v-btn>
          <v-btn variant="tonal" :loading="loading" @click="run('daily')">Sync Date Now</v-btn>
        </div>
        <div class="text-caption text-medium-emphasis mt-3">The weekly button normalizes the selected date to that week's Monday. The custom range uses exactly the two dates you select.</div>
      </v-card-text>
    </v-card>
  </v-col>

  <v-col cols="12">
    <v-card elevation="0" class="border rounded-lg">
      <v-card-item><v-card-title>Sync History</v-card-title></v-card-item>
      <v-card-text>
        <v-table>
          <thead><tr><th>Type</th><th>Status</th><th>Started</th><th>Finished</th><th>Fetched</th><th>Saved</th><th>Error</th></tr></thead>
          <tbody><tr v-for="j in status?.history||[]" :key="j._id"><td><v-chip size="small" variant="tonal">{{j.type}}</v-chip></td><td><v-chip size="small" :color="j.status==='success'?'success':j.status==='failed'?'error':'warning'">{{j.status}}</v-chip></td><td>{{new Date(j.startedAt).toLocaleString()}}</td><td>{{j.finishedAt?new Date(j.finishedAt).toLocaleString():'—'}}</td><td>{{j.fetched}}</td><td>{{j.upserted}}</td><td>{{j.error||'—'}}</td></tr></tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </v-col>
</v-row>
</template>
