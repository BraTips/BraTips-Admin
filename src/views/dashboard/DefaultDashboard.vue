<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { apiFetch } from '@/utils/api'
import { DashboardOutlined, UserOutlined, TrophyOutlined, FundOutlined, ThunderboltOutlined, SyncOutlined, CreditCardOutlined, FileSearchOutlined, FlagOutlined } from '@ant-design/icons-vue'
import { mdiRefresh, mdiSync } from '@mdi/js'

const loading = ref(true)
const refreshing = ref(false)
const error = ref('')
const d = ref<any>({})

async function load() {
  if (d.value && Object.keys(d.value).length) refreshing.value = true
  else loading.value = true
  error.value = ''
  try {
    d.value = await apiFetch('/admin/dashboard')
  } catch (e: any) {
    error.value = e.message || 'Unable to load dashboard.'
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

onMounted(load)

const cards = [
  { label: 'Users', key: 'users', icon: UserOutlined, tone: 'blue', to: '/users' },
  { label: 'Active tipsters', key: 'tipsters', icon: TrophyOutlined, tone: 'pink', to: '/tipsters' },
  { label: 'Predictions', key: 'predictions', icon: FundOutlined, tone: 'purple', to: '/predictions' },
  { label: 'Pending reviews', key: 'tipsterPending', icon: FileSearchOutlined, tone: 'orange', to: '/tipsters/applications' },
  { label: 'Open reports', key: 'openReports', icon: FlagOutlined, tone: 'orange', to: '/reports' },
  { label: 'Matches', key: 'matches', icon: DashboardOutlined, tone: 'blue', to: '/matches' },
  { label: 'Live now', key: 'live', icon: ThunderboltOutlined, tone: 'green', to: '/matches' },
  { label: 'Subscriptions', key: 'activeSubscriptions', icon: CreditCardOutlined, tone: 'pink', to: '/billing' },
  { label: 'Odds snapshots', key: 'oddsSnapshots', icon: SyncOutlined, tone: 'purple', to: '/odds' },
  { label: 'Collected revenue', key: 'subscriptionRevenue', icon: CreditCardOutlined, tone: 'green', to: '/tipsters/rewards' }
]

const winRate = computed(() => Number(d.value.winRate || 0))
const lost = computed(() => Number(d.value.lostPredictions || 0))
const won = computed(() => Number(d.value.approvedPredictions || 0))
const settled = computed(() => won.value + lost.value)
const pending = computed(() => Number(d.value.tipsterPending || 0))
const cardValue = (key:string) => key === 'subscriptionRevenue' ? `${d.value.subscriptionRevenueCurrency || 'GHS'} ${Number(d.value[key] || 0).toFixed(2)}` : (d.value[key] ?? 0)

const priorities = computed(() => [
  { title: 'Tipster applications', subtitle: pending.value ? `${pending.value} waiting for review` : 'No applications waiting', icon: FileSearchOutlined, to: '/tipsters/applications', tone: pending.value ? 'orange' : 'green' },
  { title: 'Reports & tickets', subtitle: Number(d.value.openReports || 0) ? `${d.value.openReports} open${Number(d.value.urgentReports || 0) ? `, ${d.value.urgentReports} high priority` : ''}` : 'No open reports', icon: FlagOutlined, to: '/reports', tone: Number(d.value.urgentReports || 0) ? 'orange' : (Number(d.value.openReports || 0) ? 'blue' : 'green') },
  { title: 'Prediction moderation', subtitle: `${Number(d.value.predictions || 0)} total predictions`, icon: FundOutlined, to: '/predictions', tone: 'purple' },
  { title: 'Football data sync', subtitle: 'Provider, fixtures and live scores', icon: SyncOutlined, to: '/sync', tone: 'blue' },
  { title: 'Billing', subtitle: `${Number(d.value.activeSubscriptions || 0)} active subscriptions`, icon: CreditCardOutlined, to: '/billing', tone: 'pink' },
  { title: 'Tipster rewards', subtitle: `${d.value.subscriptionRevenueCurrency || 'GHS'} ${Number(d.value.subscriptionRevenue || 0).toFixed(2)} collected revenue`, icon: TrophyOutlined, to: '/tipsters/rewards', tone: 'green' }
])
</script>

<template>
  <div class="dashboard-page">
    <section class="dashboard-hero">
      <div class="hero-copy">
        <div class="eyebrow"><span class="status-dot"></span> Platform operations</div>
        <h1>BraTipsters dashboard</h1>
        <p>Monitor predictions, football data, tipsters and subscriptions from one place.</p>
      </div>
      <div class="hero-actions">
        <v-btn variant="text" to="/sync" :prepend-icon="mdiSync">Data sync</v-btn>
        <v-btn class="refresh-btn" :loading="refreshing" :prepend-icon="mdiRefresh" @click="load">Refresh</v-btn>
      </div>
    </section>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-5" closable @click:close="error = ''">{{ error }}</v-alert>

    <template v-if="loading">
      <v-row>
        <v-col v-for="i in 8" :key="i" cols="12" sm="6" md="3"><v-skeleton-loader type="card" /></v-col>
      </v-row>
    </template>

    <template v-else>
      <section class="stat-grid">
        <v-card v-for="card in cards" :key="card.key" :to="card.to" elevation="0" class="stat-card">
          <div class="stat-icon" :class="`tone-${card.tone}`"><component :is="card.icon" /></div>
          <div class="stat-body">
            <div class="stat-label">{{ card.label }}</div>
            <div class="stat-value">{{ cardValue(card.key) }}</div>
          </div>
          <div class="stat-arrow">›</div>
        </v-card>
      </section>

      <v-row class="dashboard-row">
        <v-col cols="12" lg="7">
          <v-card elevation="0" class="panel-card performance-card">
            <div class="panel-head">
              <div>
                <div class="panel-kicker">Prediction intelligence</div>
                <h2>Prediction performance</h2>
                <p>Current settled prediction results across the platform.</p>
              </div>
              <div class="win-rate"><strong>{{ winRate }}%</strong><span>win rate</span></div>
            </div>

            <div class="performance-main">
              <div class="progress-wrap">
                <v-progress-linear :model-value="winRate" height="12" rounded class="performance-progress" />
                <div class="progress-labels"><span>Won {{ won }}</span><span>Lost {{ lost }}</span></div>
              </div>
              <div class="metric-grid">
                <div class="mini-metric"><span>Won</span><strong>{{ won }}</strong></div>
                <div class="mini-metric"><span>Lost</span><strong>{{ lost }}</strong></div>
                <div class="mini-metric"><span>Settled</span><strong>{{ settled }}</strong></div>
                <div class="mini-metric"><span>Finished matches</span><strong>{{ d.finished || 0 }}</strong></div>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" lg="5">
          <v-card elevation="0" class="panel-card live-card">
            <div class="panel-head compact">
              <div>
                <div class="panel-kicker live-kicker"><span class="pulse"></span> Live operations</div>
                <h2>Live now</h2>
                <p>Matches currently tracked by the platform.</p>
              </div>
              <div class="live-count">{{ d.live || 0 }}</div>
            </div>
            <div class="live-strip">
              <div class="live-strip-icon"><ThunderboltOutlined /></div>
              <div><strong>{{ d.live || 0 }} live matches</strong><span>Scores update automatically</span></div>
              <v-btn size="small" variant="tonal" to="/matches">View</v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" lg="7">
          <v-card elevation="0" class="panel-card">
            <div class="panel-head">
              <div>
                <div class="panel-kicker">Operations queue</div>
                <h2>Admin priorities</h2>
                <p>Jump directly into the areas that need attention.</p>
              </div>
            </div>
            <div class="priority-list">
              <v-card v-for="item in priorities" :key="item.title" :to="item.to" elevation="0" class="priority-item">
                <div class="priority-icon" :class="`tone-${item.tone}`"><component :is="item.icon" /></div>
                <div class="priority-copy"><strong>{{ item.title }}</strong><span>{{ item.subtitle }}</span></div>
                <span class="priority-arrow">›</span>
              </v-card>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" lg="5">
          <v-card elevation="0" class="panel-card overview-card">
            <div class="panel-head">
              <div>
                <div class="panel-kicker">Platform snapshot</div>
                <h2>At a glance</h2>
                <p>A quick view of your current BraTipsters footprint.</p>
              </div>
            </div>
            <div class="snapshot-list">
              <div><span>Total users</span><strong>{{ d.users || 0 }}</strong></div>
              <div><span>Active tipsters</span><strong>{{ d.tipsters || 0 }}</strong></div>
              <div><span>Subscriptions</span><strong>{{ d.activeSubscriptions || 0 }}</strong></div>
              <div><span>Odds snapshots</span><strong>{{ d.oddsSnapshots || 0 }}</strong></div>
            </div>
            <v-btn block variant="outlined" class="overview-btn" to="/analytics">Open analytics</v-btn>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<style scoped>
.dashboard-page { max-width: 1600px; margin: 0 auto; }
.dashboard-hero { display:flex; justify-content:space-between; align-items:flex-end; gap:24px; margin-bottom:28px; padding:28px 30px; border-radius:18px; background:linear-gradient(135deg,#101a38 0%,#18244b 62%,#25183d 100%); color:#fff; box-shadow:0 14px 36px rgba(16,26,56,.16); }
.eyebrow,.panel-kicker { text-transform:uppercase; letter-spacing:.11em; font-size:11px; font-weight:700; }
.eyebrow { display:flex; align-items:center; gap:8px; opacity:.8; margin-bottom:8px; }
.status-dot,.pulse { width:7px; height:7px; border-radius:50%; display:inline-block; background:#39d98a; box-shadow:0 0 0 4px rgba(57,217,138,.12); }
.dashboard-hero h1 { margin:0 0 7px; font-size:30px; line-height:1.2; font-weight:750; }
.hero-copy p { margin:0; color:rgba(255,255,255,.68); font-size:14px; }
.hero-actions { display:flex; gap:8px; flex-shrink:0; }
.refresh-btn { background:#fff!important; color:#111a35!important; }
.stat-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:16px; margin-bottom:24px; }
.stat-card { min-height:118px; padding:22px; display:flex; align-items:center; gap:16px; border:1px solid rgba(20,30,60,.08)!important; border-radius:14px!important; transition:transform .18s,box-shadow .18s,border-color .18s; }
.stat-card:hover { transform:translateY(-2px); box-shadow:0 12px 28px rgba(20,30,60,.09)!important; border-color:rgba(232,61,126,.25)!important; }
.stat-icon,.priority-icon { width:44px; height:44px; border-radius:12px; display:grid; place-items:center; font-size:19px; flex:0 0 auto; }
.tone-blue { background:rgba(46,112,255,.10); color:#2e70ff; } .tone-pink { background:rgba(232,61,126,.11); color:#e83d7e; } .tone-purple { background:rgba(125,83,235,.11); color:#7d53eb; } .tone-orange { background:rgba(245,158,11,.12); color:#d98a00; } .tone-green { background:rgba(34,183,110,.11); color:#20a866; }
.stat-body { min-width:0; } .stat-label { color:#748099; font-size:12px; font-weight:600; margin-bottom:5px; } .stat-value { font-size:27px; line-height:1; font-weight:750; color:#17213d; } .stat-arrow,.priority-arrow { margin-left:auto; font-size:24px; color:#b0b7c5; }
.dashboard-row { margin-bottom:0; }
.panel-card { height:100%; border:1px solid rgba(20,30,60,.08)!important; border-radius:15px!important; overflow:hidden; }
.panel-head { display:flex; justify-content:space-between; gap:18px; padding:22px 24px 16px; } .panel-head.compact { padding-bottom:14px; } .panel-kicker { color:#8a93a7; margin-bottom:5px; } .panel-head h2 { margin:0; color:#17213d; font-size:18px; line-height:1.3; font-weight:700; } .panel-head p { margin:5px 0 0; color:#8992a5; font-size:13px; }
.win-rate { text-align:right; } .win-rate strong { display:block; color:#20a866; font-size:27px; line-height:1; } .win-rate span { color:#8992a5; font-size:11px; }
.performance-main { padding:8px 24px 24px; } .performance-progress { --v-progress-linear-height:12px; } .progress-labels { display:flex; justify-content:space-between; margin:8px 0 18px; color:#8992a5; font-size:12px; }
.metric-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:#edf0f5; border-radius:10px; overflow:hidden; } .mini-metric { background:#fff; padding:13px 12px; } .mini-metric span { display:block; color:#8992a5; font-size:11px; margin-bottom:4px; } .mini-metric strong { color:#17213d; font-size:18px; }
.live-card { background:linear-gradient(180deg,#fff 0%,#fbfcff 100%); } .live-kicker { color:#20a866; display:flex; align-items:center; gap:8px; } .live-count { font-size:30px; font-weight:750; color:#20a866; } .live-strip { margin:0 20px 20px; padding:15px; display:flex; align-items:center; gap:12px; border-radius:12px; background:#f5faf7; border:1px solid rgba(32,168,102,.12); } .live-strip-icon { width:36px; height:36px; display:grid; place-items:center; border-radius:10px; background:rgba(32,168,102,.12); color:#20a866; } .live-strip div:nth-child(2) { min-width:0; flex:1; } .live-strip strong,.live-strip span { display:block; } .live-strip strong { color:#23304d; font-size:13px; } .live-strip span { color:#8a93a7; font-size:11px; margin-top:2px; }
.priority-list { padding:0 14px 14px; display:grid; grid-template-columns:1fr 1fr; gap:8px; } .priority-item { display:flex; align-items:center; gap:12px; padding:13px 10px; border:1px solid #edf0f5; border-radius:11px!important; } .priority-copy { min-width:0; } .priority-copy strong,.priority-copy span { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; } .priority-copy strong { color:#26314d; font-size:13px; } .priority-copy span { color:#8a93a7; font-size:11px; margin-top:2px; }
.snapshot-list { padding:0 24px 18px; } .snapshot-list div { display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #edf0f5; } .snapshot-list span { color:#8992a5; font-size:13px; } .snapshot-list strong { color:#17213d; font-size:14px; } .overview-btn { margin:0 24px 22px; width:calc(100% - 48px); }
@media (max-width:1300px) { .stat-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } }
@media (max-width:1100px) { .stat-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media (max-width:700px) { .dashboard-hero { align-items:flex-start; flex-direction:column; padding:22px; } .hero-actions { width:100%; } .hero-actions .v-btn { flex:1; } .dashboard-hero h1 { font-size:24px; } .stat-grid { grid-template-columns:1fr; } .metric-grid,.priority-list { grid-template-columns:1fr 1fr; } }
</style>
