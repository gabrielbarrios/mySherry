# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Production build
npm run lint     # ESLint check
```

No test suite is configured.

## Project overview

**MySherry** — social platform where users share recipes and restaurant reviews. Built with Next.js 16 App Router, React 19, Supabase, and Tailwind CSS v4.

## Route structure

| Route | Purpose | Auth required |
|---|---|---|
| `/recipes`, `/restaurants` | Owner's CRUD lists | Yes → redirect `/login` |
| `/recipes/create`, `/restaurants/create` | Create forms (client) | Yes (checked in submit) |
| `/recipes/edit/[id]`, `/restaurants/edit/[id]` | Edit forms (client) | Yes + ownership |
| `/recipes/view/[slug]`, `/restaurants/view/[slug]` | Public detail pages | No |
| `/user/[username]` | Public profile | No |
| `/user/[username]/recipes`, `/user/[username]/restaurants` | User's public content | No |
| `/friends` | Friend management | Yes |
| `/login`, `/signup` | Auth | No |

## Supabase clients

Always use the correct client for the rendering context:

```ts
// Server Components, Route Handlers, Server Actions
import { createClient } from '@/utils/supabase/server'

// Client Components — always wrap in useMemo to keep a stable reference
import { createClient } from '@/utils/supabase/client'
const supabase = useMemo(() => createClient(), [])
```

**Never** create `createClient()` at the top of a Client Component without `useMemo` — it produces a new reference each render and causes infinite `useEffect` loops when included in dependency arrays.

## Auth patterns

**Server pages** — call `supabase.auth.getUser()` directly, then `redirect('/login')`.

**Client edit pages** — use `useFetchOwnerEntity<T>(tableName, id, redirectPath)` from `hooks/useFetchOwnerEntity.ts`. It validates auth + record ownership in one call (double-lock: `.eq('id', id).eq('user_id', user.id)`). Returns `{ data, loading, authUser, supabase }`.

**Parallel server fetches** — in view pages, run independent fetches concurrently:

```ts
const [{ data: { user: authUser } }, profile, { data: item, error }] = await Promise.all([
    supabase.auth.getUser(),
    getProfile(),
    supabase.from('...').select('*').eq('slug', slug).single(),
])
```

## Profile data

`getProfile()` in `library/get-user-data.ts` is wrapped in React `cache()`. Call it freely from any number of Server Components in the same request — only one DB query runs. Returns `{ username, languaje, interests }`.

`app/layout.tsx` uses `getProfile()` for the Navbar and language resolution, so pages that also call `getProfile()` pay no extra cost.

## i18n

Language stored in `profiles.languaje` (note the spelling — single `a`). Dictionaries in `library/language/esp.ts` (complete) and `eng.ts` (incomplete — only has nav, home, footer).

- **Server Components**: `getTranslation(profile?.languaje)` from `@/library/language/translate`
- **Client Components**: `const t = useTranslation()` from `@/app/components/context/LanguageProvider`

`LanguageProvider` is initialized in `app/layout.tsx` server-side, so translation is available everywhere without extra fetches.

When adding new translatable strings, always add to `esp.ts` first (and mirror in `eng.ts` when it catches up). Never hardcode Spanish strings in components.

## Notifications (Toast + ConfirmModal)

**Never use `alert()` or `window.confirm()`** — both are replaced by the custom system:

```ts
// Toast — success / error / info, auto-dismisses after 3.5 s
import { useToast } from '@/app/components/ui/Toast'
const { toast } = useToast()
toast.success(t.recipes.save)
toast.error(t.global.errorSave + ': ' + error.message)
toast.info(t.global.notLoggedIn)

// ConfirmModal — replaces window.confirm()
import ConfirmModal from '@/app/components/ui/ConfirmModal'
const [confirmOpen, setConfirmOpen] = useState(false)
// ...
<ConfirmModal
    isOpen={confirmOpen}
    title={t.global.deleteConfirm}
    message={t.global.deleteWarning}
    confirmText={t.global.deleteAction}
    cancelText={t.global.cancel}
    onConfirm={handleDelete}
    onCancel={() => setConfirmOpen(false)}
    variant="danger"   // 'danger' = red, 'default' = orange
/>
```

`ToastProvider` lives in `app/layout.tsx` (inside `LanguageProvider`) so toasts persist across client-side navigations.

`ConfirmModal` uses `createPortal(…, document.body)` — **this is intentional**. Cards use `hover:-translate-y-1` (CSS transform), which creates a new stacking context and breaks `position: fixed` for children. The portal renders the modal directly into `<body>`, outside any transformed ancestor.

## Reviews / Ratings

`RatingComponent` and `RatingDisplay` are generic — both accept `tableName` and `itemId` props and work for `recipe_reviews` and `restaurant_reviews`. Review tables schema: `item_id`, `user_id`, `rating`, `personal_review` with a unique constraint on `(user_id, item_id)`. Upsert handles create/update.

## Permission system

Content (`recipes`, `restaurants`) has a `permission` integer: `0` = public, `1` = friends only, `2` = private.

## Friends system

`friends` table: `user_id`, `friend_id`, `status` (`pending` | `accepted`). Always query bidirectionally:

```ts
.or(`and(user_id.eq.${a},friend_id.eq.${b}),and(user_id.eq.${b},friend_id.eq.${a})`)
```

`FriendRequestsModal` caches results for 30 seconds (via `useRef<number>`) to avoid re-fetching every time the modal opens.

## Slug-based URLs

Recipes and restaurants use a `slug` column generated from the title via `generateSlug()` in `app/utils/string-utils.ts`. Slug uniqueness is enforced at DB level — error code `23505` is caught and shown as a user-facing error (not a toast, but inline in the form).

## Component organization

```
app/components/
  context/    # LanguageProvider — React context for i18n
  database/   # Stateful components that read/write Supabase:
              #   DeleteItem (generic delete with ConfirmModal)
              #   FriendButton, UnfriendButton, FriendRequestsModal
              #   RatingComponent (write), RatingDisplay (read)
              #   EditProfileModal, UserSearch
  filter/     # FilterBar components for list pages
  form/       # FormRecipeFields, FormRestaurantFields, FormInput, Label
  layout/     # Navbar (server), HeaderClient (client), Footer
  ui/         # Presentational: ButtonAction, SectionHeader, Heading,
              #   StaticRating, InterestsCard, Toast, ConfirmModal
```

`SectionHeader` (imported as `PageHeader`) is the standard page header — accepts optional `ratingConfig` to embed `RatingComponent` inline and optional `back` to show a back button.

## Key dictionary keys (esp.ts)

`global`: `delete`, `deleteConfirm`, `deleteWarning`, `deleteAction`, `deleteError`, `cancel`, `confirm`, `edit`, `update`, `saving`, `loading`, `errorSave`, `errorUpdate`, `notLoggedIn`, `notPermitions`, `searchFriend`, `noVotes`

`friends`: `myFriends`, `addFriend`, `friends`, `pendingRequest`, `requests`, `noPendingRequests`, `friendshipConfirmed`, `unfriend`, `unfriendConfirm` (use `.replace('{{name}}', friendName)`), `unfriendError`, `noBiography`

`recipes`: `save`, `updated.success`, `mustLogin`, `errorExist`, `create.*`, `updated.*`

`restaurants`: `createdSuccess`, `create`, `update`, `edit`, `editing`
