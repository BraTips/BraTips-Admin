<script setup lang="ts">
/**
 * DataTable — the one table component every "list of records" page should use.
 *
 * Wraps Vuetify's v-data-table with the polish a hand-rolled <v-table> never gets for free:
 * sorting, pagination, a built-in search box, an optional filter-chip row, and consistent
 * loading / error / empty states. All parent slots (item.xxx, no-data, etc.) are forwarded
 * straight through to v-data-table, so callers customise cells exactly the way they would
 * with v-data-table itself.
 */
import { computed } from 'vue';

interface Header {
  title: string;
  key: string;
  sortable?: boolean;
  align?: 'start' | 'center' | 'end';
  width?: string | number;
  nowrap?: boolean;
}

const props = withDefaults(
  defineProps<{
    headers: Header[];
    items: any[];
    itemKey?: string;
    loading?: boolean;
    error?: string;
    search?: string;
    showSearch?: boolean;
    searchLabel?: string;
    title?: string;
    subtitle?: string;
    itemsPerPage?: number;
    emptyTitle?: string;
    emptyText?: string;
    dense?: boolean;
    // Set true when `items` is already filtered by the parent (e.g. matching against a
    // resolved label rather than a raw id/ObjectId) — the search box still works, it just
    // won't hand the raw value to v-data-table's own (naive) filter as well.
    externalFilter?: boolean;
  }>(),
  {
    itemKey: '_id',
    loading: false,
    error: '',
    search: '',
    showSearch: true,
    searchLabel: 'Search',
    title: '',
    subtitle: '',
    itemsPerPage: 10,
    emptyTitle: 'No records found',
    emptyText: 'Try adjusting your search or filters.',
    dense: false,
    externalFilter: false
  }
);

const emit = defineEmits<{ (e: 'update:search', value: string): void }>();

const searchModel = computed({
  get: () => props.search,
  set: (v: string) => emit('update:search', v)
});

const tableHeaders = computed(() =>
  props.headers.map((h) => ({
    title: h.title,
    key: h.key,
    sortable: h.sortable !== false,
    align: h.align || 'start',
    width: h.width,
    nowrap: h.nowrap
  }))
);

// Slot forwarding: v-data-table supports a "item.<key>" slot per column plus a few fixed
// named slots. Forwarding is driven off the typed `headers` prop (not by iterating $slots)
// so Volar/vue-tsc never has to infer this component's own slot signature from itself —
// that self-reference is what produces a circular "implicitly has type any" type error.
const itemSlotNames = computed(() => props.headers.map((h) => `item.${h.key}`));

</script>

<template>
  <v-card elevation="0" class="border rounded-lg datatable-card">
    <v-card-item v-if="title || $slots.toolbar || $slots.actions" class="datatable-header">
      <template v-if="title" #prepend>
        <div>
          <v-card-title class="text-subtitle-1 font-weight-bold">{{ title }}</v-card-title>
          <v-card-subtitle v-if="subtitle">{{ subtitle }}</v-card-subtitle>
        </div>
      </template>
      <template v-if="$slots.actions" #append>
        <slot name="actions" />
      </template>
    </v-card-item>

    <v-card-text class="datatable-toolbar" v-if="showSearch || $slots.filters">
      <div class="d-flex flex-wrap align-center ga-3">
        <v-text-field
          v-if="showSearch"
          v-model="searchModel"
          :label="searchLabel"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
          class="datatable-search"
        />
        <div v-if="$slots.filters" class="d-flex flex-wrap align-center ga-2">
          <slot name="filters" />
        </div>
        <v-spacer />
        <div v-if="$slots.toolbar" class="d-flex align-center ga-2">
          <slot name="toolbar" />
        </div>
      </div>
    </v-card-text>

    <v-alert v-if="error" type="error" variant="tonal" class="mx-4 mb-4">{{ error }}</v-alert>

    <v-data-table
      :headers="tableHeaders"
      :items="items"
      :search="externalFilter ? undefined : searchModel"
      :loading="loading"
      :item-value="itemKey"
      :items-per-page="itemsPerPage"
      :density="dense ? 'compact' : 'comfortable'"
      class="datatable-table"
      loading-text="Loading records…"
    >
      <template v-for="slotName in itemSlotNames" :key="slotName" #[slotName]="itemProps">
        <slot :name="slotName" v-bind="itemProps ?? {}" />
      </template>

      <template v-if="$slots.top" #top>
        <slot name="top" />
      </template>
      <template v-if="$slots.bottom" #bottom="bottomProps">
        <slot name="bottom" v-bind="bottomProps ?? {}" />
      </template>

      <template v-if="$slots['no-data']" #no-data>
        <slot name="no-data" />
      </template>
      <template v-else #no-data>
        <div class="datatable-empty">
          <v-icon icon="mdi-table-search" size="40" class="mb-2 text-medium-emphasis" />
          <div class="text-subtitle-2 font-weight-medium">{{ emptyTitle }}</div>
          <div class="text-caption text-medium-emphasis">{{ emptyText }}</div>
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<style scoped>
.datatable-header {
  padding-bottom: 0;
}
.datatable-toolbar {
  padding-top: 12px;
  padding-bottom: 4px;
}
.datatable-search {
  max-width: 320px;
  flex: 1 1 240px;
}
.datatable-empty {
  padding: 48px 16px;
  text-align: center;
}
.datatable-table :deep(thead th) {
  font-weight: 600 !important;
  font-size: 0.75rem !important;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: rgb(var(--v-theme-lightText)) !important;
  background: rgb(var(--v-theme-containerBg));
}
.datatable-table :deep(tbody tr:hover) {
  background: rgba(var(--v-theme-primary), 0.04);
}
.datatable-table :deep(td),
.datatable-table :deep(th) {
  white-space: nowrap;
}
</style>
