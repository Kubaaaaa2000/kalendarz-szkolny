export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()

  // Jeśli użytkownik NIE jest zalogowany i próbuje wejść na stronę chronioną (np. /dashboard lub /admin)
  if (!user.value) {
    return navigateTo('/calendar')
  }
})