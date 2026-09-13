<template>
  <div class="wrap page-animate">
    <div class="page-head reveal"><span class="eyebrow light">Daily feature</span><h1>Bet of the Day</h1><p class="muted">Two AI-assisted featured picks selected from upcoming matches.</p></div>
    <TransitionGroup v-if="items.length" name="card" tag="div" class="grid2">
      <article v-for="(p,index) in items" :key="p._id" class="card featured lift-in" :style="{'--delay': `${index * 90}ms`}">
        <div class="featured-top"><span class="tag">{{p.risk||'Low risk'}}</span><span v-if="p.status==='won'" class="result win">WON</span><span v-else-if="p.status==='lost'" class="result loss">LOST</span></div>
        <div class="bot-match">
          <div class="team-block"><TeamLogo :src="p.matchId?.homeTeamId?.logo" :name="p.matchId?.homeTeamId?.name" size="lg"/><b>{{p.matchId?.homeTeamId?.name||'Home team'}}</b></div>
          <span class="vs">VS</span>
          <div class="team-block"><TeamLogo :src="p.matchId?.awayTeamId?.logo" :name="p.matchId?.awayTeamId?.name" size="lg"/><b>{{p.matchId?.awayTeamId?.name||'Away team'}}</b></div>
        </div>
        <div class="prediction">{{p.prediction}}</div>
        <div class="kpis"><div class="stat"><span class="muted small">Confidence</span><b>{{p.confidence}}%</b></div><div class="stat"><span class="muted small">Model</span><b style="font-size:15px">{{p.model||'AI model'}}</b></div></div>
        <p class="muted analysis">{{p.analysis}}</p>
        <button class="btn btn-wide" @click="play">{{auth.isLoggedIn?'Add to My Picks':'Sign up to play'}}</button>
      </article>
    </TransitionGroup>
    <div v-else class="card empty reveal">No Bet of the Day has been published yet.</div>
  </div>
</template>
<script setup lang="ts">
import {onMounted,ref} from 'vue';import {useRouter} from 'vue-router';import {api} from '../services/api';import {useAuth} from '../stores/auth';import TeamLogo from '../components/TeamLogo.vue';
const items=ref<any[]>([]),auth=useAuth(),router=useRouter();
function play(){if(auth.isLoggedIn)router.push('/dashboard');else router.push('/login')}
onMounted(async()=>{try{const response=await api.get('/bet-of-day');items.value=(response.data||[]).filter((x:any)=>['published','won','lost','void'].includes(x.status))}catch{items.value=[]}})
</script>
