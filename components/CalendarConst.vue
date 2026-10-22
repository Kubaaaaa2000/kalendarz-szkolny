<script setup lang="ts">
// Przykładowa lista wydarzeń szkolnych
// const events1 = ref([
//   {
//     id: 1,
//     title: 'Apel szkolny',
//     description: 'Rozpoczęcie roku lub inne święto',
//     date: new Date(2026, 9, 15), // Pamiętaj: miesiące w JS są indeksowane od 0 (9 = Październik)
//     color: 'blue' // Klasa koloru dopasowana do Nuxt UI
//   },
//   {
//     id: 2,
//     title: 'Kartkówka z Matematyki',
//     description: 'Funkcje kwadratowe',
//     date: new Date(2026, 9, 15),
//     color: 'red'
//   },
//   {
//     id: 3,
//     title: 'Wycieczka do zoo',
//     description: 'Klasy 1-3',
//     date: new Date(2026, 9, 23),
//     color: 'green'
//   }
// ])

// const calendarAttributes = computed(() => {
//   return events1.value.map(event => ({
//     highlight: event.color,
//     key: event.id,
//     dates: event.date,
//     customData: event ,
//     popover: {
//       label: event.title,
//     },
//   }))
// })

// Funkcja pomocnicza do mapowania kolorów Nuxt UI dla UBadge
// const getBadgeColor = (color) => {
//   if (color === 'error') return 'error'
//   if (color === 'success') return 'success'
//   return 'primary'
// }
import type { Database } from '~/types/database.types'

type AcademicYear = Database['public']['Tables']['academic_years']['Row']
type Category = Database['public']['Tables']['event_categories']['Row']
type EventRow = Database['public']['Tables']['events']['Row']

// Rozszerzamy typ Event o relację z kategoriami, którą pobieramy w zapytaniu .select()
interface EventWithCategory extends EventRow {
  event_categories: Category
}

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const client = useSupabaseClient<Database>()
const selectedCategory = ref<string | null>(null)

// interface Category {
//   id: string
//   name: string
//   color: string
//   description?: string
// }

// interface Event {
//   id: string
//   title: string
//   description: string | null
//   start_date: string
//   end_date: string | null
//   academic_year_id: string
//   category_id: string
//   event_categories: Category
// }

// interface AcademicYear {
//   id: string
//   name: string
//   start_date: string
//   end_date: string
//   is_active: boolean
// }

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

// Przeliczenie end_date aktywnego roku na obiekt Date dla :max-date
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

// Pobranie aktywnego roku szkolnego i wszystkich jego wydarzeń za jednym razem
const { data: events, pending } = await useAsyncData('all-academic-events', async () => {
  // 1. Pobieramy aktywny rok szkolny
  // const { data: activeYear, error: yearError } = await client
  //   .from('academic_years')
  //   .select('id, name')
  //   .eq('is_active', true)
  //   .single()

  // if (yearError || !activeYear) {
  //   console.error('Nie znaleziono aktywnego roku szkolnego:', yearError)
  //   return []
  // }
  if (!activeYear.value) return []
  // 2. Pobieramy wszystkie wydarzenia powiązane z tym rokiem
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

  // Wyświetlenie całej tablicy wydarzeń w konsoli przeglądarki / serwera
//   console.log('--- WSZYSTKIE EVENTY DLA BIEŻĄCEGO ROKU SZKOLNEGO ---', eventsData)

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

    // Jeśli wydarzenie ma datę końcową, tworzymy zakres (range)
    if (event.end_date) {
        const [endYear, endMonth, endDay] = event.end_date.split('-').map(Number)
        const endDate = new Date(endYear, endMonth - 1, endDay)

        return {
            highlight: event.event_categories.color,
            key: event.id,
            // V-Calendar przyjmuje obiekt z polem start i end dla wydarzeń wielodniowych
            dates: { start: startDate, end: endDate },
            popover: { label: event.title,},
            customData: event 
        }
    }

    // Dla wydarzeń jednodniowych
    return {
        highlight: event.event_categories.color,
        key: event.id,
        dates: startDate,
        popover: { label: event.title},
        customData: event 
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
          @click="()=>{selectedCategory = null}"
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
          @click="()=>{selectedCategory = cat.id}"
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

    <!-- Komponent V-Calendar -->
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
/* Nadpisanie domyślnych stylów V-Calendar, aby pasowały do Dark Mode i Nuxt UI */
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
/* Ukrywanie scrollbara dla czystego wyglądu */
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
/* .vc-container .vc-weekday-1, .vc-weekdays .vc-weekday-7 {
  color: #6366f1;
} */
 /* Dodanie odstępu pod nagłówkiem kalendarza */
:deep(.vc-header) {
  margin-bottom: 2rem !important; /* dostosuj wielkość odstępu wg uznania */
}

/* Opcjonalnie: odstęp pod dniami tygodnia */
:deep(.vc-weeks) {
  margin-top: 0.5rem !important;
}
</style>