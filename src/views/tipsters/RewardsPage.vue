<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { apiFetch } from '@/utils/api';
import DataTable from '@/components/shared/DataTable.vue';
import StatusChip from '@/components/shared/StatusChip.vue';
import StatCard from '@/components/shared/StatCard.vue';

const strategy = ref<any>({ platformSharePercent: 70, tipsterPoolPercent: 30, minSettledPredictions: 50, minWithdrawal: 10, currency: 'GHS' });
const periods = ref<any[]>([]);
const rewards = ref<any[]>([]);
const withdrawals = ref<any[]>([]);
const revenue = ref<any>({ total: { amount: 0, count: 0 }, byCurrency: [], byMonth: [] });
const error = ref('');
const loading = ref(false);
const calculating = ref(false);
const savingStrategy = ref(false);
const month = ref(new Date().toISOString().slice(0, 7));
const platformPercent = ref(70);
const poolPercent = ref(30);
const rewardsSearch = ref('');
const withdrawalsSearch = ref('');

const eligibleRewards = computed(() => rewards.value.filter(r => r.amount > 0));
const pendingWithdrawals = computed(() => withdrawals.value.filter(w => ['pending', 'approved'].includes(w.status)));

function money(v: any, c = 'GHS') { return `${c} ${Number(v || 0).toFixed(2)}`; }

