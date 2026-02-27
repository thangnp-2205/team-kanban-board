# Feature: Comment System

## Spec ID: FEAT-005
## Status: Approved
## Version: 1.0
## Priority: Must Have

---

## 1. Overview

Hệ thống comment cho phép team members thảo luận về các tasks.

---

## 2. User Stories

### US-021: View Comments
**As a** board member  
**I want to** see comments on a card  
**So that** I can follow the discussion

**Acceptance Criteria:**
- [x] Comments shown in card modal
- [x] Sorted by created_at (oldest first)
- [x] Show commenter avatar, name, time
- [x] Show comment content

### US-022: Add Comment
**As a** board member  
**I want to** add a comment to a card  
**So that** I can communicate with team members

**Acceptance Criteria:**
- [x] Comment input at bottom of modal
- [x] Submit with button or Ctrl+Enter
- [x] Comment appears immediately
- [x] Activity: "commented on card"

### US-023: Delete Comment
**As a** comment author  
**I want to** delete my comment  
**So that** I can remove incorrect information

**Acceptance Criteria:**
- [x] Delete button on own comments
- [x] Confirmation before delete
- [x] Only comment author can delete
- [x] Board owner cannot delete others' comments

---

## 3. Comment Data Structure

```typescript
interface Comment {
  id: string;
  card_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}
```

---

## 4. UI Specifications

### 4.1 Comments Section in Card Modal

```
┌─────────────────────────────────────────────┐
│ Comments (3)                                │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ 👤 John Doe           2 hours ago    🗑 │ │
│ │                                         │ │
│ │ This looks good! Ready for review.      │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 👤 Jane Smith          1 hour ago       │ │
│ │                                         │ │
│ │ I'll take a look at this today.         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 👤 You                 Just now      🗑 │ │
│ │                                         │ │
│ │ Thanks everyone!                        │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ Write a comment...                      │ │
│ └─────────────────────────────────────────┘ │
│                               [Send]        │
└─────────────────────────────────────────────┘
```

### 4.2 Comment Item

```
┌─────────────────────────────────────────────┐
│ ┌───┐                                       │
│ │👤 │  John Doe                    2h ago   │
│ └───┘                                    🗑 │ ← Only for own comments
│                                             │
│ This is the comment content. It can be      │
│ multiple lines and will wrap properly.      │
└─────────────────────────────────────────────┘
```

### 4.3 Comment Input

```
┌─────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────┐ │
│ │ Write a comment...                      │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                     Ctrl+Enter to send      │
│                               [Send]        │
└─────────────────────────────────────────────┘
```

### 4.4 Empty State

```
┌─────────────────────────────────────────────┐
│ Comments                                    │
├─────────────────────────────────────────────┤
│                                             │
│           💬 No comments yet               │
│                                             │
│     Be the first to leave a comment!        │
│                                             │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ Write a comment...                      │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## 5. API Usage

### Get Comments
```typescript
// GET /api/comments?card_id={cardId}
const { data: comments } = await fetch(
  `/api/comments?card_id=${cardId}`
);
```

### Add Comment
```typescript
// POST /api/comments
const comment = await createComment({
  card_id: cardId,
  content: "This looks great!"
});
```

### Delete Comment
```typescript
// DELETE /api/comments
await deleteComment({ id: commentId });
```

---

## 6. Time Formatting

| Time Difference | Display |
|-----------------|---------|
| < 1 minute | "Just now" |
| 1-59 minutes | "X minutes ago" |
| 1-23 hours | "X hours ago" |
| 1-6 days | "X days ago" |
| 7-30 days | "X weeks ago" |
| > 30 days | "MMM DD, YYYY" |

---

## 7. Validation

| Field | Rule |
|-------|------|
| content | Required, min 1 char, max 2000 chars |

---

## 8. Error Handling

| Error | User Message | Recovery |
|-------|--------------|----------|
| Failed to load | "Failed to load comments" | Retry button |
| Failed to add | "Failed to add comment" | Keep input, retry |
| Failed to delete | "Failed to delete comment" | Retry |
| Not authorized | "You can only delete your own comments" | Show message |

---

## 9. Performance

- **Lazy Loading:** Comments loaded when card modal opens
- **Optimistic Add:** Comment appears immediately, syncs in background
- **Optimistic Delete:** Comment removed immediately, rollback on error

---

## 10. Testing Scenarios

### Unit Tests
- [ ] Comment component renders correctly
- [ ] Time formatting function
- [ ] Delete button only for own comments

### Integration Tests
- [ ] Get comments API
- [ ] Add comment API
- [ ] Delete comment API
- [ ] Only author can delete

### E2E Tests
- [ ] Add comment in card modal
- [ ] Delete own comment
- [ ] Cannot delete others' comments

