import { defineNuxtPlugin } from '#app'
import VCalendar from 'v-calendar'
import 'v-calendar/style.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VCalendar, {
    locales: {
      'pl': {
        firstDayOfWeek: 2, // 1 = Niedziela, 2 = Poniedziałek
        masks: {
          title: 'MMMM YYYY',
          dayPopover: 'WWW, MMM D, HH:hh',
        },
      },
    },
  })
})