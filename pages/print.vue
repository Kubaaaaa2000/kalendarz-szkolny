<script setup lang="ts">
definePageMeta({ layout: false })

const client = useSupabaseClient()
const schoolYearStart = ref(2026)

const { data: events } = await useAsyncData('print-events', async () => {
  const { data } = await client
    .from('events')
    .select('*, event_categories(*)')
    .gte('start_date', `${schoolYearStart.value}-09-01`)
    .lte('start_date', `${schoolYearStart.value + 1}-08-31`)
    .order('start_date', { ascending: true })
  return data || []
})

const { monthsGrid } = useSchoolYearCalendar(schoolYearStart.value, computed(() => events.value || []))

// Filtrowanie sekcji do legendarnych list po prawej i na dole
const getEventsByCategoryName = (fragment: string) => {
  return (events.value || []).filter(e =>
    e.event_categories?.name?.toLowerCase().includes(fragment.toLowerCase())
  )
}

const formatRange = (start: string, end?: string | null) => {
  const fmt = (d: string) => {
    const [y, m, day] = d.split('-')
    return `${day}.${m}.${y}`
  }
  if (!end || start === end) return fmt(start)
  const [y1, m1, d1] = start.split('-')
  const [y2, m2, d2] = end.split('-')
  if (m1 === m2 && y1 === y2) return `${d1}-${d2}.${m1}.${y1}`
  return `${fmt(start)} – ${fmt(end)}`
}

const triggerPrint = () => window.print()
</script>

