<script setup lang="ts">
import SchoolCalendar from '~/components/SchoolCalendar.vue';

</script>

<!-- <script setup lang="ts">
const client = useSupabaseClient()

interface Category {
  id: string
  name: string
  color: string
}

interface Event {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string | null
  event_categories: Category
}

interface AcademicYear {
  id: string
  name: string
  start_date: string
  end_date: string
  is_active: boolean
}

// Stan wybranej kategorii do filtrowania (null oznacza "Wszystkie")
const selectedCategory = ref<string | null>(null)

// 1. Pobranie aktywnego roku szkolnego
const { data: activeYear, pending: yearPending } = await useAsyncData('active-academic-year', async () => {
  const { data, error } = await client
    .from('academic_years')
    .select('*')
    .eq('is_active', true)
    .single()
    
  if (error) throw error
  return data as AcademicYear
})

// 2. Pobranie kategorii wydarzeń do filtrów
const { data: categories } = await useAsyncData('event-categories', async () => {
  const { data, error } = await client
    .from('event_categories')
    .select('*')
  if (error) throw error
  return data as Category[]
})

// 3. Pobranie wydarzeń dla aktywnego roku
const { data: events, pending: eventsPending } = await useAsyncData(
  'school-events', 
  async () => {
    if (!activeYear.value) return []

    const { data, error } = await client
      .from('events')
      .select(`
        id,
        title,
        description,
        start_date,
        end_date,
        event_categories (
          id,
          name,
          color
        )
      `)
      .eq('academic_year_id', activeYear.value.id)
      .order('start_date', { ascending: true })

    if (error) throw error
    return data as unknown as Event[]
  },
  {
    watch: [activeYear]
  }
)

// 4. Filtrowanie wydarzeń na podstawie wybranej kategorii
const filteredEvents = computed(() => {
  if (!events.value) return []
  if (!selectedCategory.value) return events.value
  
  return events.value.filter(event => event.event_categories?.id === selectedCategory.value)
})

