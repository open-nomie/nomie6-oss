# Nomie 6 OSS - Application Architecture

## Overview
Nomie 6 is a Svelte 5-based Progressive Web App for personal life tracking with a modular, domain-driven architecture. The app uses reactive state management, modular components, and intelligent data persistence.

## Directory Structure

```
src/
├── routes/                 # Top-level page routes
│   ├── settings.svelte
│   ├── history.svelte
│   ├── Timeline.svelte
│   └── [other pages]
├── domains/                # Feature domains (core business logic)
│   ├── settings/          # Settings configuration UI & logic
│   ├── timeline/          # Timeline view and data loading
│   ├── stats/             # Statistics and analytics
│   ├── stats2/            # Enhanced stats with modals
│   ├── trackable/         # Tracker/Context/Person/Pointer management
│   ├── map/               # Location tracking and mapping
│   ├── preferences/       # User preferences and settings storage
│   ├── storage/           # Data persistence layer (PouchDB, LocalForage)
│   ├── ledger/            # Log/entry ledger store
│   ├── layout/            # Main layout and responsive structure
│   └── [other domains]
├── components/            # Reusable UI components
│   ├── button/
│   ├── list-item/
│   ├── toggle-switch/
│   ├── charts/
│   ├── input/
│   └── [other components]
├── store/                 # Global state stores
│   ├── interact.ts        # User interaction handlers (modals, toasts, etc.)
│   ├── lang.ts           # Language/internationalization
│   ├── device-store.ts   # Device info and responsive state
│   └── [other stores]
├── modules/              # Services and utilities
│   ├── pwa/              # Progressive Web App service
│   ├── locate/           # Geolocation services
│   ├── tracker/          # Tracker calculations
│   ├── tokenizer/        # Log note tokenization
│   └── [other modules]
├── utils/                # Helper functions
│   ├── math/
│   ├── tick/
│   ├── text/
│   └── [other utilities]
├── vendor/               # Vendored dependencies
│   ├── svelte-navigator/ # Router (vendored v3.2.2)
│   └── svelte-headlessui/ # Headless UI components (vendored v1.0.2)
└── config/               # Configuration files
    └── appConfig.ts
```

## Architectural Layers

### 1. **Presentation Layer** (UI/Routes)
- **Location:** `src/routes/`
- **Responsibility:** Page-level components that compose domains and components
- **Examples:** settings.svelte, history.svelte, Timeline.svelte
- **Characteristics:**
  - Svelte 5 runes-based components
  - Route-specific logic and state orchestration
  - Communication with domain stores

### 2. **Domain Layer** (Business Logic)
- **Location:** `src/domains/`
- **Responsibility:** Feature-specific logic, state management, and specialized components
- **Key Domains:**
  - **settings**: Configuration UI, preferences management
  - **timeline**: Log history view with infinite scrolling
  - **stats/stats2**: Analytics and statistics with charts
  - **trackable**: Management of trackers, contexts, people, pointers
  - **map**: Location-based features using Leaflet
  - **preferences**: User settings persistence
  - **storage**: Data persistence abstraction (PouchDB, LocalForage)
  - **layout**: Main app layout and responsive structure
  - **ledger**: Central log store (LedgerStore)

### 3. **Component Layer** (Reusable UI)
- **Location:** `src/components/`
- **Responsibility:** Atomic and composite UI components
- **Categories:**
  - **Form components**: Input, ButtonGroup, ToggleSwitch
  - **Layout components**: Container, List, ListItem, Divider
  - **Navigation**: Button, Toolbar
  - **Data display**: Charts (ChartJS), Spinner, Badge
  - **Specialized**: LogItem, TrackablePill, DateRangeController
- **Characteristics:**
  - Reusable across routes and domains
  - Accept props for customization
  - Emit events for interaction

### 4. **Store Layer** (Global State)
- **Location:** `src/store/`
- **Responsibility:** Application-wide state and services
- **Key Stores:**
  - **Prefs**: User preferences (settings, theme, locale)
  - **Interact**: Modal, toast, and dialog management
  - **Lang**: Language and i18n state
  - **Device**: Responsive device information
  - **LedgerStore**: Central log/entry data
  - **TrackableStore**: Tracker, context, person, pointer data
  - **UsageStore**: Usage statistics and analytics

### 5. **Module/Service Layer**
- **Location:** `src/modules/`
- **Responsibility:** Cross-cutting services and business logic
- **Key Modules:**
  - **pwa**: Progressive Web App initialization and update detection
  - **locate**: Geolocation and distance calculations
  - **tracker**: Tracker value calculations and formatting
  - **tokenizer**: Log note parsing and token extraction
  - **object-hash**: Object hashing for comparison
  - **remote**: Remote URL handling

### 6. **Utility Layer**
- **Location:** `src/utils/`
- **Responsibility:** Pure functions and helpers
- **Categories:**
  - **math**: Mathematical operations, percentiles, sums
  - **tick**: Async timing utilities (wait, debounce)
  - **text**: Text manipulation and ID generation

## State Management Pattern

### Svelte 5 Runes
The app uses Svelte 5's reactivity runes:

```typescript
// Reactive state
let count = $state(0)

// Derived state (read-only)
let doubled = $derived(count * 2)

// Effects (side effects)
$effect(() => {
  console.log('count changed:', count)
})

// Bindable props (two-way binding)
let { value = $bindable() } = $props()
```

### Store Pattern
Global state uses Svelte's writable/derived stores:

