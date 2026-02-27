# 04. Component Specifications

## Spec ID: SPEC-004
## Status: Approved
## Version: 1.0

---

## 1. Component Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (public)
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/       # Protected routes
│   │   ├── boards/
│   │   └── layout.tsx     # Dashboard layout with navbar
│   └── api/               # API routes
├── components/
│   ├── ui/                # Reusable UI primitives
│   ├── board/             # Board-specific components
│   └── shared/            # Shared components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configs
└── types/                 # TypeScript types
```

---

## 2. UI Components (Primitives)

### 2.1 Button

**File:** `src/components/ui/button.tsx`

**Props:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}
```

**Variants:**
| Variant | Background | Text | Border |
|---------|------------|------|--------|
| primary | blue-600 | white | none |
| secondary | gray-100 | gray-800 | gray-300 |
| danger | red-600 | white | none |
| ghost | transparent | gray-600 | none |

**Sizes:**
| Size | Padding | Font Size |
|------|---------|-----------|
| sm | px-3 py-1.5 | text-sm |
| md | px-4 py-2 | text-base |
| lg | px-6 py-3 | text-lg |

**Behavior:**
- Shows spinner when `isLoading=true`
- Disabled when `isLoading=true` or `disabled=true`
- Supports all native button attributes

---

### 2.2 Input

**File:** `src/components/ui/input.tsx`

**Props:**
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}
```

**States:**
- Default: gray-300 border
- Focus: blue-500 border, ring
- Error: red-500 border, red text
- Disabled: gray-100 bg, gray-400 text

---

### 2.3 Textarea

**File:** `src/components/ui/textarea.tsx`

**Props:**
```typescript
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  rows?: number; // default: 3
}
```

---

### 2.4 Modal

**File:** `src/components/ui/modal.tsx`

**Props:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}
```

**Sizes:**
| Size | Max Width |
|------|-----------|
| sm | max-w-sm (384px) |
| md | max-w-md (448px) |
| lg | max-w-lg (512px) |
| xl | max-w-xl (576px) |

**Behavior:**
- Overlay with backdrop blur
- Close on Escape key
- Close on backdrop click
- Focus trap when open
- Body scroll lock when open

---

### 2.5 Card

**File:** `src/components/ui/card.tsx`

**Props:**
```typescript
interface CardProps {
  className?: string;
  children: React.ReactNode;
}
```

**Styling:**
- White background
- Rounded corners (rounded-lg)
- Shadow (shadow-sm)
- Border (border-gray-200)

---

### 2.6 Avatar

**File:** `src/components/ui/avatar.tsx`

**Props:**
```typescript
interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}
```

**Sizes:**
| Size | Dimensions |
|------|------------|
| xs | 24px |
| sm | 32px |
| md | 40px |
| lg | 48px |

**Behavior:**
- Shows image if `src` provided
- Shows initials if `name` provided (no image)
- Shows default icon if neither
- Background color based on name hash

---

### 2.7 Skeleton

**File:** `src/components/ui/skeleton.tsx`

**Props:**
```typescript
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}
```

**Animation:**
- Pulse animation
- Gray background with gradient

---

## 3. Board Components

### 3.1 BoardList

**File:** `src/components/board/board-list.tsx`

**Props:**
```typescript
interface BoardListProps {
  boards: Board[];
  isLoading?: boolean;
}
```

**Features:**
- Grid layout (responsive: 1-4 columns)
- Board cards with title, description
- Owner indicator
- Member count
- Click to navigate to board
- Empty state when no boards
- Loading skeleton state

---

### 3.2 CreateBoardButton

**File:** `src/components/board/create-board-button.tsx`

**Features:**
- Opens CreateBoardModal on click
- Plus icon
- "Create Board" text

---

### 3.3 KanbanBoard

**File:** `src/components/board/kanban-board.tsx`

**Props:**
```typescript
interface KanbanBoardProps {
  board: BoardWithDetails;
}
```

**Features:**
- Drag and drop context (DragDropContext)
- Horizontal scrollable columns
- Column reordering (future)
- Card reordering within column
- Card moving between columns

**State Management:**
- Local optimistic updates
- API sync on drop
- Error rollback

---

### 3.4 KanbanColumn

