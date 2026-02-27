# Feature: Card Management

## Spec ID: FEAT-003
## Status: Approved
## Version: 1.0
## Priority: Must Have

---

## 1. Overview

Quản lý cards (tasks) trong Kanban board: tạo, sửa, xóa, di chuyển (drag-drop), gán người phụ trách.

---

## 2. User Stories

### US-010: Create Card
**As a** board member  
**I want to** create a new card in a column  
**So that** I can add tasks to track

**Acceptance Criteria:**
- [x] "Add Card" button at bottom of each column
- [x] Click expands inline form
- [x] Enter title and press Enter to create
- [x] Press Escape to cancel
- [x] Card appears at bottom of column
- [x] Activity: "created card"

### US-011: Edit Card
**As a** board member  
**I want to** edit card details  
**So that** I can update task information

**Acceptance Criteria:**
- [x] Click card opens modal
- [x] Edit title inline
- [x] Edit description in textarea
- [x] Auto-save on blur
- [x] Activity: "updated card" (for significant changes)

### US-012: Delete Card
**As a** board member  
**I want to** delete a card  
**So that** I can remove completed or invalid tasks

**Acceptance Criteria:**
- [x] Delete button in card modal
- [x] Confirmation prompt
- [x] Card removed from column
- [x] Comments deleted (cascade)
- [x] Activity: "deleted card"

### US-013: Drag and Drop Card
**As a** board member  
**I want to** drag cards between columns  
**So that** I can update task status quickly

**Acceptance Criteria:**
- [x] Drag card from any column
- [x] Drop in same column (reorder)
- [x] Drop in different column (move + reorder)
- [x] Visual feedback during drag
- [x] Smooth animation
- [x] Optimistic update (instant UI response)
- [x] Rollback on API failure
- [x] Activity: "moved card from X to Y"

### US-014: Assign User to Card
**As a** board member  
**I want to** assign a team member to a card  
**So that** everyone knows who is responsible

**Acceptance Criteria:**
- [x] Assignee picker in card modal
- [x] Show board members as options
- [x] Search/filter members
- [x] Display assignee avatar on card
- [x] Can unassign (set to null)
- [x] Activity: "assigned X to card"

### US-015: Set Due Date
**As a** board member  
**I want to** set a due date for a card  
**So that** I can track deadlines

**Acceptance Criteria:**
- [x] Due date picker in card modal
- [x] Date input with calendar
- [x] Due date indicator on card
- [x] Color coding for urgency
- [x] Can clear due date

---

## 3. Card Data Structure

```typescript
interface Card {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  position: number;
  assignee_id: string | null;
  assignee: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  due_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  comment_count: number;
}
```

---

## 4. Drag and Drop Implementation

### Library
Using `@dnd-kit/core` and `@dnd-kit/sortable` - modern React DnD library

### Component Structure
```
<DndContext
  sensors={sensors}
  collisionDetection={closestCorners}
  onDragStart={handleDragStart}
  onDragOver={handleDragOver}
  onDragEnd={handleDragEnd}
>
  <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
    {columns.map(column => (
      <KanbanColumn column={column}>
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.map(card => (
            <SortableCard card={card} />
          ))}
        </SortableContext>
      </KanbanColumn>
    ))}
  </SortableContext>
  <DragOverlay>
    {activeCard && <KanbanCard card={activeCard} isDragging />}
  </DragOverlay>
</DndContext>
```

### Drag End Handler
```typescript
function handleDragEnd(result: DropResult) {
  const { source, destination, draggableId } = result;
  
  // Dropped outside
  if (!destination) return;
  
  // Same position
  if (
    source.droppableId === destination.droppableId &&
    source.index === destination.index
  ) return;
  
  // Optimistic update
  const newColumns = reorderCards(columns, source, destination);
  setColumns(newColumns);
  
  // API call
  try {
    await moveCard({
      cardId: draggableId,
      toColumnId: destination.droppableId,
      position: destination.index
    });
  } catch (error) {
    // Rollback
    setColumns(originalColumns);
    toast.error('Failed to move card');
  }
}
```

### Position Calculation
When moving card:
1. Get all cards in destination column
2. Sort by position
3. Insert at destination index
4. Recalculate positions (0, 1, 2, ...)
5. Batch update affected cards

---

## 5. UI Specifications

### 5.1 Card Component

```
┌─────────────────────────────┐
│ Card Title                  │
│                             │
│ ┌───┐  📅 Mar 15  💬 3     │
│ │👤 │                       │
│ └───┘                       │
└─────────────────────────────┘
```

