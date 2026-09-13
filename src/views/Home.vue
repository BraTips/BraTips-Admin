<template>
  <section class="hero page-animate">
    <div class="wrap hero-grid">
      <div class="hero-copy reveal">
        <div class="eyebrow">Football tips, made clear</div>
        <h1>Follow the picks.<br />Back the track record.</h1>
        <p>
          Discover BraTips tipsters, see today's featured picks and follow prediction
          performance before you decide what to play.
        </p>
        <div class="hero-actions">
          <RouterLink to="/bet-of-the-day" class="btn pulse-hover">See Bet of the Day</RouterLink>
          <RouterLink to="/tipsters" class="ghost">Explore tipsters</RouterLink>
        </div>
      </div>

      <div class="hero-card float-in">
        <h3>Today's BraTips edge</h3>
        <TransitionGroup name="list" tag="div">
          <div v-for="p in bot" :key="p._id" class="edge-pick">
            <div class="edge-teams">
              <TeamLogo
                :src="homeLogo(p)"
                :name="homeName(p)"
                size="sm"
              />
              <b>{{ homeShortName(p) }}</b>
              <span>vs</span>
              <b>{{ awayShortName(p) }}</b>
              <TeamLogo
                :src="awayLogo(p)"
                :name="awayName(p)"
                size="sm"
              />
            </div>
            <div class="edge-meta">
              <span>{{ p.prediction }}</span>
              <strong>{{ p.confidence }}%</strong>
            </div>
          </div>
        </TransitionGroup>
        <div v-if="!bot.length" class="muted">No featured picks published yet.</div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section-head reveal">
        <div>
          <h2>Latest tipster picks</h2>
          <div class="muted">Public to browse. Sign up to play a pick.</div>
        </div>
        <RouterLink to="/picks" class="small">View all →</RouterLink>
      </div>

      <TransitionGroup name="card" tag="div" class="grid3">
        <PickCard
          v-for="p in latestPicks"
          :key="p._id"
          :pick="p"
        />
      </TransitionGroup>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="banners">
        <div class="stat reveal">
          <span class="muted small">Why BraTips</span>
          <b>Transparent</b>
          <span class="muted small">See past wins and losses.</span>
        </div>
        <div class="stat reveal">
          <span class="muted small">Daily feature</span>
          <b>2 picks</b>
          <span class="muted small">AI-assisted Bet of the Day.</span>
        </div>
        <div class="stat reveal">
          <span class="muted small">Tipster rewards</span>
          <b>Earn</b>
          <span class="muted small">Winning streaks can qualify for prizes.</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { api } from '../services/api'
import PickCard from '../components/PickCard.vue'
import TeamLogo from '../components/TeamLogo.vue'

const picks = ref<any[]>([])
const bot = ref<any[]>([])

const latestPicks = computed(() => picks.value.slice(0, 6))

function match(p: any) {
  return p && p.matchId ? p.matchId : {}
}

function homeTeam(p: any) {
  const m = match(p)
  return m.homeTeamId || {}
}

function awayTeam(p: any) {
  const m = match(p)
  return m.awayTeamId || {}
}

function homeName(p: any) {
  return homeTeam(p).name || 'Home'
}

function awayName(p: any) {
  return awayTeam(p).name || 'Away'
}

function homeShortName(p: any) {
  const team = homeTeam(p)
  return team.shortName || team.name || 'Home'
}

function awayShortName(p: any) {
  const team = awayTeam(p)
  return team.shortName || team.name || 'Away'
}

function homeLogo(p: any) {
  return homeTeam(p).logo || ''
}

function awayLogo(p: any) {
  return awayTeam(p).logo || ''
}

onMounted(async () => {
  try {
    const response = await api.get('/predictions?limit=6')
    picks.value = response.data || []
  } catch {
    picks.value = []
  }

  try {
    const response = await api.get('/bet-of-day')
    bot.value = response.data || []
  } catch {
    bot.value = []
  }
})
</script>
