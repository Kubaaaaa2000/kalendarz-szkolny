<script setup lang="ts">
const toast = useToast()
const colorMode = useColorMode()
const client = useSupabaseClient()
const user = useSupabaseUser()

const isLoggedIn = computed(() => !!user.value)

const isSlideoverOpen = ref(false)

const handleSignOut = async () => {
  isSlideoverOpen.value = false
  const { error } = await client.auth.signOut()
  if (!error) {
    isSlideoverOpen.value = false // zamknięcie slidovera na telefonie
    
    // 2. Wywołanie powiadomienia toast
    toast.add({
      title: 'Wylogowano pomyślnie',
      description: 'Do zobaczenia wkrótce!',
      icon: 'i-lucide-log-out',
      color: 'success' // lub 'neutral' / 'primary'
    })
  } else {
    // Opcjonalnie: obsługa błędu wylogowania
    toast.add({
      title: 'Błąd wylogowania',
      description: error.message,
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  }
}

const isDark = computed({
  get() {
    return colorMode?.value === 'dark'
  },
  set(_isDark) {
    colorMode.preference = _isDark ? 'dark' : 'light'
  }
})

const profileMenuItems = [
  [
    {
      label: 'Ustawienia',
      icon: 'i-lucide-settings',
      to: '/settings',
      onSelect: () => {
        isSlideoverOpen.value = false
      }
    }
  ],
  [
    {
      label: 'Wyloguj się',
      icon: 'i-lucide-log-out',
      color: 'error' as const,
      onSelect: () => {
        handleSignOut()
      }
    }
  ]
]

// const client = useSupabaseClient();
// const isLoggedIn = false;

// const { data: activeYear } = await client
//   .from('academic_years')
//   .select('*')
//   .eq('is_active', true)
//   .single()
</script>


<template>
    <header class="w-full min-h-16 sm:h-20 flex justify-between items-center px-4 sm:px-8 border-b border-gray-200 dark:border-gray-800 gap-3"> 

        <div class="flex-1 min-w-0">
            <h1 class="text-primary text-lg sm:text-3xl font-bold truncate">Kalendarz roku szkolnego</h1>
        </div>

        <div class="flex items-center gap-2 shrink-0">
            <ClientOnly >
                <UButton
                v-if="!colorMode?.forced"
                :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
                color="neutral"
                variant="ghost"
                size="lg"
                class="p-2 sm:p-2.5"
                @click="() => { isDark = !isDark }"
                />
                <template #fallback>
                    <div class="size-10">
                    </div>  
                </template>
            </ClientOnly>
            <USlideover title="Nawigacja" v-model:open="isSlideoverOpen">
              <UButton
                  icon="i-lucide-menu"
                  color="neutral"
                  variant="ghost"
                  size="lg"
                  aria-label="Otwórz menu"
              />
              <template #body>
                <div class="flex flex-col h-full justify-between py-2">
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
                      @click="()=>{isSlideoverOpen = false}"
                      />
                      
                      <UButton
                      to="/list"
                      icon="i-lucide-list"
                      label="Lista"
                      color="neutral"
                      variant="ghost"
                      size="lg"
                      block
                      class="justify-start text-base py-3"
                      @click="()=>{isSlideoverOpen = false}"
                      />
                  </nav>
                  <!-- Dolna część: Zalogowany profil użytkownika -->
                  <div class="pt-4 border-t border-gray-200 dark:border-gray-800">
                    <UDropdownMenu v-if="isLoggedIn" :items="profileMenuItems">
                      <UButton
                        color="neutral"
                        variant="ghost"
                        block
                        size="lg"
                        class="justify-start w-full p-3"
                        >
                        <UIcon name="i-lucide-user" class="w-6 h-6 text-primary shrink-0" />
                        <div class="text-left min-w-0 flex-1">
                        <p class="text-base font-medium truncate">{{"Administrator"}}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{user?.email}}</p>
                        </div>
                        <UIcon name="i-lucide-chevrons-up-down" class="w-5 h-5 text-gray-400 ms-auto shrink-0" />
                      </UButton>
                    </UDropdownMenu>
                    <UButton
                      v-else
                      to="/login"
                      label="Zaloguj się"
                      variant="solid"
                      size="md"
                      icon="i-lucide-log-in"
                      @click="()=>{isSlideoverOpen = false}"
                    />
                  </div>
                </div>
              </template>
            </USlideover>
            
        </div>
        
    </header>
    <main class="w-full min-h-[calc(100vh-8rem)] px-4 sm:px-8 py-6">
        <UApp :toaster="{position:'bottom-left',duration: 3000}">
            <NuxtPage />
        </UApp>
    </main>
     <footer class="w-full h-16 flex items-center px-4 sm:px-8 border-t border-gray-200 dark:border-gray-800">
        <p class="text-sm text-gray-500">Karol Kubica &copy;</p>
    </footer>
</template>