**File:** `src/components/board/kanban-column.tsx`

**Props:**
```typescript
interface KanbanColumnProps {
  column: ColumnWithCards;
  index: number;
}
```

**Features:**
- Droppable area for cards
- Column title (editable)
- Card count badge
- Add card button
- Delete column button
- Cards list

---

### 3.5 KanbanCard

**File:** `src/components/board/kanban-card.tsx`

**Props:**
```typescript
interface KanbanCardProps {
  card: Card;
  index: number;
  onClick: () => void;
}
```

**Features:**
- Draggable card
- Title display
- Assignee avatar (if assigned)
- Due date indicator (with color coding)
- Comment count badge
- Click to open CardModal

**Due Date Colors:**
| Condition | Color |
|-----------|-------|
| Overdue | red |
| Due today | orange |
| Due within 3 days | yellow |
| Otherwise | gray |

---

### 3.6 CardModal

**File:** `src/components/board/card-modal.tsx`

**Props:**
```typescript
interface CardModalProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<Card>) => void;
  onDelete: () => void;
}
```

**Sections:**
1. **Header**
   - Title (editable inline)
   - Column name
   - Close button

2. **Description**
   - Textarea (editable)
   - Markdown support (future)

3. **Sidebar**
   - Assignee picker
   - Due date picker
   - Delete button

4. **Comments**
   - Comments list
   - Add comment form

**Behavior:**
- Auto-save on blur
- Optimistic updates
- Loading states

---

### 3.7 AssigneePicker

**File:** `src/components/board/assignee-picker.tsx`

**Props:**
```typescript
interface AssigneePickerProps {
  boardMembers: BoardMember[];
  currentAssignee: string | null;
  onChange: (userId: string | null) => void;
}
```

**Features:**
- Dropdown with member list
- Search filter
- Avatar + name display
- Clear selection option

---

### 3.8 DueDatePicker

**File:** `src/components/board/due-date-picker.tsx`

**Props:**
```typescript
interface DueDatePickerProps {
  currentDate: string | null;
  onChange: (date: string | null) => void;
}
```

**Features:**
- Date input
- Clear date option
- Visual indicator for overdue

---

### 3.9 AddCardButton

**File:** `src/components/board/add-card-button.tsx`

**Props:**
```typescript
interface AddCardButtonProps {
  columnId: string;
  onAdd: (title: string) => void;
}
```

**Behavior:**
- Click to expand form
- Input for card title
- Enter to submit
- Escape to cancel
- Click outside to cancel

---

### 3.10 AddColumnButton

**File:** `src/components/board/add-column-button.tsx`

**Props:**
```typescript
interface AddColumnButtonProps {
  onAdd: (title: string) => void;
}
```

---

### 3.11 BoardHeader

**File:** `src/components/board/board-header.tsx`

**Props:**
```typescript
interface BoardHeaderProps {
  board: Board;
  onTitleChange: (title: string) => void;
}
```

**Features:**
- Board title (editable if owner)
- Back button
- Share button
- Activity log toggle
- Settings dropdown (future)

---

### 3.12 ShareBoardModal

**File:** `src/components/board/share-board-modal.tsx`

**Props:**
```typescript
interface ShareBoardModalProps {
  boardId: string;
  members: BoardMember[];
  isOpen: boolean;
  onClose: () => void;
}
```

**Features:**
- Current members list
- Add member by email
- Remove member button (owner only)
- Copy invite link (future)

---

### 3.13 ActivityLog

**File:** `src/components/board/activity-log.tsx`

**Props:**
```typescript
interface ActivityLogProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
}
```

**Features:**
- Side panel (slide in from right)
- Activity list with timestamps
- User avatars
- Action descriptions
- Load more pagination

---

## 4. Shared Components

### 4.1 Navbar

**File:** `src/components/shared/navbar.tsx`

**Features:**
- Logo/brand
- Navigation links (Boards)
- User menu (avatar, name)
- Logout button

---

## 5. Component Testing Checklist

### For each component, verify:
- [ ] Renders correctly with required props
- [ ] Handles optional props correctly
- [ ] Loading states work
- [ ] Error states work
- [ ] Keyboard navigation works
- [ ] Screen reader accessible
- [ ] Responsive design works
- [ ] No console errors/warnings

