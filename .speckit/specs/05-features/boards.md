# Feature: Board Management

## Spec ID: FEAT-002
## Status: Approved
## Version: 1.0
## Priority: Must Have

---

## 1. Overview

Quản lý tạo, xem, sửa, xóa Kanban boards.

---

## 2. User Stories

### US-005: View Board List
**As a** user  
**I want to** see all my boards  
**So that** I can choose which one to work on

**Acceptance Criteria:**
- [x] Display boards in grid layout
- [x] Show board title, description preview
- [x] Show owner badge for owned boards
- [x] Show member count
- [x] Show last updated time
- [x] Click to navigate to board
- [x] Empty state with create prompt

### US-006: Create Board
**As a** user  
**I want to** create a new board  
**So that** I can organize my tasks

**Acceptance Criteria:**
- [x] "Create Board" button visible
- [x] Modal with title (required) and description (optional)
- [x] Board created with 3 default columns
- [x] User becomes owner automatically
- [x] Redirect to new board after creation
- [x] Activity: "created board"

### US-007: Edit Board
**As a** board owner  
**I want to** edit board details  
**So that** I can keep it up to date

**Acceptance Criteria:**
- [x] Only owner can edit
- [x] Inline edit for title in board header
- [x] Edit modal for description
- [x] Save on blur/Enter

### US-008: Delete Board
**As a** board owner  
**I want to** delete a board  
**So that** I can remove unused boards

**Acceptance Criteria:**
- [x] Only owner can delete
- [x] Confirmation modal before delete
- [x] Cascade delete all columns, cards, comments
- [x] Redirect to /boards after delete

---

## 3. Data Flow

### Create Board Flow
```
User clicks "Create Board"
        ↓
Modal opens with form
        ↓
User enters title, description
        ↓
User clicks "Create"
        ↓
POST /api/boards
        ↓
    ┌───┴───┐
    │Success│
    └───┬───┘
        ↓
Create 3 default columns
        ↓
Add user as owner member (trigger)
        ↓
Log activity
        ↓
Redirect to /boards/{id}
```

### Default Columns
| Position | Title |
|----------|-------|
| 0 | To Do |
| 1 | In Progress |
| 2 | Done |

---

## 4. UI Specifications

### 4.1 Boards List Page (`/boards`)

```
┌──────────────────────────────────────────────────────────┐
│ [Navbar]                                                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  My Boards                        [+ Create Board]       │
│                                                          │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐  │
│  │ Board 1       │ │ Board 2       │ │ Board 3       │  │
│  │               │ │               │ │               │  │
│  │ Description...│ │ Description...│ │ 👑 Owner      │  │
│  │               │ │               │ │               │  │
│  │ 👥 3 members  │ │ 👥 5 members  │ │ 👥 2 members  │  │
│  │ Updated 2h ago│ │ Updated 1d ago│ │ Updated now   │  │
│  └───────────────┘ └───────────────┘ └───────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 4.2 Create Board Modal

```
┌────────────────────────────────────┐
│ Create New Board              [X]  │
├────────────────────────────────────┤
│                                    │
│ Title *                            │
│ ┌──────────────────────────────┐   │
│ │                              │   │
│ └──────────────────────────────┘   │
│                                    │
│ Description                        │
│ ┌──────────────────────────────┐   │
│ │                              │   │
│ │                              │   │
│ └──────────────────────────────┘   │
│                                    │
│         [Cancel] [Create Board]    │
│                                    │
└────────────────────────────────────┘
```

### 4.3 Board Page (`/boards/[id]`)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [← Back] Board Title (editable)           [Share] [Activity] [⋮ Menu]   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐       │
│  │ To Do    (3)│  │In Progress 2│  │ Done     (5)│  │ + Add     │       │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤  │  Column   │       │
│  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │  └───────────┘       │
│  │ │ Card 1  │ │  │ │ Card 4  │ │  │ │ Card 6  │ │                      │
│  │ │ 👤 📅 💬│ │  │ │ 👤      │ │  │ │         │ │                      │
│  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │                      │
│  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │                      │
│  │ │ Card 2  │ │  │ │ Card 5  │ │  │ │ Card 7  │ │                      │
│  │ │         │ │  │ │   📅 💬│ │  │ │ 👤      │ │                      │
│  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │                      │
│  │ ┌─────────┐ │  │             │  │ ...         │                      │
│  │ │ Card 3  │ │  │             │  │             │                      │
│  │ │ 👤 💬 2 │ │  │             │  │             │                      │
│  │ └─────────┘ │  │             │  │             │                      │
│  │             │  │             │  │             │                      │
│  │ [+ Add Card]│  │ [+ Add Card]│  │ [+ Add Card]│                      │
│  └─────────────┘  └─────────────┘  └─────────────┘                      │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 5. API Usage

### Get Board List
```typescript
// GET /api/boards
const { data: boards } = await fetch('/api/boards');
```

### Create Board
```typescript
// POST /api/boards
const { data: board } = await fetch('/api/boards', {
  method: 'POST',
  body: JSON.stringify({ title, description })
});
```

### Get Board Details
```typescript
// GET /api/boards/[id]
const { data: board } = await fetch(`/api/boards/${boardId}`);
// Returns: board with columns, cards, members
```

### Update Board
```typescript
// PATCH /api/boards/[id]
await fetch(`/api/boards/${boardId}`, {
  method: 'PATCH',
  body: JSON.stringify({ title, description })
});
```

### Delete Board
```typescript
// DELETE /api/boards/[id]
await fetch(`/api/boards/${boardId}`, {
  method: 'DELETE'
});
```

---

## 6. State Management

### Board List State
```typescript
interface BoardsState {
  boards: Board[];
  isLoading: boolean;
  error: Error | null;
}
```

### Board Detail State
```typescript
interface BoardState {
  board: BoardWithDetails | null;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  updateBoard: (updates: Partial<Board>) => void;
  addColumn: (title: string) => void;
  updateColumn: (id: string, updates: Partial<Column>) => void;
  deleteColumn: (id: string) => void;
  addCard: (columnId: string, title: string) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  moveCard: (cardId: string, toColumnId: string, position: number) => void;
  deleteCard: (id: string) => void;
}
```

---

## 7. Error Handling

| Error | User Message | Recovery |
|-------|--------------|----------|
| Board not found | "Board not found" | Redirect to /boards |
| Not a member | "You don't have access to this board" | Redirect to /boards |
| Failed to create | "Failed to create board. Please try again." | Show retry |
| Failed to delete | "Failed to delete board. Please try again." | Show retry |

---

## 8. Testing Scenarios

### Unit Tests
- [ ] Board card component renders correctly
- [ ] Create board form validation

### Integration Tests
- [ ] Create board API creates board and default columns
- [ ] Get boards returns only accessible boards
- [ ] Delete board cascades properly

### E2E Tests
- [ ] Create board flow
- [ ] Navigate to board
- [ ] Edit board title
- [ ] Delete board

