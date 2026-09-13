<script setup lang="ts">
import { ref } from 'vue';
import { EyeInvisibleOutlined, EyeOutlined, MailOutlined, LockOutlined } from '@ant-design/icons-vue';
import { useAuthStore } from '@/stores/auth';
const auth = useAuthStore();
const username = ref(''); const password = ref(''); const showPassword = ref(false); const error = ref(''); const loading = ref(false); const remember = ref(true);
async function submit(){ error.value=''; if(!username.value.trim()||!password.value){error.value='Enter your email and password.';return} loading.value=true; try{await auth.login(username.value.trim(),password.value)}catch(e:any){error.value=e?.message||'Unable to sign in'}finally{loading.value=false}}
</script>
<template>
  <v-form @submit.prevent="submit">
    <label class="field-label">Email address</label>
    <v-text-field v-model="username" class="login-field" type="email" placeholder="admin@example.com" variant="outlined" autocomplete="username" hide-details="auto" required>
      <template #prepend-inner><MailOutlined /></template>
    </v-text-field>
    <label class="field-label">Password</label>
    <v-text-field v-model="password" class="login-field" :type="showPassword?'text':'password'" placeholder="Enter your password" variant="outlined" autocomplete="current-password" hide-details="auto" required>
      <template #prepend-inner><LockOutlined /></template>
      <template #append-inner><v-btn icon variant="text" size="small" type="button" @click="showPassword=!showPassword"><EyeOutlined v-if="showPassword"/><EyeInvisibleOutlined v-else/></v-btn></template>
    </v-text-field>
    <div class="login-options"><v-checkbox v-model="remember" label="Remember me" density="compact" hide-details color="primary"/><span>Administrator only</span></div>
    <v-alert v-if="error" type="error" variant="tonal" class="mb-5" rounded="lg">{{ error }}</v-alert>
    <v-btn class="login-button" color="primary" size="large" block type="submit" :loading="loading">Sign in <span class="arrow">→</span></v-btn>
  </v-form>
</template>
<style scoped>
.field-label{display:block;font-size:13px;font-weight:700;color:#27334a;margin:0 0 8px}.login-field{margin-bottom:19px}.login-field :deep(.v-field){border-radius:12px;background:#fff}.login-field :deep(.v-field__input){min-height:52px}.login-field :deep(.v-field__prepend-inner){padding-inline-start:14px;color:#8a94a7}.login-options{display:flex;align-items:center;justify-content:space-between;margin:2px 0 22px;color:#8993a7;font-size:12px}.login-options :deep(.v-label){font-size:12px}.login-button{height:52px;border-radius:12px!important;font-weight:800;letter-spacing:0}.arrow{font-size:20px;margin-left:8px}
</style>