// Mapowanie przefiltrowanych danych dla V-Calendar
const calendarAttributes = computed(() => {
  return filteredEvents.value.map(event => ({
    key: event.id,
    dates: new Date(event.start_date),
    customData: event 
  }))
})
</script> -->
<!-- <template> -->
  <!-- <div class="p-6 max-w-7xl mx-auto"> -->
    <!-- Nagłówek aplikacji -->
    <!-- <div class="flex justify-between items-center mb-6"> -->
      <!-- <div> -->
        <!-- <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Kalendarz Szkolny</h1> -->
        <!-- <p class="text-neutral-500 dark:text-neutral-400 text-sm" v-if="activeYear"> -->
          <!-- Aktywny rok szkolny: <span class="font-semibold text-primary-600 dark:text-primary-400">{{ activeYear.name }}</span> -->
        <!-- </p> -->
      <!-- </div> -->
      <!-- <UButton icon="i-lucide-plus" label="Dodaj wydarzenie" color="primary" /> -->
    <!-- </div> -->

    <!-- Panel filtrowania po kategoriach -->
    <!-- <div class="flex flex-wrap items-center gap-2 mb-6 p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl"> -->
      <!-- <span class="text-xs font-semibold text-neutral-500 uppercase tracking-wider mr-2">Kategorie:</span> -->
      
      <!-- Przycisk resetujący filtr (Wszystkie) -->
      <!-- <UButton -->
        size="sm"
        :variant="selectedCategory === null ? 'solid' : 'ghost'"
        color="neutral"
        @click="selectedCategory = null"
      >
        Wszystkie
      <!-- </UButton> -->

      <!-- Przyciski poszczególnych kategorii -->
      <!-- <UButton -->
        v-for="cat in categories"
        :key="cat.id"
        size="sm"
        :variant="selectedCategory === cat.id ? 'solid' : 'ghost'"
        :color="(cat.color as any) || 'primary'"
        @click="selectedCategory = cat.id"
      >
        {{ cat.name }}
      <!-- </UButton> -->
    <!-- </div> -->

    <!-- Stan ładowania -->
    <!-- <div v-if="yearPending || eventsPending" class="flex justify-center py-12"> -->
      <!-- <UIcon name="i-lucide-loader-2" class="animate-spin w-8 h-8 text-primary" /> -->
    <!-- </div> -->

    <!-- Komponent V-Calendar -->
    <!-- <VCalendar -->
      v-else
      expanded
      transparent
      borderless
      :attributes="calendarAttributes"
      class="custom-calendar w-full"
    >
      <!-- Nagłówek z miesiącem -->
      <!-- <template #header="{ title, movePrevious, moveNext }"> -->
        <!-- <div class="flex justify-between items-center px-4 py-4 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 rounded-t-xl"> -->
          <!-- <h2 class="text-xl font-bold text-neutral-900 dark:text-white capitalize">{{ title }}</h2> -->
          <!-- <div class="flex items-center gap-2"> -->
            <!-- <UButton icon="i-lucide-chevron-left" color="neutral" variant="outline" size="sm" @click="movePrevious" /> -->
            <!-- <UButton icon="i-lucide-chevron-right" color="neutral" variant="outline" size="sm" @click="moveNext" /> -->
          <!-- </div> -->
        <!-- </div> -->
      <!-- </template> -->

      <!-- Dzień kalendarza -->
      <!-- <template #calendar-day-item="{ day, attributes }"> -->
        <!-- <div class="flex flex-col h-full min-h-[120px] p-1.5 bg-white dark:bg-neutral-950 transition-colors"> -->
          <!-- <span class="text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-1"> -->
            <!-- {{ day.day }} -->
          <!-- </span> -->
          
          <!-- <div class="flex flex-col gap-1 overflow-y-auto max-h-[90px] custom-scrollbar"> -->
            <!-- <div v-for="attr in attributes" :key="attr.key"> -->
              <!-- <UPopover mode="hover"> -->
                <!-- <UBadge -->
                  <!-- :color="(attr.customData.event_categories?.color as any) || 'primary'"
                  variant="subtle"
                  size="sm"
                  class="w-full truncate cursor-pointer block text-left font-medium"
                > -->
                  <!-- {{ attr.customData.title }} -->
                <!-- </UBadge> -->

                <!-- <template #content> -->
                  <!-- <div class="p-3 max-w-[250px]"> -->
                    <!-- <div class="flex items-center justify-between gap-2 mb-1"> -->
                      <!-- <h4 class="font-bold text-sm text-neutral-900 dark:text-white">{{ attr.customData.title }}</h4> -->
                      <!-- <UBadge :color="attr.customData.event_categories?.color" size="xs">
                        {{ attr.customData.event_categories?.name }}
                      </UBadge> -->
                    <!-- </div> -->
                    <!-- <p class="text-xs text-neutral-500 dark:text-neutral-400">
                      {{ attr.customData.description || 'Brak opisu wydarzenia.' }}
                    </p> -->
                  <!-- </div> -->
                <!-- </template> -->
              <!-- </UPopover> -->
            <!-- </div> -->
          <!-- </div> -->
        <!-- </div> -->
      <!-- </template> -->
    <!-- </VCalendar> -->
  <!-- </div> -->
<!-- </template> -->

<!-- <style scoped>
:deep(.vc-container) {
  border: 1px solid rgb(var(--color-neutral-200));
  border-radius: var(--ui-radius, 0.75rem);
  background-color: transparent;
  font-family: inherit;
}
.dark :deep(.vc-container) {
  border-color: rgb(var(--color-neutral-800));
}
:deep(.vc-weeks) {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  background-color: rgb(var(--color-neutral-200));
  gap: 1px;
}
.dark :deep(.vc-weeks) {
  background-color: rgb(var(--color-neutral-800));
}
:deep(.vc-day) {
  min-height: 120px;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(150, 150, 150, 0.3);
  border-radius: 4px;
}
</style> -->
<template>
    <div>
        <SchoolCalendar />
    </div>
</template>