# Feature: Activity Log

## Spec ID: FEAT-007
## Status: Approved
## Version: 1.0
## Priority: Must Have

---

## 1. Overview

Ghi lại và hiển thị các hoạt động trong board để team có thể theo dõi lịch sử thay đổi.

---

## 2. User Stories

### US-027: View Activity Log
**As a** board member  
**I want to** see the activity history  
**So that** I can track what has happened in the board

**Acceptance Criteria:**
- [x] Activity log button in board header
- [x] Opens side panel
- [x] Shows recent activities
- [x] Sorted by time (newest first)
- [x] Shows who did what and when
- [x] Load more pagination

### US-028: Activity Auto-Logging
**As a** system  
**I want to** automatically log activities  
**So that** all changes are tracked

**Acceptance Criteria:**
- [x] Log when card created
- [x] Log when card moved
- [x] Log when card assigned/unassigned
- [x] Log when card deleted
- [x] Log when column created/deleted
- [x] Log when member added/removed

---

## 3. Activity Data Structure

```typescript
interface Activity {
  id: string;
  board_id: string;
  user_id: string;
  action: ActivityAction;
  entity_type: EntityType;
  entity_id: string;
  metadata: Record<string, any>;
  created_at: string;
  user: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

type ActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'moved'
  | 'assigned'
  | 'unassigned'
  | 'added'
  | 'removed';

type EntityType =
  | 'card'
  | 'column'
  | 'board'
  | 'member';
```

---

## 4. Activity Types

| Entity | Action | Metadata | Display Message |
|--------|--------|----------|-----------------|
| card | created | { title } | "created card '{title}'" |
| card | updated | { field, old_value, new_value } | "updated {field} on '{title}'" |
| card | moved | { from_column, to_column, title } | "moved '{title}' from {from} to {to}" |
| card | assigned | { assignee_name, title } | "assigned {assignee} to '{title}'" |
| card | unassigned | { assignee_name, title } | "unassigned {assignee} from '{title}'" |
| card | deleted | { title } | "deleted card '{title}'" |
| column | created | { title } | "created column '{title}'" |
| column | deleted | { title } | "deleted column '{title}'" |
| member | added | { member_email } | "added {email} to the board" |
| member | removed | { member_email } | "removed {email} from the board" |

---

## 5. UI Specifications

### 5.1 Activity Log Button

```
┌──────────────────────────────────────────────┐
│ Board Title     [Share] [📋 Activity] [More] │
└──────────────────────────────────────────────┘
```

### 5.2 Activity Log Panel (Slide-in from right)

```
┌──────────────────────────────────────────────┐
│                                   Activity Log │
│                                              [X]│
├──────────────────────────────────────────────┤
│                                              │
│ Today                                        │
│ ────────────────────────────────────────     │
│ ┌────────────────────────────────────────┐   │
│ │ 👤 John Doe                    2h ago  │   │
│ │    moved 'Fix bug' from                │   │
│ │    In Progress to Done                 │   │
│ └────────────────────────────────────────┘   │
│                                              │
│ ┌────────────────────────────────────────┐   │
│ │ 👤 Jane Smith                  3h ago  │   │
│ │    assigned Bob to 'New feature'       │   │
│ └────────────────────────────────────────┘   │
│                                              │
│ ┌────────────────────────────────────────┐   │
│ │ 👤 You                         5h ago  │   │
│ │    created card 'Setup CI/CD'          │   │
│ └────────────────────────────────────────┘   │
│                                              │
│ Yesterday                                    │
│ ────────────────────────────────────────     │
│ ┌────────────────────────────────────────┐   │
│ │ 👤 John Doe                   1d ago   │   │
│ │    added jane@example.com to the board │   │
│ └────────────────────────────────────────┘   │
│                                              │
│           [Load More]                        │
│                                              │
└──────────────────────────────────────────────┘
```

### 5.3 Activity Item

```
┌────────────────────────────────────────────────┐
│ ┌───┐                                          │
│ │👤 │  John Doe                      2h ago   │
│ └───┘                                          │
│      moved 'Fix critical bug' from             │
│      In Progress to Done                       │
└────────────────────────────────────────────────┘
```

### 5.4 Empty State

```
┌──────────────────────────────────────────────┐
│                  Activity Log                 │
├──────────────────────────────────────────────┤
│                                              │
│                                              │
│              📋 No activity yet              │
│                                              │
│        Activities will appear here           │
│        when you start working.               │
│                                              │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 6. API Usage

### Get Activities
```typescript
// GET /api/activity?board_id={boardId}&limit=20&offset=0
const { data: activities } = await fetch(
  `/api/activity?board_id=${boardId}&limit=20`
);
```

### Logging Activities (Server-side)
```typescript
// Called internally by API routes
async function logActivity({
  boardId,
  userId,
  action,
  entityType,
  entityId,
  metadata
}: LogActivityParams) {
  await supabase.from('activities').insert({
    board_id: boardId,
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata
  });
}
```

---

## 7. Activity Logging Implementation

### In Card API
```typescript
// POST /api/cards - After creating card
await logActivity({
  boardId,
  userId: user.id,
  action: 'created',
  entityType: 'card',
  entityId: card.id,
  metadata: { title: card.title }
});

// PATCH /api/cards - After moving card
await logActivity({
  boardId,
  userId: user.id,
  action: 'moved',
  entityType: 'card',
  entityId: card.id,
  metadata: {
    title: card.title,
    from_column: oldColumn.title,
    to_column: newColumn.title
  }
});
```

---

## 8. Grouping by Time

Activities are grouped by time period:

| Period | Label |
|--------|-------|
| Today | "Today" |
| Yesterday | "Yesterday" |
| This week | "This Week" |
| Last week | "Last Week" |
| Earlier | "Earlier" |

---

## 9. Performance Considerations

- **Pagination:** Load 20 activities at a time
- **Lazy Loading:** Activities loaded when panel opens
- **Index:** Database index on (board_id, created_at DESC)
- **Limit Storage:** Optional: Archive activities older than 90 days

---

## 10. Testing Scenarios

### Unit Tests
- [ ] Activity message formatting
- [ ] Time grouping logic
- [ ] Relative time formatting

### Integration Tests
- [ ] Activity logged on card create
- [ ] Activity logged on card move
- [ ] Activity logged on member add
- [ ] Get activities with pagination

### E2E Tests
- [ ] Open activity panel
- [ ] See activities after creating card
- [ ] Load more activities

