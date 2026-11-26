export interface CalendarDayCell {
  dateStr: string | null // 'YYYY-MM-DD'
  dayNumber: number | null
  isWeekend: boolean
  bgColor: string | null // np. '#ff0000', '#ffff00', '#f5cba7', '#00b0f0', '#00b050', '#d946ef'
  secondaryBgColor?: string | null // dla dni z dwoma wydarzeniami (trójkątny podział)
  hatchClass: string | null // np. 'hatch-green' dla praktyk
  isSchoolDay: boolean
}

export interface MonthGrid {
  year: number
  month: number // 0-11
  label: string // np. 'wrzesień 2026'
  weeks: CalendarDayCell[][]
  schoolDaysCount: number
}

export function useSchoolYearCalendar(startYear: number, events: Ref<any[]>) {
  const monthNames = [
    'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
    'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'
  ]

  // Kolejność miesięcy: wrzesień (8) -> grudzień (11), styczeń (0) -> sierpień (7)
  const schoolMonthsOrder = [
    { year: startYear, month: 8 },
    { year: startYear, month: 9 },
    { year: startYear, month: 10 },
    { year: startYear, month: 11 },
    { year: startYear + 1, month: 0 },
    { year: startYear + 1, month: 1 },
    { year: startYear + 1, month: 2 },
    { year: startYear + 1, month: 3 },
    { year: startYear + 1, month: 4 },
    { year: startYear + 1, month: 5 },
    { year: startYear + 1, month: 6 },
    { year: startYear + 1, month: 7 }
  ]

  // Mapowanie kolorów z bazy na dokładne kolory szablonu
  const templateColorMap: Record<string, string> = {
    red: '#ff0000',      // dni ustawowo wolne
    yellow: '#ffff00',   // rozpoczęcie i zakończenie
    orange: '#f8cbad',   // dni wolne od zajęć dydaktycznych (brzoskwiniowy)
    blue: '#00b0f0',     // zebrania / konsultacje
    green: '#00b050',    // rada klasyfikacyjna
    purple: '#d946ef'    // wydarzenia specjalne (np. 9 paź)
  }

  const monthsGrid = computed<MonthGrid[]>(() => {
    return schoolMonthsOrder.map(({ year, month }) => {
      const firstDay = new Date(year, month, 1)
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      
      // Dzień tygodnia w Polsce: Pn = 0 ... Nd = 6
      const startWeekday = (firstDay.getDay() + 6) % 7
      
      const cells: CalendarDayCell[] = []
      let schoolDaysCount = 0

      // Puste kratki przed 1. dniem miesiąca
      for (let i = 0; i < startWeekday; i++) {
        cells.push({
          dateStr: null,
          dayNumber: null,
          isWeekend: i >= 5,
          bgColor: null,
          hatchClass: null,
          isSchoolDay: false
        })
      }

      // Dni miesiąca
      for (let day = 1; day <= daysInMonth; day++) {
        const current = new Date(year, month, day)
        const weekday = (current.getDay() + 6) % 7
        const isWeekend = weekday >= 5
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

        // Szukamy wydarzeń przypadających na ten dzień
        const dayEvents = events.value.filter(ev => {
          const end = ev.end_date || ev.start_date
          return dateStr >= ev.start_date && dateStr <= end
        })

        let bgColor: string | null = null
        let secondaryBgColor: string | null = null
        let hatchClass: string | null = null
        let blocksSchoolDay = false

        for (const ev of dayEvents) {
          const catColor = ev.event_categories?.color
          const mapped = templateColorMap[catColor] || null

          // Zakładamy, że kategoria praktyk ma np. flagę lub nazwę 'praktyki'
          if (ev.event_categories?.name?.toLowerCase().includes('praktyki')) {
            hatchClass = `hatch-${catColor}` // np. hatch-green, hatch-blue, hatch-purple
          } else if (mapped) {
            if (!bgColor) {
              bgColor = mapped
            } else if (bgColor !== mapped) {
              secondaryBgColor = mapped
            }
          }

          // Dni wolne odejmują się od puli dni szkolnych (czerwony = ustawowo wolny, orange = wolny od zajęć)
          if (catColor === 'red' || catColor === 'orange') {
            blocksSchoolDay = true
          }
        }

        // Wakacje (lipiec, sierpień) mają 0 dni szkolnych
        const isSummerHoliday = month === 6 || month === 7
        const isSchoolDay = !isWeekend && !blocksSchoolDay && !isSummerHoliday
        if (isSchoolDay) schoolDaysCount++

        cells.push({
          dateStr,
          dayNumber: day,
          isWeekend,
          bgColor,
          secondaryBgColor,
          hatchClass,
          isSchoolDay
        })
      }

      // Dopełnienie siatki do pełnych tygodni (zawsze 5 lub 6 wierszy, jak na szablonie)
      while (cells.length % 7 !== 0) {
        const idx = cells.length % 7
        cells.push({
          dateStr: null,
          dayNumber: null,
          isWeekend: idx >= 5,
          bgColor: null,
          hatchClass: null,
          isSchoolDay: false
        })
      }

      // Podział na tygodnie po 7 dni
      const weeks: CalendarDayCell[][] = []
      for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7))
      }

      return {
        year,
        month,
        label: `${monthNames[month]} ${year}`,
        weeks,
        schoolDaysCount
      }
    })
  })

  return { monthsGrid }
}