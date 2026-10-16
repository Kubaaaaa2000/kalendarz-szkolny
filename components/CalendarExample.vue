<script setup>
// Przykładowa lista wydarzeń szkolnych
const events = ref([
  {
    id: 1,
    title: 'Apel szkolny',
    description: 'Rozpoczęcie roku lub inne święto',
    date: new Date(2026, 9, 15), // Pamiętaj: miesiące w JS są indeksowane od 0 (9 = Październik)
    color: 'primary' // Klasa koloru dopasowana do Nuxt UI
  },
  {
    id: 2,
    title: 'Kartkówka z Matematyki',
    description: 'Funkcje kwadratowe',
    date: new Date(2026, 9, 15),
    color: 'error'
  },
  {
    id: 3,
    title: 'Wycieczka do zoo',
    description: 'Klasy 1-3',
    date: new Date(2026, 9, 23),
    color: 'success'
  }
])

// Mapowanie naszych wydarzeń na format zrozumiały dla V-Calendar (Atrybuty)
const calendarAttributes = computed(() => {
  return events.value.map(event => ({
    key: event.id,
    dates: event.date,
    // Przekazujemy własne metadane, które odczytamy w slocie szablonu
    customData: event 
  }))
})

// Funkcja pomocnicza do mapowania kolorów Nuxt UI dla UBadge
const getBadgeColor = (color) => {
  if (color === 'error') return 'error'
  if (color === 'success') return 'success'
  return 'primary'
}
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto">
    <!-- Nagłówek aplikacji -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Kalendarz Szkolny</h1>
        <p class="text-neutral-500 text-sm">Przegląd wydarzeń i sprawdzianów</p>
      </div>
      <UButton icon="i-lucide-plus" label="Dodaj wydarzenie" color="primary" />
    </div>

    <!-- Komponent V-Calendar -->
    <!-- 'expanded' rozciąga kalendarz na pełną szerokość kontenera -->
    <VCalendar
      expanded
      :attributes="calendarAttributes"
      class="custom-calendar"
    >
      <!-- Customizacja wyglądu pojedynczego dnia i renderowanie wydarzeń -->
      <template #calendar-day-item="{ day, attributes }">
        <div class="flex flex-col h-full min-h-[100px] z-10 p-1">
          <!-- Numer dnia tygodnia -->
          <span class="text-xs font-semibold text-neutral-400 mb-1">
            {{ day.day }}
          </span>
          
          <!-- Lista wydarzeń przypisanych do tego dnia -->
          <div class="flex flex-col gap-1 overflow-y-auto max-h-[80px] custom-scrollbar">
            <div
              v-for="attr in attributes"
              :key="attr.key"
            >
              <!-- Używamy komponentu UBadge z Nuxt UI v3 do ładnego wyglądu -->
              <UPopover mode="hover">
                <UBadge
                  :color="getBadgeColor(attr.customData.color)"
                  variant="subtle"
                  size="sm"
                  class="w-full truncate cursor-pointer block text-left"
                >
                  {{ attr.customData.title }}
                </UBadge>

                <!-- Tooltip / Popover po najechaniu na wydarzenie -->
                <template #content>
                  <div class="p-3 max-w-[250px]">
                    <h4 class="font-bold text-sm">{{ attr.customData.title }}</h4>
                    <p class="text-xs text-neutral-500 mt-1">{{ attr.customData.description }}</p>
                  </div>
                </template>
              </UPopover>
            </div>
          </div>
        </div>
      </template>
    </VCalendar>
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
</style>