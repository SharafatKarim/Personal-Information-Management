# PIM — Personal Information Management

A minimal, print-perfect vault for the details that matter — IDs, policies, prescriptions, passports, anything worth remembering. Capture once, find instantly, print beautifully.

## Features

- **Google sign-in** (Firebase Auth).
- **Dynamic cards** with unlimited key-value fields. Drag to reorder fields, pick an emoji/icon, drop in a document scan or photo.
- **Obsidian-minimal dashboard** with a bento grid, real-time search across titles and field values, and pinned cards at the top.
- **Drag to set priority** — reorder cards within the pinned and unpinned groups by dragging; the order is persisted per user.
- **Print-perfect views** — single card or the full vault, rendered as a formal A4 document with forced backgrounds, page-break avoidance, and chrome hidden during print.
- **Cloudinary attachments** for image/PDF document scans.
- **Light & dark themes** with system-preference awareness (`next-themes`).
- Mobile-first sidebar (drawer on phone, collapsible rail on desktop) and a FAB for quick card creation.

## Tech stack

- **Next.js 15** (App Router, TypeScript, Turbopack in dev)
- **Firebase 11** — Auth + Firestore
- **Tailwind CSS 3** + custom `@media print` rules
- **Framer Motion** for layout animations and transitions
- **Shadcn-style primitives** (inlined) + **Aceternity**-inspired Bento Grid, Aurora, Spotlight
- **dnd-kit** for field and card reordering
- **react-hook-form** with `useFieldArray` for the card form
- **SWR** for data fetching + optimistic mutation
- **Cloudinary** for attachment upload
- **Sonner** for toast feedback
- **Lucide** for icons

## Getting started

### 1. Install

```bash
pnpm install
```

### 2. Environment variables

Copy `.env.sample` to `.env` and fill in:

```env
# Firebase — from the web-app config in the Firebase console
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

# Cloudinary — from the dashboard → account details
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_API_KEY=...
NEXT_PUBLIC_CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=pim
```

### 3. Firebase setup

In the Firebase console:

1. Enable **Authentication → Google** provider.
2. Enable **Firestore** in native mode.
3. Paste the rules from [`firestore.rules`](./firestore.rules) into **Firestore → Rules**. They restrict each user to documents under `pim/{their own uid}`.

### 4. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command      | What it does                         |
| ------------ | ------------------------------------ |
| `pnpm dev`   | Start the dev server                 |
| `pnpm build` | Production build                     |
| `pnpm start` | Serve the production build           |
| `pnpm lint`  | Next.js lint (ESLint + TS)           |

## Firestore schema

```
pim/{userId}/cards/{cardId}
  title:        string
  category:     string  (Personal | Legal | Medical | Financial | Work | Education | Travel | Other)
  fields:       Array<{ id: string, label: string, value: string }>
  isPinned:     boolean
  icon?:        string  (emoji)
  order?:       number  (manual sort within its pinned/unpinned group)
  attachmentUrl?: string  (Cloudinary URL)
  createdAt:    Timestamp
  updatedAt:    Timestamp
```

## Project layout

```
app/
  (app)/                  route group — auth-guarded UI
    layout.tsx            sidebar + RouteGuard
    dashboard/            bento grid, search, drag-reorder
    create/               new card form
    cards/[id]/           detail, edit, print
    cards/print-all/      every card in one print job
  api/upload/route.ts     Cloudinary upload endpoint
  login/                  Google sign-in
  page.tsx                landing
  layout.tsx              root — theme, auth, tooltips, toasts
  globals.css             tokens + @media print rules

components/
  auth-provider.tsx       Firebase auth context
  route-guard.tsx         client-side /login redirect
  theme-provider.tsx      next-themes wrapper + themed Sonner
  sidebar.tsx             desktop rail + mobile drawer
  card-form.tsx           react-hook-form + useFieldArray + dnd-kit + Cloudinary
  print-view.tsx          PrintCardContent / PrintView / PrintAllView
  attachment-uploader.tsx Cloudinary uploader UI
  ui/                     shadcn-style primitives + Aceternity-inspired pieces

lib/
  firebase.ts             client SDK init
  cloudinary.ts           server SDK config
  cards.ts                Firestore CRUD + reorderCards batch write
  types.ts                PimCard types & CATEGORIES
  upload.ts               client upload helper
  utils.ts                cn, formatDate, randomId
```

## Design notes

- **Auth guarding is client-side**, not via Edge middleware, because the Firebase client SDK uses IndexedDB/localStorage — unavailable on the Edge runtime. The `RouteGuard` inside the `(app)` route group redirects unauthenticated users to `/login`. The included `middleware.ts` is a no-op placeholder.
- **Priority = drag order.** A numeric `order` field stores position. `reorderCards` rewrites `0,1,2,…` across the dragged group in a single `writeBatch`. Pinned cards form a separate group visually and in the drag context, so you can't accidentally drag across the pin boundary.
- **Drag is disabled while search is active.** Reordering a filtered subset would produce a confusing final order; the subheader tells you why.
- **Print view** uses `@media print` rules in `globals.css`: forces backgrounds (`print-color-adjust: exact`), hides chrome via `.no-print`, avoids breaks inside a card with `.print-avoid-break`, and breaks between cards with `.print-page-break` in the print-all view.
- **`updateCard` handles `undefined`** by dropping it for most fields and sending `deleteField()` for the explicitly clearable ones (`attachmentUrl`, `icon`). Firestore rejects literal `undefined`.

## License

MIT — personal use and hacking encouraged.
