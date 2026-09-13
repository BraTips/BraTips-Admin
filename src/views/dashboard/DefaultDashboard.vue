<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiFetch } from '@/utils/api';
import {
  TrophyOutlined,
  TeamOutlined,
  CalendarOutlined,
  UserOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined
} from '@ant-design/icons-vue';

const loading = ref(true);
const stats = ref([
  { label: 'Users', value: '—', icon: UserOutlined, color: 'primary' },
  { label: 'Leagues', value: '—', icon: TrophyOutlined, color: 'secondary' },
  { label: 'Teams', value: '—', icon: TeamOutlined, color: 'success' },
  { label: 'Matches', value: '—', icon: CalendarOutlined, color: 'warning' },
  { label: 'Live Matches', value: '—', icon: ThunderboltOutlined, color: 'error' },
  { label: 'Finished', value: '—', icon: CheckCircleOutlined, color: 'info' }
]);
const recentMatches = ref<any[]>([]);
const integration = ref<any>(null);
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

async function loadDashboard() {
  loading.value = true;
  try {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${apiUrl}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Unable to load dashboard');
    const data = await res.json();
    const d = data.data || data;
    integration.value = await apiFetch('/admin/integrations/health').catch(() => null);
    stats.value = [
      { label: 'Users', value: d.users ?? 0, icon: UserOutlined, color: 'primary' },
      { label: 'Leagues', value: d.leagues ?? 0, icon: TrophyOutlined, color: 'secondary' },
      { label: 'Teams', value: d.teams ?? 0, icon: TeamOutlined, color: 'success' },
      { label: 'Matches', value: d.matches ?? 0, icon: CalendarOutlined, color: 'warning' },
      { label: 'Live Matches', value: d.live ?? 0, icon: ThunderboltOutlined, color: 'error' },
      { label: 'Finished', value: d.finished ?? 0, icon: CheckCircleOutlined, color: 'info' }
    ];
  } catch (e) {
    console.error(e);
  } finally { loading.value = false; }
}
onMounted(loadDashboard);
</script>

<template>
  <v-row>
    <v-col v-for="item in stats" :key="item.label" cols="12" sm="6" lg="4" xl="2">
      <v-card elevation="0" class="border rounded-lg h-100">
        <v-card-item>
          <template #prepend>
            <v-avatar :color="item.color" variant="tonal" size="44">
              <component :is="item.icon" />
            </v-avatar>
          </template>
          <v-card-subtitle>{{ item.label }}</v-card-subtitle>
          <v-card-title class="text-h4 font-weight-bold">{{ item.value }}</v-card-title>
        </v-card-item>
      </v-card>
    </v-col>

    <v-col cols="12" lg="8">
      <v-card elevation="0" class="border rounded-lg">
        <v-card-item>
          <v-card-title>Football Operations</v-card-title>
          <v-card-subtitle>Manage the data that powers your public football platform.</v-card-subtitle>
        </v-card-item>
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6">
              <v-card class="bg-primary-lighten-5 border-0" elevation="0" to="/leagues">
                <v-card-item>
                  <v-card-title>Leagues & Seasons</v-card-title>
                  <v-card-text>Manage competitions and active seasons.</v-card-text>
                </v-card-item>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6">
              <v-card class="bg-secondary-lighten-5 border-0" elevation="0" to="/matches">
                <v-card-item>
                  <v-card-title>Matches</v-card-title>
                  <v-card-text>Create, edit and monitor fixtures and results.</v-card-text>
                </v-card-item>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6">
              <v-card class="bg-success-lighten-5 border-0" elevation="0" to="/teams">
                <v-card-item>
                  <v-card-title>Teams</v-card-title>
                  <v-card-text>Maintain clubs, logos and team metadata.</v-card-text>
                </v-card-item>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6">
              <v-card class="bg-warning-lighten-5 border-0" elevation="0" to="/sync">
                <v-card-item>
                  <v-card-title>Data Sync</v-card-title>
                  <v-card-text>Prepare provider synchronization and imports.</v-card-text>
                </v-card-item>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" lg="4">
      <v-card elevation="0" class="border rounded-lg h-100">
        <v-card-item>
          <v-card-title>Admin Status</v-card-title>
          <v-card-subtitle>Control center health</v-card-subtitle>
        </v-card-item>
        <v-card-text>
          <v-list lines="two">
            <v-list-item title="Sportmonks" :subtitle="integration?.providers?.football?.configured ? 'Configured' : 'Missing API token'">
              <template #prepend><CheckCircleOutlined :class="integration?.providers?.football?.configured ? 'text-success mr-3' : 'text-warning mr-3'" /></template>
            </v-list-item>
            <v-list-item title="API connection" subtitle="Connected through configured API">
              <template #prepend><CheckCircleOutlined class="text-success mr-3" /></template>
            </v-list-item>
            <v-list-item title="MongoDB" subtitle="Managed by the backend API">
              <template #prepend><CheckCircleOutlined class="text-success mr-3" /></template>
            </v-list-item>
            <v-list-item title="Authentication" subtitle="Admin role required">
              <template #prepend><CheckCircleOutlined class="text-success mr-3" /></template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
