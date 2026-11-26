# Kalendarz szkolny

Responsywna aplikacja internetowa do przeglądania kalendarza roku szkolnego i zarządzania wydarzeniami. Aplikacja korzysta z Nuxt 3, Vue 3, Nuxt UI, V-Calendar i Supabase.

Wersja opublikowana: [Kalendarz szkolny](https://kubaaaaa2000.github.io/kalendarz-szkolny).

## Spis treści

- [Funkcje](#funkcje)
- [Wymagania i planowane funkcje](#wymagania-i-planowane-funkcje)
- [Moduł drukowania wydarzeń](#moduł-drukowania-wydarzeń---specyfikacja)
- [Uruchomienie lokalne](#uruchomienie-lokalne)
- [Baza danych](#baza-danych)
- [Struktura projektu](#struktura-projektu)
- [Technologie](#technologie)

## Funkcje

### Widok użytkownika

- Kalendarz pobiera z Supabase rok szkolny oznaczony jako aktywny oraz przypisane do niego wydarzenia.
- Można przeglądać miesiące i filtrować wydarzenia według kategorii.
- Wydarzenia mogą mieć datę końcową, godziny rozpoczęcia i zakończenia oraz opis.
- Kategorie są prezentowane z oznaczeniami kolorystycznymi; szczegóły wydarzenia są dostępne po wskazaniu go w kalendarzu.
- Dostępna jest także lista wydarzeń dla aktywnego roku szkolnego z filtrem kategorii.
- Interfejs jest responsywny i obsługuje jasny oraz ciemny motyw.

### Administrator

- Logowanie odbywa się za pomocą adresu e-mail i hasła w Supabase Auth; z menu można też wywołać wylogowanie.
- Po zalogowaniu widok kalendarza udostępnia przełącznik widoku publicznego i administracyjnego.
- Na liście wydarzeń zalogowany użytkownik może edytować i usuwać wydarzenia.
- Edycja zapisuje zmiany w tabeli `events`, a widok listy aktualizuje się bez przeładowania strony.
- Formularz edycji wymaga tytułu, daty początkowej i kategorii; opis, data końcowa oraz godziny są opcjonalne.
- Usunięcie wymaga potwierdzenia.

## Wymagania i planowane funkcje

Poniższa tabela opisuje stan widoczny w kodzie projektu. Wymagania oznaczone jako „Do wdrożenia” nie są obecnie działającymi funkcjami aplikacji.

| Obszar | Stan | Uwagi |
|---|---|---|
| Logowanie i wylogowanie administratora | Częściowo dostępne | Logowanie i wylogowanie korzystają z Supabase Auth. |
| Publiczne przeglądanie kalendarza i listy | Dostępne | Dane są pobierane dla aktywnego roku szkolnego. |
| Filtrowanie wydarzeń według kategorii | Dostępne | Filtr jest dostępny w kalendarzu i na liście. |
| Filtrowanie według wybranego roku szkolnego | Do wdrożenia | Aplikacja pobiera wyłącznie rok oznaczony jako aktywny; nie ma wyboru innego roku. |
| Dodawanie wydarzeń | Do wdrożenia | Brak formularza i operacji dodawania wydarzenia. |
| Edycja i usuwanie wydarzeń | Dostępne po zalogowaniu w interfejsie | Operacje są dostępne na liście wydarzeń. |
| Przypisywanie wydarzeń do kategorii i roku | Częściowo dostępne | Edycja pozwala zmienić kategorię. Nie ma tworzenia wydarzenia ani wyboru roku szkolnego. |
| Dodawanie i edycja lat szkolnych oraz ustawianie aktywnego roku | Do wdrożenia | Brak panelu zarządzania latami szkolnymi. |
| Zarządzanie kategoriami | Do wdrożenia | Kategorie są pobierane z bazy, ale nie ma ich dodawania, edycji ani usuwania. |
| Walidacja formularzy | Częściowo dostępna | Podstawowa walidacja logowania i wymaganych pól edycji; brak formularza tworzenia oraz pełnej walidacji zakresu dat. |
| Automatyczne odświeżanie po zmianach | Częściowo dostępne | Lista aktualizuje się lokalnie po edycji lub usunięciu. Nie ma obsługi dodawania. |
| Trwały zapis w bazie | Częściowo dostępny | Edycja i usuwanie zapisują się w Supabase; pozostałe operacje CRUD nie są zaimplementowane. |
| Ochrona modyfikacji po stronie serwera/bazy | Do weryfikacji i wdrożenia | Interfejs pokazuje akcje modyfikacji po zalogowaniu oraz uprawnienia są także nałożone przez polityki RLS Supabase. |
| Widok wszystkich 12 miesięcy roku szkolnego | Do wdrożenia | Kalendarz pokazuje miesiące z nawigacją poprzedni/następny, a nie cały rok jednocześnie. |
| Legenda kolorów w publicznym kalendarzu | Do wdrożenia | Legenda występuje w komponencie widoku administracyjnego, nie w domyślnym widoku publicznym. |
| Drukowanie wydarzeń | Do wdrożenia | Proponowany format wydruku opisano w następnej sekcji. |

## Moduł drukowania wydarzeń - specyfikacja

Moduł nie jest obecnie zaimplementowany. Poniższy opis określa oczekiwany format do wdrożenia.

- **Format strony:** A4, orientacja pozioma, marginesy czytelne na wydruku.
- **Zakres danych:** wydarzenia aktywnego roku szkolnego, możliwość wydrukowania wszystkich kategorii.
- **Nagłówek:** „Kalendarz wydarzeń szkolnych”, nazwa roku szkolnego, wybrana kategoria lub informacja „Wszystkie kategorie” oraz data wygenerowania wydruku.
- **Sortowanie:** rosnąco według daty rozpoczęcia.
- **Kolumny tabeli:** Data, Godzina, Kategoria, Wydarzenie, Opis.
- **Zakres dat:** wydarzenie wielodniowe powinno pokazywać datę początku i końca. Brak daty końcowej, godziny lub opisu należy oznaczyć jako „—”.
- **Czytelność:** nazwy kategorii powinny pozostać widoczne również w druku czarno-białym; kolor może być dodatkowym oznaczeniem, ale nie jedynym sposobem rozróżnienia kategorii.
- **Układ stron:** nagłówek tabeli powtarzany po podziale na strony; w widoku drukowania należy ukryć menu, przyciski i elementy nawigacyjne aplikacji.
- **Uruchomienie:** przycisk „Drukuj ” otwiera okno drukowania przeglądarki dla przygotowanej listy. Zapis do PDF jest dostępny przez funkcję drukowania systemu.

## Uruchomienie lokalne

Wymagane: Node.js w wersji obsługiwanej przez zainstalowaną wersję Nuxt oraz dostęp do skonfigurowanego projektu Supabase.

```bash
npm install
npm run dev
```

Serwer deweloperski Nuxt wyświetli adres lokalny w terminalu (domyślnie `http://localhost:3000`).

Dostępne skrypty:

| Polecenie | Działanie |
|---|---|
| `npm run dev` | Uruchamia serwer deweloperski. |
| `npm run build` | Buduje aplikację produkcyjną. |
| `npm run generate` | Generuje statyczną wersję aplikacji. |
| `npm run preview` | Uruchamia podgląd zbudowanej aplikacji. |

Konfiguracja Nuxt określa ścieżkę bazową `/kalendarz-szkolny/` i moduł Supabase. Przy wdrożeniu w innym środowisku należy sprawdzić konfigurację adresu aplikacji i połączenia z Supabase.

## Baza danych

Typy w `types/database.types.ts` opisują trzy tabele używane przez aplikację:

| Tabela | Najważniejsze pola |
|---|---|
| `academic_years` | `id`, `name`, `start_date`, `end_date`, `is_active` |
| `event_categories` | `id`, `name`, `color`, `description` |
| `events` | `id`, `title`, `description`, `start_date`, `end_date`, `start_time`, `end_time`, `category_id`, `academic_year_id` |

Wydarzenie jest powiązane z kategorią i rokiem szkolnym. Kalendarz i lista odczytują rekordy z Supabase, a obecne operacje edycji i usuwania zapisują zmiany w tabeli `events`. Konfiguracja bazy, schemat tabel, dane przykładowe i polityki RLS powinny być utrzymywane w projekcie Supabase.

## Struktura projektu

| Ścieżka | Zawartość |
|---|---|
| `pages/calendar.vue` | Strona kalendarza i wybór widoku po zalogowaniu. |
| `pages/list.vue` | Lista wydarzeń, filtrowanie, edycja i usuwanie. |
| `pages/login.vue` | Formularz logowania administratora. |
| `components/CalendarPractice.vue` | Kalendarz z nawigacją miesięczną, filtrem kategorii i legendą dla użytkowników niezalogowanych. |
| `plugins/v-calendar.ts` | Rejestracja V-Calendar i polskiej lokalizacji. |
| `types/database.types.ts` | Typy bazy Supabase. |
| `nuxt.config.ts` | Konfiguracja Nuxt, modułów i ścieżki bazowej. |

## Technologie

- [Nuxt 3](https://nuxt.com/)
- [Vue 3](https://vuejs.org/)
- [Nuxt UI](https://ui.nuxt.com/)
- [Supabase](https://supabase.com/) - baza danych i uwierzytelnianie
- [V-Calendar](https://vcalendar.io/) - komponent kalendarza
