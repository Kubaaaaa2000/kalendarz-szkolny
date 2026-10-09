<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set(_isDark) {
    colorMode.preference = _isDark ? 'dark' : 'light'
  }
})
const profileMenuItems = [
  [
    {
      label: 'Mój profil',
      icon: 'i-lucide-user',
      to: '/profile'
    },
    {
      label: 'Ustawienia',
      icon: 'i-lucide-settings',
      to: '/settings'
    }
  ],
  [
    {
      label: 'Wyloguj się',
      icon: 'i-lucide-log-out',
      color: 'error' as const,
      click: () => {
        // obsługa wylogowania
        console.log('Wylogowano')
      }
    }
  ]
]
const isLoggedIn = true;
</script>


<template>
    <header class="w-full min-h-16 sm:h-20 flex justify-between items-center px-4 sm:px-8 border-b border-gray-200 dark:border-gray-800 gap-3"> 

        <div class="flex-1 min-w-0">
            <h1 class="text-primary text-lg sm:text-3xl font-bold truncate">Kalendarz roku szkolnego</h1>
        </div>

        <div class="flex items-center gap-2 shrink-0">
            <ClientOnly v-if="!colorMode?.forced">
                <UButton
                :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
                color="neutral"
                variant="ghost"
                size="lg"
                class="p-2 sm:p-2.5"
                @click="isDark = !isDark"
                />
                <template #fallback>
                    <div class="size-10">
                    </div>  
                </template>
            </ClientOnly>
            <USlideover v-if="isLoggedIn" title="Nawigacja">
                <UButton
                    icon="i-lucide-menu"
                    color="neutral"
                    variant="ghost"
                    size="lg"
                    aria-label="Otwórz menu"
                />
                <template #body>
                    <div class="flex flex-col h-full justify-between py-2">
                    <!-- Górna część: Linki nawigacyjne -->
                    <nav class="space-y-2">
                        <UButton
                        to="/calendar"
                        icon="i-lucide-calendar"
                        label="Kalendarz"
                        color="neutral"
                        variant="ghost"
                        size="lg"
                        block
                        class="justify-start text-base py-3"
                        />
                        
                        <UButton
                        to="/dashboard"
                        icon="i-lucide-layout-dashboard"
                        label="Pulpit"
                        color="neutral"
                        variant="ghost"
                        size="lg"
                        block
                        class="justify-start text-base py-3"
                        />

                        <!-- Miejsce na kolejne linki -->
                        <UButton
                        to="/tasks"
                        icon="i-lucide-check-square"
                        label="Zadania"
                        color="neutral"
                        variant="ghost"
                        block
                        size="lg"
                        class="justify-start text-base py-3"
                        />
                    </nav>

                    <!-- Dolna część: Zalogowany profil użytkownika -->
                    <div class="pt-4 border-t border-gray-200 dark:border-gray-800">
                        <UDropdownMenu :items="profileMenuItems">
                        <UButton
                            color="neutral"
                            variant="ghost"
                            block
                            size="lg"
                            class="justify-start w-full p-3"
                        >
                            <UIcon name="i-lucide-user" class="w-6 h-6 text-primary shrink-0" />
                            <div class="text-left min-w-0 flex-1">
                            <p class="text-base font-medium truncate">Jan Kowalski</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">jan@example.com</p>
                            </div>
                            <UIcon name="i-lucide-chevrons-up-down" class="w-5 h-5 text-gray-400 ms-auto shrink-0" />
                        </UButton>
                        </UDropdownMenu>
                    </div>
                    </div>
                </template>
            </USlideover>
            <UButton
                v-else
                to="/login"
                label="Zaloguj się"
                variant="solid"
                size="md"
                icon="i-lucide-log-in"
            />
        </div>
        
    </header>
    <main class="w-full min-h-[calc(100vh-8rem)] px-4 sm:px-8 py-6">
        <UApp>
            <NuxtPage />
        </UApp>
    </main>
     <footer class="w-full h-16 flex items-center px-4 sm:px-8 border-t border-gray-200 dark:border-gray-800">
        <p class="text-sm text-gray-500">Karol Kubica &copy;</p>
    </footer>
</template>