<script setup lang="ts">
const client = useSupabaseClient()
const user = useSupabaseUser()
const isLoggedIn = computed(() => !!user.value)

const selectedCategory = ref<string | null>(null)

interface Category {
  id: string
  name: string
  color: string
  description?: string
}

interface Event {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string | null
  academic_year_id: string
  category_id: string
  event_categories: Category
}

// 1. Pobieranie aktywnego roku szkolnego oraz wydarzeń (dokładnie tak jak w kalendarzu)
const { data: events, pending } = await useAsyncData('list-academic-events', async () => {
  const { data: activeYear, error: yearError } = await client
    .from('academic_years')
    .select('id, name')
    .eq('is_active', true)
    .single()

  if (yearError || !activeYear) {
    console.error('Nie znaleziono aktywnego roku szkolnego:', yearError)
    return []
  }

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
    .eq('academic_year_id', activeYear.id)
    .order('start_date', { ascending: true })

  if (eventsError) {
    console.error('Błąd pobierania wydarzeń:', eventsError)
    return []
  }

  return eventsData as Event[]
})

// Wyciągnięcie unikalnych kategorii z pobranych wydarzeń do filtrów (lub można pobrać osobno z tabeli)
const categories = computed(() => {
  if (!events.value) return []
  const map = new Map()
  events.value.forEach(event => {
    if (event.event_categories) {
      map.set(event.event_categories.id, event.event_categories)
    }
  })
  return Array.from(map.values())
})

// 2. Filtrowanie wydarzeń na podstawie wybranej kategorii
const filteredEvents = computed(() => {
  if (!events.value) return []
  if (!selectedCategory.value) return events.value
  return events.value.filter(event => event.event_categories?.id === selectedCategory.value)
})

// Mapowanie kolorów (dopasowane do Nuxt UI / V-Calendar)
const mapColor = (colorName?: string) => {
  switch (colorName) {
    case 'red': return 'error'
    case 'blue': return 'info'
    case 'green': return 'success'
    case 'yellow': return 'warning'
    default: return 'neutral'
  }
}

// Formatowanie daty do ładnego widoku (np. 1 września 2026)
const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6">
    
    <!-- Nagłówek strony i przełącznik trybów -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">Lista Wydarzeń Szkolnych</h1>
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {{ isLoggedIn ? 'Panel Administratora – pełny podgląd i zarządzanie' : 'Oficjalny harmonogram roku szkolnego' }}
        </p>
      </div>

      <!-- Informacja o statusie użytkownika -->
      <div class="flex items-center gap-2">
        <UBadge :color="isLoggedIn ? 'primary' : 'neutral'" variant="soft" size="lg">
          {{ isLoggedIn ? 'Tryb Admina' : 'Tryb Publiczny' }}
        </UBadge>
      </div>
    </div>

    <!-- Pasek filtrów kategorii (taki sam jak w kalendarzu) -->
    <div class="flex flex-wrap items-center gap-2 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <span class="hidden sm:block text-xs font-semibold text-neutral-400 uppercase tracking-wider mr-1">Filtruj:</span>
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
        @click="selectedCategory = cat.id"
      >
        {{ cat.name }}
      </UButton>
    </div>

    <!-- Stan ładowania -->
    <div v-if="pending" class="flex justify-center items-center py-12">
      <UIcon name="i-lucide-loader-2" class="animate-spin w-8 h-8 text-primary" />
    </div>

    <!-- Jeśli brak wydarzeń -->
    <div v-else-if="filteredEvents.length === 0" class="text-center py-12 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
      <UIcon name="i-lucide-calendar-off" class="w-12 h-12 text-neutral-400 mx-auto mb-3" />
      <h3 class="text-base font-semibold text-neutral-800 dark:text-neutral-200">Brak wydarzeń</h3>
      <p class="text-sm text-neutral-500 mt-1">W tej kategorii lub dla tego roku szkolnego nie dodano jeszcze żadnych wpisów.</p>
    </div>

    <!-- LISTA WYDARZEŃ (Rozróżnienie widoku dla Zalogowanego i Niezalogowanego) -->
    <div v-else class="space-y-3">
      
      <!-- WIDOK DLA NIEZALOGOWANYCH (Czysta, czytelna lista) -->
      <template v-if="!isLoggedIn">
        <div 
          v-for="event in filteredEvents" 
          :key="event.id"
          class="bg-white dark:bg-neutral-900 p-4 sm:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div class="space-y-1.5 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <UBadge :color="(mapColor(event.event_categories?.color) as any)" variant="solid" size="xs">
                {{ event.event_categories?.name }}
              </UBadge>
              <span class="text-xs font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <UIcon name="i-lucide-calendar" class="w-3.5 h-3.5" />
                {{ formatDate(event.start_date) }} 
                <span v-if="event.end_date"> - {{ formatDate(event.end_date) }}</span>
              </span>
            </div>
            <h3 class="text-base font-bold text-neutral-900 dark:text-white">{{ event.title }}</h3>
            <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              {{ event.description || 'Brak dodatkowego opisu wydarzenia.' }}
            </p>
          </div>
        </div>
      </template>

      <!-- WIDOK DLA ZALOGOWANEGO / ADMINA (Z dodatkowymi opcjami zarządzania) -->
      <template v-else>
        <div 
          v-for="event in filteredEvents" 
          :key="event.id"
          class="bg-white dark:bg-neutral-900 p-4 sm:p-5 rounded-2xl border-l-4 border-l-primary border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div class="space-y-1.5 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <UBadge :color="(mapColor(event.event_categories?.color) as any)" variant="solid" size="xs">
                {{ event.event_categories?.name }}
              </UBadge>
              <span class="text-xs font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <UIcon name="i-lucide-calendar" class="w-3.5 h-3.5" />
                {{ formatDate(event.start_date) }} 
                <span v-if="event.end_date"> - {{ formatDate(event.end_date) }}</span>
              </span>
              <UBadge color="neutral" variant="outline" size="sm">ID: {{ event.id.slice(0, 6) }}...</UBadge>
            </div>
            <h3 class="text-base font-bold text-neutral-900 dark:text-white">{{ event.title }}</h3>
            <p class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              {{ event.description || 'Brak dodatkowego opisu wydarzenia.' }}
            </p>
          </div>

          <!-- Akcje dostępne tylko dla administratora -->
          <div class="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800">
            <UButton size="xs" variant="outline" color="neutral" icon="i-lucide-pencil">
              Edytuj
            </UButton>
            <UButton size="xs" variant="ghost" color="error" icon="i-lucide-trash-2">
              Usuń
            </UButton>
          </div>
        </div>
      </template>

    </div>

  </div>
</template>