<script setup lang="ts">
import { computed } from 'vue';

/**
 * StatusChip — one place that decides "what color is this status", so every page
 * stops re-implementing its own badgeColor()/statusColor() ternary chain.
 */
const props = withDefaults(
  defineProps<{
    status: string | boolean | null | undefined;
    // Optional overrides for domain-specific statuses, e.g. { more_info: 'warning' }
    colorMap?: Record<string, string>;
    size?: 'x-small' | 'small' | 'default';
  }>(),
  { size: 'small' }
);

const DEFAULT_COLORS: Record<string, string> = {
  active: 'success',
  approved: 'success',
  won: 'success',
  paid: 'success',
  success: 'success',
  available: 'success',
  released: 'success',
  completed: 'success',

  pending: 'warning',
  under_review: 'warning',
  more_info: 'warning',
  processing: 'warning',
  review: 'warning',

  suspended: 'error',
  rejected: 'error',
  lost: 'error',
  failed: 'error',
  cancelled: 'error',
  inactive: 'error',
  error: 'error',

  info: 'info',
  void: 'secondary',
  draft: 'secondary'
};

const label = computed(() => {
  if (typeof props.status === 'boolean') return props.status ? 'Active' : 'Inactive';
  const s = String(props.status ?? '—');
  return s.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
});

const color = computed(() => {
  const key = typeof props.status === 'boolean' ? (props.status ? 'active' : 'inactive') : String(props.status ?? '').toLowerCase();
  return props.colorMap?.[key] || DEFAULT_COLORS[key] || 'secondary';
});
</script>

<template>
  <v-chip :color="color" :size="size" variant="tonal" label class="font-weight-medium">
    {{ label }}
  </v-chip>
</template>
