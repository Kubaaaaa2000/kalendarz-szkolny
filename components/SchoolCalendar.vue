<script setup lang="ts">
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

const selectedCategory = ref<string | null>(null)

// Mapowanie kolorów tekstowych/badge z bazy na Nuxt UI
const mapColor = (colorName: string): string => {
  const map: Record<string, string> = {
    red: 'primary',
    amber: 'warning',
    blue: 'info',
    indigo: 'tertiary',
    emerald: 'success',
    gray: 'neutral'
  }
  return map[colorName] || 'primary'
}

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

// 2. Pobranie kategorii
const { data: categories } = await useAsyncData('event-categories', async () => {
  const { data, error } = await client
    .from('event_categories')
    .select('*')
  if (error) throw error
  return data as Category[]
})

// 3. Pobranie wydarzeń
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

const filteredEvents = computed(() => {
  if (!events.value) return []
  if (!selectedCategory.value) return events.value
  return events.value.filter(event => event.event_categories?.id === selectedCategory.value)
})

const calendarAttributes = computed(() => {
  return filteredEvents.value.map(event => ({
    key: event.id,
    dates: new Date(event.start_date),
    customData: event 
  }))
})

</script>

<template>
  <div class="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
    
    <!-- Nagłówek i informacja o aktywnym roku -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-neutral-900 p-5 sm:p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">Kalendarz Roku Szkolnego</h1>
        <p class="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm mt-1">
          Bieżące informacje o dniach wolnych, egzaminach, zebraniach i wydarzeniach.
        </p>
      </div>
      <div v-if="activeYear" class="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-start">
        <span class="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400">Aktywny rok:</span>
        <UBadge color="primary" variant="solid" size="lg">{{ activeYear.name }}</UBadge>
      </div>
    </div>

    <!-- Panel filtrów / Legenda kolorów -->
    <div class="flex flex-col gap-4 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm">
      
      <!-- Przyciski filtrowania -->
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs font-semibold text-neutral-400 uppercase tracking-wider mr-1 w-full sm:w-auto mb-1 sm:mb-0">Filtruj:</span>
        <UButton
          size="xs"
          sm:size="sm"
          :variant="selectedCategory === null ? 'solid' : 'ghost'"
          color="neutral"
          @click="selectedCategory = null"
        >
          Wszystkie
        </UButton>
        <UButton
          v-for="cat in categories"
          :key="cat.id"
          size="xs"
          sm:size="sm"
          :variant="selectedCategory === cat.id ? 'solid' : 'ghost'"
          :color="(mapColor(cat.color) as any)"
          @click="selectedCategory = cat.id"
        >
          {{ cat.name }}
        </UButton>
      </div>

      <!-- Legenda -->
      <div class="flex flex-wrap items-center gap-2 sm:gap-3 border-t pt-3 border-neutral-100 dark:border-neutral-800">
        <span class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Legenda:</span>
        <div v-for="cat in categories" :key="cat.id" class="flex items-center gap-1.5">
          <UBadge :color="(mapColor(cat.color) as any)" variant="subtle" size="xs">
            {{ cat.name }}
          </UBadge>
        </div>
      </div>
    </div>

    <!-- Stan ładowania -->
    <div v-if="yearPending || eventsPending" class="flex justify-center py-16">
      <UIcon name="i-lucide-loader-2" class="animate-spin w-10 h-10 text-primary" />
    </div>

    <!-- Główny Kalendarz z kontenerem przewijanym na mobile -->
    <div v-else class="overflow-x-auto pb-4">
      <div class="min-w-[650px] sm:min-w-full">
        <VCalendar
          expanded
          transparent
          borderless
          :attributes="calendarAttributes"
          class="custom-calendar w-full shadow-sm rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
        >
        <!-- Poprawne nadpisanie dni tygodnia za pomocą slotu -->
            <template #weekday="{ weekday }">
                <div class="py-2 text-center text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                {{ ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'][weekday.position - 1] }}
                </div>
            </template>
          <!-- Nagłówek kalendarza -->
          <template #header="{ title, movePrevious, moveNext }">
            <div class="flex justify-between items-center px-4 sm:px-6 py-4 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
              <h2 class="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white capitalize">{{ title }}</h2>
              <div class="flex items-center gap-2">
                <UButton icon="i-lucide-chevron-left" color="neutral" variant="outline" size="sm" @click="movePrevious" />
                <UButton icon="i-lucide-chevron-right" color="neutral" variant="outline" size="sm" @click="moveNext" />
              </div>
            </div>
          </template>

          <!-- Dzień kalendarza -->
          <template #calendar-day-item="{ day, attributes }">
            <div class="flex flex-col h-full w-full min-h-[110px] sm:min-h-[130px] p-1.5 bg-white dark:bg-neutral-900 transition-colors">
              <!-- Numer dnia -->
              <span class="text-xs font-bold text-neutral-400 mb-1">
                {{ day.day }}
              </span>
              
              <!-- Lista wydarzeń (zajmuje dostępną przestrzeń lub pozostaje pusta) -->
              <div class="flex flex-col gap-1 overflow-y-auto flex-1 max-h-[80px] sm:max-h-[100px] custom-scrollbar">
                <div v-for="attr in attributes" :key="attr.key">
                  <UPopover mode="hover">
                    <UBadge
                      :color="(mapColor(attr.customData.event_categories?.color) as any)"
                      variant="solid"
                      size="xs"
                      class="w-full truncate cursor-pointer block text-left font-medium"
                    >
                      {{ attr.customData.title }}
                    </UBadge>

                    <template #content>
                      <div class="p-3 max-w-[260px] space-y-2">
                        <div class="flex items-center justify-between gap-2">
                          <h4 class="font-bold text-sm text-neutral-900 dark:text-white">{{ attr.customData.title }}</h4>
                          <UBadge :color="(mapColor(attr.customData.event_categories?.color) as any)" size="xs" variant="solid">
                            {{ attr.customData.event_categories?.name }}
                          </UBadge>
                        </div>
                        <p class="text-xs text-neutral-500 dark:text-neutral-400">
                          {{ attr.customData.description || 'Brak dodatkowego opisu wydarzenia.' }}
                        </p>
                      </div>
                    </template>
                  </UPopover>
                </div>
              </div>
            </div>
          </template>
        </VCalendar>
      </div>
    </div>

  </div>
</template>

<style scoped>
:deep(.vc-container) {
  background-color: transparent;
  font-family: inherit;
  color: inherit;
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
  min-height: 110px !important;
  background-color: white;
  display: flex;
  flex-direction: column;
}
.dark :deep(.vc-day) {
  background-color: rgb(var(--color-neutral-900));
}
@media (min-width: 640px) {
  :deep(.vc-day) {
    min-height: 130px !important;
  }
}
:deep(.vc-weekday) {
  background-color: rgb(var(--color-neutral-100));
  color: rgb(var(--color-neutral-600));
  font-weight: 600;
  padding: 8px 0;
  font-size: 0.75rem;
}
.dark :deep(.vc-weekday) {
  background-color: rgb(var(--color-neutral-950));
  color: rgb(var(--color-neutral-400));
}
.custom-scrollbar::-webkit-scrollbar {
  width: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(150, 150, 150, 0.3);
  border-radius: 4px;
}
</style>