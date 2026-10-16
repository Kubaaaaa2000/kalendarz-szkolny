<script setup>
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
// Przykładowa lista wydarzeń szkolnych
const events = ref([
  {
    id: 1,
    title: 'Apel szkolny',
    description: 'Rozpoczęcie roku lub inne święto',
    date: new Date(2026, 9, 15), // Pamiętaj: miesiące w JS są indeksowane od 0 (9 = Październik)
    color: 'blue' // Klasa koloru dopasowana do Nuxt UI
  },
  {
    id: 2,
    title: 'Kartkówka z Matematyki',
    description: 'Funkcje kwadratowe',
    date: new Date(2026, 9, 15),
    color: 'red'
  },
  {
    id: 3,
    title: 'Wycieczka do zoo',
    description: 'Klasy 1-3',
    date: new Date(2026, 9, 23),
    color: 'green'
  }
])

// Mapowanie naszych wydarzeń na format zrozumiały dla V-Calendar (Atrybuty)
const calendarAttributes = computed(() => {
  return events.value.map(event => ({
    highlight: event.color,
    key: event.id,
    dates: event.date,
    // Przekazujemy własne metadane, które odczytamy w slocie szablonu
    customData: event ,
    popover: {
      label: event.title,
    },
  }))
})

// Funkcja pomocnicza do mapowania kolorów Nuxt UI dla UBadge
// const getBadgeColor = (color) => {
//   if (color === 'error') return 'error'
//   if (color === 'success') return 'success'
//   return 'primary'
// }
</script>
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
.my-calendar :deep(.vc-weekday-1, .vc-weekday-7) {
  color: #ac0707;
}
/* .vc-container .vc-weekday-1, .vc-weekdays .vc-weekday-7 {
  color: #6366f1;
} */
</style>
<template>
  <div class="p-6 max-w-6xl mx-auto">
    <!-- Nagłówek aplikacji -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Kalendarz Szkolny</h1>
        <p class="text-neutral-500 text-sm">Przegląd wydarzeń</p>
      </div>
      <UButton icon="i-lucide-plus" label="Dodaj wydarzenie" color="primary" />
    </div>

    <!-- Komponent V-Calendar -->
    <!-- 'expanded' rozciąga kalendarz na pełną szerokość kontenera -->
    <ClientOnly>
        <VCalendar
            expanded
            borderless
            :attributes="calendarAttributes"
            :is-dark="isDark"
            class="my-calendar custom-calendar"
            title-position="right"
            />
        <template #fallback>
            <div class="h-[500px] w-full flex items-center justify-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                <UIcon name="i-lucide-loader-2" class="animate-spin w-8 h-8 text-primary" />
            </div>
        </template>

    </ClientOnly>   
    
  </div>
</template>