async function load() {
  loading.value = true; error.value = '';
  try {
    strategy.value = await apiFetch('/admin/rewards/strategy');
    platformPercent.value = strategy.value.platformSharePercent;
    poolPercent.value = strategy.value.tipsterPoolPercent;
    periods.value = await apiFetch('/admin/rewards/periods');
    rewards.value = await apiFetch('/admin/rewards');
    withdrawals.value = await apiFetch('/admin/withdrawals');
    revenue.value = await apiFetch('/admin/rewards/revenue?days=365');
  } catch (e: any) { error.value = e.message || 'Unable to load reward centre.'; }
  finally { loading.value = false; }
}
async function saveStrategy() {
  savingStrategy.value = true; error.value = '';
  try {
    strategy.value = await apiFetch('/admin/rewards/strategy', {
      method: 'PATCH',
      body: JSON.stringify({
        platformSharePercent: Number(platformPercent.value),
        tipsterPoolPercent: Number(poolPercent.value),
        minSettledPredictions: Number(strategy.value.minSettledPredictions),
        minMonthlySettledPredictions: Number(strategy.value.minMonthlySettledPredictions || 5),
        minWithdrawal: Number(strategy.value.minWithdrawal || 10),
        currency: strategy.value.currency || 'GHS'
      })
    });
    await load();
  } catch (e: any) { error.value = e.message || 'Unable to save reward strategy.'; }
  finally { savingStrategy.value = false; }
}
async function calculate() {
  calculating.value = true; error.value = '';
  try {
    await apiFetch('/admin/rewards/periods/calculate', { method: 'POST', body: JSON.stringify({ month: month.value, platformSharePercent: Number(platformPercent.value), tipsterPoolPercent: Number(poolPercent.value) }) });
    await load();
  } catch (e: any) { error.value = e.message || 'Unable to calculate reward period.'; }
  finally { calculating.value = false; }
}
async function approve(id: string) { try { await apiFetch(`/admin/rewards/${id}/approve`, { method: 'PATCH' }); await load(); } catch (e: any) { error.value = e.message; } }
async function available(id: string) { try { await apiFetch(`/admin/rewards/${id}/available`, { method: 'PATCH' }); await load(); } catch (e: any) { error.value = e.message; } }
async function withdrawal(id: string, status: string) { try { await apiFetch(`/admin/withdrawals/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); await load(); } catch (e: any) { error.value = e.message; } }
onMounted(load);

const periodHeaders = [
  { title: 'Month', key: 'label' },
  { title: 'Revenue', key: 'grossRevenue', align: 'end' as const },
  { title: 'Pool', key: 'pool', align: 'end' as const },
  { title: 'Platform', key: 'platform', align: 'end' as const },
  { title: 'Allocated', key: 'allocatedAmount', align: 'end' as const },
  { title: 'Status', key: 'status' }
];
const rewardHeaders = [
  { title: 'Tipster', key: 'tipster' },
  { title: 'Settled', key: 'settledPredictions', align: 'end' as const },
  { title: 'Monthly', key: 'monthlySettledPredictions', align: 'end' as const },
  { title: 'Win rate', key: 'winRate', align: 'end' as const },
  { title: 'ROI', key: 'roi', align: 'end' as const },
  { title: 'Score', key: 'performanceScore', align: 'end' as const },
  { title: 'Share', key: 'sharePercent', align: 'end' as const },
  { title: 'Reward', key: 'amount', align: 'end' as const },
  { title: 'Status', key: 'status' },
  { title: 'Action', key: 'actions', sortable: false, align: 'end' as const }
];
const withdrawalHeaders = [
  { title: 'Tipster', key: 'tipster' },
  { title: 'Amount', key: 'amount', align: 'end' as const },
  { title: 'Method', key: 'method' },
  { title: 'Recipient', key: 'recipient' },
  { title: 'Requested', key: 'createdAt' },
  { title: 'Status', key: 'status' },
  { title: 'Action', key: 'actions', sortable: false, align: 'end' as const }
];
</script>

<template>
<v-row>
  <v-col cols="12">
    <v-card class="reward-hero" elevation="0">
      <v-card-text class="pa-7">
        <div class="d-flex justify-space-between align-start flex-wrap ga-5">
          <div>
            <div class="text-overline text-white-50">BraTipsters monetization</div>
            <h1 class="text-h4 text-white font-weight-bold mb-2">Tipster Rewards & Revenue</h1>
            <p class="text-body-1 text-white opacity-80 mb-0">70% stays with BraTipsters. 30% of collected subscription revenue funds the performance pool.</p>
          </div>
          <v-chip color="white" variant="outlined">NO P2P WAGERING</v-chip>
        </div>
      </v-card-text>
    </v-card>
  </v-col>

  <v-col cols="12" md="3"><StatCard label="Platform share" :value="`${platformPercent}%`" caption="BraTipsters revenue" /></v-col>
  <v-col cols="12" md="3"><StatCard label="Tipster pool" :value="`${poolPercent}%`" caption="Performance rewards" /></v-col>
  <v-col cols="12" md="3"><StatCard label="Eligibility" :value="strategy.minSettledPredictions" caption="settled predictions minimum" /></v-col>
  <v-col cols="12" md="3">
    <StatCard
      label="Collected revenue"
      :value="money(revenue.total.amount, revenue.byCurrency?.[0]?._id || strategy.currency)"
      :caption="`${revenue.total.count || 0} paid invoices`"
    />
  </v-col>

  <v-col cols="12">
    <v-card elevation="0" class="border rounded-lg">
      <v-card-title>Monthly pool calculator</v-card-title>
      <v-card-subtitle>Calculate the previous month after Stripe revenue has settled. Rewards are created as pending until admin review.</v-card-subtitle>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3"><v-text-field v-model="month" type="month" label="Reward month" variant="outlined" /></v-col>
          <v-col cols="12" md="3"><v-text-field v-model.number="platformPercent" type="number" min="0" max="100" label="Platform share %" variant="outlined" /></v-col>
          <v-col cols="12" md="3"><v-text-field v-model.number="poolPercent" type="number" min="0" max="100" label="Tipster pool %" variant="outlined" /></v-col>
          <v-col cols="12" md="3" class="d-flex align-center ga-2">
            <v-btn variant="outlined" :loading="savingStrategy" @click="saveStrategy">Save strategy</v-btn>
            <v-btn color="primary" :loading="calculating" @click="calculate">Calculate rewards</v-btn>
          </v-col>
        </v-row>
        <v-row class="mt-1">
          <v-col cols="12" md="3"><v-text-field v-model.number="strategy.minSettledPredictions" type="number" min="1" label="Lifetime settled minimum" variant="outlined" /></v-col>
          <v-col cols="12" md="3"><v-text-field v-model.number="strategy.minMonthlySettledPredictions" type="number" min="1" label="Monthly settled minimum" variant="outlined" /></v-col>
          <v-col cols="12" md="3"><v-text-field v-model.number="strategy.minWithdrawal" type="number" min="1" label="Minimum withdrawal" variant="outlined" /></v-col>
          <v-col cols="12" md="3"><v-text-field v-model="strategy.currency" label="Wallet currency" variant="outlined" /></v-col>
        </v-row>
        <v-alert type="info" variant="tonal">Formula: 40% win rate · 25% volume · 15% consistency · 10% ROI · 10% discipline. Lifetime performance is used for the long-term score; monthly volume keeps the pool focused on active tipsters.</v-alert>
      </v-card-text>
    </v-card>
  </v-col>

  <v-col cols="12">
    <DataTable title="Reward periods" :headers="periodHeaders" :items="periods" :show-search="false" empty-title="No reward periods calculated yet">
      <template #item.grossRevenue="{ item }">{{ money(item.grossRevenue, item.currency) }}</template>
      <template #item.pool="{ item }">{{ money(item.tipsterPoolAmount, item.currency) }} ({{ item.tipsterPoolPercent }}%)</template>
      <template #item.platform="{ item }">{{ money(item.platformRevenueAmount, item.currency) }} ({{ item.platformSharePercent }}%)</template>
      <template #item.allocatedAmount="{ item }">{{ money(item.allocatedAmount, item.currency) }}</template>
      <template #item.status="{ item }"><StatusChip :status="item.status" /></template>
    </DataTable>
  </v-col>

  <v-col cols="12">
    <DataTable
      title="Tipster performance rewards"
      :subtitle="`${eligibleRewards.length} eligible for payout`"
      :headers="rewardHeaders"
      :items="rewards"
      v-model:search="rewardsSearch"
      search-label="Search rewards"
      empty-title="No rewards yet"
    >
      <template #item.tipster="{ item }">
        <b>{{ item.tipsterId?.username || item.tipsterId?.userId?.name || 'Tipster' }}</b>
        <div class="text-caption text-medium-emphasis">{{ item.periodId?.label }}</div>
      </template>
      <template #item.winRate="{ item }">{{ Number(item.winRate || 0).toFixed(1) }}%</template>
      <template #item.roi="{ item }">{{ Number(item.roi || 0).toFixed(1) }}%</template>
      <template #item.performanceScore="{ item }">{{ Number(item.performanceScore || 0).toFixed(3) }}</template>
      <template #item.sharePercent="{ item }">{{ Number(item.sharePercent || 0).toFixed(2) }}%</template>
      <template #item.amount="{ item }"><b>{{ money(item.amount, item.currency) }}</b></template>
      <template #item.status="{ item }"><StatusChip :status="item.status" /></template>
      <template #item.actions="{ item }">
        <v-btn v-if="item.status === 'pending'" size="small" @click="approve(item._id)">Approve</v-btn>
        <v-btn v-if="item.status === 'approved'" size="small" color="success" @click="available(item._id)">Release</v-btn>
      </template>
    </DataTable>
  </v-col>

  <v-col cols="12">
    <DataTable
      title="Manual tipster payouts"
      :subtitle="`${pendingWithdrawals.length} open`"
      :headers="withdrawalHeaders"
      :items="withdrawals"
      v-model:search="withdrawalsSearch"
      search-label="Search payouts"
      empty-title="No withdrawal requests"
    >
      <template #filters>
        <v-alert type="info" variant="tonal" density="compact" class="mb-0">
          BraTipsters does not automatically transfer tipster earnings. Verify recipient details before sending money. <b>Target payout time: 1–3 business days.</b>
        </v-alert>
      </template>
      <template #item.tipster="{ item }">
        <b>{{ item.tipsterId?.username || item.tipsterId?.userId?.name || 'Tipster' }}</b>
        <div class="text-caption text-medium-emphasis">{{ item.tipsterId?.userId?.email || '' }}</div>
      </template>
      <template #item.amount="{ item }"><b>{{ money(item.amount, item.currency) }}</b></template>
      <template #item.method="{ item }"><span class="text-capitalize">{{ item.method.replace('_', ' ') }}</span></template>
      <template #item.recipient="{ item }">
        <div><b>{{ item.payoutAccountName || '—' }}</b></div>
        <div>{{ item.payoutAccountNumber || '—' }}</div>
        <div class="text-caption text-medium-emphasis">{{ item.payoutInstitution || '—' }}</div>
      </template>
      <template #item.createdAt="{ item }">{{ new Date(item.createdAt).toLocaleString() }}</template>
      <template #item.status="{ item }"><StatusChip :status="item.status" /></template>
      <template #item.actions="{ item }">
        <v-btn v-if="item.status === 'pending'" size="small" @click="withdrawal(item._id, 'approved')">Approve</v-btn>
        <v-btn v-if="['pending', 'approved'].includes(item.status)" size="small" color="success" class="ml-1" @click="withdrawal(item._id, 'paid')">Mark paid</v-btn>
        <v-btn v-if="['pending', 'approved'].includes(item.status)" size="small" color="error" variant="text" class="ml-1" @click="withdrawal(item._id, 'rejected')">Reject</v-btn>
      </template>
    </DataTable>
  </v-col>

  <v-col cols="12" v-if="error"><v-alert type="error" variant="tonal">{{ error }}</v-alert></v-col>
</v-row>
</template>
<style scoped>
.reward-hero { background: linear-gradient(135deg, #101a2e, #182641); border-radius: 18px; }
.text-white-50 { color: rgba(255, 255, 255, 0.62) !important; }
</style>
