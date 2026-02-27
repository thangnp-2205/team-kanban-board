# Feature: Column Management

## Spec ID: FEAT-004
## Status: Approved
## Version: 1.0
## Priority: Must Have

---

## 1. Overview

Quản lý columns (lists) trong Kanban board.

---

## 2. User Stories

### US-016: View Columns
**As a** board member  
**I want to** see all columns in a board  
**So that** I can understand the workflow

**Acceptance Criteria:**
- [x] Columns displayed horizontally
- [x] Each column shows title and card count
- [x] Columns are scrollable if many
- [x] Columns ordered by position

### US-017: Create Column
**As a** board member  
**I want to** add a new column  
**So that** I can customize the workflow

**Acceptance Criteria:**
- [x] "Add Column" button at end of columns
- [x] Click expands inline form
- [x] Enter title and submit
- [x] Column appears at the end
- [x] Activity: "created column"

### US-018: Edit Column Title
**As a** board member  
**I want to** rename a column  
**So that** I can update the workflow labels

**Acceptance Criteria:**
- [x] Click on column title to edit
- [x] Inline edit mode
- [x] Save on blur or Enter
- [x] Cancel on Escape

### US-019: Delete Column
**As a** board member  
**I want to** delete a column  
**So that** I can remove unused workflow stages

**Acceptance Criteria:**
- [x] Delete button on column header
- [x] Confirmation if column has cards
- [x] All cards in column are deleted
- [x] Activity: "deleted column"

### US-020: Reorder Columns (Future)
**As a** board member  
**I want to** drag columns to reorder  
**So that** I can customize the workflow order

**Status:** Deferred to v1.1

---

## 3. Column Data Structure

```typescript
interface Column {
  id: string;
  board_id: string;
  title: string;
  position: number;
  created_at: string;
}

interface ColumnWithCards extends Column {
  cards: Card[];
}
```

---

## 4. UI Specifications

### 4.1 Column Component

```
┌─────────────────────┐
│ Column Title     (5)│  ← Card count
│ [Edit] [Delete]     │  ← Hover actions
├─────────────────────┤
│ ┌─────────────────┐ │
│ │ Card 1          │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ Card 2          │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ Card 3          │ │
│ └─────────────────┘ │
│                     │
│ [+ Add Card]        │
└─────────────────────┘
```

**Column Dimensions:**
- Width: 280px (fixed)
- Min Height: 200px
- Max Height: calc(100vh - 200px)
- Scrollable content area

### 4.2 Column Header

```
┌─────────────────────────────────────┐
│ To Do                            (3)│
│ ┌─────┐ ┌─────┐                     │
│ │ 📝  │ │ 🗑  │    ← Show on hover │
│ └─────┘ └─────┘                     │
└─────────────────────────────────────┘
```

### 4.3 Edit Mode

```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │ New Title                       │ │
│ └─────────────────────────────────┘ │
│ [Save] [Cancel]                     │
└─────────────────────────────────────┘
```

### 4.4 Add Column Button

```
┌─────────────┐
│             │
│  + Add      │
│  Column     │
│             │
└─────────────┘
```

Expanded state:
```
┌─────────────────────┐
│ ┌─────────────────┐ │
│ │ Enter title...  │ │
│ └─────────────────┘ │
│ [Add] [X]           │
└─────────────────────┘
```

---

## 5. API Usage

### Create Column
```typescript
// POST /api/columns
const column = await createColumn({
  board_id: boardId,
  title: "New Column"
});
```

### Update Column
```typescript
// PATCH /api/columns
await updateColumn({
  columns: [{ id: columnId, title: "Updated Title" }]
});
```

### Reorder Columns
```typescript
// PATCH /api/columns
await updateColumns({
  columns: [
    { id: col1.id, position: 0 },
    { id: col2.id, position: 1 },
    { id: col3.id, position: 2 }
  ]
});
```

### Delete Column
```typescript
// DELETE /api/columns
await deleteColumn({ id: columnId });
```

---

## 6. Business Rules

1. **Default Columns:** New boards get 3 default columns (To Do, In Progress, Done)
2. **Min Columns:** Board must have at least 1 column (prevent deleting last column)
3. **Max Columns:** No hard limit (UI scrolls horizontally)
4. **Delete Warning:** Show warning if column has cards
5. **Cascade Delete:** Deleting column deletes all its cards

---

## 7. Delete Confirmation

```
┌────────────────────────────────────┐
│ Delete Column?                     │
├────────────────────────────────────┤
│                                    │
│ Are you sure you want to delete    │
│ "In Progress"?                     │
│                                    │
│ ⚠️ This will also delete 5 cards  │
│    in this column.                 │
│                                    │
│           [Cancel] [Delete]        │
│                                    │
└────────────────────────────────────┘
```

---

## 8. Error Handling

| Error | User Message | Recovery |
|-------|--------------|----------|
| Failed to create | "Failed to create column" | Retry |
| Failed to update | "Failed to update column" | Retry |
| Failed to delete | "Failed to delete column" | Retry |
| Last column | "Cannot delete the last column" | Show message |

---

## 9. Testing Scenarios

### Unit Tests
- [ ] Column component renders correctly
- [ ] Edit mode toggles properly
- [ ] Card count displays correctly

### Integration Tests
- [ ] Create column API
- [ ] Update column title API
- [ ] Delete column cascades cards
- [ ] Positions recalculate after delete

### E2E Tests
- [ ] Create column via inline form
- [ ] Edit column title inline
- [ ] Delete column with confirmation
- [ ] Cannot delete last column