<template>
  <div class="bg-neutral-100 min-h-screen p-4 print:p-0 print:bg-white text-black font-sans">
    <!-- Pasek akcji widoczny tylko na ekranie -->
    <div class="max-w-[297mm] mx-auto mb-4 flex justify-between items-center bg-white p-3 rounded-lg shadow print:hidden">
      <span class="text-sm font-medium text-neutral-700">Podgląd wydruku A4 (poziomo)</span>
      <UButton icon="i-lucide-printer" color="primary" @click="triggerPrint">
        Drukuj / Zapisz jako PDF
      </UButton>
    </div>

    <!-- Arkusz A4 Landscape -->
    <div class="sheet bg-white mx-auto w-[297mm] min-h-[210mm] p-[6mm] shadow-lg print:shadow-none print:w-full flex flex-col justify-between text-[9px] leading-tight">
      
      <!-- NAGŁÓWEK -->
      <header class="flex items-center justify-between px-6 mb-2">
        <img src="/logo-zs4.png" alt="Logo ZS4" class="h-14 w-auto object-contain" />
        <div class="text-center font-serif">
          <h1 class="text-[15px] font-bold tracking-wide uppercase">
            Zespół Szkół nr 4 im. Janusza Groszkowskiego<br />w Tychach
          </h1>
          <h2 class="text-[13px] font-bold tracking-wider uppercase mt-1">
            Kalendarz Roku Szkolnego {{ schoolYearStart }}/{{ schoolYearStart + 1 }}
          </h2>
        </div>
        <img src="/herb-tychy.png" alt="Herb Tychów" class="h-14 w-auto object-contain" />
      </header>

      <!-- ŚRODEK: 12 MIESIĘCY + PRAWA KOLUMNA -->
      <div class="grid grid-cols-12 gap-3 items-start">
        <!-- 12 miesięcy (9 kolumn z 12) -->
        <div class="col-span-9 grid grid-cols-4 gap-x-2.5 gap-y-2">
          <div v-for="m in monthsGrid" :key="m.label" class="flex flex-col">
            <table class="w-full border-collapse border-[1.5px] border-black text-center table-fixed">
              <thead>
                <tr>
                  <th colspan="7" class="bg-[#d96b27] text-white font-bold py-0.5 text-[10px] border-b border-black">
                    {{ m.label }}
                  </th>
                </tr>
                <tr class="bg-white font-bold border-b border-black text-[8.5px]">
                  <th class="border-r border-black py-0.5">Pn</th>
                  <th class="border-r border-black py-0.5">Wt</th>
                  <th class="border-r border-black py-0.5">Śr</th>
                  <th class="border-r border-black py-0.5">Cz</th>
                  <th class="border-r border-black py-0.5">Pt</th>
                  <th class="border-r border-black py-0.5">Sb</th>
                  <th class="py-0.5">Nd</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(week, wIdx) in m.weeks" :key="wIdx" class="border-b border-black">
                  <td
                    v-for="(cell, dIdx) in week"
                    :key="dIdx"
                    class="border-r border-black h-[15px] relative p-0 font-medium text-[8.5px]"
                    :class="[
                      cell.isWeekend ? 'bg-[#94a3b8]' : '',
                      cell.hatchClass
                    ]"
                    :style="cell.bgColor && !cell.secondaryBgColor ? { backgroundColor: cell.bgColor } : {}"
                  >
                    <!-- Trójkątny podział dla dni z dwoma kolorami (np. 15 stycznia) -->
                    <div
                      v-if="cell.bgColor && cell.secondaryBgColor"
                      class="absolute inset-0"
                      :style="{
                        background: `linear-gradient(135deg, ${cell.bgColor} 50%, ${cell.secondaryBgColor} 50%)`
                      }"
                    ></div>
                    <span class="relative z-10">{{ cell.dayNumber || '' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="text-center text-[8px] mt-0.5 font-medium">
              {{ m.schoolDaysCount }} dni szkolnych
            </div>
          </div>
        </div>

        <!-- PRAWA RAMKA: LEGENDA + PÓŁROCZA (3 kolumny z 12) -->
        <aside class="col-span-3 border-[1.5px] border-black p-2 space-y-2 text-[8px]">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="w-3.5 h-2.5 border border-black bg-[#ff0000] shrink-0"></span>
              <span>dni ustawowo wolne</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="w-3.5 h-2.5 border border-black bg-[#ffff00] shrink-0 mt-0.5"></span>
              <div>
                <div>rozpoczęcie i zakończenie zajęć dydaktycznych:</div>
                <ul class="list-disc pl-4">
                  <li v-for="ev in getEventsByCategoryName('rozpoczęcie')" :key="ev.id">
                    {{ formatRange(ev.start_date) }} – {{ ev.title }}
                  </li>
                </ul>
              </div>
            </div>
            <div class="flex items-start gap-2">
              <span class="w-3.5 h-2.5 border border-black bg-[#f8cbad] shrink-0 mt-0.5"></span>
              <div>
                <div>dni wolne od zajęć dydaktycznych, w tym:</div>
                <ul class="list-disc pl-4">
                  <li v-for="ev in getEventsByCategoryName('wolne od zajęć')" :key="ev.id">
                    {{ formatRange(ev.start_date, ev.end_date) }} – {{ ev.title }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="space-y-1 pt-1">
            <div class="font-bold uppercase text-[8.5px]">Pierwsze Półrocze</div>
            <div v-for="ev in getEventsByCategoryName('I półrocze')" :key="ev.id">
              <strong>{{ formatRange(ev.start_date, ev.end_date) }}</strong> – {{ ev.title }}
            </div>
          </div>

          <div class="space-y-1 pt-1">
            <div class="font-bold uppercase text-[8.5px]">Drugie Półrocze</div>
            <div v-for="ev in getEventsByCategoryName('II półrocze')" :key="ev.id">
              <strong>{{ formatRange(ev.start_date, ev.end_date) }}</strong> – {{ ev.title }}
            </div>
          </div>
        </aside>
      </div>

      <!-- DOLNA SEKCJA: RADY, PRAKTYKI, ZEBRANIA, EGZAMINY -->
      <footer class="mt-2 grid grid-cols-12 gap-3 text-[8px]">
        <!-- Kolumna 1: Rada klasyfikacyjna + Praktyki -->
        <div class="col-span-3 space-y-2">
          <div>
            <div class="flex items-center gap-1.5 font-bold mb-0.5">
              <span class="w-3.5 h-2.5 border border-black bg-[#00b050] inline-block"></span>
              <span>rada klasyfikacyjna</span>
            </div>
            <div class="pl-5 space-y-0.5">
              <div v-for="ev in getEventsByCategoryName('rada')" :key="ev.id">
                {{ formatRange(ev.start_date) }} – {{ ev.title }}
              </div>
            </div>
          </div>

          <div>
            <div class="font-bold pl-5 mb-0.5">praktyki zawodowe klasy:</div>
            <div class="space-y-0.5">
              <div v-for="ev in getEventsByCategoryName('praktyki')" :key="ev.id" class="flex items-center gap-1.5">
                <span class="w-3.5 h-2.5 border border-black inline-block" :class="`hatch-${ev.event_categories?.color}`"></span>
                <span>{{ ev.title }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Kolumna 2: Zebrania z rodzicami + Konsultacje -->
        <div class="col-span-3 space-y-2">
          <div>
            <div class="flex items-center gap-1.5 font-bold mb-0.5">
              <span class="w-3.5 h-2.5 border border-black bg-[#00b0f0] inline-block"></span>
              <span>zebrania z rodzicami</span>
            </div>
            <div class="pl-5 space-y-0.5">
              <div v-for="ev in getEventsByCategoryName('zebrania')" :key="ev.id" class="flex justify-between pr-4">
                <span>{{ formatRange(ev.start_date) }}</span>
                <span v-if="ev.start_time">g. {{ ev.start_time.substring(0, 5) }}</span>
              </div>
            </div>
          </div>

          <div>
            <div class="flex items-center gap-1.5 font-bold mb-0.5">
              <span class="w-3.5 h-2.5 border border-black bg-[#00b0f0] inline-block"></span>
              <span>konsultacje</span>
            </div>
            <div class="pl-5 space-y-0.5">
              <div v-for="ev in getEventsByCategoryName('konsultacje')" :key="ev.id" class="flex justify-between pr-4">
                <span>{{ formatRange(ev.start_date) }} ({{ ev.title }})</span>
                <span v-if="ev.start_time">g. {{ ev.start_time.substring(0, 5) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Kolumna 3: Egzaminy pisemne i praktyczne zima -->
        <div class="col-span-3 space-y-2">
          <div>
            <div class="font-bold mb-0.5">egzaminy zawodowe – część pisemna (sesja / klasa):</div>
            <div v-for="ev in getEventsByCategoryName('pisemna')" :key="ev.id">
              {{ formatRange(ev.start_date, ev.end_date) }} {{ ev.title }}
            </div>
          </div>
          <div>
            <div class="font-bold mb-0.5">egzaminy zawodowe – część praktyczna sesja zimowa, kwalifikacje</div>
            <div v-for="ev in getEventsByCategoryName('praktyczna zima')" :key="ev.id" class="grid grid-cols-12">
              <span class="col-span-5">{{ formatRange(ev.start_date, ev.end_date) }}</span>
              <span class="col-span-7">– {{ ev.title }}</span>
            </div>
          </div>
        </div>

        <!-- Kolumna 4: Egzaminy praktyczne lato -->
        <div class="col-span-3">
          <div class="font-bold mb-0.5">egzaminy zawodowe – część praktyczna sesja letnia, kwalifikacje</div>
          <div v-for="ev in getEventsByCategoryName('praktyczna lato')" :key="ev.id" class="grid grid-cols-12">
            <span class="col-span-5">{{ formatRange(ev.start_date, ev.end_date) }}</span>
            <span class="col-span-7">– {{ ev.title }}</span>
          </div>
        </div>
      </footer>
      <div class="text-center text-[7.5px] text-neutral-700 mt-1">
        Made by Bartosz Kiszewski teacher ZS nr 4 im. J. Groszkowskiego
      </div>
    </div>
  </div>
</template>
<style>
/* Ukośne paski dla praktyk zawodowych */
.hatch-purple {
  background-image: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 3px,
    #a855f7 3px,
    #a855f7 4.5px
  );
}

.hatch-blue {
  background-image: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 3px,
    #0284c7 3px,
    #0284c7 4.5px
  );
}

.hatch-green {
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 3px,
    #16a34a 3px,
    #16a34a 4.5px
  );
}

/* Wymuszenie drukowania kolorów tła w przeglądarce */
@media print {
  @page {
    size: A4 landscape;
    margin: 5mm;
  }
  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>