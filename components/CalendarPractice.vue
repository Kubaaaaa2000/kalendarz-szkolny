<script setup lang="ts">

import type { Database } from '~/types/database.types'

type AcademicYear = Database['public']['Tables']['academic_years']['Row']
type Category = Database['public']['Tables']['event_categories']['Row']
type EventRow = Database['public']['Tables']['events']['Row']

interface EventWithCategory extends EventRow {
  event_categories: Category
}

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const client = useSupabaseClient<Database>()
const selectedCategory = ref<string | null>(null)


const { data: activeYear, pending: yearPending } = await useAsyncData('active-academic-year', async () => {
  const { data, error } = await client
    .from('academic_years')
    .select('*')
    .eq('is_active', true)
    .single()
    
  if (error) throw error
  return data as AcademicYear
})

const minDate = computed(() => {
  if (!activeYear.value?.start_date) return undefined
  const [year, month, day] = activeYear.value.start_date.split('-').map(Number)
  return new Date(year, month - 1, day)
})

const maxDate = computed(() => {
  if (!activeYear.value?.end_date) return undefined
  const [year, month, day] = activeYear.value.end_date.split('-').map(Number)
  return new Date(year, month - 1, day)
})

const mapColor = (colorName: string): string => {
  const map: Record<string, string> = {
    red: 'error',
    yellow: 'warning',
    blue: 'info',
    indigo: 'tertiary',
    green: 'success',
    gray: 'neutral'
  }
  return map[colorName] || 'primary'
}
const { data: categories } = await useAsyncData('event-categories', async () => {
  const { data, error } = await client
    .from('event_categories')
    .select('*')
  if (error) throw error
  return data as Category[]
})
const { data: events, pending } = await useAsyncData('all-academic-events', async () => {
  if (!activeYear.value) return []
  const { data: eventsData, error: eventsError } = await client
    .from('events')
    .select(`
      *,
      event_categories (
        id,
        name,
        color,
        description
      )
    `)
    .eq('academic_year_id', activeYear.value.id)
    .order('start_date', { ascending: true })

  if (eventsError) {
    console.error('Błąd pobierania wydarzeń:', eventsError)
    return []
  }
  return eventsData as EventWithCategory[]
})

const filteredEvents = computed(() => {
  if (!events.value) return []
  if (!selectedCategory.value) return events.value
  return events.value.filter(event => event.event_categories?.id === selectedCategory.value)
})

const calendarAttributes = computed(() => {
  return filteredEvents.value.map(event => {
    // Bezpieczne parsowanie daty początkowej
    const [startYear, startMonth, startDay] = event.start_date.split('-').map(Number)
    const startDate = new Date(startYear, startMonth - 1, startDay)

    let formattedDate = startDate.toLocaleDateString('pl-PL', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    })
    if (event.start_time) {
      const startTimeFormatted = event.start_time.substring(0, 5)
      if (event.end_time) {
        const endTimeFormatted = event.end_time.substring(0, 5)
        formattedDate += `, ${startTimeFormatted} – ${endTimeFormatted}`
      } else {
        formattedDate += `, ${startTimeFormatted}`
      }
    }
    const customData = {
      ...event,
      formattedDate
    }
    const popoverConfig = {
        visibility: 'hover'
    }
    if (event.end_date) {
        const [endYear, endMonth, endDay] = event.end_date.split('-').map(Number)
        const endDate = new Date(endYear, endMonth - 1, endDay)

        return {
            highlight: event.event_categories.color,
            key: event.id,
            dates: { start: startDate, end: endDate },
            popover: popoverConfig,
            customData
        }
    }
    return {
        highlight: event.event_categories.color,
        key: event.id,
        dates: startDate,
        popover: popoverConfig,
        customData
    }
  })
})
</script>
<template>
  <div class="p-6 max-w-6xl mx-auto">
    
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
    <div class="flex flex-col gap-4 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs font-semibold text-neutral-400 uppercase tracking-wider mr-1 w-full sm:w-auto mb-1 sm:mb-0">Filtruj:</span>
        <UButton
          size="xs"
          sm:size="sm"
          :variant="selectedCategory === null ? 'solid' : 'ghost'"
          color="neutral"
          @click="()=>{selectedCategory = null}"
        >Wszystkie</UButton>
        <UButton
          v-for="cat in categories"
          :key="cat.id"
          size="xs"
          sm:size="sm"
          :variant="selectedCategory === cat.id ? 'solid' : 'ghost'"
          :color="(mapColor(cat.color) as any)"
          @click="()=>{selectedCategory = cat.id}"
        >
          {{ cat.name }}
        </UButton>
      </div>
    </div>

    <ClientOnly>
        <VCalendar
          expanded
          borderless
          :attributes="calendarAttributes"
          :is-dark="isDark"
          transition="fade"
          :min-date="minDate"
          :max-date="maxDate"
          >
            <template #day-popover="{ attributes }">    
                <div class="">        
                    <ul class="space-y-1">          
                    <li            
                        v-for="{ key, customData } in attributes"            
                        :key="key"            
                        class="block text-xs text-gray-700 dark:text-gray-300  p-2 rounded space-y-1">            
                        
                        <div class="text-[10px] font-bold text-center text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b pb-1 border-gray-200/60 dark:border-gray-800">
                        {{ customData.formattedDate }}
                        </div>

                        <div>
                            <div class=" flex items-center gap-2">
                                <span class="w-2 h-1.25 rounded-sm inline-block shrink-0"
                                 :style="{ backgroundColor: `var(--ui-color-${mapColor(customData.event_categories.color)}-500` }"
                                 ></span>
                                <span class="font-bold block text-[13px]">{{ customData.title }}</span>
                            </div>
                            <p v-if="customData.description" class="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                {{ customData.description }}
                            </p>
                        </div>

                    </li>        
                    </ul>    
                </div>  
            </template>
        </VCalendar>
        <template #fallback>
            <div class="h-125 w-full flex items-center justify-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                <UIcon name="i-lucide-loader-2" class="animate-spin w-8 h-8 text-primary" />
            </div>
        </template>
    </ClientOnly>   
  </div>
</template>
<style scoped>
:deep(.vc-container) {
  border-radius: var(--ui-radius);
  border-color: rgb(var(--color-neutral-200));
  background-color: transparent;
}
.dark :deep(.vc-container) {
  border-color: rgb(var(--color-neutral-800));
}
:deep(.vc-header) {
  padding: 12px 0;
}
:deep(.vc-weeks) {
  padding: 0;
}
:deep(.vc-day) {
  border: 1px solid rgb(var(--color-neutral-100));
  min-height: 120px;
}
.dark :deep(.vc-day) {
  border-color: rgb(var(--color-neutral-800));
}
.custom-scrollbar::-webkit-scrollbar {
  width: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}
:deep(.vc-weekday-1) {
  color: #ac0707 !important;
}
:deep(.vc-weekday-7) {
  color: #ac0707 !important;
}
:deep(.vc-header) {
  margin-bottom: 2rem !important; 
}

:deep(.vc-weeks) {
  margin-top: 0.5rem !important;
}
</style>