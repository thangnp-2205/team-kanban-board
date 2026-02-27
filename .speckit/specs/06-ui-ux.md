# 06. UI/UX Specifications

## Spec ID: SPEC-006
## Status: Approved
## Version: 1.0

---

## 1. Design System

### 1.1 Color Palette

```css
/* Primary Colors */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-500: #3b82f6;
--primary-600: #2563eb;
--primary-700: #1d4ed8;

/* Gray Scale */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;

/* Semantic Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

### 1.2 Typography

```css
/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 1.3 Spacing

```css
/* Spacing Scale (Tailwind default) */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
```

### 1.4 Border Radius

```css
--rounded-sm: 0.125rem;  /* 2px */
--rounded: 0.25rem;      /* 4px */
--rounded-md: 0.375rem;  /* 6px */
--rounded-lg: 0.5rem;    /* 8px */
--rounded-xl: 0.75rem;   /* 12px */
--rounded-2xl: 1rem;     /* 16px */
--rounded-full: 9999px;
```

### 1.5 Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

---

## 2. Layout

### 2.1 Page Structure

```
┌────────────────────────────────────────────────────────────┐
│ Navbar (h: 64px)                                           │
├────────────────────────────────────────────────────────────┤
│                                                            │
│                                                            │
│                     Main Content                           │
│               (min-h: calc(100vh - 64px))                  │
│                                                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 2.2 Responsive Breakpoints

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablet |
| lg | 1024px | Desktop |
| xl | 1280px | Large desktop |
| 2xl | 1536px | Extra large |

### 2.3 Container Widths

```css
/* Boards list page */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Board page - full width with horizontal scroll */
.board-container {
  width: 100%;
  overflow-x: auto;
  padding: 1rem;
}
```

---

## 3. Components Styling

### 3.1 Buttons

**Primary Button:**
```css
.btn-primary {
  background-color: var(--primary-600);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--rounded-lg);
  font-weight: 500;
  transition: background-color 0.2s;
}
.btn-primary:hover {
  background-color: var(--primary-700);
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Secondary Button:**
```css
.btn-secondary {
  background-color: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
}
.btn-secondary:hover {
  background-color: var(--gray-200);
}
```

### 3.2 Cards

```css
.card {
  background-color: white;
  border-radius: var(--rounded-lg);
  border: 1px solid var(--gray-200);
  box-shadow: var(--shadow-sm);
}
.card:hover {
  box-shadow: var(--shadow);
}
```

### 3.3 Inputs

```css
.input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: var(--rounded-lg);
  font-size: var(--text-sm);
}
.input:focus {
  outline: none;
  border-color: var(--primary-500);
  ring: 2px solid var(--primary-100);
}
.input-error {
  border-color: var(--error);
}
```

### 3.4 Kanban Column

```css
.kanban-column {
  width: 280px;
  min-width: 280px;
  background-color: var(--gray-100);
  border-radius: var(--rounded-xl);
  padding: 0.75rem;
}
```

### 3.5 Kanban Card

```css
.kanban-card {
  background-color: white;
  border-radius: var(--rounded-lg);
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border: 1px solid var(--gray-200);
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.kanban-card:hover {
  box-shadow: var(--shadow-md);
}
.kanban-card.dragging {
  box-shadow: var(--shadow-lg);
  transform: rotate(3deg);
}
```

---

## 4. Animations

### 4.1 Transitions

```css
/* Default transition */
.transition {
  transition-property: color, background-color, border-color, box-shadow;
  transition-duration: 200ms;
  transition-timing-function: ease-in-out;
}

/* Modal entrance */
@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Slide in from right (activity panel) */
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
```

### 4.2 Loading States

```css
/* Skeleton loading */
@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
.skeleton {
  background: linear-gradient(
    90deg,
    var(--gray-200) 0%,
    var(--gray-300) 50%,
    var(--gray-200) 100%
  );
  animation: skeleton-pulse 2s ease-in-out infinite;
}

/* Button loading spinner */
.spinner {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## 5. Accessibility

### 5.1 Focus States

```css
/* Visible focus ring */
:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* Remove default focus for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}
```

### 5.2 Color Contrast

All text must meet WCAG 2.1 AA standards:
- Normal text: 4.5:1 ratio minimum
- Large text (18px+): 3:1 ratio minimum

| Background | Text Color | Ratio |
|------------|------------|-------|
| white | gray-700 | 8.59:1 ✅ |
| white | gray-600 | 5.74:1 ✅ |
| white | gray-500 | 4.63:1 ✅ |
| primary-600 | white | 4.68:1 ✅ |

### 5.3 Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move to next focusable element |
| Shift+Tab | Move to previous focusable element |
| Enter | Activate button/link |
| Space | Toggle checkbox, activate button |
| Escape | Close modal/dropdown |
| Arrow keys | Navigate within lists |

### 5.4 Screen Reader

- All images have alt text
- Icons have aria-label or sr-only text
- Form inputs have associated labels
- Live regions for dynamic content
- Proper heading hierarchy (h1 > h2 > h3)

---

## 6. Responsive Design

### 6.1 Mobile (< 768px)

- Single column layout
- Hamburger menu for navigation
- Full-width cards
- Stacked columns (vertical scroll)
- Bottom sheet for modals

### 6.2 Tablet (768px - 1024px)

- 2 columns for board list
- Horizontal scroll for kanban
- Narrower side panels

### 6.3 Desktop (> 1024px)

- 3-4 columns for board list
- Full kanban with side panels
- Hover states enabled

---

## 7. Dark Mode (Future)

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #111827;
    --bg-secondary: #1f2937;
    --text-primary: #f9fafb;
    --text-secondary: #d1d5db;
    --border-color: #374151;
  }
}
```

