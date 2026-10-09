<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

// Pomocnicza obsługa czyszczenia błędu i powrotu do strony głównej
const handleError = () => clearError({ redirect: '/' })

// Czytelniejsza wiadomość w zależności od kodu błędu
const errorMessage = computed(() => {
  if (props.error?.statusCode === 404) {
    return 'Przepraszamy, strona której szukasz nie istnieje lub została przeniesiona.'
  }
  return props.error?.statusMessage || props.error?.message || 'Wystąpił nieoczekiwany błąd.'
})
</script>

<template>
  <UApp>
    <div class="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-neutral-900 px-4 py-8">
      <div class="max-w-md w-full text-center space-y-6">
        
        <!-- Ikona błędu z kolorystyką Rose -->
        <div class="flex justify-center">
          <div class="size-20 sm:size-24 rounded-full bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center">
            <UIcon name="i-lucide-alert-triangle" class="size-10 sm:size-12 text-rose-500" />
          </div>
        </div>

        <!-- Kod błędu i opis -->
        <div class="space-y-2">
          <h1 class="text-6xl sm:text-7xl font-extrabold text-primary tracking-tight">
            {{ error?.status || 500 }}
          </h1>
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {{ error?.status === 404 ? 'Strona nie została znaleziona' : 'Coś poszło nie tak' }}
          </h2>
          <p class="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
            {{ errorMessage }}
          </p>
        </div>

        <!-- Przyciski akcji (dostosowane rozmiarem pod ekrany dotykowe) -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <UButton
            icon="i-lucide-house"
            label="Wróć do strony głównej"
            color="primary"
            variant="solid"
            size="lg"
            block
            class="sm:block-none"
            @click="handleError"
          />

          <UButton
            icon="i-lucide-arrow-left"
            label="Poprzednia strona"
            color="neutral"
            variant="ghost"
            size="lg"
            block
            class="sm:block-none"
            @click="$router.back()"
          />
        </div>

      </div>
    </div>
  </UApp>
</template>