```typescript
export const Prefs = writable(initialState)
Prefs.subscribe(state => {
  localStorage.save(state) // Persist changes
})
```

## Data Flow Architecture

```
User Interaction (UI)
        ↓
    Component Event Handler
        ↓
    Domain Logic / Store Update
        ↓
    State Change ($state, writable)
        ↓
    Side Effects ($effect)
        ↓
    Storage Persistence (SideStore, PouchDB)
        ↓
    Reactive Update (UI re-renders)
```

## Key Patterns Used

### 1. **Modal Pattern**
- Modal stores manage modal state and visibility
- Modals accept props and emit events
- Example: Stats2Store.openStats2(), UpdateAvailableModal

### 2. **Reactive Computation Pattern**
- Use `$derived()` for read-only computations
- Use `$effect()` only for side effects
- Avoid infinite loops by not writing state in effects

### 3. **Virtual Scrolling**
- NvirtualList for rendering large lists efficiently
- Used in Timeline and History views

### 4. **Domain Store Pattern**
- Each domain has its own writable store
- Store updates trigger component reactivity
- Persistence handled by SideStore

### 5. **Bindable Props Pattern**
- Props marked with `$bindable()` allow two-way binding
- Used for form controls and configuration UI

## Technology Stack

### Frontend Framework
- **Svelte 5**: Reactive component framework with runes
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety

### UI/Styling
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS preprocessing

### State Management
- **Svelte Stores**: Built-in writable/derived stores
- **SideStore**: Custom wrapper for persistence

### Data & Storage
- **PouchDB**: Local database with sync capabilities
- **LocalForage**: Simple key-value storage
- **JSON**: Data serialization

### Charts & Visualization
- **Chart.js**: Interactive charts
- **Leaflet**: Map visualization
- **D3-like patterns**: Custom data visualization

### PWA & Service Worker
- **Workbox**: Service worker generation and caching
- **vite-plugin-pwa**: PWA integration

### Utilities
- **dayjs**: Date manipulation
- **esri-leaflet-geocoder**: Location geocoding

## Component Reactivity System

### Svelte 5 Reactivity
```typescript
// Component state is fully reactive
let count = $state(0)

// Computed values don't recompute unnecessarily
let doubled = $derived(count * 2)

// Effects run when dependencies change
$effect(() => {
  console.log('Effect runs when count changes')
})

// Two-way binding
let { value = $bindable() } = $props()
```

### Store Reactivity
```typescript
// Stores are reactive everywhere
const value = $derived(data.length) // Auto-subscribes
// or
const unsubscribe = store.subscribe(value => { ... })
```

## Data Persistence Architecture

### Layers
1. **In-Memory**: Svelte stores ($state, writable)
2. **Browser Storage**: SideStore (localStorage wrapper)
3. **Database**: PouchDB for entries/logs
4. **Sync**: Optional cloud sync via Nomie Server

### Flow
```
User Action → Store Update → SideStore.put() → Persistence
                          → $effect() → UI Update
```

## Key Design Decisions

### 1. Domain-Driven Design
- Features organized by domain (settings, timeline, map)
- Each domain owns its data and business logic
- Reduces coupling between features

### 2. Component Composition
- Small, focused, reusable components
- Props for customization, events for communication
- Avoid complex nested props drilling

### 3. Reactive-First
- Svelte 5 runes for component state
- Stores for shared state
- Effects for side effects (not data transformation)

### 4. Modular Vendored Dependencies
- svelte-navigator (router) - vendored v3.2.2
- svelte-headlessui - vendored v1.0.2
- Ensures compatibility with Svelte 5

### 5. Progressive Enhancement
- PWA with offline support
- Workbox for intelligent caching
- Update detection with exponential backoff

## Recent Major Features (2026)

### PWA Modernization (Phase 4)
- Enhanced update detection (15min polling vs 60min)
- Exponential backoff for failed checks
- localStorage persistence of update state
- Manual refresh checking

### AI Integration
- Bring-your-own-key principle
- Per-service API key storage (Claude, ChatGPT)
- Collapsible settings section
- Secure storage in preferences

### Svelte 5 Migration
- Full migration to runes-based reactivity
- Vendored dependencies updated
- Fixed infinite loops and reactive issues

## Performance Considerations

### Optimization Techniques
1. **Virtual Lists**: NvirtualList for large data
2. **Derived State**: $derived() avoids recomputation
3. **Code Splitting**: Route-level and lazy loading
4. **PWA Caching**: Workbox intelligent strategies
5. **Bundle Size**: Workbox limit 20MB for precaching

### Reactive Performance
- Avoid large effects that run frequently
- Use untrack() to break dependency cycles
- Prefer $derived() over $effect() for computations

## Testing & Quality

### Type Safety
- TypeScript for compile-time checks
- Types throughout codebase

### Component Testing
- Verification through browser testing (no unit tests observed)
- Manual testing in dev server
- Svelte compiler catches reactivity errors

## Deployment

### Build Process
- Vite build produces dist/ directory
- Service worker auto-generated by Workbox
- PWA manifest included

### Distribution
- Web app deployable to any static host
- PWA installable on mobile devices
- Optional: Nomie Server for cloud sync

## Future Architecture Considerations

### Potential Improvements
1. **Query Abstraction**: Standardize data fetching patterns
2. **Error Boundaries**: Graceful error handling
3. **Testing Framework**: Structured test suite
4. **API Services**: Centralized AI/external API layer
5. **Analytics**: Event-based tracking system
