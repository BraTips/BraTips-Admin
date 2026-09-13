<template>
  <div class="team-logo" :class="size" :title="name">
    <img v-if="normalizedSrc && !failed" :src="normalizedSrc" :alt="`${name} logo`" loading="lazy" decoding="async" @error="failed=true" />
    <span v-else class="team-initials" aria-hidden="true">{{ initials }}</span>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
const props = withDefaults(defineProps<{src?:string|null,name?:string,size?:'sm'|'md'|'lg'}>(),{name:'Team',size:'md'})
const failed=ref(false)
watch(()=>props.src,()=>failed.value=false)
const normalizedSrc=computed(()=>{
  const value=(props.src||'').trim()
  if(!value) return ''
  if(value.startsWith('//')) return `https:${value}`
  return value
})
const initials=computed(()=>props.name.trim().split(/\s+/).filter(Boolean).map(x=>x[0]).join('').slice(0,2).toUpperCase()||'TM')
</script>
<style scoped>
.team-logo{display:grid;place-items:center;border-radius:50%;background:linear-gradient(145deg,#f8fafc,#e9eef6);overflow:hidden;flex:none;border:1px solid var(--line);font-weight:800;color:var(--muted);box-shadow:0 4px 12px rgba(16,26,46,.08)}
.team-logo img{width:100%;height:100%;object-fit:contain;padding:5px;display:block}
.team-initials{font-size:inherit;line-height:1}
.sm{width:34px;height:34px;font-size:9px}.md{width:48px;height:48px;font-size:11px}.lg{width:76px;height:76px;font-size:16px}
</style>