**Elements:**
- Title (max 2 lines, ellipsis)
- Assignee avatar (if assigned)
- Due date badge (if set)
- Comment count (if > 0)

**Due Date Colors:**
| Condition | Badge Color |
|-----------|-------------|
| Overdue | bg-red-100, text-red-700 |
| Due today | bg-orange-100, text-orange-700 |
| Due in 1-3 days | bg-yellow-100, text-yellow-700 |
| Due later | bg-gray-100, text-gray-600 |

### 5.2 Card Modal

```
┌────────────────────────────────────────────────────────────┐
│ [Edit Title]                                          [X]  │
│ in column: In Progress                                     │
├─────────────────────────────────────────────┬──────────────┤
│                                             │              │
│ Description                                 │ Assignee     │
│ ┌─────────────────────────────────────────┐ │ ┌──────────┐ │
│ │                                         │ │ │ 👤 Name  │ │
│ │ Click to add description...             │ │ └──────────┘ │
│ │                                         │ │              │
│ └─────────────────────────────────────────┘ │ Due Date     │
│                                             │ ┌──────────┐ │
│ Comments                                    │ │ Pick date│ │
│ ┌─────────────────────────────────────────┐ │ └──────────┘ │
│ │ 👤 John: Great progress!                │ │              │
│ │    2 hours ago                          │ │ ──────────── │
│ ├─────────────────────────────────────────┤ │              │
│ │ 👤 Jane: Need to review                 │ │ [🗑 Delete] │
│ │    1 day ago                            │ │              │
│ └─────────────────────────────────────────┘ │              │
│                                             │              │
│ ┌─────────────────────────────────────────┐ │              │
│ │ Write a comment...              [Send]  │ │              │
│ └─────────────────────────────────────────┘ │              │
└─────────────────────────────────────────────┴──────────────┘
```

### 5.3 Add Card Form (Inline)

```
Column Header
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ Existing Card           │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Enter card title...     │ │
│ │                         │ │
│ │ [Add Card] [X Cancel]   │ │
│ └─────────────────────────┘ │
```

---

## 6. API Usage

### Create Card
```typescript
// POST /api/cards
const card = await createCard({
  column_id: columnId,
  title: "New task"
});
```

### Update Card
```typescript
// PATCH /api/cards
await updateCard({
  id: cardId,
  title: "Updated title",
  description: "Details...",
  assignee_id: userId,
  due_date: "2026-03-15"
});
```

### Move Card
```typescript
// PATCH /api/cards (batch update)
await updateCards({
  cards: [
    { id: cardId, column_id: newColumnId, position: 0 },
    { id: otherCardId, position: 1 },
    // ... reordered cards
  ]
});
```

### Delete Card
```typescript
// DELETE /api/cards
await deleteCard({ id: cardId });
```

---

## 7. Activity Logging

| Action | Log Message Template |
|--------|---------------------|
| Create | "{user} created card '{title}'" |
| Move | "{user} moved '{title}' from {from_column} to {to_column}" |
| Assign | "{user} assigned {assignee} to '{title}'" |
| Unassign | "{user} unassigned {assignee} from '{title}'" |
| Update title | "{user} renamed card to '{new_title}'" |
| Set due date | "{user} set due date to {date} on '{title}'" |
| Delete | "{user} deleted card '{title}'" |

---

## 8. Error Handling

| Error | User Message | Recovery |
|-------|--------------|----------|
| Failed to create | "Failed to create card" | Retry |
| Failed to move | "Failed to move card" | Rollback + Retry |
| Failed to update | "Failed to update card" | Retry |
| Failed to delete | "Failed to delete card" | Retry |
| Card not found | "Card no longer exists" | Close modal + Refresh |

---

## 9. Performance Considerations

- **Optimistic Updates:** Update UI immediately, sync with server
- **Debounced Saves:** Debounce description changes (500ms)
- **Batch Position Updates:** Update all positions in single API call
- **Skeleton Loading:** Show skeleton while loading card details

---

## 10. Testing Scenarios

### Unit Tests
- [ ] Card component renders all elements
- [ ] Due date color calculation
- [ ] Position recalculation logic

### Integration Tests
- [ ] Create card API
- [ ] Update card API
- [ ] Move card reorders correctly
- [ ] Delete card cascades comments

### E2E Tests
- [ ] Create card via inline form
- [ ] Drag and drop between columns
- [ ] Edit card in modal
- [ ] Assign user to card
- [ ] Delete card with confirmation

