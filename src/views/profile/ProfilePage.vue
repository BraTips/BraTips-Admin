<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
const auth = useAuthStore();
const user = computed(() => auth.user || {});
</script>
<template>
  <div>
    <v-breadcrumbs :items="['Dashboard', 'Profile']" class="px-0" />
    <v-row>
      <v-col cols="12" md="4"><v-card class="pa-6 text-center" elevation="0" border><v-avatar size="88" class="mb-4"><img src="@/assets/images/users/avatar-1.png" alt="Administrator" /></v-avatar><h2>{{ user.name || 'Administrator' }}</h2><div class="text-medium-emphasis mb-4">Administrator</div><v-chip color="success" variant="tonal">Active admin account</v-chip></v-card></v-col>
      <v-col cols="12" md="8"><v-card elevation="0" border><v-card-title>Profile information</v-card-title><v-card-text><v-row><v-col cols="12" md="6"><v-text-field label="Name" :model-value="user.name || ''" readonly /></v-col><v-col cols="12" md="6"><v-text-field label="Email" :model-value="user.email || ''" readonly /></v-col><v-col cols="12" md="6"><v-text-field label="Role" model-value="Administrator" readonly /></v-col><v-col cols="12" md="6"><v-text-field label="Account status" model-value="Active" readonly /></v-col></v-row><v-btn to="/account-settings" color="primary">Account settings</v-btn></v-card-text></v-card></v-col>
    </v-row>
  </div>
</template>
