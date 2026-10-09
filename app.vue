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
</script>


<template>
    <header class="vw-100"> 
        <div>
            <h1 class=" text-primary">Nuxt UI</h1>
        </div>
        <div>
            <ClientOnly v-if="!colorMode?.forced">
                <UButton
                :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
                color="neutral"
                variant="ghost"
                @click="isDark = !isDark"
                />

                <template #fallback>
                    <div class="size-8" />
                </template>
            </ClientOnly>
        </div>
        
            
    </header>
     
     <UApp>
         <NuxtPage />
     </UApp>
     <footer>
        <p>Karol Kubica &copy;</p>
     </footer>
</template>