---

## 8. Loading States

### 8.1 Page Loading

```
┌────────────────────────────────────────────────┐
│ [Navbar]                                       │
├────────────────────────────────────────────────┤
│                                                │
│  My Boards                                     │
│                                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ ████████ │ │ ████████ │ │ ████████ │       │
│  │ ████     │ │ ████     │ │ ████     │       │
│  │ ██████   │ │ ██████   │ │ ██████   │       │
│  └──────────┘ └──────────┘ └──────────┘       │
│                                                │
└────────────────────────────────────────────────┘
```

### 8.2 Button Loading

```
┌───────────────────────┐
│  ⟳  Creating...       │
└───────────────────────┘
```

### 8.3 Empty States

```
┌────────────────────────────────────────────────┐
│                                                │
│                    📋                          │
│                                                │
│          No boards yet                         │
│                                                │
│    Create your first board to get started      │
│                                                │
│           [+ Create Board]                     │
│                                                │
└────────────────────────────────────────────────┘
```

---

## 9. Error States

### 9.1 Form Errors

```
┌────────────────────────────────────────────────┐
│ Title *                                        │
│ ┌────────────────────────────────────────────┐ │
│ │                                            │ │
│ └────────────────────────────────────────────┘ │
│ ⚠️ Title is required                          │
└────────────────────────────────────────────────┘
```

### 9.2 Page Errors

```
┌────────────────────────────────────────────────┐
│                                                │
│                    ⚠️                          │
│                                                │
│          Something went wrong                  │
│                                                │
│    We couldn't load this board. Please try     │
│    again or contact support.                   │
│                                                │
│           [Try Again]                          │
│                                                │
└────────────────────────────────────────────────┘
```

---

## 10. Iconography

Using **Lucide Icons** (or Heroicons):

| Purpose | Icon |
|---------|------|
| Add | Plus |
| Delete | Trash2 |
| Edit | Pencil |
| Close | X |
| Menu | Menu |
| User | User |
| Calendar | Calendar |
| Comment | MessageSquare |
| Share | Share2 |
| Activity | Activity |
| Board | Layout |
| Settings | Settings |
| Logout | LogOut |
| Loading | Loader2 |

