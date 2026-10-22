<script setup lang="ts">

const client = useSupabaseClient()
const toast = useToast()

const state = reactive({
  email: '',
  password: ''
})

const loading = ref(false)

const handleLogin = async () => {
  // Prosta walidacja podstawowa
  if (!state.email || !state.password) {
    toast.add({
      title: 'Uzupełnij pola',
      description: 'Adres e-mail i hasło są wymagane.',
      color: 'warning'
    })
    return
  }

  loading.value = true
  try {
    const { error } = await client.auth.signInWithPassword({
      email: state.email,
      password: state.password
    })

    if (error) throw error

    toast.add({
      title: 'Zalogowano pomyślnie!',
      description: 'Witaj w panelu administratora.',
      color: 'success'
    })

    navigateTo('/calendar')
  } catch (error: any) {
    toast.add({
      title: 'Błąd logowania',
      description: error.message || 'Nie udało się zalogować. Sprawdź dane.',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-12">
    <UCard class="w-full max-w-md shadow-xl border border-neutral-200 dark:border-neutral-800">
      
      <template #header>
        <div class="text-center space-y-1">
          <div class="inline-flex p-3 bg-primary-50 dark:bg-primary-950/50 text-primary rounded-full mb-2">
            <UIcon name="i-lucide-lock" class="w-6 h-6" />
          </div>
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white">Panel Administratora</h2>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            Zaloguj się, aby zarządzać kalendarzem roku szkolnego
          </p>
        </div>
      </template>

      <!-- Formularz bez schematu Zod -->
      <UForm :state="state" class="space-y-4" @submit="handleLogin">
        
        <UFormField label="Adres e-mail" name="email" required>
          <UInput
            v-model="state.email"
            type="email"
            placeholder="admin@szkola.pl"
            icon="i-lucide-mail"
            size="lg"
            class="w-full"
            autocomplete="email"
          />
        </UFormField>

        <UFormField label="Hasło" name="password" required>
          <UInput
            v-model="state.password"
            type="password"
            placeholder="••••••••"
            icon="i-lucide-key-round"
            size="lg"
            class="w-full"
            autocomplete="current-password"
          />
        </UFormField>

        <div class="pt-2">
          <UButton
            type="submit"
            color="primary"
            variant="solid"
            size="lg"
            block
            :loading="loading"
            label="Zaloguj się"
            icon="i-lucide-log-in"
          />
        </div>
      </UForm>

      <template #footer>
        <div class="text-center">
          <UButton
            to="/calendar"
            variant="link"
            color="neutral"
            size="sm"
            icon="i-lucide-arrow-left"
            label="Wróć do widoku kalendarza"
          />
        </div>
      </template>

    </UCard>
  </div>
</template>